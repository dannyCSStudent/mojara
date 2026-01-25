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
};

interface AppState {
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;

  theme: "light" | "dark" | "system";
  setTheme: (theme: AppState["theme"]) => void;

  isAuthenticated: boolean;
  authToken: string | null;
  user: AppUser | null;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;

  vendorId: string | null;
  setVendorId: (id: string | null) => void;

  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  markets: Market[];
  loadMarkets: () => Promise<void>;
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

  /* ---------- Auth actions ---------- */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const token = data.session?.access_token ?? null;

    set({
      isAuthenticated: true,
      authToken: token,
      user: data.user
        ? { id: data.user.id, email: data.user.email ?? "" }
        : null,
    });

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
    });
    setApiAuthToken(null);
    return;
  }

  const token = data.session.access_token;

  set({
    isAuthenticated: true, // 🚨 literal boolean ONLY
    authToken: token,
    user: {
      id: data.session.user.id,
      email: data.session.user.email ?? "",
    },
  });

  setApiAuthToken(token);
},


  /* ---------- Markets ---------- */
  markets: [],
  loadMarkets: async () => {
    const data = await fetchMarkets();
    set({ markets: data });
  },
}));
