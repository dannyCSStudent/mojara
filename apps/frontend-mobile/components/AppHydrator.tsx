import { useEffect } from "react";
// import { View } from "react-native";
import { useAppStore } from "../store/useAppStore";
import { LoadingState } from "./LoadingState";

interface AppHydratorProps {
  children: React.ReactNode;
}

export function AppHydrator({ children }: AppHydratorProps) {
  const isHydrated = useAppStore((s) => s.isHydrated);
  const setHydrated = useAppStore((s) => s.setHydrated);

  useEffect(() => {
    // Placeholder for:
    // - token restore
    // - theme restore
    // - session restore
    setHydrated(true);
  }, [setHydrated]);

  if (!isHydrated) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
