import { createApiClient } from "./api-client";
import { Grade } from "@/types/api.types";

const apiClient = createApiClient("grade");

export const gradeService = {
    // Lấy tất cả khối
    getAllGrades: async (): Promise<Grade[]> => {
        const response = await apiClient.get("");
        return response.data;
    },

    // Lấy khối theo ID
    getGradeById: async (id: number): Promise<Grade> => {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    },

    // Tạo khối mới
    createGrade: async (grade: Grade): Promise<Grade> => {
        const response = await apiClient.post("", grade);
        return response.data;
    },

    // Cập nhật khối
    updateGrade: async (id: number, grade: Grade): Promise<Grade> => {
        const response = await apiClient.put(`/${id}`, grade);
        return response.data;
    },

    // Xóa khối
    deleteGrade: async (id: number): Promise<void> => {
        await apiClient.delete(`/${id}`);
    },
}; 