import type { Fee } from '@/types/api.types';

import { createApiClient } from './api-client';

const apiClient = createApiClient('fee');

export const feeService = {
  // Lấy tất cả phí
  getAllFees: async (): Promise<Fee[]> => {
    const response = await apiClient.get('');
    return response.data;
  },

  // Lấy phí theo ID
  getFeeById: async (id: number): Promise<Fee> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo phí mới
  createFee: async (fee: Fee): Promise<Fee> => {
    const response = await apiClient.post('', fee);
    return response.data;
  },

  // Cập nhật phí
  updateFee: async (id: number, fee: Fee): Promise<Fee> => {
    const response = await apiClient.put(`/${id}`, fee);
    return response.data;
  },

  // Xóa phí
  deleteFee: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
