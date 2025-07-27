import { Attendance, BulkAttendanceDTO, PaginatedResponse } from "@/types/api.types";
import { createApiClient } from "./api-client";

const apiClient = createApiClient("attendance");

export const attendanceService = {
  // Lấy tất cả điểm danh
  getAllAttendances: async (): Promise<Attendance[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  // Lấy điểm danh theo ID
  getAttendanceById: async (id: number): Promise<Attendance> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo mới điểm danh
  createAttendance: async (attendance: Omit<Attendance, 'id' | 'create_at' | 'update_at' | 'end_at'>): Promise<Attendance> => {
    const response = await apiClient.post("", attendance);
    return response.data;
  },

  // Cập nhật điểm danh
  updateAttendance: async (id: number, attendance: Partial<Attendance>): Promise<Attendance> => {
    const response = await apiClient.put(`/${id}`, attendance);
    return response.data;
  },

  // Xóa điểm danh (soft delete)
  deleteAttendance: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },

  // Tìm kiếm điểm danh với phân trang
  searchAttendances: async (params: { search?: string; page?: number; size?: number; sort?: string }): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get("/search", { params });
    return response.data;
  },

  // Tạo điểm danh hàng loạt
  createBulkAttendance: async (bulkData: BulkAttendanceDTO): Promise<Attendance[]> => {
    const response = await apiClient.post("/bulk", bulkData);
    return response.data;
  },

  // Cập nhật điểm danh hàng loạt
  updateBulkAttendance: async (bulkData: BulkAttendanceDTO): Promise<Attendance[]> => {
    const response = await apiClient.put("/bulk", bulkData);
    return response.data;
  }
};

// Xuất các hàm cũ để tương thích ngược
export const getAllAttendances = attendanceService.getAllAttendances;
export const getAttendanceById = attendanceService.getAttendanceById;
export const createAttendance = attendanceService.createAttendance;
export const updateAttendance = attendanceService.updateAttendance;
export const deleteAttendance = attendanceService.deleteAttendance;
