import { useEffect } from "react";
import { Slot } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import '../global.css'



export default function RootLayout() {
  const restoreSession = useAppStore((s) => s.restoreSession);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const isHydrated = useAppStore((s) => s.isHydrated);

  useEffect(() => {
    const boot = async () => {
      try {
        await restoreSession();
      } finally {
        setHydrated(true);
      }
    };

    boot();
  }, [restoreSession, setHydrated]);

  // Prevent rendering until auth state is known
  if (!isHydrated) {
    return null; // or splash / loader later
  }

  return <Slot />;
}
