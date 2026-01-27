import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchMyOrders } from "../api/orders";
import { Order } from "../api/types";
import { useAppStore } from "../store/useAppStore";

export function useOrdersRealtime(enabled: boolean) {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
  if (!isAuthenticated || !user) return;

  let channel: ReturnType<typeof supabase.channel> | null = null;

  const loadInitial = async () => {
    try {
      setLoading(true);
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  loadInitial();

  channel = supabase
    .channel(`orders:user:${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("ORDER REALTIME:", payload);

        setOrders((prev) => {
          switch (payload.eventType) {
            case "INSERT":
              return [payload.new as Order, ...prev];
            case "UPDATE":
              return prev.map((o) =>
                o.id === payload.new.id ? (payload.new as Order) : o
              );
            case "DELETE":
              return prev.filter((o) => o.id !== payload.old.id);
            default:
              return prev;
          }
        });
      }
    )
    .subscribe();

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}, [isAuthenticated, user]);


  return {
    orders,
    loading,
    error,
  };
}
