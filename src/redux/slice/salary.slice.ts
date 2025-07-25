import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { salaryService } from '@/service/salary.service';
import type { 
  TeacherMonthlySummary, 
  SalaryConfigurationDTO, 
  SalaryCalculationParams,
  SalaryHistoryParams,
  SalarySummariesParams,
  PaginatedResponse,
  Teacher
} from '@/types/api.types';

interface SalaryState {
  // Configuration state
  teacherConfigs: Record<number, Teacher>; // teacherId -> Teacher config
  configLoading: boolean;
  configError: string | null;

  // Calculation state
  monthlySummaries: TeacherMonthlySummary[];
  currentSummary: TeacherMonthlySummary | null;
  calculationLoading: boolean;
  calculationError: string | null;

  // History and reporting state
  salaryHistory: TeacherMonthlySummary[];
  paginatedSummaries: PaginatedResponse<TeacherMonthlySummary> | null;
  historyLoading: boolean;
  historyError: string | null;

  // UI state
  selectedTeacherId: number | null;
  selectedMonth: number | null;
  selectedYear: number | null;
}

const initialState: SalaryState = {
  teacherConfigs: {},
  configLoading: false,
  configError: null,
  
  monthlySummaries: [],
  currentSummary: null,
  calculationLoading: false,
  calculationError: null,
  
  salaryHistory: [],
  paginatedSummaries: null,
  historyLoading: false,
  historyError: null,
  
  selectedTeacherId: null,
  selectedMonth: null,
  selectedYear: null,
};

// 🔧 Configuration Async Thunks
export const updateTeacherSalaryConfig = createAsyncThunk(
  'salary/updateTeacherSalaryConfig',
  async ({ teacherId, config }: { teacherId: number; config: SalaryConfigurationDTO }) => {
    const response = await salaryService.updateTeacherSalaryConfig(teacherId, config);
    return { teacherId, config: response };
  }
);

export const fetchTeacherSalaryConfig = createAsyncThunk(
  'salary/fetchTeacherSalaryConfig',
  async (teacherId: number) => {
    const response = await salaryService.getTeacherSalaryConfig(teacherId);
    return { teacherId, config: response };
  }
);

// 💰 Calculation Async Thunks
export const calculateMonthlySalary = createAsyncThunk(
  'salary/calculateMonthlySalary',
  async ({ teacherId, params }: { teacherId: number; params: SalaryCalculationParams }) => {
    const response = await salaryService.calculateMonthlySalary(teacherId, params);
    return response;
  }
);

export const calculateAllMonthlySalaries = createAsyncThunk(
  'salary/calculateAllMonthlySalaries',
  async (params: SalaryCalculationParams) => {
    const response = await salaryService.calculateAllMonthlySalaries(params);
    return response;
  }
);

export const recalculateMonthlySalary = createAsyncThunk(
  'salary/recalculateMonthlySalary',
  async ({ teacherId, params }: { teacherId: number; params: SalaryCalculationParams }) => {
    const response = await salaryService.recalculateMonthlySalary(teacherId, params);
    return response;
  }
);

// 📊 History & Reporting Async Thunks
export const fetchTeacherSalarySummaries = createAsyncThunk(
  'salary/fetchTeacherSalarySummaries',
  async ({ teacherId, params }: { teacherId: number; params?: SalarySummariesParams }) => {
    const response = await salaryService.getTeacherSalarySummaries(teacherId, params);
    return response;
  }
);

export const fetchSpecificMonthlySummary = createAsyncThunk(
  'salary/fetchSpecificMonthlySummary',
  async ({ teacherId, year, month }: { teacherId: number; year: number; month: number }) => {
    const response = await salaryService.getSpecificMonthlySummary(teacherId, year, month);
    return response;
  }
);

export const fetchSalaryHistory = createAsyncThunk(
  'salary/fetchSalaryHistory',
  async ({ teacherId, params }: { teacherId: number; params: SalaryHistoryParams }) => {
    const response = await salaryService.getSalaryHistory(teacherId, params);
    return response;
  }
);

