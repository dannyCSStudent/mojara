import { useEffect } from "react";
import { Screen, AppText } from "../../components";
import { useAppStore } from "../../store/useAppStore";
import { router } from "expo-router";

export default function PrivateHome() {
  const markets = useAppStore((s) => s.markets);
  const loadMarkets = useAppStore((s) => s.loadMarkets);
  

  router.push("/vendor/orders");

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  return (
    <Screen className="gap-4">
      <AppText variant="title">
        Markets
      </AppText>

      {markets.length === 0 ? (
        <AppText variant="body">
          No markets available.
        </AppText>
      ) : (
        markets.map((m) => (
          <AppText key={m.id}>
            • {m.name} — {m.location}
          </AppText>
        ))
      )}
    </Screen>
  );
}
