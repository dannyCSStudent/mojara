import { useCallback, useEffect, useState } from 'react';
import { fetchMyOrders } from '../api/orders';
import { Order } from '../api/types';
import { useAppStore } from '../store/useAppStore';
import { usePolling } from './usePolling';

export function useOrdersRealtime(enabled: boolean) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOrders = useCallback(async () => {
    if (!enabled || !isAuthenticated) return;
    try {
      setError(null);
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [enabled, isAuthenticated]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
  }, [enabled, isAuthenticated]);

  usePolling(loadOrders, 5000, enabled && isAuthenticated);

  return {
    orders,
    loading,
    error,
  };
}
