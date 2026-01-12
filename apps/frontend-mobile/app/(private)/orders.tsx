import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { fetchMyOrders } from "../../api/orders";
import { Order } from "../../api/types";
import { usePolling } from "../../hooks/usePolling";


export default function OrdersScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  usePolling(
  loadOrders,
  5000, // every 5 seconds
  isAuthenticated
  );

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

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
          <Pressable
            onPress={() =>
              router.push(`/(private)/orders/${item.id}`)
            }
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
