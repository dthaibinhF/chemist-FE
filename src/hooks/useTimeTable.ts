import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  createSchedule,
  deleteSchedule,
  fetchSchedule,
  fetchSchedules,
  updateSchedule,
} from "@/redux/slice/time-table.slice";
import type { Schedule } from "@/types/api.types";

export const useTimeTable = () => {
  const dispatch = useAppDispatch();
  const { schedules, schedule, loading, error } = useAppSelector(
    (state) => state.timeTable
  );

  const handleFetchSchedules = useCallback(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  const handleFetchSchedule = useCallback(
    (id: number) => {
      dispatch(fetchSchedule(id));
    },
    [dispatch]
  );

  const handleCreateSchedule = useCallback(
    (schedule: Schedule) => {
      dispatch(createSchedule(schedule));
    },
    [dispatch]
  );

  const handleUpdateSchedule = useCallback(
    (id: number, schedule: Schedule) => {
      dispatch(updateSchedule({ id, data: schedule }));
    },
    [dispatch]
  );

  const handleDeleteSchedule = useCallback(
    (id: number) => {
      dispatch(deleteSchedule(id));
    },
    [dispatch]
  );

  return {
    // Data
    schedules,
    schedule,
    loading,
    error,

    // Actions
    handleFetchSchedules,
    handleFetchSchedule,
    handleCreateSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
  };
};
