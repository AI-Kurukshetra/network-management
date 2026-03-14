"use client";

import { useEffect, useState } from "react";

import type { DashboardPayload } from "@/types";

export function useNetworkData(initialData: DashboardPayload) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        setIsRefreshing(true);
        await fetch("/api/metrics/simulate", { method: "POST" });
        const response = await fetch("/api/metrics", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to refresh network metrics.");
        }

        const payload = (await response.json()) as DashboardPayload;
        if (mounted) {
          setData(payload);
          setError(null);
        }
      } catch (refreshError) {
        if (mounted) {
          setError(refreshError instanceof Error ? refreshError.message : "Unknown refresh error.");
        }
      } finally {
        if (mounted) {
          setIsRefreshing(false);
        }
      }
    };

    const interval = window.setInterval(refresh, 5_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return {
    data,
    setData,
    isRefreshing,
    error
  };
}
