import type { SchoolClass } from '@/types/api.types';

import { createApiClient } from './api-client';

const apiClient = createApiClient('school-class');

export const schoolClassService = {
  // Lấy tất cả lớp học
  getAllSchoolClasses: async (): Promise<SchoolClass[]> => {
    const response = await apiClient.get('');
    return response.data;
  },

  // Lấy lớp học theo ID
  getSchoolClassById: async (id: number): Promise<SchoolClass> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // get school class by grade prefix
  getSchoolClassByGradePrefix: async (gradePrefix: number): Promise<SchoolClass[]> => {
    const response = await apiClient.get(`/grade/${gradePrefix}`);
    return response.data;
  },

  // Tạo lớp học mới
  createSchoolClass: async (schoolClass: SchoolClass): Promise<SchoolClass> => {
    const response = await apiClient.post('', schoolClass);
    return response.data;
  },

  // Cập nhật lớp học
  updateSchoolClass: async (id: number, schoolClass: SchoolClass): Promise<SchoolClass> => {
    const response = await apiClient.put(`/${id}`, schoolClass);
    return response.data;
  },

  // Xóa lớp học
  deleteSchoolClass: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
