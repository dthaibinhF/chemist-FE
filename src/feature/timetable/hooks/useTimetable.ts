import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import type { Schedule } from "@/types/api.types";
import type { TimetableFilterData, TimetableSearchData } from "../schemas/timetable.schema";

import {
  fetchSchedules,
  fetchWeeklySchedules,
  fetchFilteredSchedules,
  searchSchedules,
  fetchSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  generateWeeklySchedule,
  setViewMode,
  setSelectedDate,
  setFilters,
  setSearchQuery,
  clearError,
  resetState,
} from "@/redux/slice/time-table.slice";

export const useTimetable = () => {
  const dispatch = useAppDispatch();
  const {
    schedules,
    schedule,
    loading,
    error,
    viewMode,
    selectedDate,
    filters,
    searchQuery,
  } = useAppSelector((state) => state.timeTable);

  // Fetch actions
  const handleFetchSchedules = useCallback(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  const handleFetchWeeklySchedules = useCallback(
    (startDate: string, endDate: string) => {
      dispatch(fetchWeeklySchedules({ startDate, endDate }));
    },
    [dispatch]
  );

  const handleFetchFilteredSchedules = useCallback(
    (filterData: TimetableFilterData) => {
      dispatch(fetchFilteredSchedules(filterData));
    },
    [dispatch]
  );

  const handleSearchSchedules = useCallback(
    (searchData: TimetableSearchData) => {
      dispatch(searchSchedules(searchData));
    },
    [dispatch]
  );

  const handleFetchSchedule = useCallback(
    (id: number) => {
      dispatch(fetchSchedule(id));
    },
    [dispatch]
  );

  // CRUD actions
  const handleCreateSchedule = useCallback(
    (schedule: Omit<Schedule, 'id' | 'create_at' | 'update_at' | 'end_at'>) => {
      return dispatch(createSchedule(schedule));
    },
    [dispatch]
  );

  const handleUpdateSchedule = useCallback(
    (id: number, data: Partial<Schedule>) => {
      return dispatch(updateSchedule({ id, data }));
    },
    [dispatch]
  );

  const handleDeleteSchedule = useCallback(
    (id: number) => {
      return dispatch(deleteSchedule(id));
    },
    [dispatch]
  );

  const handleGenerateWeeklySchedule = useCallback(
    (groupId: number, startDate: string, endDate: string) => {
      return dispatch(generateWeeklySchedule({ groupId, startDate, endDate }));
    },
    [dispatch]
  );

  // UI state actions
  const handleSetViewMode = useCallback(
    (mode: "weekly" | "daily") => {
      dispatch(setViewMode(mode));
    },
    [dispatch]
  );

  const handleSetSelectedDate = useCallback(
    (date: Date) => {
      dispatch(setSelectedDate(date));
    },
    [dispatch]
  );

  const handleSetFilters = useCallback(
    (filterData: TimetableFilterData) => {
      dispatch(setFilters(filterData));
    },
    [dispatch]
  );

  const handleSetSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleResetState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  // Helper functions
  const getScheduleById = useCallback(
    (id: number) => {
      return schedules.find(schedule => schedule.id === id);
    },
    [schedules]
  );

  const getSchedulesByGroup = useCallback(
    (groupId: number) => {
      return schedules.filter(schedule => schedule.group_id === groupId);
    },
    [schedules]
  );

  const getSchedulesByDate = useCallback(
    (date: Date) => {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      return schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate.getTime() === targetDate.getTime();
      });
    },
    [schedules]
  );

  const getSchedulesForWeek = useCallback(
    (weekStart: Date) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        return scheduleDate >= weekStart && scheduleDate <= weekEnd;
      });
    },
    [schedules]
  );

  return {
    // State
    schedules,
    schedule,
    loading,
    error,
    viewMode,
    selectedDate,
    filters,
    searchQuery,

    // Fetch actions
    handleFetchSchedules,
    handleFetchWeeklySchedules,
    handleFetchFilteredSchedules,
    handleSearchSchedules,
    handleFetchSchedule,

    // CRUD actions
    handleCreateSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
    handleGenerateWeeklySchedule,

    // UI state actions
    handleSetViewMode,
    handleSetSelectedDate,
    handleSetFilters,
    handleSetSearchQuery,
    handleClearError,
    handleResetState,

    // Helper functions
    getScheduleById,
    getSchedulesByGroup,
    getSchedulesByDate,
    getSchedulesForWeek,
  };
};