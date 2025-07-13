import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/feature/auth/slice/authSlice.ts";
import studentReducer from "@/feature/student/slice/student.slice";
import groupReducer from "./slice/group.slice";

import academicYearReducer from "./slice/academic-year.slice";
import feeReducer from "./slice/fee.slice";
import gradeReducer from "./slice/grade.slice";
import paymentReducer from "./slice/payment.slice";
import schoolClassReducer from "./slice/school-class.slice";
import schoolReducer from "./slice/school.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    group: groupReducer,
    grade: gradeReducer,
    academicYear: academicYearReducer,
    fee: feeReducer,
    school: schoolReducer,
    schoolClass: schoolClassReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
