import { create } from "zustand";
import { fetchMarkets, Market } from "../api/markets";
import { supabase } from "../lib/supabase";
import { setApiAuthToken } from "../api/client";

/* =========================
   Types
========================= */

export type AppUser = {
  id: string;
  email: string;
  app_role: "user" | "admin";
};

interface AppState {
  /* ---------- App lifecycle ---------- */
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;

  /* ---------- UI ---------- */
  theme: "light" | "dark" | "system";
  setTheme: (theme: AppState["theme"]) => void;

  /* ---------- Auth ---------- */
  isAuthenticated: boolean;
  authToken: string | null;
  user: AppUser | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;

  /* ---------- Vendor ---------- */
  vendorId: string | null;
  setVendorId: (id: string | null) => void;

  /* ---------- Orders ---------- */
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  /* ---------- Markets ---------- */
  markets: Market[];
  loadMarkets: () => Promise<void>;

  /* ---------- Notifications ---------- */
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  initNotificationRealtime: () => void;
  
}

/* =========================
   Store
========================= */

export const useAppStore = create<AppState>((set) => ({
  /* ---------- App lifecycle ---------- */
  isHydrated: false,
  setHydrated: (value) => set({ isHydrated: value }),

  /* ---------- UI ---------- */
  theme: "system",
  setTheme: (theme) => set({ theme }),

  /* ---------- Auth ---------- */
  isAuthenticated: false,
  authToken: null,
  user: null,

  /* ---------- Vendor ---------- */
  vendorId: null,
  setVendorId: (id) => set({ vendorId: id }),

  /* ---------- Orders ---------- */
  activeOrderId: null,
  setActiveOrderId: (id) => set({ activeOrderId: id }),

  /* ---------- Notifications ---------- */
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  /* ---------- Auth actions ---------- */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const token = data.session?.access_token ?? null;
    const user = data.user;

    set({
      isAuthenticated: true,
      authToken: token,
      user: user
        ? {
            id: user.id,
            email: user.email ?? "",
            app_role: user.app_metadata?.role ?? "user",
          }
        : null,
    });
    useAppStore.getState().initNotificationRealtime();


    setApiAuthToken(token);
  },

  signOut: async () => {
    await supabase.auth.signOut();

    set({
      isAuthenticated: false,
      authToken: null,
      user: null,
      vendorId: null,
      markets: [],
      activeOrderId: null,
      unreadCount: 0, // reset badge
    });

    setApiAuthToken(null);
  },

  restoreSession: async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      set({
        isAuthenticated: false,
        authToken: null,
        user: null,
        unreadCount: 0,
      });
      setApiAuthToken(null);
      return;
    }

    const { user } = data.session;
    const token = data.session.access_token;

    set({
      isAuthenticated: true,
      authToken: token,
      user: {
        id: user.id,
        email: user.email ?? "",
        app_role: user.app_metadata?.role ?? "user",
      },
    });
    useAppStore.getState().initNotificationRealtime();

    setApiAuthToken(token);
  },

  /* ---------- Markets ---------- */
  markets: [],
  loadMarkets: async () => {
    const data = await fetchMarkets();
    set({ markets: data });
  },

  initNotificationRealtime: () => {
  const user = useAppStore.getState().user;
  if (!user) return;

  supabase
    .channel("notifications-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        // Increase unread count optimistically
        set((state) => ({
          unreadCount: state.unreadCount + 1,
        }));
      }
    )
    .subscribe();
},

}));
