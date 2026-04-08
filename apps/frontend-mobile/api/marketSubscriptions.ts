import { apiRequest } from './client';

export type MarketSubscription = {
  market_id: string;
  created_at: string;
};

export async function fetchMarketSubscriptions(): Promise<MarketSubscription[]> {
  return apiRequest<MarketSubscription[]>('/me/market-subscriptions');
}

export async function createMarketSubscription(marketId: string): Promise<MarketSubscription> {
  return apiRequest<MarketSubscription>('/me/market-subscriptions', {
    method: 'POST',
    body: { market_id: marketId },
  });
}

export async function deleteMarketSubscription(marketId: string): Promise<void> {
  return apiRequest<void>(`/me/market-subscriptions/${marketId}`, {
    method: 'DELETE',
  });
}
