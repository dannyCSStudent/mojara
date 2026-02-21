import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchMarkets, Market } from "../api/markets";
import { supabase } from "../lib/supabase";
import { setApiAuthToken } from "../api/client";
import { storage } from "./storage";



/* =========================
   Types
========================= */

export type AppUser = {
  id: string;
  email: string;
  app_role: "user" | "admin";
};

interface AppState {
  /* ---------- Lifecycle ---------- */
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
  loadUserProfile: (userId: string, token: string) => Promise<void>;

  /* ---------- Vendor ---------- */
  vendorId: string | null;
  setVendorId: (id: string | null) => void;

  /* ---------- Orders ---------- */
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;

  /* ---------- Markets ---------- */
  markets: Market[];
  loadMarkets: () => Promise<void>;

  /* ---------- Subscriptions ---------- */
  subscriptions: string[];
  loadSubscriptions: () => Promise<void>;
  toggleMarketSubscription: (marketId: string) => Promise<void>;

  activeMarketId: string | null;
  setActiveMarket: (id: string | null) => void;

  /* ---------- Notifications ---------- */
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  initNotificationRealtime: () => void;

  notificationChannel: any | null;
  notificationDedupeMap: Map<string, number>;
  notificationWindowMs: number;
}

/* =========================
   Store
========================= */

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      /* ---------- Lifecycle ---------- */
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

      /* ---------- Subscriptions ---------- */
      subscriptions: [],
      activeMarketId: null,

      loadSubscriptions: async () => {
        const { user } = get();
        if (!user) return;

        const { data, error } = await supabase
          .from("market_subscriptions")
          .select("market_id")
          .eq("user_id", user.id);

        if (error) throw error;

        const loadedSubs =
          data?.map((row) => row.market_id) ?? [];

        set((state) => {
          let updatedActive = state.activeMarketId;

          if (
            updatedActive &&
            !loadedSubs.includes(updatedActive)
          ) {
            updatedActive = loadedSubs[0] ?? null;
          }

          if (!updatedActive && loadedSubs.length > 0) {
            updatedActive = loadedSubs[0];
          }

          return {
            subscriptions: loadedSubs,
            activeMarketId: updatedActive,
          };
        });
      },

      toggleMarketSubscription: async (marketId) => {
        const { user } = get();
        if (!user) return;

        const state = get();
        const isSubscribed =
          state.subscriptions.includes(marketId);

        // Optimistic update
        set((prev) => {
          let updatedSubs: string[];

          if (isSubscribed) {
            updatedSubs = prev.subscriptions.filter(
              (id) => id !== marketId
            );
          } else {
            updatedSubs = [...prev.subscriptions, marketId];
          }

          let updatedActive = prev.activeMarketId;

          if (
            isSubscribed &&
            prev.activeMarketId === marketId
          ) {
            updatedActive = null;
          }

          if (
            !updatedActive &&
            updatedSubs.length > 0
          ) {
            updatedActive = updatedSubs[0];
          }

          return {
            subscriptions: updatedSubs,
            activeMarketId: updatedActive,
          };
        });

        // Sync with DB
        if (isSubscribed) {
          await supabase
            .from("market_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .eq("market_id", marketId);
        } else {
          await supabase
            .from("market_subscriptions")
            .insert({
              user_id: user.id,
              market_id: marketId,
            });
        }
      },

      setActiveMarket: (id) =>
        set((state) => {
          if (id === null) {
            return { activeMarketId: null };
          }

          if (!state.subscriptions.includes(id)) {
            return { activeMarketId: null };
          }

          return { activeMarketId: id };
        }),

      /* ---------- Notifications ---------- */
      unreadCount: 0,
      setUnreadCount: (count) =>
        set({ unreadCount: count }),

      notificationChannel: null,
      notificationDedupeMap: new Map(),
      notificationWindowMs: 5000,

      initNotificationRealtime: () => {
        const state = get();
        if (!state.user || state.notificationChannel)
          return;

        const channel = supabase
          .channel(`notifications-${state.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${state.user.id}`,
            },
            (payload) => {
              const now = Date.now();
              const id = payload.new.id;

              set((current) => {
                const dedupeMap = new Map(
                  current.notificationDedupeMap
                );

                const lastSeen =
                  dedupeMap.get(id);

                if (
                  lastSeen &&
                  now - lastSeen <
                    current.notificationWindowMs
                ) {
                  return {};
                }

                dedupeMap.set(id, now);

                return {
                  unreadCount:
                    current.unreadCount + 1,
                  notificationDedupeMap:
                    dedupeMap,
                };
              });
            }
          )
          .subscribe();

        set({ notificationChannel: channel });
      },

      /* ---------- Profile Loader ---------- */
      loadUserProfile: async (userId, token) => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, app_role")
          .eq("id", userId)
          .single();

        if (error) throw error;

        set({
          isAuthenticated: true,
          authToken: token,
          user: {
            id: data.id,
            email: data.email,
            app_role:
              (data.app_role ??
                "user") as "user" | "admin",
          },
        });

        setApiAuthToken(token);

        get().initNotificationRealtime();
        await get().loadSubscriptions();
      },

      /* ---------- Auth Actions ---------- */
      signIn: async (email, password) => {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;
        if (!data.session) return;

        await get().loadUserProfile(
          data.session.user.id,
          data.session.access_token
        );
      },

      signUp: async (email, password) => {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (error) throw error;
        if (!data.session) return;

        await get().loadUserProfile(
          data.session.user.id,
          data.session.access_token
        );
      },

      restoreSession: async () => {
        try {
          const { data } = await supabase.auth.getSession();

          if (!data.session) {
            set({
              isAuthenticated: false,
              authToken: null,
              user: null,
              subscriptions: [],
              activeMarketId: null,
              unreadCount: 0,
            });

            setApiAuthToken(null);
            return;
          }

          await get().loadUserProfile(
            data.session.user.id,
            data.session.access_token
          );
        } catch (error) {
          console.error("Session restore failed:", error);

          set({
            isAuthenticated: false,
            authToken: null,
            user: null,
          });

          setApiAuthToken(null);
        } finally {
          // 🔥 Hydration ownership now lives here
          set({ isHydrated: true });
        }
      },


      signOut: async () => {
        const { notificationChannel } = get();

        if (notificationChannel) {
          await supabase.removeChannel(
            notificationChannel
          );
        }

        await supabase.auth.signOut();

        set({
          isAuthenticated: false,
          authToken: null,
          user: null,
          vendorId: null,
          markets: [],
          subscriptions: [],
          activeMarketId: null,
          activeOrderId: null,
          unreadCount: 0,
          notificationChannel: null,
          notificationDedupeMap: new Map(),
        });

        setApiAuthToken(null);
      },
    }),
    {
      name: "app-storage",
      storage,
      
      partialize: (state) => ({
        theme: state.theme,
        subscriptions: state.subscriptions,
        activeMarketId: state.activeMarketId,
        vendorId: state.vendorId,
      }),
    }
  )
);
