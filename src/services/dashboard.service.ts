import { api } from "@/lib/axios";
import type { DashboardStats } from "@/types/dashboard.types";

/**
 * =========================
 * DASHBOARD STATS
 * =========================
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const res = await api.get<DashboardStats>("/dashboard/stats");

    console.log("DASHBOARD API RESPONSE:", res.data);

    return res.data;
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};