import { useEffect, useState } from 'react';
import { Pressable, ActivityIndicator, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, AppText, EmptyState } from '../../../components';
import { useAppStore } from '../../../store/useAppStore';
import { fetchMarket, Market } from '../../../api/markets';
import { fetchVendors, Vendor } from '../../../api/vendors';

export default function MarketVendorsScreen() {
  const router = useRouter();
  const { marketId } = useLocalSearchParams<{ marketId: string }>();
  const subscriptions = useAppStore((s) => s.subscriptions);
  const activeMarketId = useAppStore((s) => s.activeMarketId);
  const setActiveMarket = useAppStore((s) => s.setActiveMarket);
  const toggleMarketSubscription = useAppStore((s) => s.toggleMarketSubscription);
  const loadMarkets = useAppStore((s) => s.loadMarkets);

  const [market, setMarket] = useState<Market | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!marketId) return;

    setLoading(true);
    setErrorMessage(null);

    Promise.all([fetchMarket(marketId).catch(() => null), fetchVendors(marketId, debouncedSearch)])
      .then(([marketData, vendorData]) => {
        setMarket(marketData);
        setVendors(vendorData);
      })
      .catch((error: any) => {
        setVendors([]);
        setErrorMessage(error?.message ?? 'Failed to load market vendors.');
      })
      .finally(() => setLoading(false));
  }, [marketId, debouncedSearch]);

  const isSubscribed = marketId ? subscriptions.includes(marketId) : false;
  const isActive = activeMarketId === marketId;

  async function handleToggleSubscription() {
    if (!marketId) return;

    try {
      setErrorMessage(null);
      await toggleMarketSubscription(marketId);
      await loadMarkets();
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Failed to update market subscription.');
    }
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
      </Screen>
    );
  }

  return (
    <Screen className="gap-4">
      <View className="gap-2 rounded-2xl bg-gray-100 p-5 dark:bg-neutral-800">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AppText variant="title">{market?.name ?? 'Market'}</AppText>

            {market?.location ? (
              <AppText variant="caption" className="mt-1 text-gray-500 dark:text-neutral-400">
                {market.location}
              </AppText>
            ) : null}
          </View>

          {isSubscribed ? (
            <AppText className="text-xs text-blue-600">Subscribed</AppText>
          ) : (
            <AppText className="text-xs text-gray-500 dark:text-neutral-400">
              Not subscribed
            </AppText>
          )}
        </View>

        {market?.description ? (
          <AppText variant="caption" className="text-gray-500 dark:text-neutral-400">
            {market.description}
          </AppText>
        ) : null}

        <View className="flex-row gap-2 pt-2">
          <Pressable
            onPress={handleToggleSubscription}
            className={`rounded-xl px-4 py-3 ${isSubscribed ? 'bg-black' : 'bg-blue-600'}`}>
            <AppText className="text-white">{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</AppText>
          </Pressable>

          {isSubscribed ? (
            <Pressable
              onPress={() => setActiveMarket(isActive ? null : (marketId ?? null))}
              className="rounded-xl border border-gray-300 px-4 py-3">
              <AppText>{isActive ? 'Clear Active' : 'Set Active'}</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <AppText variant="headline">Vendors</AppText>

      <View className="rounded-xl border border-gray-300 px-4 py-2">
        <TextInput
          placeholder="Search vendors..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {errorMessage ? (
        <View className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
          <AppText variant="caption" className="text-red-700 dark:text-red-300">
            {errorMessage}
          </AppText>
        </View>
      ) : null}

      {vendors.length === 0 ? (
        <EmptyState
          title="No Vendors Found"
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : 'This market does not have any visible vendors yet.'
          }
        />
      ) : (
        vendors.map((vendor) => (
          <Pressable
            key={vendor.id}
            onPress={() =>
              router.push({
                pathname: '/(private)/markets/vendors/[vendorId]',
                params: {
                  marketId,
                  vendorId: vendor.id,
                },
              })
            }
            className="rounded-xl border p-4">
            <AppText variant="body">{vendor.name}</AppText>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
