import { createApiClient } from '@/service/api-client';
import type { Student } from '@/types/api.types';

const apiClient = createApiClient('student');

export const getAllStudents = async (): Promise<Student[]> => {
  const res = await apiClient.get('');
  return res.data;
};

export const getStudentById = async (id: number): Promise<Student> => {
  const res = await apiClient.get(`/${id}`);
  console.log('API Client: Student data:', res.data);
  return res.data;
};

export const createStudent = async (student: Student): Promise<Student> => {
  const res = await apiClient.post('/', student);
  return res.data;
};

export const updateStudent = async (id: number, student: Student): Promise<Student> => {
  const res = await apiClient.put(`/${id}`, student);
  return res.data;
};

export const deleteStudent = async (id: number): Promise<void> => {
  await apiClient.delete(`/${id}`);
};
