import { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../../../store/useAppStore';
import { Screen } from '../../../components/Screen';
import { AppText } from '../../../components/AppText';
import { EmptyState } from '../../../components/EmptyState';

export default function ManageMarketsScreen() {
  const markets = useAppStore((s) => s.markets);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const activeMarketId = useAppStore((s) => s.activeMarketId);
  const setActiveMarket = useAppStore((s) => s.setActiveMarket);
  const loadMarkets = useAppStore((s) => s.loadMarkets);
  const toggleMarketSubscription = useAppStore((s) => s.toggleMarketSubscription);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  function handleToggle(marketId: string, isSubscribed: boolean) {
    if (isSubscribed && subscriptions.length === 1) {
      Alert.alert(
        'At least one market required',
        'You must stay subscribed to at least one market.'
      );
      return;
    }

    toggleMarketSubscription(marketId);

    // If user unsubscribes from active market → reset active
    if (isSubscribed && activeMarketId === marketId) {
      setActiveMarket(null);
    }
  }

  const filteredMarkets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return markets;

    return markets.filter((market) =>
      [market.name, market.location, market.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [markets, search]);

  return (
    <Screen>
      <View className="flex-1 px-6 pt-16">
        <AppText variant="title" className="mb-2">
          Manage Markets
        </AppText>

        <AppText variant="caption" className="mb-6 text-gray-500 dark:text-neutral-400">
          Select the markets you want to see and receive updates from.
        </AppText>

        <View className="mb-4 rounded-xl border border-gray-300 px-4 py-2">
          <TextInput
            placeholder="Search markets..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredMarkets.length === 0 ? (
            <EmptyState title="No Matching Markets" description="Try a different search term." />
          ) : (
            filteredMarkets.map((market) => {
              const isSubscribed = subscriptions.includes(market.id);
              const isActive = activeMarketId === market.id;

              return (
                <View key={market.id} className="mb-4">
                  {/* MARKET CARD */}
                  <Pressable
                    onPress={() => handleToggle(market.id, isSubscribed)}
                    className={`rounded-2xl border p-5 ${
                      isSubscribed
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800'
                    }`}>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <AppText variant="subheading" className={isSubscribed ? 'text-white' : ''}>
                          {market.name}
                        </AppText>

                        <AppText
                          variant="caption"
                          className={`mt-1 ${
                            isSubscribed ? 'text-blue-100' : 'text-gray-500 dark:text-neutral-400'
                          }`}>
                          {market.location}
                        </AppText>
                      </View>

                      {isSubscribed && (
                        <View className="items-end gap-2">
                          <AppText className="text-xs text-white">✓</AppText>
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: '/(private)/markets/[marketId]',
                                params: { marketId: market.id },
                              })
                            }>
                            <AppText className="text-xs text-white underline">Browse</AppText>
                          </Pressable>
                        </View>
                      )}
                    </View>

                    <AppText
                      variant="caption"
                      className={`mt-3 ${
                        isSubscribed ? 'text-blue-100' : 'text-gray-500 dark:text-neutral-400'
                      }`}>
                      {isSubscribed ? 'Subscribed' : 'Tap to subscribe'}
                    </AppText>
                  </Pressable>

                  {/* ACTIVE MARKET SWITCHER */}
                  {isSubscribed && (
                    <Pressable
                      onPress={() => setActiveMarket(isActive ? null : market.id)}
                      className="ml-2 mt-2">
                      <AppText variant="caption" className="text-gray-500 dark:text-neutral-400">
                        {isActive ? 'Viewing this market' : 'Set as active market'}
                      </AppText>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}
