import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Order } from "../api/types";

type Options = {
  marketId?: string;
  vendorId?: string;
};

export function useOrdersAdminRealtime(
  enabled: boolean,
  options: Options = {}
) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadInitial = async () => {
      setLoading(true);

      let query = supabase.from("orders").select("*");

      if (options.marketId) {
        query = query.eq("market_id", options.marketId);
      }

      if (options.vendorId) {
        query = query.eq("vendor_id", options.vendorId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Admin orders load failed", error);
      } else {
        setOrders(data ?? []);
      }

      setLoading(false);
    };

    loadInitial();

    channel = supabase
      .channel("orders:admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
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
  }, [enabled, options.marketId, options.vendorId]);

  return { orders, loading };
}
