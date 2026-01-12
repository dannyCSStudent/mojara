import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { createOrder, confirmOrder } from "../../api/orders";
import { useAppStore } from "../../store/useAppStore";
import { Order } from "../../api/types";
import { useCartStore } from "../../store/useCartStore";

export default function CheckoutScreen() {
  const router = useRouter();

  /* ---------- Cart state (single source of truth) ---------- */
  const marketId = useCartStore((s) => s.marketId);
  const vendorId = useCartStore((s) => s.vendorId);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const lockCart = useCartStore((s) => s.lockCart);


  /* ---------- App state ---------- */
  const user = useAppStore((s) => s.user);
  const setActiveOrderId = useAppStore((s) => s.setActiveOrderId);

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  /* ---------- Guard invalid access ---------- */
  if (!marketId || !vendorId || items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg">Invalid checkout session</Text>
      </View>
    );
  }

  const safeMarketId = marketId!;
  const safeVendorId = vendorId!;

  async function handleCheckout() {
    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const createdOrder = await createOrder(
        safeMarketId,
        safeVendorId,
        {
          user_id: user.id,
          items,
        }
      );

      setOrder(createdOrder);
      setActiveOrderId(createdOrder.id);
      lockCart(); // 🔒
    } catch (err: any) {
      Alert.alert("Checkout failed", err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!order || order.status !== "pending") return;

    try {
      setLoading(true);

      await confirmOrder(order.id);

      setActiveOrderId(null);
      clearCart(); // 🔥 single source cleanup
      Alert.alert("Success", "Order confirmed!");
      router.replace("/(private)/orders");
    } catch (err: any) {
      Alert.alert("Confirmation failed", err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Checkout</Text>

      <View className="mb-6">
        {items.map((item) => (
          <View
            key={item.product_id}
            className="flex-row justify-between mb-2"
          >
            <Text>{item.name}</Text>
            <Text>x{item.quantity}</Text>
          </View>
        ))}
      </View>

      {!order ? (
        <Pressable
          onPress={handleCheckout}
          disabled={loading}
          className="bg-black rounded-xl p-4"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">
              Place Order
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          onPress={handleConfirm}
          disabled={loading || order.status !== "pending"}
          className="bg-green-600 rounded-xl p-4"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">
              Confirm Order
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
