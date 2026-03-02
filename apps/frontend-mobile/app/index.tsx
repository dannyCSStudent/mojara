import { Redirect } from "expo-router";
import { useAppStore } from "../store/useAppStore";

export default function AppEntry() {
  console.log("Zustand store hydrated, rendering app...");
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isHydrated = useAppStore((s) => s.isHydrated);

  if (!isHydrated) {
    return null; // later: splash / loader
  }
  
  return isAuthenticated ? (
    <Redirect href="/(private)" />
  ) : (
    <Redirect href="/(public)" />
  );
}
