import { View, Text, ActivityIndicator, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { useOrdersRealtime } from "../../hooks/useOrdersRealtime";
import { useOrdersAdminRealtime } from "../../hooks/useOrdersAdminRealtime";

export default function OrdersScreen() {
  const router = useRouter();

  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const isAdmin = user?.app_role === "admin";

  // ✅ ALWAYS call both hooks
  const userOrders = useOrdersRealtime(!isAdmin);
  const adminOrders = useOrdersAdminRealtime(isAdmin);

  // ✅ Pick data AFTER hooks are called
  const orders = isAdmin ? adminOrders.orders : userOrders.orders;
  const loading = isAdmin ? adminOrders.loading : userOrders.loading;

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>You must be logged in</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg">No orders yet</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">
        {isAdmin ? "All Orders" : "My Orders"}
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(private)/orders/${item.id}`)}
            className="border rounded-xl p-4 mb-3"
          >
            <Text className="font-semibold">
              Order #{item.id.slice(0, 8)}
            </Text>

            <Text
              className={`mt-1 font-medium ${
                item.status === "confirmed"
                  ? "text-green-600"
                  : item.status === "canceled"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {item.status.toUpperCase()}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
