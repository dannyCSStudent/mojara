import { useEffect, useState, useCallback } from 'react';
import { fetchActivePrices, ActivePrice } from '../api/prices';
import { usePolling } from './usePolling';

export function usePriceBoard(marketId?: string | null) {
  const [prices, setPrices] = useState<ActivePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchActivePrices();
      setPrices(marketId ? data.filter((p) => p.market_id === marketId) : data);
    } catch (err) {
      setPrices([]);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load prices.');
      console.error('Failed to load prices', err);
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    setLoading(true);
  }, [marketId]);

  usePolling(loadPrices, 5000, true);

  return { prices, loading, errorMessage };
}
