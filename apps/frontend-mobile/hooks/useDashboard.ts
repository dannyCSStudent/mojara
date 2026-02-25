import { useEffect, useState, useCallback, useRef } from "react";
import { fetchAdminOverview } from "../api/dashboard";
import { AdminOverview } from "@repo/types";

export function useAdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  const load = useCallback(async () => {
    try {
      setError(null);

      // only show spinner if first load
      if (isFirstLoad.current) setLoading(true);

      const res = await fetchAdminOverview();
      setData(res);
      isFirstLoad.current = false;
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
