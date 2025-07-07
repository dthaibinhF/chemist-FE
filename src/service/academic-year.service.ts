import type { AcademicYear } from '@/types/api.types';

import { createApiClient } from './api-client';

const apiClient = createApiClient('academic-year');

export const academicYearService = {
  // Lấy tất cả năm học
  getAllAcademicYears: async (): Promise<AcademicYear[]> => {
    const response = await apiClient.get('');
    return response.data;
  },

  // Lấy năm học theo ID
  getAcademicYearById: async (id: number): Promise<AcademicYear> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo năm học mới
  createAcademicYear: async (academicYear: AcademicYear): Promise<AcademicYear> => {
    const response = await apiClient.post('', academicYear);
    return response.data;
  },

  // Cập nhật năm học
  updateAcademicYear: async (id: number, academicYear: AcademicYear): Promise<AcademicYear> => {
    const response = await apiClient.put(`/${id}`, academicYear);
    return response.data;
  },

  // Xóa năm học
  deleteAcademicYear: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
