import type {
  Teacher,
  TeacherMonthlySummary,
  SalaryConfigurationDTO,
  SalaryCalculationParams,
  SalaryHistoryParams,
  SalarySummariesParams,
  PaginatedResponse
} from "@/types/api.types";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("salary");

export const salaryService = {
  // 🔧 Salary Configuration Endpoints

  // Cập nhật cấu hình lương giáo viên
  updateTeacherSalaryConfig: async (
    teacherId: number,
    config: SalaryConfigurationDTO
  ): Promise<Teacher> => {
    const response = await apiClient.put(`/teacher/${teacherId}/config`, null, {
      params: {
        salaryType: config.salaryType,
        baseRate: config.baseRate
      }
    });
    return response.data;
  },

  // Lấy cấu hình lương giáo viên hiện tại
  getTeacherSalaryConfig: async (teacherId: number): Promise<Teacher> => {
    const response = await apiClient.get(`/teacher/${teacherId}/config`);
    return response.data;
  },

  // 💰 Salary Calculation Endpoints

  // Tính lương tháng cho một giáo viên
  calculateMonthlySalary: async (
    teacherId: number,
    params: SalaryCalculationParams
  ): Promise<TeacherMonthlySummary> => {
    const response = await apiClient.post(`/teacher/${teacherId}/calculate`, null, {
      params: {
        month: params.month,
        year: params.year
      }
    });
    return response.data;
  },

  // Tính lương tháng cho tất cả giáo viên
  calculateAllMonthlySalaries: async (
    params: SalaryCalculationParams
  ): Promise<TeacherMonthlySummary[]> => {
    const response = await apiClient.post("/calculate-all", null, {
      params: {
        month: params.month,
        year: params.year
      }
    });
    return response.data;
  },

  // Tính lại lương tháng (sau khi cập nhật điểm danh)
  recalculateMonthlySalary: async (
    teacherId: number,
    params: SalaryCalculationParams
  ): Promise<TeacherMonthlySummary> => {
    const response = await apiClient.put(`/teacher/${teacherId}/recalculate`, null, {
      params: {
        month: params.month,
        year: params.year
      }
    });
    return response.data;
  },

  // 📊 Salary History & Reporting Endpoints

  // Lấy danh sách tóm tắt lương giáo viên (có phân trang)
  getTeacherSalarySummaries: async (
    teacherId: number,
    params?: SalarySummariesParams
  ): Promise<PaginatedResponse<TeacherMonthlySummary>> => {
    const response = await apiClient.get(`/teacher/${teacherId}/summaries`, {
      params: {
        page: params?.page || 0,
        size: params?.size || 12,
        ...(params?.sort && { sort: params.sort })
      }
    });
    return response.data;
  },

  // Lấy tóm tắt lương tháng cụ thể
  getSpecificMonthlySummary: async (
    teacherId: number,
    year: number,
    month: number
  ): Promise<TeacherMonthlySummary> => {
    const response = await apiClient.get(`/teacher/${teacherId}/summary/${year}/${month}`);
    return response.data;
  },

  // Lấy lịch sử lương theo khoảng thời gian
  getSalaryHistory: async (
    teacherId: number,
    params: SalaryHistoryParams
  ): Promise<TeacherMonthlySummary[]> => {
    const response = await apiClient.get(`/teacher/${teacherId}/history`, {
      params: {
        fromYear: params.fromYear,
        fromMonth: params.fromMonth,
        toYear: params.toYear,
        toMonth: params.toMonth
      }
    });
    return response.data;
  }
};