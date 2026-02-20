import { useEffect, useState, useCallback } from "react"
import { supabase } from "../lib/supabase"
import { fetchActivePrices, ActivePrice } from "../api/prices"
import { useAppStore } from "../store/useAppStore"

export function usePriceBoard(marketId: string) {
  const authToken = useAppStore((s) => s.authToken)
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)

  const [prices, setPrices] = useState<ActivePrice[]>([])
  const [loading, setLoading] = useState(true)

  const loadPrices = useCallback(async () => {
    if (!authToken) return

    setLoading(true)
    try {
      const data = await fetchActivePrices()
      setPrices(data.filter((p) => p.market_id === marketId))
    } catch (err) {
      console.error("Failed to load prices", err)
    } finally {
      setLoading(false)
    }
  }, [authToken, marketId])

  /* ---------- Initial load ---------- */
  useEffect(() => {
    if (isAuthenticated) {
      loadPrices()
    }
  }, [isAuthenticated, loadPrices])

  /* ---------- Realtime updates ---------- */
  useEffect(() => {
    if (!isAuthenticated) return

    const channel = supabase
      .channel("price-signals")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "price_signals",
        },
        () => {
          loadPrices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthenticated, loadPrices])

  return { prices, loading }
}
