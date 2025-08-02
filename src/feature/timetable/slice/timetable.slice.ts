import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

import type { Schedule } from "@/types/api.types";
import type { TimetableFilterData, TimetableSearchData } from "../schemas/timetable.schema";
import type { TimetableState, TimetableViewMode } from "../types/timetable.types";
import { timeTableService } from "@/service/time-table.service";

const initialState: TimetableState = {
  schedules: [],
  loading: false,
  error: null,
  viewMode: "weekly",
  selectedDate: new Date().toISOString(),
  filters: {},
  searchQuery: "",
};

// Async thunks
export const fetchSchedules = createAsyncThunk(
  "timetable/fetchSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const schedules = await timeTableService.getAllSchedules();
      return schedules;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải danh sách lịch học");
    }
  }
);

export const fetchWeeklySchedules = createAsyncThunk(
  "timetable/fetchWeeklySchedules",
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const schedules = await timeTableService.getWeeklySchedules(startDate, endDate);
      return schedules;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải lịch học tuần");
    }
  }
);

export const fetchFilteredSchedules = createAsyncThunk(
  "timetable/fetchFilteredSchedules",
  async (filters: TimetableFilterData, { rejectWithValue }) => {
    try {
      const schedules = await timeTableService.getFilteredSchedules(filters);
      return schedules;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể lọc lịch học");
    }
  }
);

export const searchSchedules = createAsyncThunk(
  "timetable/searchSchedules",
  async (searchData: TimetableSearchData, { rejectWithValue }) => {
    try {
      const schedules = await timeTableService.searchSchedules(searchData);
      return schedules;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể tìm kiếm lịch học");
    }
  }
);

export const createSchedule = createAsyncThunk(
  "timetable/createSchedule",
  async (schedule: Omit<Schedule, 'id' | 'create_at' | 'update_at' | 'end_at'>, { rejectWithValue }) => {
    try {
      const newSchedule = await timeTableService.createSchedule(schedule);
      toast.success("Tạo lịch học thành công");
      return newSchedule;
    } catch (error: any) {
      toast.error("Tạo lịch học thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể tạo lịch học");
    }
  }
);

export const updateSchedule = createAsyncThunk(
  "timetable/updateSchedule",
  async ({ id, data }: { id: number; data: Partial<Schedule> }, { rejectWithValue }) => {
    try {
      const updatedSchedule = await timeTableService.updateSchedule(id, data);
      toast.success("Cập nhật lịch học thành công");
      return updatedSchedule;
    } catch (error: any) {
      toast.error("Cập nhật lịch học thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể cập nhật lịch học");
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  "timetable/deleteSchedule",
  async (id: number, { rejectWithValue }) => {
    try {
      await timeTableService.deleteSchedule(id);
      toast.success("Xóa lịch học thành công");
      return id;
    } catch (error: any) {
      toast.error("Xóa lịch học thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể xóa lịch học");
    }
  }
);

const timetableSlice = createSlice({
  name: "timetable",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<TimetableViewMode>) => {
      state.viewMode = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setFilters: (state, action: PayloadAction<TimetableFilterData>) => {
      // Convert any Date objects in filters to ISO strings
      const serializedFilters = {
        ...action.payload,
        start_date: action.payload.startDate,
        end_date: action.payload.endDate,
      };
      state.filters = serializedFilters;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch weekly schedules
      .addCase(fetchWeeklySchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklySchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchWeeklySchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch filtered schedules
      .addCase(fetchFilteredSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchFilteredSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Search schedules
      .addCase(searchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(searchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules.push(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update schedule
      .addCase(updateSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.schedules.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete schedule
      .addCase(deleteSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = state.schedules.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setViewMode,
  setSelectedDate,
  setFilters,
  setSearchQuery,
  clearError,
  resetState,
} = timetableSlice.actions;

export default timetableSlice.reducer;