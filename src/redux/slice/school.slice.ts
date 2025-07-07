import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { schoolService } from '@/service/school.service';
import type { School } from '@/types/api.types';

export interface SchoolState {
  schools: School[];
  school: School | null;
  loading: boolean;
  error: string | null;
}

export const initialState: SchoolState = {
  schools: [],
  school: null,
  loading: false,
  error: null,
};

export const fetchSchools = createAsyncThunk('school/fetchSchools', async () => {
  const response = await schoolService.getAllSchools();
  return response;
});

export const fetchSchool = createAsyncThunk('school/fetchSchool', async (id: number) => {
  const response = await schoolService.getSchoolById(id);
  return response;
});

export const createSchool = createAsyncThunk('school/createSchool', async (school: School) => {
  const response = await schoolService.createSchool(school);
  return response;
});

export const updateSchool = createAsyncThunk(
  'school/updateSchool',
  async ({ id, school }: { id: number; school: School }) => {
    const response = await schoolService.updateSchool(id, school);
    return response;
  }
);

export const deleteSchool = createAsyncThunk('school/deleteSchool', async (id: number) => {
  const response = await schoolService.deleteSchool(id);
  return response;
});

export const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSchools.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchools.fulfilled, (state, action) => {
      state.loading = false;
      state.schools = action.payload;
    });
    builder.addCase(fetchSchools.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch schools';
    });
    // fetch school
    builder.addCase(fetchSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSchool.fulfilled, (state, action) => {
      state.loading = false;
      state.school = action.payload;
    });
    builder.addCase(fetchSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch school';
    });
    // create school
    builder.addCase(createSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSchool.fulfilled, (state, action) => {
      state.loading = false;
      state.schools.push(action.payload);
    });
    builder.addCase(createSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to create school';
    });
    // update school
    builder.addCase(updateSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSchool.fulfilled, (state, action) => {
      state.loading = false;
      state.schools = state.schools.map((school) =>
        school.id === action.payload.id ? action.payload : school
      );
    });
    builder.addCase(updateSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to update school';
    });
    // delete school
    builder.addCase(deleteSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteSchool.fulfilled, (state, action) => {
      state.loading = false;
      state.schools = state.schools.filter((school) => school.id !== action.payload);
    });
    builder.addCase(deleteSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to delete school';
    });
  },
});

export default schoolSlice.reducer;

// selectors
export const selectSchools = (state: { school: SchoolState }) => state.school.schools;
export const selectSchool = (state: { school: SchoolState }) => state.school.school;
export const selectLoading = (state: { school: SchoolState }) => state.school.loading;
export const selectError = (state: { school: SchoolState }) => state.school.error;
