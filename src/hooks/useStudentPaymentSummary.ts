import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  deletePaymentSummary,
  fetchPaymentSummariesByGroup,
  fetchPaymentSummariesByStudent,
  fetchPaymentSummaryById,
  generateAllPaymentsForGroup,
  generatePaymentForStudentInGroup,
  recalculateAllSummaries,
  updateSummaryAfterPayment,
} from "@/redux/slice/student-payment-summary.slice";
import { formatCurrency } from "@/utils/currency-utils";
import { useCallback } from "react";

export const useStudentPaymentSummary = () => {
  const dispatch = useAppDispatch();
  const paymentSummaries = useAppSelector(state => state.studentPaymentSummary.paymentSummaries);
  const paymentSummary = useAppSelector(state => state.studentPaymentSummary.paymentSummary);
  const loading = useAppSelector(state => state.studentPaymentSummary.loading);
  const error = useAppSelector(state => state.studentPaymentSummary.error);

  // 📝 Payment Obligation Management

  const handleGeneratePaymentForStudentInGroup = useCallback(
    (studentId: number, groupId: number) => {
      dispatch(generatePaymentForStudentInGroup({ studentId, groupId }));
    },
    [dispatch]
  );

  const handleGenerateAllPaymentsForGroup = useCallback(
    (groupId: number) => {
      dispatch(generateAllPaymentsForGroup(groupId));
    },
    [dispatch]
  );

  // 📊 Payment Summary Retrieval

  const handleFetchPaymentSummariesByStudent = useCallback(
    (studentId: number) => {
      dispatch(fetchPaymentSummariesByStudent(studentId));
    },
    [dispatch]
  );

  const handleFetchPaymentSummariesByGroup = useCallback(
    (groupId: number) => {
      dispatch(fetchPaymentSummariesByGroup(groupId));
    },
    [dispatch]
  );

  const handleFetchPaymentSummaryById = useCallback(
    (summaryId: number) => {
      dispatch(fetchPaymentSummaryById(summaryId));
    },
    [dispatch]
  );

  // 🔄 Payment Summary Updates

  const handleUpdateSummaryAfterPayment = useCallback(
    (studentId: number, feeId: number, academicYearId: number, groupId: number) => {
      dispatch(updateSummaryAfterPayment({ studentId, feeId, academicYearId, groupId }));
    },
    [dispatch]
  );

  const handleDeletePaymentSummary = useCallback(
    (summaryId: number) => {
      dispatch(deletePaymentSummary(summaryId));
    },
    [dispatch]
  );

  const handleRecalculateAllSummaries = useCallback(() => {
    dispatch(recalculateAllSummaries());
  }, [dispatch]);

  // 📈 Helper Functions

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


  const calculateCompletionPercentage = useCallback((
    totalPaid: number,
    totalDue: number
  ): number => {
    if (totalDue === 0) return 100;
    return Math.round((totalPaid / totalDue) * 100);
  }, []);

  return {
    // State
    paymentSummaries,
    paymentSummary,
    loading,
    error,

    // Payment Obligation Management
    handleGeneratePaymentForStudentInGroup,
    handleGenerateAllPaymentsForGroup,

    // Payment Summary Retrieval
    handleFetchPaymentSummariesByStudent,
    handleFetchPaymentSummariesByGroup,
    handleFetchPaymentSummaryById,

    // Payment Summary Updates
    handleUpdateSummaryAfterPayment,
    handleDeletePaymentSummary,
    handleRecalculateAllSummaries,

    // Helper Functionss
    getPaymentStatusColor,
    getPaymentStatusIcon,
    formatCurrency,
    calculateCompletionPercentage,
  };
};