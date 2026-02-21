import { useEffect } from "react";
import { Slot, router } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { supabase } from "../lib/supabase";
import "../global.css";

export default function RootLayout() {
  const restoreSession = useAppStore((s) => s.restoreSession);
  const isHydrated = useAppStore((s) => s.isHydrated);

  useEffect(() => {
  restoreSession().catch(console.error);
}, [restoreSession]);


  // ✅ Listen for password recovery events
  useEffect(() => {
    const { data: subscription } =
      supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          router.replace("/reset-password");
        }
      });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (!isHydrated) {
    return null;
  }

  return <Slot />;
}
