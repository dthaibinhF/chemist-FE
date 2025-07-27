import { 
  FinancialStatisticsDTO, 
  OverdueStatisticsDTO, 
  PaymentDetail, 
  StudentPaymentSummary 
} from "@/types/api.types";
import { createApiClient } from "./api-client";

const apiClient = createApiClient("financial");

export const financialDashboardService = {
  // 📊 Financial Dashboard & Statistics

  // Get comprehensive financial dashboard
  getDashboardStatistics: async (): Promise<FinancialStatisticsDTO> => {
    const response = await apiClient.get("/dashboard");
    return response.data;
  },

  // Get financial statistics for date range
  getStatisticsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<FinancialStatisticsDTO> => {
    const response = await apiClient.get("/statistics", {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // 🚨 Overdue Payment Management

  // Get all overdue payment details
  getOverduePaymentDetails: async (): Promise<PaymentDetail[]> => {
    const response = await apiClient.get("/overdue/details");
    return response.data;
  },

  // Get all overdue payment summaries
  getOverduePaymentSummaries: async (): Promise<StudentPaymentSummary[]> => {
    const response = await apiClient.get("/overdue/summaries");
    return response.data;
  },

  // Get overdue payments for specific student
  getOverduePaymentsByStudent: async (
    studentId: number
  ): Promise<StudentPaymentSummary[]> => {
    const response = await apiClient.get(`/overdue/student/${studentId}`);
    return response.data;
  },

  // Batch update overdue payment statuses (run daily)
  updateOverdueStatuses: async (): Promise<number> => {
    const response = await apiClient.post("/overdue/update-statuses");
    return response.data;
  },

  // Get overdue payment statistics
  getOverdueStatistics: async (): Promise<OverdueStatisticsDTO> => {
    const response = await apiClient.get("/overdue/statistics");
    return response.data;
  },

  // Check if student has overdue payments
  checkStudentOverduePayments: async (studentId: number): Promise<boolean> => {
    const response = await apiClient.get(`/overdue/student/${studentId}/check`);
    return response.data;
  },

  // Get days overdue for payment summary
  getDaysOverdue: async (summaryId: number): Promise<number> => {
    const response = await apiClient.get(`/overdue/summary/${summaryId}/days`);
    return response.data;
  },

  // 📈 Analytics & Reporting Helpers

  // Calculate collection rate
  calculateCollectionRate: (stats: FinancialStatisticsDTO): number => {
    if (stats.total_amount_due === 0) return 100;
    return (stats.total_revenue / stats.total_amount_due) * 100;
  },

  // Format currency for Vietnamese locale
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Calculate growth rate
  calculateGrowthRate: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Get payment status color coding
  getPaymentStatusColor: (status: string): string => {
    const statusColors = {
      'PENDING': '#FFA500',
      'PARTIAL': '#FF6B6B', 
      'PAID': '#4ECDC4',
      'OVERDUE': '#FF0000'
    };
    return statusColors[status as keyof typeof statusColors] || '#6B7280';
  },

  // Get payment status icon
  getPaymentStatusIcon: (status: string): string => {
    const statusIcons = {
      'PENDING': '⏳',
      'PARTIAL': '⚠️',
      'PAID': '✅',
      'OVERDUE': '🚨'
    };
    return statusIcons[status as keyof typeof statusIcons] || '❓';
  },
};