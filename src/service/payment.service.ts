import { PaymentDetail, PaymentStatus, PaymentSearchParams } from "@/types/api.types";
import { createApiClient } from "./api-client";

const apiClient = createApiClient("payment-detail");

export const paymentService = {
  getAllPayments: async (): Promise<PaymentDetail[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  getPaymentDetailById: async (id: number): Promise<PaymentDetail> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  createPaymentDetail: async (
    paymentDetail: PaymentDetail
  ): Promise<PaymentDetail> => {
    const response = await apiClient.post("", paymentDetail);
    return response.data;
  },

  updatePaymentDetail: async (
    id: number,
    paymentDetail: PaymentDetail
  ): Promise<PaymentDetail> => {
    const response = await apiClient.put(`/${id}`, paymentDetail);
    return response.data;
  },

  deletePaymentDetail: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },

  getPaymentDetailByStudentId: async (
    studentId: number
  ): Promise<PaymentDetail[]> => {
    const response = await apiClient.get(`/student/${studentId}`);
    return response.data;
  },

  getPaymentDetailByFeeId: async (feeId: number): Promise<PaymentDetail[]> => {
    const response = await apiClient.get(`/fee/${feeId}`);
    return response.data;
  },

  getPaymentDetailByStudentIdAndFeeId: async (
    studentId: number,
    feeId: number
  ): Promise<PaymentDetail[]> => {
    const response = await apiClient.get(`/student/${studentId}/fee/${feeId}`);
    return response.data;
  },

  // 🆕 NEW ENHANCED API ENDPOINTS

  // Get payments by status
  getPaymentsByStatus: async (status: PaymentStatus): Promise<PaymentDetail[]> => {
    const response = await apiClient.get(`/status/${status}`);
    return response.data;
  },

  // Get payments within date range
  getPaymentsByDateRange: async (
    params: PaymentSearchParams
  ): Promise<PaymentDetail[]> => {
    const response = await apiClient.get("/date-range", { params });
    return response.data;
  },


  // Advanced search with multiple parameters
  searchPayments: async (params: PaymentSearchParams): Promise<PaymentDetail[]> => {
    const response = await apiClient.get("", { params });
    return response.data;
  },
};
