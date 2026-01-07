import { create } from "zustand";
import { fetchMarkets, Market } from "../api/markets";
import { supabase } from "../lib/supabase";

/* =========================
   Types
========================= */

export type AppUser = {
  id: string;
  email: string;
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

  setAuthenticated: (value: boolean) => void;
  setAuthToken: (token: string | null) => void;
  setUser: (user: AppUser | null) => void;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;

  /* ---------- Markets ---------- */
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

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setAuthToken: (token) => set({ authToken: token }),
  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    set({
      isAuthenticated: true,
      authToken: data.session?.access_token ?? null,
      user: data.user
        ? { id: data.user.id, email: data.user.email ?? "" }
        : null,
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      isAuthenticated: false,
      authToken: null,
      user: null,
      markets: [],
    });
  },

  restoreSession: async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      set({
        isAuthenticated: true,
        authToken: data.session.access_token,
        user: data.session.user
          ? {
              id: data.session.user.id,
              email: data.session.user.email ?? "",
            }
          : null,
      });
    }
  },

  /* ---------- Markets ---------- */
  markets: [],

  loadMarkets: async () => {
    const data = await fetchMarkets();
    set({ markets: data });
  },
}));
