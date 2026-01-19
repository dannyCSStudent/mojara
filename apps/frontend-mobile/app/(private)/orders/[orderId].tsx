import { useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { Screen, AppText } from "../../../components";
import { getOrder, cancelOrder } from "../../../api/orders";
import { Order } from "../../../api/types";
import { usePolling } from "../../../hooks/usePolling";


export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [focused, setFocused] = useState(true);

  useFocusEffect(
  useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, [])
);



  /* ---------- Fetch ---------- */
  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    const data = await getOrder(orderId);
    setOrder(data);
    setLoading(false);
  }, [orderId]);

  /* ---------- Poll (pending only) ---------- */
  usePolling(
  loadOrder,
  3000,
  focused && !!orderId && order?.status === "pending"
);


  /* ---------- Cancel ---------- */
  async function handleCancelOrder() {
    if (!order || order.status !== "pending") return;

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setCanceling(true);
              const updated = await cancelOrder(order.id);
              setOrder(updated);
            } catch {
              Alert.alert("Error", "Failed to cancel order");
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  }

  /* ---------- UI ---------- */
  if (loading && !order) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <AppText>Order not found</AppText>
      </Screen>
    );
  }

  const total = (order.items ?? []).reduce(
  (sum, i) => sum + i.price * i.quantity,
  0
);


  return (
    <Screen className="gap-4">
      <AppText variant="title">
        Order #{order.id.slice(0, 8)}
      </AppText>

      <AppText>Status: {order.status.toUpperCase()}</AppText>
      <AppText>
        Placed: {new Date(order.created_at).toLocaleString()}
      </AppText>

      <View className="border-t pt-4 gap-2">
        {(order.items ?? []).map((item) => (
          <View
            key={item.product_id}
            className="flex-row justify-between"
          >
            <AppText>
              {item.name} × {item.quantity}
            </AppText>
            <AppText>
              ${(item.price * item.quantity).toFixed(2)}
            </AppText>
          </View>
        ))}
      </View>

      <View className="border-t pt-4">
        <AppText variant="title">
          Total: ${total.toFixed(2)}
        </AppText>
      </View>

      {/* 🔥 Cancel Order */}
      {order.status === "pending" && (
        <Pressable
          disabled={canceling}
          onPress={handleCancelOrder}
          className={`rounded-xl p-4 mt-4 ${
            canceling ? "bg-red-300" : "bg-red-600"
          }`}
        >
          <AppText className="text-white text-center font-semibold">
            {canceling ? "Canceling..." : "Cancel Order"}
          </AppText>
        </Pressable>
      )}
    </Screen>
  );
}
