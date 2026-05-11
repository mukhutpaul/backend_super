"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types/dashboard.types";

export function useDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Calling dashboard API...");

      const res = await getDashboardStats();

      console.log("✅ Dashboard response:", res);

      setData(res);

    } catch (err: any) {
      console.error("❌ Dashboard error full:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Erreur API dashboard"
      );

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}