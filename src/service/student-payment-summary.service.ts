import { StudentPaymentSummary } from "@/types/api.types";
import { createApiClient } from "./api-client";

const apiClient = createApiClient("student-payment");

export const studentPaymentSummaryService = {
  // 📝 Payment Obligation Management

  // Generate payment obligation when student joins group
  generatePaymentForStudentInGroup: async (
    studentId: number,
    groupId: number
  ): Promise<StudentPaymentSummary> => {
    const response = await apiClient.post(`/student/${studentId}/group/${groupId}`);
    return response.data;
  },

  // Generate payments for all students in a group (bulk operation)
  generateAllPaymentsForGroup: async (
    groupId: number
  ): Promise<StudentPaymentSummary[]> => {
    const response = await apiClient.post(`/group/${groupId}/generate-all`);
    return response.data;
  },

  // 📊 Payment Summary Retrieval

  // Get all payment summaries for a student
  getPaymentSummariesByStudent: async (
    studentId: number
  ): Promise<StudentPaymentSummary[]> => {
    const response = await apiClient.get(`/student/${studentId}`);
    return response.data;
  },

  // Get all payment summaries for a group
  getPaymentSummariesByGroup: async (
    groupId: number
  ): Promise<StudentPaymentSummary[]> => {
    const response = await apiClient.get(`/group/${groupId}`);
    return response.data;
  },

  // Get specific payment summary by ID
  getPaymentSummaryById: async (
    summaryId: number
  ): Promise<StudentPaymentSummary> => {
    const response = await apiClient.get(`/summary/${summaryId}`);
    return response.data;
  },

  // 🔄 Payment Summary Updates

  // Update payment summary after payment is made
  updateSummaryAfterPayment: async (
    studentId: number,
    feeId: number,
    academicYearId: number,
    groupId: number
  ): Promise<void> => {
    await apiClient.put("/update-after-payment", null, {
      params: { studentId, feeId, academicYearId, groupId }
    });
  },

  // Delete payment summary (soft delete)
  deletePaymentSummary: async (summaryId: number): Promise<void> => {
    await apiClient.delete(`/summary/${summaryId}`);
  },

  // 🔧 Maintenance Operations

  // Recalculate all payment summaries (maintenance operation)
  recalculateAllSummaries: async (): Promise<void> => {
    await apiClient.post("/recalculate-all");
  },
};