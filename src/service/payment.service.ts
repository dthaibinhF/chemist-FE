import { PaymentDetail } from "@/types/api.types";
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
};
