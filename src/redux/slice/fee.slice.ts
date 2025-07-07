import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { feeService } from '@/service/fee.service';
import type { Fee } from '@/types/api.types';

interface FeeState {
  fees: Fee[];
  fee: Fee | null;
  loading: boolean;
  error: string | null;
}

const initialState: FeeState = {
  fees: [],
  fee: null,
  loading: false,
  error: null,
};

export const fetchFees = createAsyncThunk('fee/fetchFees', async () => {
  const response = await feeService.getAllFees();
  return response;
});

export const fetchFee = createAsyncThunk('fee/fetchFee', async (id: number) => {
  const response = await feeService.getFeeById(id);
  return response;
});

export const createFee = createAsyncThunk('fee/createFee', async (fee: Fee) => {
  const response = await feeService.createFee(fee);
  return response;
});

export const updateFee = createAsyncThunk(
  'fee/updateFee',
  async ({ id, data }: { id: number; data: Fee }) => {
    const response = await feeService.updateFee(id, data);
    return response;
  }
);

export const deleteFee = createAsyncThunk('fee/deleteFee', async (id: number) => {
  const response = await feeService.deleteFee(id);
  return response;
});

export const feeSlice = createSlice({
  name: 'fee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFees.fulfilled, (state, action) => {
      state.fees = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchFee.fulfilled, (state, action) => {
      state.fee = action.payload;
      state.loading = false;
    });
    builder.addCase(createFee.fulfilled, (state, action) => {
      state.fees.push(action.payload);
      state.loading = false;
    });
    builder.addCase(updateFee.fulfilled, (state, action) => {
      state.fee = action.payload;
      state.loading = false;
    });
    builder.addCase(deleteFee.fulfilled, (state, action) => {
      state.fees = state.fees.filter((fee) => fee.id !== action.payload);
      state.loading = false;
    });
    builder.addCase(fetchFees.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Lỗi khi lấy dữ liệu';
    });
    builder.addCase(fetchFee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Lỗi khi lấy dữ liệu';
    });
    builder.addCase(createFee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Lỗi khi tạo dữ liệu';
    });
    builder.addCase(updateFee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Lỗi khi cập nhật dữ liệu';
    });
    builder.addCase(deleteFee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Lỗi khi xóa dữ liệu';
    });
  },
});

export default feeSlice.reducer;

// Selectors
export const selectFees = (state: { fee: FeeState }) => state.fee.fees;
export const selectFee = (state: { fee: FeeState }) => state.fee.fee;
export const selectLoading = (state: { fee: FeeState }) => state.fee.loading;
export const selectError = (state: { fee: FeeState }) => state.fee.error;
