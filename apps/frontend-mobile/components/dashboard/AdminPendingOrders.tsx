import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AppText, LoadingState, EmptyState } from "../../components";
import { useOrdersAdminRealtime } from "../../hooks/useOrdersAdminRealtime";

export function AdminPendingOrders() {
  const router = useRouter();
  const { orders, loading } = useOrdersAdminRealtime(true);

  const pending = orders?.filter((o) => o.status === "pending") ?? [];
  const preview = pending.slice(0, 5);
  const hasMore = pending.length > 5;

  if (loading) return <LoadingState />;

  if (!pending.length) {
    return (
      <EmptyState
        title="No Pending Orders"
        description="All orders are processed."
      />
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 shadow space-y-4">
      <AppText className="text-lg font-semibold">
        Pending Orders
      </AppText>

      {/* Preview List */}
      {preview.map((order) => (
        <Pressable
          key={order.id}
          onPress={() =>
            router.push(`/(private)/orders/${order.id}`)
          }
          className="flex-row justify-between items-center border-b border-gray-100 pb-3 pt-2 active:opacity-60"
        >
          <View>
            <AppText className="font-semibold">
              #{order.id.slice(0, 8)}
            </AppText>
            <AppText className="text-gray-500 text-sm">
              {new Date(order.created_at).toLocaleString()}
            </AppText>
          </View>

          <View className="flex-row items-center gap-2">
            <AppText className="font-semibold">
              ${order.total.toFixed(2)}
            </AppText>
            <AppText className="text-gray-400">›</AppText>
          </View>
        </Pressable>
      ))}

      {/* View All CTA */}
      {hasMore && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(private)/orders",
              params: { status: "pending" },
            })
          }
          className="pt-2"
        >
          <AppText className="text-primary font-semibold text-center">
            View All Pending ({pending.length})
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
