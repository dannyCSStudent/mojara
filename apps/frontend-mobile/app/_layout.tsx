import { useEffect } from "react";
import { Slot } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import "../global.css";

export default function RootLayout() {
  const restoreSession = useAppStore((s) => s.restoreSession);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const isHydrated = useAppStore((s) => s.isHydrated);

  useEffect(() => {
    restoreSession()
      .catch(console.error)
      .finally(() => setHydrated(true));
  }, [restoreSession, setHydrated]);

  if (!isHydrated) {
    return null;
  }

  return <Slot />;
}
