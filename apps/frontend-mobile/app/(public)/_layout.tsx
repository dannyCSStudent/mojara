import { Redirect, Slot } from "expo-router";
import { useAppStore } from "../../store/useAppStore";

export default function PublicLayout() {
  const isAuthenticated = useAppStore(
    (s) => s.isAuthenticated
  );

  if (isAuthenticated) {
    return <Redirect href="/(private)" />;
  }

  return <Slot />;
}
