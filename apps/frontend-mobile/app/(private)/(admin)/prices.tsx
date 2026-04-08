import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Screen, AppText } from '../../../components';
import {
  fetchAdminPriceExplain,
  fetchAdminPrices,
  lockPriceAgreement,
  AdminPriceAgreement,
  AdminPriceExplainRow,
} from '../../../api/adminPrices';
import { fetchMarkets, Market } from '../../../api/markets';

const STATUSES = ['all', 'draft', 'locked'] as const;

export default function AdminPricesScreen() {
  const [prices, setPrices] = useState<AdminPriceAgreement[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>('all');
  const [explainRows, setExplainRows] = useState<AdminPriceExplainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setForbidden(false);
      setError(null);

      const [marketData, priceData] = await Promise.all([
        fetchMarkets(),
        fetchAdminPrices({
          status: statusFilter === 'all' ? undefined : statusFilter,
          marketId: selectedMarketId ?? undefined,
        }),
      ]);
      setMarkets(marketData);
      setSelectedMarketId((current) => current ?? marketData[0]?.id ?? null);
      setPrices(priceData);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        setForbidden(true);
      } else {
        setError(err.message ?? 'Failed to load admin prices.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedMarketId, statusFilter]);

  async function loadExplain(marketId: string) {
    try {
      setLoadingExplain(true);
      setError(null);
      const data = await fetchAdminPriceExplain(marketId);
      setExplainRows(data);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        setForbidden(true);
      } else {
        setError(err.message ?? 'Failed to load price explanation.');
      }
    } finally {
      setLoadingExplain(false);
    }
  }

  async function handleLock(id: string) {
    try {
      setLockingId(id);
      await lockPriceAgreement(id);

      // Optimistic UI update
      setPrices((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'locked' } : p)));
    } catch (err: any) {
      if (err.message === 'FORBIDDEN') {
        setForbidden(true);
      } else {
        console.error('Failed to lock price agreement:', err);
      }
    } finally {
      setLockingId(null);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedMarketId) {
      setExplainRows([]);
      return;
    }

    void loadExplain(selectedMarketId);
  }, [selectedMarketId]);

  const selectedMarket = useMemo(
    () => markets.find((market) => market.id === selectedMarketId) ?? null,
    [markets, selectedMarketId]
  );

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

  return (
    <Screen className="gap-4">
      <AppText variant="headline">Admin · Prices</AppText>

      <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <AppText variant="subheading">Filters</AppText>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}>
          {STATUSES.map((status) => {
            const active = statusFilter === status;
            return (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-2 ${
                  active
                    ? 'border-black bg-black dark:border-white dark:bg-white'
                    : 'border-gray-300 dark:border-gray-700'
                }`}>
                <AppText className={active ? 'text-white dark:text-black' : ''}>
                  {status === 'all' ? 'All statuses' : status}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}>
          {markets.map((market) => {
            const active = selectedMarketId === market.id;
            return (
              <Pressable
                key={market.id}
                onPress={() => setSelectedMarketId(market.id)}
                className={`rounded-full border px-3 py-2 ${
                  active
                    ? 'border-black bg-black dark:border-white dark:bg-white'
                    : 'border-gray-300 dark:border-gray-700'
                }`}>
                <AppText className={active ? 'text-white dark:text-black' : ''}>
                  {market.name}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {selectedMarket ? (
        <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <AppText variant="subheading">Explainability · {selectedMarket.name}</AppText>
          {loadingExplain ? (
            <AppText variant="caption">Loading explanation…</AppText>
          ) : explainRows.length === 0 ? (
            <AppText variant="caption">No explanation rows found for this market.</AppText>
          ) : (
            explainRows.map((row) => (
              <View
                key={`${row.market_id}-${row.size_band}-${row.created_at}`}
                className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
                <AppText variant="caption">{row.size_band}</AppText>
                <AppText variant="caption">
                  Reference: {row.reference_price} / kg · Confidence:{' '}
                  {Math.round(row.confidence_score * 100)}%
                </AppText>
                <AppText variant="caption">Samples: {row.sample_count}</AppText>
                <AppText variant="caption">Status: {row.status}</AppText>
              </View>
            ))
          )}
        </View>
      ) : null}

      {error ? (
        <View className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AppText variant="caption" className="text-red-700 dark:text-red-300">
            {error}
          </AppText>
        </View>
      ) : null}

      {prices.length === 0 ? (
        <View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <AppText variant="muted">No price agreements found for the current filters.</AppText>
        </View>
      ) : null}

      {prices.map((price) => {
        const isDraft = price.status === 'draft';

        return (
          <View
            key={price.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <View className="mb-2 flex-row items-center justify-between">
              <AppText variant="subheading">{price.reference_price} / kg</AppText>

              <View
                className={`rounded-full px-2 py-1 ${
                  isDraft ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-green-100 dark:bg-green-900'
                }`}>
                <AppText
                  variant="caption"
                  className={
                    isDraft
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : 'text-green-800 dark:text-green-300'
                  }>
                  {price.status.toUpperCase()}
                </AppText>
              </View>
            </View>

            {/* Meta */}
            <AppText variant="caption">
              Confidence: {Math.round(price.confidence_score * 100)}%
            </AppText>
            <AppText variant="caption">Samples: {price.sample_count}</AppText>
            <AppText variant="caption">Market: {price.market_id}</AppText>
            <AppText variant="caption">Size band: {price.size_band_id}</AppText>

            {/* Admin action */}
            {isDraft && (
              <Pressable
                disabled={lockingId === price.id}
                onPress={() => handleLock(price.id)}
                className="mt-3 rounded-xl bg-black px-4 py-3 dark:bg-white">
                <AppText className="text-center font-semibold text-white dark:text-black">
                  {lockingId === price.id ? 'Locking…' : 'Lock price'}
                </AppText>
              </Pressable>
            )}
          </View>
        );
      })}
    </Screen>
  );
}
