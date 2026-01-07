

import { Redirect, Slot } from "expo-router";
import { useAppStore } from "../../store/useAppStore";

export default function PrivateLayout() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(public)" />;
  }

  return <Slot screenOptions={{ headerShown: false }} />;
}
