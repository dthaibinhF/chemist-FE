import type { Schedule } from "@/types/api.types";
import type { TimetableFilterData, TimetableSearchData } from "@/feature/timetable/schemas/timetable.schema";

import { createApiClient } from "./api-client";

const apiClient = createApiClient("schedule");

export const timeTableService = {
  // Get all schedules
  getAllSchedules: async (): Promise<Schedule[]> => {
    const response = await apiClient.get("");
    return response.data;
  },

  // Get weekly schedules
  getWeeklySchedules: async (startDate: string, endDate: string): Promise<Schedule[]> => {
    const response = await apiClient.get("/search", {
      params: { startDate: startDate, endDate: endDate }
    });
    return response.data;
  },

  // Get schedules with filters
  getFilteredSchedules: async (filters: TimetableFilterData): Promise<Schedule[]> => {
    const response = await apiClient.get("/search", { params: filters });
    return response.data;
  },

  // Search schedules
  searchSchedules: async (searchData: TimetableSearchData): Promise<Schedule[]> => {
    const response = await apiClient.get("/search", { params: searchData });
    return response.data;
  },

  // Get schedule by ID
  getScheduleById: async (id: number): Promise<Schedule> => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Create new schedule
  createSchedule: async (schedule: Omit<Schedule, 'id' | 'create_at' | 'update_at' | 'end_at'>): Promise<Schedule> => {
    const response = await apiClient.post("", schedule);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id: number, schedule: Partial<Schedule>): Promise<Schedule> => {
    const response = await apiClient.put(`/${id}`, schedule);
    return response.data;
  },

  // Delete schedule (soft delete)
  deleteSchedule: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },

  // Get schedules by group ID
  getSchedulesByGroup: async (groupId: number): Promise<Schedule[]> => {
    const response = await apiClient.get(`/group/${groupId}`);
    return response.data;
  },

  // Get schedules by teacher ID  
  getSchedulesByTeacher: async (teacherId: number): Promise<Schedule[]> => {
    const response = await apiClient.get(`/teacher/${teacherId}`);
    return response.data;
  },

  // Get schedules by room ID
  getSchedulesByRoom: async (roomId: number): Promise<Schedule[]> => {
    const response = await apiClient.get(`/room/${roomId}`);
    return response.data;
  },

  // Generate weekly schedule for a group
  generateWeeklySchedule: async (
    groupId: number,
    startDate: string,
    endDate: string
  ): Promise<Schedule[]> => {
    const response = await apiClient.post("/weekly", null, {
      params: {
        groupId: groupId,
        startDate: startDate,
        endDate: endDate
      }
    });
    return response.data;
  },
};
