import type { DashboardStats } from "@/types/api.types";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("statistics");

export const dashboardService = {
  // Lấy thống kê tổng quan cho dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  }
};