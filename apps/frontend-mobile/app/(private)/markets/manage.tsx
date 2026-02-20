import { useEffect } from "react";
import { View, Pressable, ScrollView, Alert } from "react-native";
import { useAppStore } from "../../../store/useAppStore";
import { Screen } from "../../../components/Screen";
import { AppText } from "../../../components/AppText";

export default function ManageMarketsScreen() {
  const markets = useAppStore((s) => s.markets);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const activeMarketId = useAppStore((s) => s.activeMarketId);
  const setActiveMarket = useAppStore((s) => s.setActiveMarket);
  const loadMarkets = useAppStore((s) => s.loadMarkets);
  const toggleMarketSubscription = useAppStore(
    (s) => s.toggleMarketSubscription
  );

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  function handleToggle(marketId: string, isSubscribed: boolean) {
    if (isSubscribed && subscriptions.length === 1) {
      Alert.alert(
        "At least one market required",
        "You must stay subscribed to at least one market."
      );
      return;
    }

    toggleMarketSubscription(marketId);

    // If user unsubscribes from active market → reset active
    if (isSubscribed && activeMarketId === marketId) {
      setActiveMarket(null);
    }
  }

  return (
    <Screen>
      <View className="flex-1 px-6 pt-16">
        <AppText variant="title" className="mb-2">
          Manage Markets
        </AppText>

        <AppText
          variant="caption"
          className="mb-6 text-gray-500 dark:text-neutral-400"
        >
          Select the markets you want to see and receive updates from.
        </AppText>

        <ScrollView showsVerticalScrollIndicator={false}>
          {markets.map((market) => {
            const isSubscribed = subscriptions.includes(market.id);
            const isActive = activeMarketId === market.id;

            return (
              <View key={market.id} className="mb-4">

                {/* MARKET CARD */}
                <Pressable
                  onPress={() =>
                    handleToggle(market.id, isSubscribed)
                  }
                  className={`rounded-2xl p-5 border ${
                    isSubscribed
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-3">
                      <AppText
                        variant="subheading"
                        className={isSubscribed ? "text-white" : ""}
                      >
                        {market.name}
                      </AppText>

                      <AppText
                        variant="caption"
                        className={`mt-1 ${
                          isSubscribed
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-neutral-400"
                        }`}
                      >
                        {market.location}
                      </AppText>
                    </View>

                    {isSubscribed && (
                      <AppText className="text-white text-xs">
                        ✓
                      </AppText>
                    )}
                  </View>

                  <AppText
                    variant="caption"
                    className={`mt-3 ${
                      isSubscribed
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-neutral-400"
                    }`}
                  >
                    {isSubscribed
                      ? "Subscribed"
                      : "Tap to subscribe"}
                  </AppText>
                </Pressable>

                {/* ACTIVE MARKET SWITCHER */}
                {isSubscribed && (
                  <Pressable
                    onPress={() =>
                      setActiveMarket(
                        isActive ? null : market.id
                      )
                    }
                    className="mt-2 ml-2"
                  >
                    <AppText
                      variant="caption"
                      className="text-gray-500 dark:text-neutral-400"
                    >
                      {isActive
                        ? "Viewing this market"
                        : "Set as active market"}
                    </AppText>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}
