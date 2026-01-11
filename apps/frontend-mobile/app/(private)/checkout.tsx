import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createOrder, confirmOrder } from "../../api/orders";
import { useAppStore } from "../../store/useAppStore";
import { Order } from "../../api/types";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    marketId: string;
    vendorId: string;
    items: string;
  }>();

  const { marketId, vendorId } = params;

  let items: any[] = [];
  try {
    items = JSON.parse(params.items ?? "[]");
  } catch {
    Alert.alert("Error", "Invalid checkout data");
  }

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

  async function handleCheckout() {
    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const createdOrder = await createOrder(marketId, vendorId, {
        user_id: user.id,
        items,
      });

      setOrder(createdOrder);
      setActiveOrderId(createdOrder.id);
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
        {items.map((item: any) => (
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
