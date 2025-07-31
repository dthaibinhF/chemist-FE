import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

import type { Schedule, BulkScheduleRequest } from "@/types/api.types";
import type { TimetableFilterData, TimetableSearchData } from "@/feature/timetable/schemas/timetable.schema";
import {
  timeTableService,
  generateBulkSchedulesForGroups,
  generateBulkSchedulesForAllGroups,
  generateNextWeekSchedules,
  triggerAutoGeneration
} from "@/service/time-table.service";
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
  // Bulk generation state
  bulkGenerationLoading: boolean;
  bulkGenerationProgress: {
    total: number;
    completed: number;
    errors: number;
    currentStep: string;
  };
  bulkGenerationResults: Schedule[][] | string | null;
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
  // Bulk generation initial state
  bulkGenerationLoading: false,
  bulkGenerationProgress: {
    total: 0,
    completed: 0,
    errors: 0,
    currentStep: "",
  },
  bulkGenerationResults: null,
};

// Bulk generation async thunks
export const bulkGenerateSchedulesForGroups = createAsyncThunk(
  "timeTable/bulkGenerateSchedulesForGroups",
  async (request: BulkScheduleRequest, { rejectWithValue }) => {
    try {
      const response = await generateBulkSchedulesForGroups(request);
      toast.success(`Tạo thành công ${response.length} lịch học cho ${response.length} nhóm`);
      return response;
    } catch (error: any) {
      toast.error("Tạo lịch học hàng loạt thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể tạo lịch học hàng loạt");
    }
  }
);

export const bulkGenerateSchedulesForAllGroups = createAsyncThunk(
  "timeTable/bulkGenerateSchedulesForAllGroups",
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await generateBulkSchedulesForAllGroups(startDate, endDate);
      toast.success(`Tạo thành công ${response.length} lịch học cho tất cả nhóm`);
      return response;
    } catch (error: any) {
      toast.error("Tạo lịch học cho tất cả nhóm thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể tạo lịch học cho tất cả nhóm");
    }
  }
);

export const bulkGenerateNextWeekSchedules = createAsyncThunk(
  "timeTable/bulkGenerateNextWeekSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await generateNextWeekSchedules();
      toast.success("Tạo lịch học tuần tới thành công");
      return response;
    } catch (error: any) {
      toast.error("Tạo lịch học tuần tới thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể tạo lịch học tuần tới");
    }
  }
);

export const bulkTriggerAutoGeneration = createAsyncThunk(
  "timeTable/bulkTriggerAutoGeneration",
  async (_, { rejectWithValue }) => {
    try {
      const response = await triggerAutoGeneration();
      toast.success("Kích hoạt tự động tạo lịch thành công");
      return response;
    } catch (error: any) {
      toast.error("Kích hoạt tự động tạo lịch thất bại");
      return rejectWithValue(error.response?.data?.message || "Không thể kích hoạt tự động tạo lịch");
    }
  }
);

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
    clearSchedule: (state) => {
      state.schedule = null;
    },
    // Bulk generation reducers
    setBulkGenerationProgress: (state, action: PayloadAction<{
      total: number;
      completed: number;
      errors: number;
      currentStep: string;
    }>) => {
      state.bulkGenerationProgress = action.payload;
    },
    clearBulkGenerationResults: (state) => {
      state.bulkGenerationResults = null;
      state.bulkGenerationProgress = {
        total: 0,
        completed: 0,
        errors: 0,
        currentStep: "",
      };
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
      })

      // Bulk generate schedules for groups
      .addCase(bulkGenerateSchedulesForGroups.pending, (state) => {
        state.bulkGenerationLoading = true;
        state.error = null;
        state.bulkGenerationResults = null;
      })
      .addCase(bulkGenerateSchedulesForGroups.fulfilled, (state, action) => {
        state.bulkGenerationLoading = false;
        state.bulkGenerationResults = action.payload;
        // Add generated schedules to the existing ones
        state.schedules.push(...action.payload.flat());
      })
      .addCase(bulkGenerateSchedulesForGroups.rejected, (state, action) => {
        state.bulkGenerationLoading = false;
        state.error = action.payload as string;
      })

      // Bulk generate schedules for all groups
      .addCase(bulkGenerateSchedulesForAllGroups.pending, (state) => {
        state.bulkGenerationLoading = true;
        state.error = null;
        state.bulkGenerationResults = null;
      })
      .addCase(bulkGenerateSchedulesForAllGroups.fulfilled, (state, action) => {
        state.bulkGenerationLoading = false;
        state.bulkGenerationResults = [action.payload];
        // Add generated schedules to the existing ones
        state.schedules.push(...action.payload.flat());
      })
      .addCase(bulkGenerateSchedulesForAllGroups.rejected, (state, action) => {
        state.bulkGenerationLoading = false;
        state.error = action.payload as string;
      })

      // Bulk generate next week schedules
      .addCase(bulkGenerateNextWeekSchedules.pending, (state) => {
        state.bulkGenerationLoading = true;
        state.error = null;
      })
      .addCase(bulkGenerateNextWeekSchedules.fulfilled, (state, action) => {
        state.bulkGenerationLoading = false;
        state.bulkGenerationResults = action.payload;
      })
      .addCase(bulkGenerateNextWeekSchedules.rejected, (state, action) => {
        state.bulkGenerationLoading = false;
        state.error = action.payload as string;
      })

      // Bulk trigger auto generation
      .addCase(bulkTriggerAutoGeneration.pending, (state) => {
        state.bulkGenerationLoading = true;
        state.error = null;
      })
      .addCase(bulkTriggerAutoGeneration.fulfilled, (state, action) => {
        state.bulkGenerationLoading = false;
        state.bulkGenerationResults = action.payload;
      })
      .addCase(bulkTriggerAutoGeneration.rejected, (state, action) => {
        state.bulkGenerationLoading = false;
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
  clearSchedule,
  setBulkGenerationProgress,
  clearBulkGenerationResults,
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

// Bulk generation selectors
export const selectBulkGenerationLoading = (state: { timeTable: TimeTableState }) =>
  state.timeTable.bulkGenerationLoading;
export const selectBulkGenerationProgress = (state: { timeTable: TimeTableState }) =>
  state.timeTable.bulkGenerationProgress;
export const selectBulkGenerationResults = (state: { timeTable: TimeTableState }) =>
  state.timeTable.bulkGenerationResults;
