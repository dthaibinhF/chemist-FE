import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import type { Student } from "@/types/api.types";

import {
  createMultipleStudents,
  createStudent,
  deleteStudent,
  fetchStudent,
  fetchStudents,
  setSelectedStudent,
  updateStudent,
} from "../slice/studentSlice";

export const useStudent = () => {
  const dispatch = useAppDispatch();
  const { students, selectedStudent, loading, error } = useAppSelector(
    (state) => state.student
  );

  const loadStudents = useCallback(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const addStudent = useCallback(
    (student: Student) => {
      dispatch(createStudent(student));
    },
    [dispatch]
  );

  const editStudent = useCallback(
    (id: number, student: Student) => {
      dispatch(updateStudent({ id, student }));
    },
    [dispatch]
  );

  const removeStudent = async (id: number) => {
    return dispatch(deleteStudent(id));
  };

  const addMultipleStudents = useCallback(
    (students: Partial<Student>[]) => {
      return dispatch(createMultipleStudents(students));
    },
    [dispatch]
  );

  const selectStudent = useCallback(
    (student?: Student) => {
      dispatch(setSelectedStudent(student));
    },
    [dispatch]
  );

  const loadStudent = useCallback(
    (id: number) => {
      dispatch(fetchStudent(id));
    },
    [dispatch]
  );

  return {
    loadStudent,
    students,
    selectedStudent,
    loading,
    error,
    loadStudents,
    addStudent,
    editStudent,
    removeStudent,
    selectStudent,
    addMultipleStudents,
  };
};
