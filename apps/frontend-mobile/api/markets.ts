import { apiRequest } from './client';
export type Market = {
  id: string;
  name: string;
  location: string;
  description?: string;
};

export function fetchMarkets(search?: string) {
  const query = new URLSearchParams();

  if (search?.trim()) {
    query.set('search', search.trim());
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<Market[]>(`/markets${suffix}`);
}

export function fetchMarket(marketId: string) {
  return apiRequest<Market>(`/markets/${marketId}`);
}
