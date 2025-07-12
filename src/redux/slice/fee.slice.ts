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
  await feeService.deleteFee(id);
  return id;
});

export const feeSlice = createSlice({
  name: 'fee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.fees = action.payload;
      })
      .addCase(fetchFee.fulfilled, (state, action) => {
        state.loading = false;
        state.fee = action.payload;
      })
      .addCase(createFee.fulfilled, (state, action) => {
        state.loading = false;
        state.fees.push(action.payload);
      })
      .addCase(updateFee.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.fees.findIndex((fee) => fee.id === action.payload.id);
        if (index !== -1) {
          state.fees[index] = action.payload;
        }
      })
      .addCase(deleteFee.fulfilled, (state, action) => {
        state.loading = false;
        state.fees = state.fees.filter((fee) => fee.id !== action.payload);
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch fees';
      })
      .addCase(fetchFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch fee';
      })
      .addCase(createFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create fee';
      })
      .addCase(updateFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to update fee';
      })
      .addCase(deleteFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to delete fee';
      });
  },
});

export default feeSlice.reducer;

// Selectors
export const selectFees = (state: { fee: FeeState }) => state.fee.fees;
export const selectFee = (state: { fee: FeeState }) => state.fee.fee;
export const selectLoading = (state: { fee: FeeState }) => state.fee.loading;
export const selectError = (state: { fee: FeeState }) => state.fee.error;
