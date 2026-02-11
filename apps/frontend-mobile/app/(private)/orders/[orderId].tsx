import { useState, useCallback, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { Screen, AppText } from "../../../components";
import { getOrder, cancelOrder } from "../../../api/orders";
import { Order } from "../../../api/types";
import { usePolling } from "../../../hooks/usePolling";
import { issueRefund } from "../../../api/refunds";
import { formatOrderEvent } from "../../../utils/orderEvents";

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  /* ---------- Status ---------- */
  const status = order?.status;
  const isPending = status === "pending";
  const isConfirmed = status === "confirmed";
  const isCanceled = status === "canceled";
  


  /* ---------- Refund Modal ---------- */
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  

  /* ---------- Fetch ---------- */
  const loadOrder = useCallback(async () => {
    
    if (!orderId) return;

    try {
      const data = await getOrder(orderId);
    
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    setOrder(null);
    setLoading(true);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrder();
    }, [loadOrder])
  );

  usePolling(loadOrder, 3000, Boolean(isPending && orderId));

  /* ---------- Cancel ---------- */
  async function handleCancelOrder() {
    if (!order || !isPending) return;

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
              await cancelOrder(order.id);
              router.replace("/orders");
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
  /* ---------- Submit Refund ---------- */
  async function submitRefund() {
    

    if (!order) return;

    const amount = Number(refundAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid refund amount");
      return;
    }

    if (amount > remaining) {
      Alert.alert(
        "Too much",
      ` Maximum refundable amount is $${remaining.toFixed(2)}`
      );
      return;
    }

    try {
      setRefunding(true);
      await issueRefund(order.id, {
        amount,
        reason: refundReason?.trim() || undefined,
      });

      setRefundOpen(false);
      setRefundAmount("");
      setRefundReason("");
      await loadOrder();
    } catch (e: any) {
      Alert.alert("Refund failed", e.message);
    } finally {
      setRefunding(false);
    }
  }

  /* ---------- Ledger-safe totals ---------- */
  const itemsTotal =
    order?.items?.reduce(
      (sum, i) => sum + i.line_total,
      0
    ) ?? 0;
  const refundedTotal =
    order?.refunds?.reduce(
      (sum, r) => sum + r.amount,
      0
    ) ?? 0;

  const remaining = Math.max(itemsTotal - refundedTotal, 0);

  const hasRefunds = refundedTotal > 0;
  const isFullyRefunded = remaining === 0 && refundedTotal > 0;
  const refundDisabled = isFullyRefunded;
  const isFinalized = isCanceled || isFullyRefunded;

  /* ---------- UI states ---------- */
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

  /* ---------- Render ---------- */
  return (
    <Screen className="gap-4">
      <AppText variant="title">
        Order #{order.id.slice(0, 8)}
      </AppText>

      <AppText>Status: {status?.toUpperCase()}</AppText>

      {isConfirmed && (
        <AppText className="text-green-600 font-semibold">
          ✔ This order is confirmed
        </AppText>
      )}

      {isCanceled && (
        <AppText className="text-red-600 font-semibold">
          ✖ This order was cancelled
        </AppText>
      )}

      <AppText>
        Placed: {new Date(order.created_at).toLocaleString()}
      </AppText>

      {/* ---------- Items ---------- */}
      <View className="border-t pt-4 gap-3">
        {(order.items ?? []).map((item) => (
          <View
            key={item.product_id}
            className="flex-row justify-between items-start"
          >
            <View>
              <AppText>
                {item.name} × {item.quantity}
              </AppText>
              <AppText className="text-gray-500 text-sm">
                ${item.unit_price.toFixed(2)} each
              </AppText>
            </View>

            <AppText className="font-semibold">
              ${item.line_total.toFixed(2)}
            </AppText>
          </View>
        ))}
      </View>

      {/* ---------- Refund history ---------- */}
      {hasRefunds && (
        <View className="border-t pt-4 gap-3">
          <AppText variant="subheading">Refund History</AppText>

          {order.refunds.map((refund) => (
            <View
              key={refund.id}
              className="flex-row justify-between"
            >
              <View>
                <AppText>Refund</AppText>
                <AppText className="text-gray-500 text-sm">
                  {refund.reason ?? "No reason provided"}
                </AppText>
                <AppText className="text-gray-400 text-xs">
                  {new Date(refund.created_at).toLocaleString()}
                </AppText>
              </View>

              <AppText className="text-red-600 font-semibold">
                -${refund.amount.toFixed(2)}
              </AppText>
            </View>
          ))}
        </View>
      )}

      {/* ---------- Totals ---------- */}
      <View className="border-t pt-4 gap-1">
        <View className="flex-row justify-between">
          <AppText>Order Total</AppText>
          <AppText>${itemsTotal.toFixed(2)}</AppText>
        </View>

        {hasRefunds && (
          <View className="flex-row justify-between">
            <AppText>Refunded</AppText>
            <AppText className="text-red-600">
              -${refundedTotal.toFixed(2)}
            </AppText>
          </View>
        )}

        <View className="flex-row justify-between pt-2">
          <AppText variant="title">Balance</AppText>
          <AppText variant="title">
            ${remaining.toFixed(2)}
          </AppText>
        </View>

        {isFullyRefunded && (
          <AppText className="text-blue-600 font-semibold pt-2">
            💸 This order has been fully refunded
          </AppText>
        )}
      </View>

      {/* ---------- Actions ---------- */}
      {isPending && (
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

      <Pressable
        disabled={refundDisabled}
        onPress={() => setRefundOpen(true)}
        className={`rounded-xl p-4 ${
          refundDisabled ? "bg-gray-300" : "bg-blue-600"
        }`}
      >
        <AppText className="text-white text-center font-semibold">
          {refundDisabled ? "Fully Refunded" : "Issue Refund"}
        </AppText>
      </Pressable>
      
      {isFinalized && (
        <View className="mt-4">
          <AppText className="text-gray-500 text-sm italic">
            This order is finalized and can no longer be modified.
          </AppText>
        </View>
      )}
      {refundOpen && (
        <View className="absolute inset-0 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-xl p-5 gap-3">
            <AppText variant="title">Issue Refund</AppText>

            <AppText className="text-gray-500">
              Remaining balance: ${remaining.toFixed(2)}
            </AppText>

            <TextInput
              keyboardType="decimal-pad"
              placeholder="Refund amount"
              value={refundAmount}
              onChangeText={setRefundAmount}
              className="border rounded-lg px-3 py-2"
            />

            <TextInput
              placeholder="Reason (optional)"
              value={refundReason}
              onChangeText={setRefundReason}
              className="border rounded-lg px-3 py-2"
            />

            <View className="flex-row justify-end gap-3 pt-3">
              <Pressable onPress={() => setRefundOpen(false)}>
                <AppText className="text-gray-500">Cancel</AppText>
              </Pressable>

              <Pressable
                disabled={refunding}
                onPress={submitRefund}
              >
                <AppText className="text-blue-600 font-semibold">
                  {refunding ? "Refunding..." : "Confirm"}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      {order.events.map(event => (
        <View key={event.id}>
          <AppText>{formatOrderEvent(event)}</AppText>
          <AppText>{new Date(event.created_at).toLocaleString()}</AppText>
          {event.reason && <AppText>{event.reason}</AppText>}
        </View>
      ))}
    </Screen>
  );
}
