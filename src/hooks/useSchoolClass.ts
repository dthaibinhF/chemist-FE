import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  createSchoolClass,
  deleteSchoolClass,
  fetchSchoolClass,
  fetchSchoolClassByGradePrefix,
  fetchSchoolClasses,
  updateSchoolClass,
} from '@/redux/slice/school-class.slice';
import type { SchoolClass } from '@/types/api.types';

export const useSchoolClass = () => {
  const dispatch = useAppDispatch();
  const { schoolClasses, schoolClass, loading, error } = useAppSelector(
    (state) => state.schoolClass
  );

  const handleFetchSchoolClasses = useCallback(() => {
    dispatch(fetchSchoolClasses());
  }, [dispatch]);

  const handleFetchSchoolClassByGradePrefix = useCallback(
    (gradePrefix: number) => {
      dispatch(fetchSchoolClassByGradePrefix(gradePrefix));
    },
    [dispatch]
  );

  const handleFetchSchoolClass = useCallback(
    (id: number) => {
      dispatch(fetchSchoolClass(id));
    },
    [dispatch]
  );

  const handleCreateSchoolClass = useCallback(
    (schoolClass: SchoolClass) => {
      dispatch(createSchoolClass(schoolClass));
    },
    [dispatch]
  );

  const handleUpdateSchoolClass = useCallback(
    (id: number, schoolClass: SchoolClass) => {
      dispatch(updateSchoolClass({ id, schoolClass }));
    },
    [dispatch]
  );

  const handleDeleteSchoolClass = useCallback(
    (id: number) => {
      dispatch(deleteSchoolClass(id));
    },
    [dispatch]
  );

  return {
    // Data
    schoolClasses,
    schoolClass,
    loading,
    error,

    // Actions
    handleFetchSchoolClasses,
    handleFetchSchoolClassByGradePrefix,
    handleFetchSchoolClass,
    handleCreateSchoolClass,
    handleUpdateSchoolClass,
    handleDeleteSchoolClass,
  };
};
