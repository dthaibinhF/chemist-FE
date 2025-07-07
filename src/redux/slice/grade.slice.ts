import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { gradeService } from '@/service/grade.service';
import type { Grade } from '@/types/api.types';

export interface GradeSatate {
  grades: Grade[];
  grade: Grade | null;
  loading: boolean;
  error: string | null;
}

export const initialState: GradeSatate = {
  grades: [],
  grade: null,
  loading: false,
  error: null,
};

// Async thunks

export const fetchGrades = createAsyncThunk('grade/fetchGrades', async () => {
  const response = await gradeService.getAllGrades();
  return response;
});

export const fetchGrade = createAsyncThunk('grade/fetchGrade', async (id: number) => {
  const response = await gradeService.getGradeById(id);
  return response;
});

export const createGrade = createAsyncThunk('grade/createGrade', async (grade: Grade) => {
  const response = await gradeService.createGrade(grade);
  return response;
});

export const updateGrade = createAsyncThunk(
  'grade/updateGrade',
  async ({ id, grade }: { id: number; grade: Grade }) => {
    const response = await gradeService.updateGrade(id, grade);
    return response;
  }
);

export const deleteGrade = createAsyncThunk('grade/deleteGrade', async (id: number) => {
  const response = await gradeService.deleteGrade(id);
  return response;
});

export const gradeSlice = createSlice({
  name: 'grade',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch grades
    builder.addCase(fetchGrades.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGrades.fulfilled, (state, action) => {
      state.loading = false;
      state.grades = action.payload;
    });
    builder.addCase(fetchGrades.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch grades';
    });

    // Fetch grade
    builder.addCase(fetchGrade.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGrade.fulfilled, (state, action) => {
      state.loading = false;
      state.grade = action.payload;
    });
    builder.addCase(fetchGrade.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch grade';
    });

    // Create grade
    builder.addCase(createGrade.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createGrade.fulfilled, (state, action) => {
      state.loading = false;
      state.grades.push(action.payload);
    });
    builder.addCase(createGrade.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to create grade';
    });

    // Update grade
    builder.addCase(updateGrade.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateGrade.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.grades.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.grades[index] = action.payload;
      }
    });
    builder.addCase(updateGrade.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to update grade';
    });

    // Delete grade
    builder.addCase(deleteGrade.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteGrade.fulfilled, (state, action) => {
      state.loading = false;
      state.grades = state.grades.filter((g) => g.id !== action.payload);
    });
    builder.addCase(deleteGrade.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to delete grade';
    });
  },
});

export default gradeSlice.reducer;

// Selectors
export const selectGrades = (state: { grade: GradeSatate }) => state.grade.grades;
export const selectGrade = (state: { grade: GradeSatate }) => state.grade.grade;
export const selectLoading = (state: { grade: GradeSatate }) => state.grade.loading;
export const selectError = (state: { grade: GradeSatate }) => state.grade.error;
