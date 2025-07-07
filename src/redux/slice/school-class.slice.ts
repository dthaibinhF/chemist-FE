import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { schoolClassService } from '@/service/school-class.service';
import type { SchoolClass } from '@/types/api.types';

export interface SchoolClassState {
  schoolClasses: SchoolClass[];
  schoolClass: SchoolClass | null;
  loading: boolean;
  error: string | null;
}

export const initialState: SchoolClassState = {
  schoolClasses: [],
  schoolClass: null,
  loading: false,
  error: null,
};

export const fetchSchoolClasses = createAsyncThunk('schoolClass/fetchSchoolClasses', async () => {
  const response = await schoolClassService.getAllSchoolClasses();
  return response;
});

export const fetchSchoolClassByGradePrefix = createAsyncThunk(
  'schoolClass/fetchSchoolClassByGradePrefix',
  async (gradePrefix: number) => {
    const response = await schoolClassService.getSchoolClassByGradePrefix(gradePrefix);
    return response;
  }
);

export const fetchSchoolClass = createAsyncThunk(
  'schoolClass/fetchSchoolClass',
  async (id: number) => {
    const response = await schoolClassService.getSchoolClassById(id);
    return response;
  }
);

export const createSchoolClass = createAsyncThunk(
  'schoolClass/createSchoolClass',
  async (schoolClass: SchoolClass) => {
    const response = await schoolClassService.createSchoolClass(schoolClass);
    return response;
  }
);

export const updateSchoolClass = createAsyncThunk(
  'schoolClass/updateSchoolClass',
  async ({ id, schoolClass }: { id: number; schoolClass: SchoolClass }) => {
    const response = await schoolClassService.updateSchoolClass(id, schoolClass);
    return response;
  }
);

export const deleteSchoolClass = createAsyncThunk(
  'schoolClass/deleteSchoolClass',
  async (id: number) => {
    const response = await schoolClassService.deleteSchoolClass(id);
    return response;
  }
);

export const schoolClassSlice = createSlice({
  name: 'schoolClass',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch school classes
    builder.addCase(fetchSchoolClasses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchoolClasses.fulfilled, (state, action) => {
      state.loading = false;
      state.schoolClasses = action.payload;
    });
    builder.addCase(fetchSchoolClasses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch school classes';
    });
    // fetch school class by grade prefix
    builder.addCase(fetchSchoolClassByGradePrefix.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchoolClassByGradePrefix.fulfilled, (state, action) => {
      state.loading = false;
      state.schoolClasses = action.payload;
    });
    builder.addCase(fetchSchoolClassByGradePrefix.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch school class by grade prefix';
    });
    // fetch school class
    builder.addCase(fetchSchoolClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchoolClass.fulfilled, (state, action) => {
      state.loading = false;
      state.schoolClass = action.payload;
    });
    builder.addCase(fetchSchoolClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch school class';
    });
    // create school class
    builder.addCase(createSchoolClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSchoolClass.fulfilled, (state, action) => {
      state.loading = false;
      state.schoolClasses.push(action.payload);
    });
    builder.addCase(createSchoolClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to create school class';
    });
    // update school class
    builder.addCase(updateSchoolClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSchoolClass.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.schoolClasses.findIndex(
        (schoolClass) => schoolClass.id === action.payload.id
      );
      if (index !== -1) {
        state.schoolClasses[index] = action.payload;
      }
    });
    builder.addCase(updateSchoolClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to update school class';
    });
    // delete school class
    builder.addCase(deleteSchoolClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteSchoolClass.fulfilled, (state, action) => {
      state.loading = false;
      state.schoolClasses = state.schoolClasses.filter(
        (schoolClass) => schoolClass.id !== action.payload
      );
    });
    builder.addCase(deleteSchoolClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to delete school class';
    });
  },
});

export default schoolClassSlice.reducer;

export const selectSchoolClasses = (state: { schoolClass: SchoolClassState }) =>
  state.schoolClass.schoolClasses;
export const selectSchoolClass = (state: { schoolClass: SchoolClassState }) =>
  state.schoolClass.schoolClass;
export const selectLoading = (state: { schoolClass: SchoolClassState }) =>
  state.schoolClass.loading;
export const selectError = (state: { schoolClass: SchoolClassState }) => state.schoolClass.error;
