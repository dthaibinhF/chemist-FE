import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hook';

import { createGroup, deleteGroup, fetchGroup, fetchGroups, fetchGroupsWithDetail, updateGroup } from '@/redux/slice/group.slice';
import type { Group } from '@/types/api.types';


export const useGroup = () => {
  const dispatch = useAppDispatch();
  const { groups, group, loading, error } = useAppSelector((state) => state.group);

  const handleFetchGroups = useCallback(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleFetchGroupsWithDetail = useCallback(() => {
    dispatch(fetchGroupsWithDetail());
  }, [dispatch]);

  const handleFetchGroup = useCallback(
    (id: number) => {
      dispatch(fetchGroup(id));
    },
    [dispatch]
  );

  const handleCreateGroup = useCallback(
    (group: Group) => {
      dispatch(createGroup(group));
    },
    [dispatch]
  );

  const handleUpdateGroup = useCallback(
    (id: number, group: Group) => {
      dispatch(updateGroup({ id, group }));
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
    groups,
    group,
    loading,
    error,

    // Actions
    handleFetchGroups,
    handleFetchGroupsWithDetail,
    handleFetchGroup,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
  };
};
