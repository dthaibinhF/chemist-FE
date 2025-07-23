import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

import type { Schedule } from "@/types/api.types";
import type { TimetableFilterData, TimetableSearchData } from "@/feature/timetable/schemas/timetable.schema";
import { timeTableService } from "@/service/time-table.service";

// Extended state interface with timetable-specific features
interface TimeTableState {
  schedules: Schedule[];
  schedule: Schedule | null;
  loading: boolean;
  error: string | null;
  viewMode: "weekly" | "daily";
  selectedDate: string;
  filters: TimetableFilterData;
  searchQuery: string;
}

const initialState: TimeTableState = {
  schedules: [],
  schedule: null,
  loading: false,
  error: null,
  viewMode: "weekly",
  selectedDate: new Date().toISOString(),
  filters: {},
  searchQuery: "",
};

// Enhanced async thunks
export const fetchSchedules = createAsyncThunk(
  "timeTable/fetchSchedules",
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
  "timeTable/fetchWeeklySchedules",
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
  "timeTable/fetchFilteredSchedules",
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
  "timeTable/searchSchedules",
  async (searchData: TimetableSearchData, { rejectWithValue }) => {
    try {
      const schedules = await timeTableService.searchSchedules(searchData);
      return schedules;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể tìm kiếm lịch học");
    }
  }
);

export const fetchSchedule = createAsyncThunk(
  "timeTable/fetchSchedule",
  async (id: number, { rejectWithValue }) => {
    try {
      const schedule = await timeTableService.getScheduleById(id);
      return schedule;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể tải lịch học");
    }
  }
);

export const createSchedule = createAsyncThunk(
  "timeTable/createSchedule",
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
  "timeTable/updateSchedule",
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
  "timeTable/deleteSchedule",
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

export const generateWeeklySchedule = createAsyncThunk(
  "timeTable/generateWeeklySchedule",
  async ({ groupId, startDate, endDate }: { groupId: number; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const schedules = await timeTableService.generateWeeklySchedule(groupId, startDate, endDate);
      toast.success(`Tạo thành công ${schedules.length} lịch học tuần`);
      return schedules;
    } catch (error: any) {
      toast.error("Tạo lịch học tuần thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể tạo lịch học tuần");
    }
  }
);

export const timeTableSlice = createSlice({
  name: "timeTable",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"weekly" | "daily">) => {
      state.viewMode = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setFilters: (state, action: PayloadAction<TimetableFilterData>) => {
      state.filters = action.payload;
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

      // Fetch single schedule
      .addCase(fetchSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedule = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
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
      })

      // Generate weekly schedule
      .addCase(generateWeeklySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateWeeklySchedule.fulfilled, (state, action) => {
        state.loading = false;
        // Add the generated schedules to the existing ones
        state.schedules.push(...action.payload);
      })
      .addCase(generateWeeklySchedule.rejected, (state, action) => {
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
} = timeTableSlice.actions;

export default timeTableSlice.reducer;

// Enhanced selectors
export const selectSchedules = (state: { timeTable: TimeTableState }) =>
  state.timeTable.schedules;
export const selectSchedule = (state: { timeTable: TimeTableState }) =>
  state.timeTable.schedule;
export const selectLoading = (state: { timeTable: TimeTableState }) =>
  state.timeTable.loading;
export const selectError = (state: { timeTable: TimeTableState }) =>
  state.timeTable.error;
export const selectViewMode = (state: { timeTable: TimeTableState }) =>
  state.timeTable.viewMode;
export const selectSelectedDate = (state: { timeTable: TimeTableState }) =>
  state.timeTable.selectedDate;
export const selectFilters = (state: { timeTable: TimeTableState }) =>
  state.timeTable.filters;
export const selectSearchQuery = (state: { timeTable: TimeTableState }) =>
  state.timeTable.searchQuery;
