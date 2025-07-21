import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { timeTableService } from "@/service/time-table.service";
import type { Schedule } from "@/types/api.types";

interface TimeTableState {
  schedules: Schedule[];
  schedule: Schedule | null;
  loading: boolean;
  error: string | null;
}

const initialState: TimeTableState = {
  schedules: [],
  schedule: null,
  loading: false,
  error: null,
};

export const fetchSchedules = createAsyncThunk(
  "timeTable/fetchSchedules",
  async () => {
    const response = await timeTableService.getAllSchedules();
    return response;
  }
);

export const fetchSchedule = createAsyncThunk(
  "timeTable/fetchSchedule",
  async (id: number) => {
    const response = await timeTableService.getScheduleById(id);
    return response;
  }
);

export const createSchedule = createAsyncThunk(
  "timeTable/createSchedule",
  async (schedule: Schedule) => {
    const response = await timeTableService.createSchedule(schedule);
    return response;
  }
);

export const updateSchedule = createAsyncThunk(
  "timeTable/updateSchedule",
  async ({ id, data }: { id: number; data: Schedule }) => {
    const response = await timeTableService.updateSchedule(id, data);
    return response;
  }
);

export const deleteSchedule = createAsyncThunk(
  "timeTable/deleteSchedule",
  async (id: number) => {
    await timeTableService.deleteSchedule(id);
    return id;
  }
);

export const timeTableSlice = createSlice({
  name: "timeTable",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules.push(action.payload);
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex(
          (schedule) => schedule.id === action.payload.id
        );
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = state.schedules.filter(
          (schedule) => schedule.id !== action.payload
        );
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch schedules";
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch schedule";
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create schedule";
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update schedule";
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete schedule";
      });
  },
});

export default timeTableSlice.reducer;

// Selectors
export const selectSchedules = (state: { timeTable: TimeTableState }) =>
  state.timeTable.schedules;
export const selectSchedule = (state: { timeTable: TimeTableState }) =>
  state.timeTable.schedule;
export const selectLoading = (state: { timeTable: TimeTableState }) =>
  state.timeTable.loading;
export const selectError = (state: { timeTable: TimeTableState }) =>
  state.timeTable.error;
