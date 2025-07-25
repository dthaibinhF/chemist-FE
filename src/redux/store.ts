import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/feature/auth/slice/auth.slice";
import studentReducer from "@/feature/student/slice/student.slice";
import groupReducer from "./slice/group.slice";

import academicYearReducer from "./slice/academic-year.slice";
import feeReducer from "./slice/fee.slice";
import gradeReducer from "./slice/grade.slice";
import paymentReducer from "./slice/payment.slice";
import roomReducer from "./slice/room.slice";
import schoolClassReducer from "./slice/school-class.slice";
import schoolReducer from "./slice/school.slice";
import teacherReducer from "./slice/teacher.slice";
import timeTableReducer from "./slice/time-table.slice";

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
    teacher: teacherReducer,
    timeTable: timeTableReducer,
    room: roomReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
