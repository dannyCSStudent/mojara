import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { Screen, AppText } from "../../components";
import { useAppStore } from "../../store/useAppStore";

export default function PrivateHome() {
  const markets = useAppStore((s) => s.markets);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const activeMarketId = useAppStore((s) => s.activeMarketId);
  const setActiveMarket = useAppStore((s) => s.setActiveMarket);
  const loadMarkets = useAppStore((s) => s.loadMarkets);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  const subscribedMarkets = markets.filter((m) =>
    subscriptions.includes(m.id)
  );

  const visibleMarkets = activeMarketId
    ? subscribedMarkets.filter((m) => m.id === activeMarketId)
    : subscribedMarkets;

  const activeMarket = markets.find(
    (m) => m.id === activeMarketId
  );

  return (
    <Screen className="px-6 pt-14 gap-6">

      {/* CONTEXT BANNER */}
      <View>
        <AppText variant="title">Markets</AppText>

        <AppText
          variant="caption"
          className="mt-2 text-gray-500 dark:text-neutral-400"
        >
          {activeMarket
            ? `Viewing: ${activeMarket.name}`
            : "Viewing: All Subscribed Markets"}
        </AppText>

        {activeMarket && (
          <Pressable
            onPress={() => setActiveMarket(null)}
            className="mt-2"
          >
            <AppText className="text-blue-600">
              Clear active filter
            </AppText>
          </Pressable>
        )}
      </View>

      {/* EMPTY STATE */}
      {subscriptions.length === 0 ? (
        <AppText variant="body">
          You are not subscribed to any markets.
        </AppText>
      ) : visibleMarkets.length === 0 ? (
        <AppText variant="body">
          No markets match your current filter.
        </AppText>
      ) : (
        visibleMarkets.map((m) => (
          <View
            key={m.id}
            className="rounded-2xl bg-gray-100 dark:bg-neutral-800 p-5"
          >
            <AppText variant="subheading">
              {m.name}
            </AppText>

            <AppText
              variant="caption"
              className="mt-1 text-gray-500 dark:text-neutral-400"
            >
              {m.location}
            </AppText>
          </View>
        ))
      )}
    </Screen>
  );
}
