import { Redirect, Slot } from "expo-router";
import { useAppStore } from "../../../store/useAppStore";

export default function AdminLayout() {
  const user = useAppStore((s) => s.user);
  const isHydrated = useAppStore((s) => s.isHydrated);

  if (!isHydrated) return null;

  // 🛡 Only allow admins
  if (user?.app_role !== "admin") {
    return <Redirect href="/(private)" />;
  }

  return <Slot />;
}
