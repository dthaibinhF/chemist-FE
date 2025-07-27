import type { Teacher, TeacherSearchParams, PaginatedResponse } from "@/types/api.types";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("teacher");

export const teacherService = {
  // Lấy tất cả giáo viên
  getAllTeachers: async (): Promise<Teacher[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  // Lấy giáo viên theo ID
  getTeacherById: async (id: number): Promise<Teacher> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo mới giáo viên
  createTeacher: async (teacher: Omit<Teacher, 'id' | 'create_at' | 'update_at' | 'end_at'>): Promise<Teacher> => {
    const response = await apiClient.post("", teacher);
    return response.data;
  },

  // Cập nhật thông tin giáo viên
  updateTeacher: async (id: number, teacher: Partial<Teacher>): Promise<Teacher> => {
    const response = await apiClient.put(`/${id}`, teacher);
    return response.data;
  },

  // Xóa giáo viên (soft delete)
  deleteTeacher: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },

  // Tìm kiếm giáo viên nâng cao với phân trang
  searchTeachers: async (params: TeacherSearchParams): Promise<PaginatedResponse<Teacher>> => {
    const response = await apiClient.get("/search", { params });
    return response.data;
  }
};