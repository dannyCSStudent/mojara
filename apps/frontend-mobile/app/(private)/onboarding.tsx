import { useEffect, useState } from "react";
import {
  View,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";

export default function OnboardingScreen() {
  const router = useRouter();

  const markets = useAppStore((s) => s.markets);
  const loadMarkets = useAppStore((s) => s.loadMarkets);
  const setHasCompletedOnboarding = useAppStore(
    (s) => s.setHasCompletedOnboarding
  );

  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  function toggleMarket(id: string) {
    setSelectedMarkets((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  }

  async function handleComplete() {
    if (selectedMarkets.length === 0) {
      Alert.alert("Please select at least one market.");
      return;
    }

    try {
      setLoading(true);

      // TODO:
      // await createBatchSubscriptions(selectedMarkets)

      setHasCompletedOnboarding(true);
      router.replace("/(private)");
    } catch (err) {
      console.error("Failed to complete onboarding", err);
      Alert.alert("Something went wrong. Please try again.");
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

        {/* Market List */}
        <ScrollView className="flex-1">
          {markets.map((market) => {
            const isSelected = selectedMarkets.includes(market.id);

            return (
              <Pressable
                key={market.id}
                onPress={() => toggleMarket(market.id)}
                className={`mb-4 rounded-2xl p-5 border ${
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                }`}
              >
                <AppText
                  variant="subheading"
                  className={
                    isSelected
                      ? "text-white"
                      : ""
                  }
                >
                  {market.name}
                </AppText>

                {typeof market.description === "string" && market.description.length > 0 && (

                  <AppText
                    variant="caption"
                    className={`mt-1 ${
                      isSelected ? "text-blue-100" : ""
                    }`}
                  >
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
          className={`mt-6 rounded-2xl py-4 items-center ${
            selectedMarkets.length === 0 || loading
              ? "bg-gray-400"
              : "bg-blue-600"
          }`}
        >
          <AppText variant="subheading" className="text-white">
            {loading ? "Saving..." : "Complete Setup"}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
