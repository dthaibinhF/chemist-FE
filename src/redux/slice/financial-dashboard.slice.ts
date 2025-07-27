import { financialDashboardService } from "@/service/financial-dashboard.service";
import { 
  FinancialStatisticsDTO, 
  OverdueStatisticsDTO, 
  PaymentDetail, 
  StudentPaymentSummary 
} from "@/types/api.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface FinancialDashboardState {
  dashboardStats: FinancialStatisticsDTO | null;
  overdueStats: OverdueStatisticsDTO | null;
  overduePaymentDetails: PaymentDetail[];
  overduePaymentSummaries: StudentPaymentSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: FinancialDashboardState = {
  dashboardStats: null,
  overdueStats: null,
  overduePaymentDetails: [],
  overduePaymentSummaries: [],
  loading: false,
  error: null,
};

// 📊 Financial Dashboard Thunks

export const fetchDashboardStatistics = createAsyncThunk(
  "financialDashboard/fetchDashboardStatistics",
  async () => {
    const response = await financialDashboardService.getDashboardStatistics();
    return response;
  }
);

export const fetchStatisticsByDateRange = createAsyncThunk(
  "financialDashboard/fetchStatisticsByDateRange",
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await financialDashboardService.getStatisticsByDateRange(startDate, endDate);
    return response;
  }
);

// 🚨 Overdue Payment Management Thunks

export const fetchOverduePaymentDetails = createAsyncThunk(
  "financialDashboard/fetchOverduePaymentDetails",
  async () => {
    const response = await financialDashboardService.getOverduePaymentDetails();
    return response;
  }
);

export const fetchOverduePaymentSummaries = createAsyncThunk(
  "financialDashboard/fetchOverduePaymentSummaries",
  async () => {
    const response = await financialDashboardService.getOverduePaymentSummaries();
    return response;
  }
);

export const fetchOverduePaymentsByStudent = createAsyncThunk(
  "financialDashboard/fetchOverduePaymentsByStudent",
  async (studentId: number) => {
    const response = await financialDashboardService.getOverduePaymentsByStudent(studentId);
    return response;
  }
);

export const updateOverdueStatuses = createAsyncThunk(
  "financialDashboard/updateOverdueStatuses",
  async () => {
    const response = await financialDashboardService.updateOverdueStatuses();
    return response;
  }
);

export const fetchOverdueStatistics = createAsyncThunk(
  "financialDashboard/fetchOverdueStatistics",
  async () => {
    const response = await financialDashboardService.getOverdueStatistics();
    return response;
  }
);

export const checkStudentOverduePayments = createAsyncThunk(
  "financialDashboard/checkStudentOverduePayments",
  async (studentId: number) => {
    const response = await financialDashboardService.checkStudentOverduePayments(studentId);
    return { studentId, hasOverdue: response };
  }
);

export const fetchDaysOverdue = createAsyncThunk(
  "financialDashboard/fetchDaysOverdue",
  async (summaryId: number) => {
    const response = await financialDashboardService.getDaysOverdue(summaryId);
    return { summaryId, daysOverdue: response };
  }
);

export const financialDashboardSlice = createSlice({
  name: "financialDashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardStats: (state) => {
      state.dashboardStats = null;
    },
    clearOverdueData: (state) => {
      state.overdueStats = null;
      state.overduePaymentDetails = [];
      state.overduePaymentSummaries = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard statistics
    builder.addCase(fetchDashboardStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardStats = action.payload;
      state.error = null;
    });
    builder.addCase(fetchDashboardStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch dashboard statistics";
    });

    // Fetch statistics by date range
    builder.addCase(fetchStatisticsByDateRange.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStatisticsByDateRange.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardStats = action.payload;
      state.error = null;
    });
    builder.addCase(fetchStatisticsByDateRange.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch statistics by date range";
    });

    // Fetch overdue payment details
    builder.addCase(fetchOverduePaymentDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOverduePaymentDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.overduePaymentDetails = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOverduePaymentDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch overdue payment details";
    });

    // Fetch overdue payment summaries
    builder.addCase(fetchOverduePaymentSummaries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOverduePaymentSummaries.fulfilled, (state, action) => {
      state.loading = false;
      state.overduePaymentSummaries = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOverduePaymentSummaries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch overdue payment summaries";
    });

    // Fetch overdue payments by student
    builder.addCase(fetchOverduePaymentsByStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOverduePaymentsByStudent.fulfilled, (state, action) => {
      state.loading = false;
      state.overduePaymentSummaries = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOverduePaymentsByStudent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch overdue payments by student";
    });

    // Update overdue statuses
    builder.addCase(updateOverdueStatuses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateOverdueStatuses.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(updateOverdueStatuses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update overdue statuses";
    });

    // Fetch overdue statistics
    builder.addCase(fetchOverdueStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOverdueStatistics.fulfilled, (state, action) => {
      state.loading = false;
      state.overdueStats = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOverdueStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch overdue statistics";
    });

    // Check student overdue payments
    builder.addCase(checkStudentOverduePayments.fulfilled, (state) => {
      state.error = null;
    });
    builder.addCase(checkStudentOverduePayments.rejected, (state, action) => {
      state.error = action.error.message || "Failed to check student overdue payments";
    });

    // Fetch days overdue
    builder.addCase(fetchDaysOverdue.fulfilled, (state) => {
      state.error = null;
    });
    builder.addCase(fetchDaysOverdue.rejected, (state, action) => {
      state.error = action.error.message || "Failed to fetch days overdue";
    });
  },
});

export const { clearError, clearDashboardStats, clearOverdueData } = 
  financialDashboardSlice.actions;

export default financialDashboardSlice.reducer;

// Selectors
export const selectDashboardStats = (state: { financialDashboard: FinancialDashboardState }) =>
  state.financialDashboard.dashboardStats;
export const selectOverdueStats = (state: { financialDashboard: FinancialDashboardState }) =>
  state.financialDashboard.overdueStats;
export const selectOverduePaymentDetails = (state: { financialDashboard: FinancialDashboardState }) =>
  state.financialDashboard.overduePaymentDetails;
export const selectOverduePaymentSummaries = (state: { financialDashboard: FinancialDashboardState }) =>
  state.financialDashboard.overduePaymentSummaries;
export const selectLoading = (state: { financialDashboard: FinancialDashboardState }) =>
  state.financialDashboard.loading;
export const selectError = (state: { financialDashboard: FinancialDashboardState }) =>
  state.financialDashboard.error;