const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {
    // UI state management
    setSelectedTeacher: (state, action) => {
      state.selectedTeacherId = action.payload;
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    clearSelectedSummary: (state) => {
      state.currentSummary = null;
    },
    clearErrors: (state) => {
      state.configError = null;
      state.calculationError = null;
      state.historyError = null;
    },
    resetSalaryState: () => initialState,
  },
  extraReducers: (builder) => {
    // Configuration reducers
    builder
      .addCase(updateTeacherSalaryConfig.pending, (state) => {
        state.configLoading = true;
        state.configError = null;
      })
      .addCase(updateTeacherSalaryConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.teacherConfigs[action.payload.teacherId] = action.payload.config;
      })
      .addCase(updateTeacherSalaryConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.configError = action.error.message || 'Failed to update salary configuration';
      })
      
      .addCase(fetchTeacherSalaryConfig.pending, (state) => {
        state.configLoading = true;
        state.configError = null;
      })
      .addCase(fetchTeacherSalaryConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.teacherConfigs[action.payload.teacherId] = action.payload.config;
      })
      .addCase(fetchTeacherSalaryConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.configError = action.error.message || 'Failed to fetch salary configuration';
      })

    // Calculation reducers
    builder
      .addCase(calculateMonthlySalary.pending, (state) => {
        state.calculationLoading = true;
        state.calculationError = null;
      })
      .addCase(calculateMonthlySalary.fulfilled, (state, action) => {
        state.calculationLoading = false;
        state.currentSummary = action.payload;
        // Update the summaries array if it exists
        const existingIndex = state.monthlySummaries.findIndex(
          s => s.teacher_id === action.payload.teacher_id && 
               s.month === action.payload.month && 
               s.year === action.payload.year
        );
        if (existingIndex >= 0) {
          state.monthlySummaries[existingIndex] = action.payload;
        } else {
          state.monthlySummaries.push(action.payload);
        }
      })
      .addCase(calculateMonthlySalary.rejected, (state, action) => {
        state.calculationLoading = false;
        state.calculationError = action.error.message || 'Failed to calculate monthly salary';
      })

      .addCase(calculateAllMonthlySalaries.pending, (state) => {
        state.calculationLoading = true;
        state.calculationError = null;
      })
      .addCase(calculateAllMonthlySalaries.fulfilled, (state, action) => {
        state.calculationLoading = false;
        state.monthlySummaries = action.payload;
      })
      .addCase(calculateAllMonthlySalaries.rejected, (state, action) => {
        state.calculationLoading = false;
        state.calculationError = action.error.message || 'Failed to calculate all monthly salaries';
      })

      .addCase(recalculateMonthlySalary.pending, (state) => {
        state.calculationLoading = true;
        state.calculationError = null;
      })
      .addCase(recalculateMonthlySalary.fulfilled, (state, action) => {
        state.calculationLoading = false;
        state.currentSummary = action.payload;
        // Update the summaries array
        const existingIndex = state.monthlySummaries.findIndex(
          s => s.teacher_id === action.payload.teacher_id && 
               s.month === action.payload.month && 
               s.year === action.payload.year
        );
        if (existingIndex >= 0) {
          state.monthlySummaries[existingIndex] = action.payload;
        }
      })
      .addCase(recalculateMonthlySalary.rejected, (state, action) => {
        state.calculationLoading = false;
        state.calculationError = action.error.message || 'Failed to recalculate monthly salary';
      })

    // History & Reporting reducers
    builder
      .addCase(fetchTeacherSalarySummaries.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchTeacherSalarySummaries.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.paginatedSummaries = action.payload;
      })
      .addCase(fetchTeacherSalarySummaries.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.error.message || 'Failed to fetch salary summaries';
      })

      .addCase(fetchSpecificMonthlySummary.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchSpecificMonthlySummary.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.currentSummary = action.payload;
      })
      .addCase(fetchSpecificMonthlySummary.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.error.message || 'Failed to fetch monthly summary';
      })

      .addCase(fetchSalaryHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchSalaryHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.salaryHistory = action.payload;
      })
      .addCase(fetchSalaryHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.error.message || 'Failed to fetch salary history';
      });
  },
});

export const {
  setSelectedTeacher,
  setSelectedMonth,
  setSelectedYear,
  clearSelectedSummary,
  clearErrors,
  resetSalaryState,
} = salarySlice.actions;

export default salarySlice.reducer;