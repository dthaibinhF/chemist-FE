import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hook';
import type { Group } from '@/types/api.types';

import {
  createGroup,
  deleteGroup,
  fetchGroup,
  fetchGroups,
  fetchGroupsWithDetail,
  updateGroup,
} from '../slice/group.slice';

export const useGroup = () => {
  const dispatch = useAppDispatch();
  const { groups, group, loading, error } = useAppSelector((state) => state.group);

  const handleFetchGroups = useCallback(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleFetchGroupWithDetaisl = useCallback(() => {
    dispatch(fetchGroupsWithDetail());
  }, [dispatch]);

  const handleFetchGroup = useCallback(
    (id: number) => {
      dispatch(fetchGroup(id));
    },
    [dispatch]
  );

  const handleCreateGroup = useCallback(
    (data: Group) => {
      dispatch(createGroup(data));
    },
    [dispatch]
  );

  const handleUpdateGroup = useCallback(
    (id: number, data: Group) => {
      dispatch(updateGroup({ id, data }));
    },
    [dispatch]
  );

  const handleDeleteGroup = useCallback(
    (id: number) => {
      dispatch(deleteGroup(id));
    },
    [dispatch]
  );

  return {
    // Data
    groups,
    group,
    loading,
    error,

    // Actions
    fetchGroupsWithDetail: handleFetchGroupWithDetaisl,
    fetchGroups: handleFetchGroups,
    fetchGroup: handleFetchGroup,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
  };
};
