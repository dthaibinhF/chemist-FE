import { studentPaymentSummaryService } from "@/service/student-payment-summary.service";
import { StudentPaymentSummary } from "@/types/api.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface StudentPaymentSummaryState {
  paymentSummaries: StudentPaymentSummary[];
  paymentSummary: StudentPaymentSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentPaymentSummaryState = {
  paymentSummaries: [],
  paymentSummary: null,
  loading: false,
  error: null,
};

// 📝 Payment Obligation Management Thunks

export const generatePaymentForStudentInGroup = createAsyncThunk(
  "studentPaymentSummary/generatePaymentForStudentInGroup",
  async ({ studentId, groupId }: { studentId: number; groupId: number }) => {
    const response = await studentPaymentSummaryService.generatePaymentForStudentInGroup(
      studentId,
      groupId
    );
    return response;
  }
);

export const generateAllPaymentsForGroup = createAsyncThunk(
  "studentPaymentSummary/generateAllPaymentsForGroup",
  async (groupId: number) => {
    const response = await studentPaymentSummaryService.generateAllPaymentsForGroup(groupId);
    return response;
  }
);

// 📊 Payment Summary Retrieval Thunks

export const fetchPaymentSummariesByStudent = createAsyncThunk(
  "studentPaymentSummary/fetchPaymentSummariesByStudent",
  async (studentId: number) => {
    const response = await studentPaymentSummaryService.getPaymentSummariesByStudent(studentId);
    return response;
  }
);

export const fetchPaymentSummariesByGroup = createAsyncThunk(
  "studentPaymentSummary/fetchPaymentSummariesByGroup",
  async (groupId: number) => {
    const response = await studentPaymentSummaryService.getPaymentSummariesByGroup(groupId);
    return response;
  }
);

export const fetchPaymentSummaryById = createAsyncThunk(
  "studentPaymentSummary/fetchPaymentSummaryById",
  async (summaryId: number) => {
    const response = await studentPaymentSummaryService.getPaymentSummaryById(summaryId);
    return response;
  }
);

export const fetchPaymentSummaryByStudentIdAndFeeId = createAsyncThunk(

  "studentPaymentSummary/fetchPaymentSummaryByStudentIdAndFeeId",
  async ({ studentId, feeId }: { studentId: number; feeId: number }) => {
    const response = await studentPaymentSummaryService.getPaymentSummaryByStudentIdAndFeeId(studentId, feeId);
    return response;
  }
);

// 🔄 Payment Summary Update Thunks

export const updateSummaryAfterPayment = createAsyncThunk(
  "studentPaymentSummary/updateSummaryAfterPayment",
  async ({
    studentId,
    feeId,
    academicYearId,
    groupId,
  }: {
    studentId: number;
    feeId: number;
    academicYearId: number;
    groupId: number;
  }) => {
    await studentPaymentSummaryService.updateSummaryAfterPayment(
      studentId,
      feeId,
      academicYearId,
      groupId
    );
    return { studentId, feeId, academicYearId, groupId };
  }
);

export const deletePaymentSummary = createAsyncThunk(
  "studentPaymentSummary/deletePaymentSummary",
  async (summaryId: number) => {
    await studentPaymentSummaryService.deletePaymentSummary(summaryId);
    return summaryId;
  }
);

export const recalculateAllSummaries = createAsyncThunk(
  "studentPaymentSummary/recalculateAllSummaries",
  async () => {
    await studentPaymentSummaryService.recalculateAllSummaries();
    return true;
  }
);

export const studentPaymentSummarySlice = createSlice({
  name: "studentPaymentSummary",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentSummary: (state) => {
      state.paymentSummary = null;
    },
    clearAllSummaries: (state) => {
      state.paymentSummaries = [];
      state.paymentSummary = null;
    },
  },
  extraReducers: (builder) => {
    // Generate payment for student in group
    builder.addCase(generatePaymentForStudentInGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(generatePaymentForStudentInGroup.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummary = action.payload;
      state.paymentSummaries.push(action.payload);
      state.error = null;
    });
    builder.addCase(generatePaymentForStudentInGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to generate payment for student in group";
    });

    // Generate all payments for group
    builder.addCase(generateAllPaymentsForGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(generateAllPaymentsForGroup.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummaries = action.payload;
      state.error = null;
    });
    builder.addCase(generateAllPaymentsForGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to generate payments for group";
    });

    // Fetch payment summaries by student
    builder.addCase(fetchPaymentSummariesByStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummariesByStudent.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummaries = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummariesByStudent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch payment summaries by student";
    });

    // Fetch payment summaries by group
    builder.addCase(fetchPaymentSummariesByGroup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummariesByGroup.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummaries = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummariesByGroup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch payment summaries by group";
    });

    // Fetch payment summary by ID
    builder.addCase(fetchPaymentSummaryById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummaryById.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummary = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummaryById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch payment summary by ID";
    });

    // Fetch payment summary by student ID and fee ID
    builder.addCase(fetchPaymentSummaryByStudentIdAndFeeId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummaryByStudentIdAndFeeId.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummary = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentSummaryByStudentIdAndFeeId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch payment summary by student ID and fee ID";
    });

    // Update summary after payment
    builder.addCase(updateSummaryAfterPayment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSummaryAfterPayment.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(updateSummaryAfterPayment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update summary after payment";
    });

    // Delete payment summary
    builder.addCase(deletePaymentSummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePaymentSummary.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentSummaries = state.paymentSummaries.filter(
        (summary) => summary.id !== action.payload
      );
      if (state.paymentSummary?.id === action.payload) {
        state.paymentSummary = null;
      }
      state.error = null;
    });
    builder.addCase(deletePaymentSummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to delete payment summary";
    });

    // Recalculate all summaries
    builder.addCase(recalculateAllSummaries.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(recalculateAllSummaries.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(recalculateAllSummaries.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to recalculate summaries";
    });
  },
});

export const { clearError, clearPaymentSummary, clearAllSummaries } =
  studentPaymentSummarySlice.actions;

export default studentPaymentSummarySlice.reducer;

// Selectors
export const selectPaymentSummaries = (state: { studentPaymentSummary: StudentPaymentSummaryState }) =>
  state.studentPaymentSummary.paymentSummaries;
export const selectPaymentSummary = (state: { studentPaymentSummary: StudentPaymentSummaryState }) =>
  state.studentPaymentSummary.paymentSummary;
export const selectLoading = (state: { studentPaymentSummary: StudentPaymentSummaryState }) =>
  state.studentPaymentSummary.loading;
export const selectError = (state: { studentPaymentSummary: StudentPaymentSummaryState }) =>
  state.studentPaymentSummary.error;