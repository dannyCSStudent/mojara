import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMarkets, Market } from '../api/markets';
import {
  createMarketSubscription,
  deleteMarketSubscription,
  fetchMarketSubscriptions,
} from '../api/marketSubscriptions';
import { supabase } from '../lib/supabase';
import { setApiAuthToken } from '../api/client';
import { storage } from './storage';

/* =========================
   Types
========================= */
export type AppRole = 'admin' | 'moderator' | 'user' | 'vendor';
export type AppUser = {
  id: string;
  email: string;
  app_role: AppRole;
};

interface AppState {
  /* ---------- Lifecycle ---------- */
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;

  /* ---------- UI ---------- */
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: AppState['theme']) => void;

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
      theme: 'system',
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

        const data = await fetchMarketSubscriptions();
        const loadedSubs = data?.map((row) => row.market_id) ?? [];

        set((state) => {
          let updatedActive = state.activeMarketId;

          if (updatedActive && !loadedSubs.includes(updatedActive)) {
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
        const isSubscribed = state.subscriptions.includes(marketId);
        const previousSubscriptions = state.subscriptions;
        const previousActiveMarketId = state.activeMarketId;

        // Optimistic update
        set((prev) => {
          let updatedSubs: string[];

          if (isSubscribed) {
            updatedSubs = prev.subscriptions.filter((id) => id !== marketId);
          } else {
            updatedSubs = [...prev.subscriptions, marketId];
          }

          let updatedActive = prev.activeMarketId;

          if (isSubscribed && prev.activeMarketId === marketId) {
            updatedActive = null;
          }

          if (!updatedActive && updatedSubs.length > 0) {
            updatedActive = updatedSubs[0];
          }

          return {
            subscriptions: updatedSubs,
            activeMarketId: updatedActive,
          };
        });

        try {
          if (isSubscribed) {
            await deleteMarketSubscription(marketId);
          } else {
            await createMarketSubscription(marketId);
          }
        } catch (error) {
          set({
            subscriptions: previousSubscriptions,
            activeMarketId: previousActiveMarketId,
          });
          throw error;
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
      setUnreadCount: (count) => set({ unreadCount: count }),

      /* ---------- Profile Loader ---------- */
      loadUserProfile: async (userId, token) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error('User not found');

        const role = (user.app_metadata?.role ?? 'user') as AppRole;
        const vendorId =
          typeof user.app_metadata?.vendor_id === 'string' ? user.app_metadata.vendor_id : null;

        set({
          isAuthenticated: true,
          authToken: token,
          vendorId,
          user: {
            id: user.id,
            email: user.email ?? '',
            app_role: role,
          },
        });

        setApiAuthToken(token);

        await get().loadSubscriptions();
      },

      /* ---------- Auth Actions ---------- */
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.session) return;

        await get().loadUserProfile(data.session.user.id, data.session.access_token);
      },

      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        if (!data.session) return;

        await get().loadUserProfile(data.session.user.id, data.session.access_token);
      },

      restoreSession: async () => {
        try {
          const { data } = await supabase.auth.getSession();

          if (!data.session) {
            set({
              isAuthenticated: false,
              authToken: null,
              user: null,
              vendorId: null,
              subscriptions: [],
              activeMarketId: null,
              unreadCount: 0,
            });

            setApiAuthToken(null);
            return;
          }

          await get().loadUserProfile(data.session.user.id, data.session.access_token);
        } catch (error) {
          console.error('Session restore failed:', error);

          set({
            isAuthenticated: false,
            authToken: null,
            user: null,
            vendorId: null,
          });

          setApiAuthToken(null);
        } finally {
          // 🔥 Hydration ownership now lives here
          set({ isHydrated: true });
        }
      },

      signOut: async () => {
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
        });

        setApiAuthToken(null);
      },
    }),
    {
      name: 'app-storage',
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
