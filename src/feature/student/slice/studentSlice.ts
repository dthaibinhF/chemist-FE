import {createSlice, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";
import {Student} from "../../../types/student.type";
import * as studentApi from "../services/studentApi";

export interface StudentState {
    students: Student[];
    selectedStudent?: Student;
    loading: boolean;
    error?: string;
}

const initialState: StudentState = {
    students: [],
    selectedStudent: undefined,
    loading: false,
    error: undefined,
};

export const fetchStudent = createAsyncThunk(
    "student/fetch",
    async (id: number, {rejectWithValue}) => {
        try {
            console.log("Slice: Fetching student with ID:", id);
            return await studentApi.getStudentById(id);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchStudents = createAsyncThunk(
    "student/fetchAll",
    async (_, {rejectWithValue}) => {
        try {

            const response = await studentApi.getAllStudents();
            return response;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const createStudent = createAsyncThunk(
    "student/create",
    async (student: Student, {rejectWithValue}) => {
        try {
            return await studentApi.createStudent(student);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateStudent = createAsyncThunk(
    "student/update",
    async ({id, student}: {id: number, student: Student}, {rejectWithValue}) => {
        try {
            return await studentApi.updateStudent(id, student);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteStudent = createAsyncThunk(
    "student/delete",
    async (id: number, {rejectWithValue}) => {
        try {
            await studentApi.deleteStudent(id);
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    }
);

const studentSlice = createSlice({
    name: "student",
    initialState,
    reducers: {
        setSelectedStudent(state, action: PayloadAction<Student | undefined>) {
            state.selectedStudent = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudent.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchStudent.fulfilled, (state, action) => {
                state.selectedStudent = action.payload;
                state.loading = false;
            })
            .addCase(fetchStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.students = action.payload;
                state.loading = false;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.students.push(action.payload);
            })
            .addCase(updateStudent.fulfilled, (state, action) => {
                const idx = state.students.findIndex(s => s.id === action.payload.id);
                if (idx !== -1) state.students[idx] = action.payload;
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.students = state.students.filter(s => s.id !== action.payload);
            });
    },
});

export const {setSelectedStudent} = studentSlice.actions;
export default studentSlice.reducer; 