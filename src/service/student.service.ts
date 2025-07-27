import type { Student, StudentSearchParams, PaginatedResponse } from "@/types/api.types";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("student");

export const studentService = {
  // Lấy tất cả học sinh
  getAllStudents: async (): Promise<Student[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  // Lấy học sinh theo ID
  getStudentById: async (id: number): Promise<Student> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo mới học sinh
  createStudent: async (student: Omit<Student, 'id' | 'create_at' | 'update_at' | 'end_at'>): Promise<Student> => {
    const response = await apiClient.post("", student);
    return response.data;
  },

  // Cập nhật thông tin học sinh
  updateStudent: async (id: number, student: Partial<Student>): Promise<Student> => {
    const response = await apiClient.put(`/${id}`, student);
    return response.data;
  },

  // Xóa học sinh (soft delete)
  deleteStudent: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },

  // Tìm kiếm học sinh với phân trang và lọc nâng cao
  searchStudents: async (params: StudentSearchParams): Promise<PaginatedResponse<Student>> => {
    const response = await apiClient.get("/search", { params });
    return response.data;
  },

  // Tạo nhiều học sinh cùng lúc
  createMultipleStudents: async (students: Omit<Student, 'id' | 'create_at' | 'update_at' | 'end_at'>[]): Promise<Student[]> => {
    const response = await apiClient.post("/multiple", students);
    return response.data;
  },

  // Lấy danh sách học sinh theo nhóm
  getStudentsByGroup: async (groupId: number): Promise<Student[]> => {
    const response = await apiClient.get(`/group/${groupId}`);
    return response.data;
  },

  // Lấy lịch sử chi tiết của học sinh
  getStudentHistory: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/${id}/history`);
    return response.data;
  }
};