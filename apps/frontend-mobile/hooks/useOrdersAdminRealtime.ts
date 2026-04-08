import { useCallback, useEffect, useState } from 'react';
import { fetchAdminOrders } from '../api/orders';
import { Order } from '../api/types';
import { usePolling } from './usePolling';

type Options = {
  marketId?: string;
  vendorId?: string;
};

export function useOrdersAdminRealtime(enabled: boolean = true, options: Options = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!enabled) return;

    try {
      const result = await fetchAdminOrders({
        status: 'pending',
        limit: 50,
      });
      setOrders(result.data);
    } catch (error) {
      console.error('Admin orders load failed', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
  }, [enabled, options.marketId, options.vendorId]);

  usePolling(loadOrders, 5000, enabled);

  return { orders, loading };
}
