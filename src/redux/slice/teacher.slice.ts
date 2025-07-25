import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { teacherService } from '@/service/teacher.service';
import type { Teacher, TeacherSearchParams } from '@/types/api.types';

interface TeacherState {
    teachers: Teacher[];
    teacher: Teacher | null;
    loading: boolean;
    error: string | null;
    total: number;
}

const initialState: TeacherState = {
    teachers: [],
    teacher: null,
    loading: false,
    error: null,
    total: 0,
};

export const fetchTeachers = createAsyncThunk('teacher/fetchTeachers', async () => {
    const response = await teacherService.getAllTeachers();
    return response;
});

export const fetchTeacher = createAsyncThunk('teacher/fetchTeacher', async (id: number) => {
    const response = await teacherService.getTeacherById(id);
    return response;
});

export const createTeacher = createAsyncThunk('teacher/createTeacher', async (teacher: Teacher) => {
    const response = await teacherService.createTeacher(teacher);
    return response;
});

export const updateTeacher = createAsyncThunk('teacher/updateTeacher', async ({ id, data }: { id: number; data: Teacher }) => {
    const response = await teacherService.updateTeacher(id, data);
    return response;
});

export const deleteTeacher = createAsyncThunk('teacher/deleteTeacher', async (id: number) => {
    await teacherService.deleteTeacher(id);
    return id;
});

export const searchTeachers = createAsyncThunk('teacher/searchTeachers', async (params: TeacherSearchParams) => {
    const response = await teacherService.searchTeachers(params);
    return response;
});

export const teacherSlice = createSlice({
    name: 'teacher',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTeachers.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchTeachers.fulfilled, (state, action) => {
            state.loading = false;
            state.teachers = action.payload;
        });
        builder.addCase(fetchTeachers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Lỗi khi tải danh sách giáo viên';
        });
        builder.addCase(fetchTeacher.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchTeacher.fulfilled, (state, action) => {
            state.loading = false;
            state.teacher = action.payload;
        });
        builder.addCase(fetchTeacher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Lỗi khi tải giáo viên';
        });
        builder.addCase(createTeacher.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createTeacher.fulfilled, (state, action) => {
            state.loading = false;
            state.teachers.push(action.payload);
        });
        builder.addCase(createTeacher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Lỗi khi tạo giáo viên';
        });
        builder.addCase(updateTeacher.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateTeacher.fulfilled, (state, action) => {
            state.loading = false;
            state.teacher = action.payload;
        });
        builder.addCase(updateTeacher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Lỗi khi cập nhật giáo viên';
        });
        builder.addCase(deleteTeacher.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteTeacher.fulfilled, (state, action) => {
            state.loading = false;
            state.teachers = state.teachers.filter((teacher) => teacher.id !== action.payload);
        });
        builder.addCase(deleteTeacher.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Lỗi khi xóa giáo viên';
        });
        builder.addCase(searchTeachers.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(searchTeachers.fulfilled, (state, action) => {
            state.loading = false;
            state.teachers = action.payload.content;
            state.total = action.payload.totalElements;
        });
        builder.addCase(searchTeachers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Lỗi khi tìm kiếm giáo viên';
        });
    },
});

export default teacherSlice.reducer;

export const selectTeachers = (state: { teacher: TeacherState }) => state.teacher.teachers;
export const selectTeacher = (state: { teacher: TeacherState }) => state.teacher.teacher;
export const selectLoading = (state: { teacher: TeacherState }) => state.teacher.loading;
export const selectError = (state: { teacher: TeacherState }) => state.teacher.error;
export const selectTotal = (state: { teacher: TeacherState }) => state.teacher.total;