import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { fetchMyOrders } from "../../api/orders";
import { Order } from "../../api/types";

export default function OrdersScreen() {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function loadOrders() {
      try {
        const data = await fetchMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated, user]);

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
      <Text className="text-2xl font-bold mb-4">My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="border rounded-xl p-4 mb-3">
            <Text className="font-semibold">
              Order #{item.id.slice(0, 8)}
            </Text>
            <Text className="text-gray-600 mt-1">
              Status: {item.status.toUpperCase()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
