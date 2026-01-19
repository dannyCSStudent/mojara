import { useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { Screen, AppText } from "../../../components";
import {
  fetchVendorOrders,
  confirmOrder,
  cancelOrder,
} from "../../../api/orders";
import { Order } from "../../../api/types";
import { usePolling } from "../../../hooks/usePolling";

export default function VendorOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  /* ---------- Fetch ---------- */
  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchVendorOrders(signal);

      // Oldest → newest
      data.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

      setOrders(data);
      setLoading(false);
    } catch {
      // silent retry (important for sleep / resume)
    }
  }, []);

  /* ---------- Focus handling ---------- */
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      loadOrders();

      return () => setFocused(false);
    }, [loadOrders])
  );

  /* ---------- Poll only if needed ---------- */
  const hasPending = useMemo(
    () => orders.some((o) => o.status === "pending"),
    [orders]
  );

  usePolling(loadOrders, 4000, focused && hasPending);

  /* ---------- Actions ---------- */
  async function handleConfirm(orderId: string) {
    try {
      setActing(orderId);

      // Optimistic UI
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "confirmed" } : o
        )
      );

      await confirmOrder(orderId);
    } catch {
      Alert.alert("Error", "Failed to confirm order");
      loadOrders();
    } finally {
      setActing(null);
    }
  }

  function handleCancel(orderId: string) {
    Alert.alert("Cancel Order", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setActing(orderId);

            setOrders((prev) =>
              prev.map((o) =>
                o.id === orderId ? { ...o, status: "canceled" } : o
              )
            );

            await cancelOrder(orderId);
          } catch {
            Alert.alert("Error", "Failed to cancel order");
            loadOrders();
          } finally {
            setActing(null);
          }
        },
      },
    ]);
  }

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  const pending = orders.filter((o) => o.status === "pending");
  const completed = orders.filter((o) => o.status !== "pending");

  return (
    <Screen className="gap-4">
      <AppText variant="title">Incoming Orders</AppText>

      {pending.length === 0 && completed.length === 0 && (
        <AppText>No orders yet</AppText>
      )}

      {/* 🔴 Pending */}
      {pending.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          acting={acting}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ))}

      {/* 🟢 Completed */}
      {completed.length > 0 && (
        <>
          <AppText className="mt-6 text-sm opacity-70">
            Completed
          </AppText>

          {completed.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              acting={null}
            />
          ))}
        </>
      )}
    </Screen>
  );
}

/* ---------- Card ---------- */
function OrderCard({
  order,
  acting,
  onConfirm,
  onCancel,
}: {
  order: Order;
  acting: string | null;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  return (
    <View className="border rounded-xl p-4 gap-2">
      <AppText className="font-semibold">
        Order #{order.id.slice(0, 8)}
      </AppText>

      <AppText>
        Status: {order.status.toUpperCase()}
      </AppText>

      {(order.items ?? []).map((item) => (
        <AppText key={item.product_id} className="text-sm">
          • {item.name || item.product_id.slice(0, 6)} ×{" "}
          {item.quantity}
        </AppText>
      ))}

      {order.status === "pending" && onConfirm && onCancel && (
        <View className="flex-row gap-2 mt-2">
          <Pressable
            disabled={acting === order.id}
            onPress={() => onConfirm(order.id)}
            className="flex-1 bg-green-600 rounded-lg p-3"
          >
            <AppText className="text-white text-center">
              Confirm
            </AppText>
          </Pressable>

          <Pressable
            disabled={acting === order.id}
            onPress={() => onCancel(order.id)}
            className="flex-1 bg-red-600 rounded-lg p-3"
          >
            <AppText className="text-white text-center">
              Cancel
            </AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
