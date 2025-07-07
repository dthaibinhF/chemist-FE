import type { School } from '@/types/api.types';

import { createApiClient } from './api-client';

const apiClient = createApiClient('school');

export const schoolService = {
  // Lấy tất cả trường học
  getAllSchools: async (): Promise<School[]> => {
    const response = await apiClient.get('');
    return response.data;
  },

  // Lấy trường học theo ID
  getSchoolById: async (id: number): Promise<School> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo trường học mới
  createSchool: async (school: School): Promise<School> => {
    const response = await apiClient.post('', school);
    return response.data;
  },

  // Cập nhật trường học
  updateSchool: async (id: number, school: School): Promise<School> => {
    const response = await apiClient.put(`/${id}`, school);
    return response.data;
  },

  // Xóa trường học
  deleteSchool: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
