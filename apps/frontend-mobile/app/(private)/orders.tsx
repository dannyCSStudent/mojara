import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { fetchMyOrders } from "../../api/orders";
import { Order } from "../../api/types";
import { supabase } from "../../lib/supabase";

export default function OrdersScreen() {

  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [initialLoad, setInitialLoad] = useState(true);

const loadOrders = useCallback(async () => {
  if (!isAuthenticated || !user) return;

  if (initialLoad) setLoading(true);

  try {
    const data = await fetchMyOrders();
    setOrders(data);
  } finally {
    setLoading(false);
    setInitialLoad(false);
  }
}, [isAuthenticated, user, initialLoad]);

useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel(`orders-${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("ORDER REALTIME:", payload);

        setOrders((prev) => {
          const order = payload.new as Order;

          if (payload.eventType === "INSERT") {
            return [order, ...prev];
          }

          if (payload.eventType === "UPDATE") {
            return prev.map((o) =>
              o.id === order.id ? order : o
            );
          }

          if (payload.eventType === "DELETE") {
            return prev.filter(
              (o) => o.id !== payload.old.id
            );
          }

          return prev;
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

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


