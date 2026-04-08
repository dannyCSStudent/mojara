import { useEffect, useMemo, useState } from 'react';
import { Pressable, View, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen, AppText, EmptyState } from '../../components';
import { useAppStore } from '../../store/useAppStore';

export default function PrivateHome() {
  const markets = useAppStore((s) => s.markets);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const activeMarketId = useAppStore((s) => s.activeMarketId);
  const setActiveMarket = useAppStore((s) => s.setActiveMarket);
  const loadMarkets = useAppStore((s) => s.loadMarkets);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  const subscribedMarkets = markets.filter((m) => subscriptions.includes(m.id));

  const visibleMarkets = useMemo(() => {
    const scopedMarkets = activeMarketId
      ? subscribedMarkets.filter((m) => m.id === activeMarketId)
      : subscribedMarkets;

    const query = search.trim().toLowerCase();
    if (!query) return scopedMarkets;

    return scopedMarkets.filter((market) =>
      [market.name, market.location, market.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [activeMarketId, search, subscribedMarkets]);

  const activeMarket = markets.find((m) => m.id === activeMarketId);

  return (
    <Screen className="gap-6 px-6 pt-14">
      {/* CONTEXT BANNER */}
      <View>
        <AppText variant="title">Markets</AppText>

        <AppText variant="caption" className="mt-2 text-gray-500 dark:text-neutral-400">
          {activeMarket ? `Viewing: ${activeMarket.name}` : 'Viewing: All Subscribed Markets'}
        </AppText>

        {activeMarket && (
          <Pressable onPress={() => setActiveMarket(null)} className="mt-2">
            <AppText className="text-blue-600">Clear active filter</AppText>
          </Pressable>
        )}
      </View>

      <View className="rounded-xl border border-gray-300 px-4 py-2">
        <TextInput
          placeholder="Search subscribed markets..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <View className="flex-row items-center justify-between">
        <AppText variant="caption" className="text-gray-500 dark:text-neutral-400">
          {visibleMarkets.length} visible market
          {visibleMarkets.length === 1 ? '' : 's'}
        </AppText>

        <Pressable onPress={() => router.push('/(private)/markets/manage')}>
          <AppText className="text-blue-600">Manage Markets</AppText>
        </Pressable>
      </View>

      {/* EMPTY STATE */}
      {subscriptions.length === 0 ? (
        <EmptyState
          title="No Markets Selected"
          description="Subscribe to at least one market to start browsing."
          action={
            <Pressable
              onPress={() => router.push('/(private)/markets/manage')}
              className="mt-3 rounded-xl bg-black px-4 py-3">
              <AppText className="text-white">Choose Markets</AppText>
            </Pressable>
          }
        />
      ) : visibleMarkets.length === 0 ? (
        <EmptyState
          title="No Matching Markets"
          description="Try a different search or clear the active market filter."
        />
      ) : (
        visibleMarkets.map((m) => (
          <Pressable
            key={m.id}
            onPress={() =>
              router.push({
                pathname: '/(private)/markets/[marketId]',
                params: { marketId: m.id },
              })
            }
            className="rounded-2xl bg-gray-100 p-5 dark:bg-neutral-800">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <AppText variant="subheading">{m.name}</AppText>

                <AppText variant="caption" className="mt-1 text-gray-500 dark:text-neutral-400">
                  {m.location}
                </AppText>

                {m.description ? (
                  <AppText variant="caption" className="mt-3 text-gray-500 dark:text-neutral-400">
                    {m.description}
                  </AppText>
                ) : null}
              </View>

              <AppText className="text-xs text-blue-600">Open</AppText>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
