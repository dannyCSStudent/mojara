import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";

export default function PrivateLayout() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isHydrated = useAppStore((s) => s.isHydrated);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* ✅ Visible tabs */}
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

      {/* 🚫 Hidden routes */}
      <Tabs.Screen name="checkout" options={{ href: null }} />

      <Tabs.Screen name="markets" options={{ href: null }} />
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
