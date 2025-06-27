import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/feature/auth/slice/authSlice.ts";
import studentReducer from "@/feature/student/slice/studentSlice.ts";
import groupReducer from "@/feature/group/slice/group.slice.ts";
import gradeReducer from "./slice/grade.slice";
import academicYearReducer from "./slice/academic-year.slice";
import feeReducer from "./slice/fee.slice";

export const store = configureStore({
     reducer: {
          auth: authReducer,
          student: studentReducer,
          group: groupReducer,
          grade: gradeReducer,
          academicYear: academicYearReducer,
          fee: feeReducer,
     },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;