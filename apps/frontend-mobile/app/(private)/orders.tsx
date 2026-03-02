
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { fetchOrdersCursor } from "../../api/orders";

const STATUSES = ["all", "pending", "confirmed", "canceled"] as const;
type SortOption = "newest" | "oldest" | "highest";

console.log("OrdersScreen component mounted");

export default function OrdersScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();

  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const isAdmin = user?.app_role === "admin";

  const [orders, setOrders] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const activeStatus = status ?? "all";

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const loadInitial = useCallback(async () => {
    setLoading(true);

    const res = await fetchOrdersCursor({
      scope: isAdmin ? "vendor" : "user",
      status: activeStatus === "all" ? undefined : activeStatus,
      sort,
      search: debouncedQuery || undefined,
      limit: 20,
    });

    setOrders(res.data);
    setCursor(res.next_cursor);
    setLoading(false);
  }, [isAdmin, activeStatus, sort, debouncedQuery]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;

    setLoadingMore(true);
    console.log("Loading more orders with cursor:", cursor);

    const res = await fetchOrdersCursor({
      scope: isAdmin ? "vendor" : "user",
      status: activeStatus === "all" ? undefined : activeStatus,
      sort,
      search: debouncedQuery || undefined,
      cursor,
      limit: 20,
    });

    setOrders((prev) => [...prev, ...res.data]);
    setCursor(res.next_cursor);
    setLoadingMore(false);
  }, [cursor, loadingMore, isAdmin, activeStatus, sort, debouncedQuery]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  function setFilter(next: string) {
    if (next === "all") {
      router.replace("/(private)/orders");
    } else {
      router.replace({
        pathname: "/(private)/orders",
        params: { status: next },
      });
    }
  }

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

  if (!loading && orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-center">
          No orders found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">
        {isAdmin ? "Orders" : "My Orders"}
      </Text>

      {/* Search */}
      <TextInput
        placeholder="Search by Order ID..."
        value={query}
        onChangeText={setQuery}
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        autoCapitalize="none"
      />

      {/* Sort */}
      <View className="flex-row mb-4">
        {["newest", "oldest", "highest"].map((value) => {
          const active = sort === value;

          return (
            <Pressable
              key={value}
              onPress={() => setSort(value as SortOption)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                active ? "bg-black border-black" : "border-gray-300"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  active ? "text-white" : "text-gray-600"
                }`}
              >
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Admin Tabs */}
      {isAdmin && (
        <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
          {STATUSES.map((s) => {
            const isActive = activeStatus === s;

            return (
              <Pressable
                key={s}
                onPress={() => setFilter(s)}
                className={`flex-1 py-2 rounded-lg ${
                  isActive ? "bg-white shadow" : ""
                }`}
              >
                <Text className="text-center font-medium">
                  {s.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

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

            <Text className="mt-1 font-medium">
              {item.status.toUpperCase()}
            </Text>

            <Text className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </Pressable>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator /> : null
        }
      />
    </View>
  );
}
