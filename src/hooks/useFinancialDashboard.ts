import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  checkStudentOverduePayments,
  fetchDashboardStatistics,
  fetchDaysOverdue,
  fetchOverduePaymentDetails,
  fetchOverduePaymentSummaries,
  fetchOverdueStatistics,
  fetchStatisticsByDateRange,
  selectDashboardStats,
  selectError,
  selectLoading,
  selectOverduePaymentDetails,
  selectOverduePaymentSummaries,
  selectOverdueStats,
  updateOverdueStatuses,
} from "@/redux/slice/financial-dashboard.slice";
import { FinancialStatisticsDTO } from "@/types/api.types";
import { useCallback } from "react";

export const useFinancialDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardStats = useAppSelector(selectDashboardStats);
  const overdueStats = useAppSelector(selectOverdueStats);
  const overduePaymentDetails = useAppSelector(selectOverduePaymentDetails);
  const overduePaymentSummaries = useAppSelector(selectOverduePaymentSummaries);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // 📊 Financial Dashboard Methods

  const handleFetchDashboardStatistics = useCallback(() => {
    dispatch(fetchDashboardStatistics());
  }, [dispatch]);

  const handleFetchStatisticsByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      dispatch(fetchStatisticsByDateRange({ startDate, endDate }));
    },
    [dispatch]
  );

  // 🚨 Overdue Payment Management

  const handleFetchOverduePaymentDetails = useCallback(() => {
    dispatch(fetchOverduePaymentDetails());
  }, [dispatch]);

  const handleFetchOverduePaymentSummaries = useCallback(() => {
    dispatch(fetchOverduePaymentSummaries());
  }, [dispatch]);

  const handleFetchOverdueStatistics = useCallback(() => {
    dispatch(fetchOverdueStatistics());
  }, [dispatch]);

  const handleUpdateOverdueStatuses = useCallback(() => {
    dispatch(updateOverdueStatuses());
  }, [dispatch]);

  const handleCheckStudentOverduePayments = useCallback(
    (studentId: number) => {
      dispatch(checkStudentOverduePayments(studentId));
    },
    [dispatch]
  );

  const handleFetchDaysOverdue = useCallback(
    (summaryId: number) => {
      dispatch(fetchDaysOverdue(summaryId));
    },
    [dispatch]
  );

  // 📈 Analytics & Helper Functions

  const calculateCollectionRate = useCallback((stats: FinancialStatisticsDTO): number => {
    if (stats.total_amount_due === 0) return 100;
    return (stats.total_revenue / stats.total_amount_due) * 100;
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const calculateGrowthRate = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  const getPaymentStatusColor = useCallback((status: string): string => {
    const statusColors = {
      'PENDING': '#FFA500',
      'PARTIAL': '#FF6B6B',
      'PAID': '#4ECDC4',
      'OVERDUE': '#FF0000'
    };
    return statusColors[status as keyof typeof statusColors] || '#6B7280';
  }, []);

  const getPaymentStatusIcon = useCallback((status: string): string => {
    const statusIcons = {
      'PENDING': '⏳',
      'PARTIAL': '⚠️',
      'PAID': '✅',
      'OVERDUE': '🚨'
    };
    return statusIcons[status as keyof typeof statusIcons] || '❓';
  }, []);

  const formatPercentage = useCallback((value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`;
  }, []);

  const getGrowthColor = useCallback((growthRate: number): string => {
    if (growthRate > 0) return '#4ECDC4'; // Green for positive growth
    if (growthRate < 0) return '#FF6B6B'; // Red for negative growth
    return '#6B7280'; // Gray for no change
  }, []);

  const getGrowthIcon = useCallback((growthRate: number): string => {
    if (growthRate > 0) return '📈';
    if (growthRate < 0) return '📉';
    return '➡️';
  }, []);

  // 📊 Chart Data Preparation

  const prepareRevenueChartData = useCallback((stats: FinancialStatisticsDTO | null) => {
    if (!stats) return [];

    return [
      {
        name: 'Tháng trước',
        revenue: stats.previous_month_revenue,
        color: '#94A3B8'
      },
      {
        name: 'Tháng này',
        revenue: stats.current_month_revenue,
        color: '#4ECDC4'
      }
    ];
  }, []);

  const preparePaymentStatusChartData = useCallback((stats: FinancialStatisticsDTO | null) => {
    if (!stats) return [];

    return [
      {
        name: 'Đã thanh toán',
        value: stats.paid_payments_count,
        color: '#4ECDC4'
      },
      {
        name: 'Thanh toán một phần',
        value: stats.partial_payments_count,
        color: '#FF6B6B'
      },
      {
        name: 'Chờ thanh toán',
        value: stats.pending_payments_count,
        color: '#FFA500'
      },
      {
        name: 'Quá hạn',
        value: stats.overdue_payments_count,
        color: '#FF0000'
      }
    ];
  }, []);

  return {
    // State
    dashboardStats,
    overdueStats,
    overduePaymentDetails,
    overduePaymentSummaries,
    loading,
    error,

    // Financial Dashboard Methods
    handleFetchDashboardStatistics,
    handleFetchStatisticsByDateRange,

    // Overdue Payment Management
    handleFetchOverduePaymentDetails,
    handleFetchOverduePaymentSummaries,
    handleFetchOverdueStatistics,
    handleUpdateOverdueStatuses,
    handleCheckStudentOverduePayments,
    handleFetchDaysOverdue,

    // Analytics & Helper Functions
    calculateCollectionRate,
    formatCurrency,
    calculateGrowthRate,
    getPaymentStatusColor,
    getPaymentStatusIcon,
    formatPercentage,
    getGrowthColor,
    getGrowthIcon,

    // Chart Data Preparation
    prepareRevenueChartData,
    preparePaymentStatusChartData,
  };
};