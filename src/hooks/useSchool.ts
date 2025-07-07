import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  createSchool,
  deleteSchool,
  fetchSchool,
  fetchSchools,
  updateSchool,
} from '@/redux/slice/school.slice';
import type { School } from '@/types/api.types';

export const useSchool = () => {
  const dispatch = useAppDispatch();
  const { schools, school, loading, error } = useAppSelector((state) => state.school);

  const handleFetchSchools = useCallback(() => {
    dispatch(fetchSchools());
  }, [dispatch]);

  const handleFetchSchool = useCallback(
    (id: number) => {
      dispatch(fetchSchool(id));
    },
    [dispatch]
  );

  const handleCreateSchool = useCallback(
    (school: School) => {
      dispatch(createSchool(school));
    },
    [dispatch]
  );

  const handleUpdateSchool = useCallback(
    (id: number, school: School) => {
      dispatch(updateSchool({ id, school }));
    },
    [dispatch]
  );

  const handleDeleteSchool = useCallback(
    (id: number) => {
      dispatch(deleteSchool(id));
    },
    [dispatch]
  );

  return {
    schools,
    school,
    loading,
    error,

    handleFetchSchools,
    handleFetchSchool,
    handleCreateSchool,
    handleUpdateSchool,
    handleDeleteSchool,
  };
};
