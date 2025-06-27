import { createApiClient } from "./api-client";
import { Group } from "@/types/api.types";

const apiClient = createApiClient("group");

export const groupService = {
    // Lấy tất cả nhóm (danh sách)
    getAllGroups: async (): Promise<Group[]> => {
        const response = await apiClient.get("");
        return response.data;
    },

    // Lấy tất cả nhóm với chi tiết
    getAllGroupsWithDetail: async (): Promise<Group[]> => {
        const response = await apiClient.get("/detail");
        return response.data;
    },

    // Lấy nhóm theo ID
    getGroupById: async (id: number): Promise<Group> => {
        const response = await apiClient.get(`/${id}`);
        return response.data;
    },

    // Lấy nhóm theo năm học
    getGroupsByAcademicYearId: async (academicYearId: number): Promise<Group[]> => {
        const response = await apiClient.get(`/academic-year/${academicYearId}`);
        return response.data;
    },

    // Lấy nhóm theo khối
    getGroupsByGradeId: async (gradeId: number): Promise<Group[]> => {
        const response = await apiClient.get(`/grade/${gradeId}`);
        return response.data;
    },

    // Tạo nhóm mới
    createGroup: async (group: Group): Promise<Group> => {
        const response = await apiClient.post("", group);
        return response.data;
    },

    // Cập nhật nhóm
    updateGroup: async (id: number, group: Group): Promise<Group> => {
        const response = await apiClient.put(`/${id}`, group);
        return response.data;
    },

    // Xóa nhóm
    deleteGroup: async (id: number): Promise<void> => {
        await apiClient.delete(`/${id}`);
    },
}; 