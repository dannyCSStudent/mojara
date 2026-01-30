import { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { Screen, AppText } from "../../../components";
import {
  fetchAdminPrices,
  lockPriceAgreement,
  AdminPriceAgreement,
} from "../../../api/adminPrices";

export default function AdminPricesScreen() {
  const [prices, setPrices] = useState<AdminPriceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setForbidden(false);

      const data = await fetchAdminPrices();
      setPrices(data);
    } catch (err: any) {
      if (err.message === "FORBIDDEN") {
        setForbidden(true);
      } else {
        console.error("Failed to load admin prices:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLock(id: string) {
    try {
      setLockingId(id);
      await lockPriceAgreement(id);

      // Optimistic UI update
      setPrices((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "locked" } : p
        )
      );
    } catch (err: any) {
      if (err.message === "FORBIDDEN") {
        setForbidden(true);
      } else {
        console.error("Failed to lock price agreement:", err);
      }
    } finally {
      setLockingId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------- Permission guard ---------- */
  if (forbidden) {
    return (
      <Screen>
        <AppText variant="headline">Access denied</AppText>
        <AppText variant="muted" className="mt-2">
          You do not have permission to view this page.
        </AppText>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <AppText variant="muted">Loading price agreements…</AppText>
      </Screen>
    );
  }

  if (prices.length === 0) {
    return (
      <Screen>
        <AppText variant="muted">No price agreements found</AppText>
      </Screen>
    );
  }

  return (
    <Screen className="gap-4">
      <AppText variant="headline">Admin · Prices</AppText>

      {prices.map((price) => {
        const isDraft = price.status === "draft";

        return (
          <View
            key={price.id}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="subheading">
                {price.reference_price} / kg
              </AppText>

              <View
                className={`px-2 py-1 rounded-full ${
                  isDraft
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : "bg-green-100 dark:bg-green-900"
                }`}
              >
                <AppText
                  variant="caption"
                  className={
                    isDraft
                      ? "text-yellow-800 dark:text-yellow-300"
                      : "text-green-800 dark:text-green-300"
                  }
                >
                  {price.status.toUpperCase()}
                </AppText>
              </View>
            </View>

            {/* Meta */}
            <AppText variant="caption">
              Confidence: {Math.round(price.confidence_score * 100)}%
            </AppText>
            <AppText variant="caption">
              Samples: {price.sample_count}
            </AppText>

            {/* Admin action */}
            {isDraft && (
              <Pressable
                disabled={lockingId === price.id}
                onPress={() => handleLock(price.id)}
                className="mt-3 rounded-xl bg-black dark:bg-white px-4 py-3"
              >
                <AppText
                  className="text-center text-white dark:text-black font-semibold"
                >
                  {lockingId === price.id ? "Locking…" : "Lock price"}
                </AppText>
              </Pressable>
            )}
          </View>
        );
      })}
    </Screen>
  );
}
