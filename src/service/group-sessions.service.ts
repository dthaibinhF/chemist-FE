import type { GroupSession } from "@/types/api.types";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("group-sessions");

export const groupSessionsService = {
  // Lấy tất cả phiên làm việc nhóm
  getAllGroupSessions: async (): Promise<GroupSession[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  // Lấy phiên làm việc nhóm theo ID
  getGroupSessionById: async (id: number): Promise<GroupSession> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo mới phiên làm việc nhóm
  createGroupSession: async (groupSession: Omit<GroupSession, 'id' | 'create_at' | 'update_at' | 'end_at'>): Promise<GroupSession> => {
    const response = await apiClient.post("", groupSession);
    return response.data;
  },

  // Cập nhật phiên làm việc nhóm
  updateGroupSession: async (id: number, groupSession: Partial<GroupSession>): Promise<GroupSession> => {
    const response = await apiClient.put(`/${id}`, groupSession);
    return response.data;
  },

  // Xóa phiên làm việc nhóm (soft delete)
  deleteGroupSession: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  }
};