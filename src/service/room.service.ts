import type { Room } from '@/types/api.types';

import { createApiClient } from './api-client';

const apiClient = createApiClient('room');

export const roomService = {
  // Lấy tất cả phòng học
  getAllRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get('');
    return response.data;
  },

  // Lấy phòng học theo ID
  getRoomById: async (id: number): Promise<Room> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Tạo phòng học mới
  createRoom: async (room: Room): Promise<Room> => {
    const response = await apiClient.post('', room);
    return response.data;
  },

  // Cập nhật phòng học
  updateRoom: async (id: number, room: Room): Promise<Room> => {
    const response = await apiClient.put(`/${id}`, room);
    return response.data;
  },

  // Xóa phòng học
  deleteRoom: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
