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

  signUp: (email: string, password: string) => Promise<void>;


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

  notificationChannel: any | null;
  notificationDedupeMap: Map<string, number>;
  notificationWindowMs: number;


     /* ---------- Onboarding ---------- */
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;



}

/* =========================
   Store
========================= */

export const useAppStore = create<AppState>((set, get) => ({
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

  /* ---------- Markets ---------- */
  markets: [],
  loadMarkets: async () => {
    const data = await fetchMarkets();
    set({ markets: data });
  },

  /* ---------- Notifications ---------- */
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  notificationChannel: null,
  notificationDedupeMap: new Map(),
  notificationWindowMs: 5000,

    /* ---------- Onboarding ---------- */
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (value) =>
    set({ hasCompletedOnboarding: value }),


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
      hasCompletedOnboarding: false, // 🔥 until we load real profile flag
    });


    setApiAuthToken(token);
    get().initNotificationRealtime();
  },

  signOut: async () => {
    const { notificationChannel } = get();

    if (notificationChannel) {
      await supabase.removeChannel(notificationChannel);
    }

    await supabase.auth.signOut();

    set({
      isAuthenticated: false,
      authToken: null,
      user: null,
      vendorId: null,
      markets: [],
      activeOrderId: null,
      unreadCount: 0,
      notificationChannel: null,
      notificationDedupeMap: new Map(),
      hasCompletedOnboarding: false, // 🔥 reset
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
      hasCompletedOnboarding: false, // 🔥 temporary until backend-driven
    });


    setApiAuthToken(token);
    get().initNotificationRealtime();
  },

  signUp: async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Optional: auto-login if session returned
  if (data.session) {
    const token = data.session.access_token;
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

    setApiAuthToken(token);
    get().initNotificationRealtime();
  }
},

  /* ---------- Realtime Notifications ---------- */

  initNotificationRealtime: () => {
    const state = get();
    const user = state.user;

    if (!user) return;

    // Prevent duplicate subscriptions
    if (state.notificationChannel) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const now = Date.now();
          const notificationId = payload.new.id;

          const dedupeMap = new Map(state.notificationDedupeMap);
          const lastSeen = dedupeMap.get(notificationId);

          if (
            lastSeen &&
            now - lastSeen < state.notificationWindowMs
          ) {
            return; // suppress duplicate
          }

          dedupeMap.set(notificationId, now);

          // Clean old entries
          dedupeMap.forEach((time, key) => {
            if (now - time > state.notificationWindowMs) {
              dedupeMap.delete(key);
            }
          });

          set((s) => ({
            unreadCount: s.unreadCount + 1,
            notificationDedupeMap: dedupeMap,
          }));
        }
      )
      .subscribe();

    set({ notificationChannel: channel });
  },
}));
