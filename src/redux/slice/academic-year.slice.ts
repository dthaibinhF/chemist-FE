import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { academicYearService } from '@/service/academic-year.service';
import type { AcademicYear } from '@/types/api.types';

export interface AcademicYearState {
  academicYears: AcademicYear[];
  academicYear: AcademicYear | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AcademicYearState = {
  academicYears: [],
  academicYear: null,
  loading: false,
  error: null,
};

export const fetchAcademicYears = createAsyncThunk('academicYear/fetchAcademicYears', async () => {
  const response = await academicYearService.getAllAcademicYears();
  return response;
});

export const fetchAcademicYear = createAsyncThunk(
  'academicYear/fetchAcademicYear',
  async (id: number) => {
    const response = await academicYearService.getAcademicYearById(id);
    return response;
  }
);

export const createAcademicYear = createAsyncThunk(
  'academicYear/createAcademicYear',
  async (academicYear: AcademicYear) => {
    const response = await academicYearService.createAcademicYear(academicYear);
    return response;
  }
);

export const updateAcademicYear = createAsyncThunk(
  'academicYear/updateAcademicYear',
  async ({ id, academicYear }: { id: number; academicYear: AcademicYear }) => {
    const response = await academicYearService.updateAcademicYear(id, academicYear);
    return response;
  }
);

export const deleteAcademicYear = createAsyncThunk(
  'academicYear/deleteAcademicYear',
  async (id: number) => {
    const response = await academicYearService.deleteAcademicYear(id);
    return response;
  }
);

export const academicYearSlice = createSlice({
  name: 'academic-year',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch academic years
    builder.addCase(fetchAcademicYears.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAcademicYears.fulfilled, (state, action) => {
      state.loading = false;
      state.academicYears = action.payload;
    });
    builder.addCase(fetchAcademicYears.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch academic years';
    });
    // fetch academic year
    builder.addCase(fetchAcademicYear.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAcademicYear.fulfilled, (state, action) => {
      state.loading = false;
      state.academicYear = action.payload;
    });
    builder.addCase(fetchAcademicYear.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch academic year';
    });
    // create academic year
    builder.addCase(createAcademicYear.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createAcademicYear.fulfilled, (state, action) => {
      state.loading = false;
      state.academicYears.push(action.payload);
    });
    builder.addCase(createAcademicYear.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to create academic year';
    });
    // update academic year
    builder.addCase(updateAcademicYear.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAcademicYear.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.academicYears.findIndex((year) => year.id === action.payload.id);
      if (index !== -1) {
        state.academicYears[index] = action.payload;
      }
    });
    builder.addCase(updateAcademicYear.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to update academic year';
    });
    // delete academic year
    builder.addCase(deleteAcademicYear.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAcademicYear.fulfilled, (state, action) => {
      state.loading = false;
      state.academicYears = state.academicYears.filter((year) => year.id !== action.payload);
    });
    builder.addCase(deleteAcademicYear.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to delete academic year';
    });
  },
});

export default academicYearSlice.reducer;

// Selectors
export const selectAcademicYears = (state: { academicYear: AcademicYearState }) =>
  state.academicYear.academicYears;
export const selectAcademicYear = (state: { academicYear: AcademicYearState }) =>
  state.academicYear.academicYear;
export const selectLoading = (state: { academicYear: AcademicYearState }) =>
  state.academicYear.loading;
export const selectError = (state: { academicYear: AcademicYearState }) => state.academicYear.error;
