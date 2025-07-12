import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import type { Group } from "@/types/api.types";

import {
  createGroup,
  deleteGroup,
  fetchGroup,
  fetchGroups,
  fetchGroupsWithDetail,
  // fetchGroupStats, // Import the new thunk
  // generateInvoices, // Import the new thunk
  updateGroup,
} from "../slice/group.slice";

export const useGroup = () => {
  const dispatch = useAppDispatch();
  const { groups, group, stats, loading, error } = useAppSelector(
    (state) => state.group
  );

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

  // const handleFetchGroupStats = useCallback(() => {
  //   dispatch(fetchGroupStats());
  // }, [dispatch]);

  // const handleGenerateInvoices = useCallback(
  //   (groupId: number) => {
  //     return dispatch(generateInvoices(groupId));
  //   },
  //   [dispatch]
  // );

  return {
    // Data
    groups,
    group,
    stats,
    loading,
    error,

    // Actions
    fetchGroupsWithDetail: handleFetchGroupWithDetaisl,
    fetchGroups: handleFetchGroups,
    fetchGroup: handleFetchGroup,
    // fetchGroupStats: handleFetchGroupStats,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    // generateInvoices: handleGenerateInvoices,
  };
};
