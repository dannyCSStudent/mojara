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
  console.log("SIGN IN TOKEN:", token);
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

  const { user } = data.session;
  const token = data.session.access_token;
  console.log("RESTORE SESSION TOKEN:", token);

  set({
    isAuthenticated: true,
    authToken: token,
    user: {
      id: user.id,
      email: user.email ?? "",
      app_role: user.app_metadata?.role ?? "user",
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
