"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard.service";

export interface DashboardData {
  totalPoliciers: number;
  totalUnites: number;
  totalEquipes: number;
  totalMissions: number;

  totalControles: number;
  totalPresent: number;
  totalJustifies: number;
}

export function useDashboard() {

  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadDashboard = async () => {

    try {

      const res = await getDashboardStats();

      setData(res);

      setError("");

    } catch (err: any) {

      console.error(err);

      setError(
        err?.message || "Erreur chargement dashboard"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    /* FIRST LOAD */
    loadDashboard();

    /* AUTO REFRESH 5s */
    const interval = setInterval(() => {

      loadDashboard();

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return {
    data,
    loading,
    error,
  };
}