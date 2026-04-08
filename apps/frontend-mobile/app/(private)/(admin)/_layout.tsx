import { Redirect, Slot } from 'expo-router';
import { useAppStore } from '../../../store/useAppStore';
import { hasPermission, ROUTE_PERMISSIONS } from '@repo/permissions';

export default function AdminLayout() {
  const user = useAppStore((s) => s.user);
  const isHydrated = useAppStore((s) => s.isHydrated);

  if (!isHydrated) return null;

  if (!user) {
    return <Redirect href="/(public)/login" />;
  }

  if (!hasPermission(user.app_role, ROUTE_PERMISSIONS.adminDashboard)) {
    return <Redirect href="/(private)" />;
  }

  return <Slot />;
}

//   if (!hasPermission(user.app_role, "dashboard.admin")) {
//   return <Text>You do not have access to this area.</Text>;
// }
