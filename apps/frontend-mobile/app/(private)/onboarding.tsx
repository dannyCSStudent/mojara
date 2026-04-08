import { useEffect, useState } from 'react';
import { View, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { fetchMarketSubscriptions, createMarketSubscription } from '../../api/marketSubscriptions';
import { getMissingMarketSubscriptions } from '../../utils/onboardingSubscriptions';

export default function OnboardingScreen() {
  const router = useRouter();

  const markets = useAppStore((s) => s.markets);
  const loadMarkets = useAppStore((s) => s.loadMarkets);

  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkets().catch((err: any) => {
      setLoadError(err?.message ?? 'Failed to load markets.');
    });
  }, [loadMarkets]);

  function toggleMarket(id: string) {
    setSelectedMarkets((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function handleComplete() {
    if (selectedMarkets.length === 0) {
      Alert.alert('Please select at least one market.');
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const user = useAppStore.getState().user;
      if (!user) {
        Alert.alert('User session not found.');
        return;
      }

      const existingSubscriptions = await fetchMarketSubscriptions();
      const missingMarketIds = getMissingMarketSubscriptions({
        selectedMarketIds: selectedMarkets,
        existingMarketIds: existingSubscriptions.map((subscription) => subscription.market_id),
      });

      for (const marketId of missingMarketIds) {
        await createMarketSubscription(marketId);
      }

      await useAppStore.getState().loadSubscriptions();

      router.replace('/(private)');
    } catch (err) {
      console.error('Failed to complete onboarding', err);
      Alert.alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 px-6 pt-16">
        {/* Header */}
        <AppText variant="title" className="mb-3">
          Choose Your Markets
        </AppText>

        <AppText variant="body" className="mb-8">
          Select the markets you want to receive real-time alerts for.
        </AppText>

        {loadError ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <AppText variant="caption" className="text-red-700 dark:text-red-300">
              {loadError}
            </AppText>
          </View>
        ) : null}

        {/* Market List */}
        <ScrollView className="flex-1">
          {markets.map((market) => {
            const isSelected = selectedMarkets.includes(market.id);

            return (
              <Pressable
                key={market.id}
                onPress={() => toggleMarket(market.id)}
                className={`mb-4 rounded-2xl border p-5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800'
                }`}>
                <AppText variant="subheading" className={isSelected ? 'text-white' : ''}>
                  {market.name}
                </AppText>

                {typeof market.description === 'string' && market.description.length > 0 && (
                  <AppText
                    variant="caption"
                    className={`mt-1 ${isSelected ? 'text-blue-100' : ''}`}>
                    {market.description}
                  </AppText>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Button */}
        <Pressable
          onPress={handleComplete}
          disabled={loading}
          className={`mt-6 items-center rounded-2xl py-4 ${
            selectedMarkets.length === 0 || loading ? 'bg-gray-400' : 'bg-blue-600'
          }`}>
          <AppText variant="subheading" className="text-white">
            {loading ? 'Saving...' : 'Complete Setup'}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
