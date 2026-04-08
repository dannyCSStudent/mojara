import { useEffect } from 'react';
import { Slot, router } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { setApiAuthToken } from '../api/client';
import '../global.css';

export default function RootLayout() {
  const restoreSession = useAppStore((s) => s.restoreSession);
  const isHydrated = useAppStore((s) => s.isHydrated);

  /* =========================
     Restore Zustand session
  ========================= */
  useEffect(() => {
    restoreSession().catch(console.error);
  }, [restoreSession]);

  /* =========================
     🔥 Sync initial Supabase session → API token
  ========================= */
  useEffect(() => {
    async function syncInitialSession() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      setApiAuthToken(token);
    }

    syncInitialSession();
  }, []);

  /* =========================
     🔥 Listen for auth changes
     - Keep API token in sync
     - Handle password recovery
  ========================= */
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const token = session?.access_token ?? null;
      setApiAuthToken(token);

      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/reset-password');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <Slot />;
}
