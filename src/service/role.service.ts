import { createApiClient } from "./api-client";
import { Role } from "@/types/api.types";

const apiClient = createApiClient("role");

export const roleService = {
    // Lấy tất cả vai trò
    getAllRoles: async (): Promise<Role[]> => {
        const response = await apiClient.get("");
        return response.data;
    },

    // Lấy vai trò theo ID
    getRoleById: async (id: number): Promise<Role> => {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    },

    // Tạo vai trò mới
    createRole: async (role: Role): Promise<Role> => {
        const response = await apiClient.post("", role);
        return response.data;
    },

    // Cập nhật vai trò
    updateRole: async (id: number, role: Role): Promise<Role> => {
        const response = await apiClient.put(`/${id}`, role);
        return response.data;
    },

    // Xóa vai trò
    deleteRole: async (id: number): Promise<void> => {
        await apiClient.delete(`/${id}`);
    },
}; 