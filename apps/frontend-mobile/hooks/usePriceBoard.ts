import { useEffect, useState, useCallback } from 'react';
import { fetchActivePrices, ActivePrice } from '../api/prices';
import { useAppStore } from '../store/useAppStore';
import { usePolling } from './usePolling';

export function usePriceBoard(marketId: string) {
  const authToken = useAppStore((s) => s.authToken);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [prices, setPrices] = useState<ActivePrice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrices = useCallback(async () => {
    if (!authToken) return;

    setLoading(true);
    try {
      const data = await fetchActivePrices();
      setPrices(data.filter((p) => p.market_id === marketId));
    } catch (err) {
      console.error('Failed to load prices', err);
    } finally {
      setLoading(false);
    }
  }, [authToken, marketId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPrices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
  }, [isAuthenticated, marketId]);

  usePolling(loadPrices, 5000, isAuthenticated);

  return { prices, loading };
}
