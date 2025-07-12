import { Attendance } from "@/types/api.types";
import { AxiosResponse } from "axios";
import { createApiClient } from "./api-client";

const apiClient = createApiClient("attendance");

export const getAllAttendances = async (): Promise<Attendance[]> => {
  const response = await apiClient.get("");
  return response.data;
};

export const getAttendanceById = async (id: number): Promise<Attendance> => {
  const response = await apiClient.get(`/${id}`);
  return response.data;
};

export const createAttendance = async (
  attendance: Attendance
): Promise<Attendance> => {
  const response = await apiClient.post("", attendance);
  return response.data;
};

export const updateAttendance = async (
  id: number,
  attendance: Attendance
): Promise<Attendance> => {
  const response = await apiClient.put(`/${id}`, attendance);
  return response.data;
};

export const deleteAttendance = async (
  id: number
): Promise<AxiosResponse<any>> => {
  const response = await apiClient.delete(`/${id}`);
  return response;
};

export const searchAttendances = async (
  search: string
): Promise<Attendance[]> => {
  const response = await apiClient.get(`/search?search=${search}`);
  return response.data;
};
