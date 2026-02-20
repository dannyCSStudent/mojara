import { Redirect, Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";
import { useEffect } from "react";
import { fetchUnreadCount } from "../../api/notifications";

export default function PrivateLayout() {
  const pathname = usePathname();

  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);
  const hasCompletedOnboarding = useAppStore(
  (s) => s.subscriptions.length > 0
);


  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    let mounted = true;

    async function loadUnread() {
      try {
        const count = await fetchUnreadCount();
        if (mounted) {
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("Failed to load unread count", err);
      }
    }

    loadUnread();

    return () => {
      mounted = false;
    };
  }, [isHydrated, isAuthenticated, setUnreadCount]);

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  // ✅ Allow onboarding route to render itself
 const isOnboardingRoute = pathname.includes("onboarding");

if (!hasCompletedOnboarding && !isOnboardingRoute) {
  return <Redirect href="/(private)/onboarding" />;
}

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Visible Tabs */}

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />

      <Tabs.Screen name="markets/manage" options={{ href: null }} />

      {/* Hidden Routes */}
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      {/* <Tabs.Screen name="markets" options={{ href: null }} /> */}
      <Tabs.Screen name="markets/[marketId]" options={{ href: null }} />
      <Tabs.Screen
        name="markets/vendors/[vendorId]"
        options={{ href: null }}
      />
      <Tabs.Screen name="orders/[orderId]" options={{ href: null }} />
      <Tabs.Screen name="vendor" options={{ href: null }} />
      <Tabs.Screen name="vendor/orders" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="admin/prices" options={{ href: null }} />
    </Tabs>
  );
}
