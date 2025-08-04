import { paymentService } from "@/service/payment.service";
import { PaymentDetail, PaymentStatus, PaymentSearchParams } from "@/types/api.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface PaymentState {
  paymentDetails: PaymentDetail[];
  paymentDetail: PaymentDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  paymentDetails: [],
  paymentDetail: null,
  loading: false,
  error: null,
};

export const fetchPaymentDetails = createAsyncThunk(
  "payment/fetchPaymentDetails",
  async () => {
    const response = await paymentService.getAllPayments();
    return response;
  }
);

export const fetchPaymentDetailById = createAsyncThunk(
  "payment/fetchPaymentDetailById",
  async (id: number) => {
    const response = await paymentService.getPaymentDetailById(id);
    return response;
  }
);

export const createPaymentDetail = createAsyncThunk(
  "payment/createPaymentDetail",
  async (paymentDetail: PaymentDetail) => {
    const response = await paymentService.createPaymentDetail(paymentDetail);
    return response;
  }
);

export const updatePaymentDetail = createAsyncThunk(
  "payment/updatePaymentDetail",
  async ({
    id,
    paymentDetail,
  }: {
    id: number;
    paymentDetail: PaymentDetail;
  }) => {
    const response = await paymentService.updatePaymentDetail(
      id,
      paymentDetail
    );
    return response;
  }
);

export const deletePaymentDetail = createAsyncThunk(
  "payment/deletePaymentDetail",
  async (id: number) => {
    const response = await paymentService.deletePaymentDetail(id);
    return response;
  }
);

export const fetchPaymentDetailByStudentId = createAsyncThunk(
  "payment/fetchPaymentDetailByStudentId",
  async (studentId: number) => {
    const response =
      await paymentService.getPaymentDetailByStudentId(studentId);
    return response;
  }
);

export const fetchPaymentDetailByFeeId = createAsyncThunk(
  "payment/fetchPaymentDetailByFeeId",
  async (feeId: number) => {
    const response = await paymentService.getPaymentDetailByFeeId(feeId);
    return response;
  }
);

export const fetchPaymentDetailByStudentIdAndFeeId = createAsyncThunk(
  "payment/fetchPaymentDetailByStudentIdAndFeeId",
  async ({ studentId, feeId }: { studentId: number; feeId: number }) => {
    const response = await paymentService.getPaymentDetailByStudentIdAndFeeId(
      studentId,
      feeId
    );
    return response;
  }
);

// 🆕 NEW ENHANCED ASYNC THUNKS

export const fetchPaymentsByStatus = createAsyncThunk(
  "payment/fetchPaymentsByStatus",
  async (status: PaymentStatus) => {
    const response = await paymentService.getPaymentsByStatus(status);
    return response;
  }
);


export const fetchPaymentsByDateRange = createAsyncThunk(
  "payment/fetchPaymentsByDateRange",
  async (params: PaymentSearchParams) => {
    const response = await paymentService.getPaymentsByDateRange(params);
    return response;
  }
);


export const searchPayments = createAsyncThunk(
  "payment/searchPayments",
  async (params: PaymentSearchParams) => {
    const response = await paymentService.searchPayments(params);
    return response;
  }
);

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentDetail: (state) => {
      state.paymentDetail = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPaymentDetails
    builder.addCase(fetchPaymentDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentDetails = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch payment details";
    });

    // fetchPaymentDetailById
    builder.addCase(fetchPaymentDetailById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetailById.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentDetail = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetailById.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message || "Failed to fetch payment detail by id";
    });

    // createPaymentDetail
    builder.addCase(createPaymentDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPaymentDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentDetails.push(action.payload);
      state.error = null;
    });
    builder.addCase(createPaymentDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to create payment detail";
    });

    // updatePaymentDetail
    builder.addCase(updatePaymentDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updatePaymentDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentDetails = state.paymentDetails.map((payment) =>
        payment.id === action.payload.id ? action.payload : payment
      );
      state.paymentDetail = action.payload;
      state.error = null;
    });
    builder.addCase(updatePaymentDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update payment detail";
    });

    // deletePaymentDetail
    builder.addCase(deletePaymentDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePaymentDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentDetails = state.paymentDetails.filter(
        (payment) => payment.id !== action.payload
      );
      state.error = null;
    });
    builder.addCase(deletePaymentDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to delete payment detail";
    });

    // fetchPaymentDetailByStudentId
    builder.addCase(fetchPaymentDetailByStudentId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPaymentDetailByStudentId.fulfilled,
      (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
        state.error = null;
      }
    );
    builder.addCase(fetchPaymentDetailByStudentId.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message || "Failed to fetch payment details by student ID";
    });

    // fetchPaymentDetailByFeeId
    builder.addCase(fetchPaymentDetailByFeeId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetailByFeeId.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentDetails = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetailByFeeId.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message || "Failed to fetch payment details by fee ID";
    });

    // fetchPaymentDetailByStudentIdAndFeeId
    builder.addCase(fetchPaymentDetailByStudentIdAndFeeId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPaymentDetailByStudentIdAndFeeId.fulfilled,
      (state, action) => {
        state.loading = false;
        state.paymentDetails = action.payload;
        state.error = null;
      }
    );
    builder.addCase(
      fetchPaymentDetailByStudentIdAndFeeId.rejected,
      (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          "Failed to fetch payment details by student and fee ID";
      }
    );
  },
});

export default paymentSlice.reducer;

export const selectPaymentDetails = (state: { payment: PaymentState }) =>
  state.payment.paymentDetails;
export const selectPaymentDetail = (state: { payment: PaymentState }) =>
  state.payment.paymentDetail;
export const selectLoading = (state: { payment: PaymentState }) =>
  state.payment.loading;
export const selectError = (state: { payment: PaymentState }) =>
  state.payment.error;
