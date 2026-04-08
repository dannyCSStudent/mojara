export function applyMarketSubscriptionToggle(params: {
  subscriptions: string[];
  activeMarketId: string | null;
  marketId: string;
}) {
  const isSubscribed = params.subscriptions.includes(params.marketId);
  const subscriptions = isSubscribed
    ? params.subscriptions.filter((id) => id !== params.marketId)
    : [...params.subscriptions, params.marketId];

  let activeMarketId = params.activeMarketId;

  if (isSubscribed && params.activeMarketId === params.marketId) {
    activeMarketId = null;
  }

  if (!activeMarketId && subscriptions.length > 0) {
    activeMarketId = subscriptions[0];
  }

  return {
    subscriptions,
    activeMarketId,
    isSubscribed,
  };
}
