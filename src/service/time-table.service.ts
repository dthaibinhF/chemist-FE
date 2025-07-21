import type { Schedule } from "@/types/api.types";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("schedule");

export const timeTableService = {
  // Get all schedules
  getAllSchedules: async (): Promise<Schedule[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  // Get schedule by ID
  getScheduleById: async (id: number): Promise<Schedule> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Create new schedule
  createSchedule: async (schedule: Schedule): Promise<Schedule> => {
    const response = await apiClient.post("", schedule);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id: number, schedule: Schedule): Promise<Schedule> => {
    const response = await apiClient.put(`/${id}`, schedule);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
