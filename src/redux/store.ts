import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/feature/auth/slice/authSlice.ts';
import groupReducer from '@/feature/group/slice/group.slice.ts';
import studentReducer from '@/feature/student/slice/studentSlice.ts';

import academicYearReducer from './slice/academic-year.slice';
import feeReducer from './slice/fee.slice';
import gradeReducer from './slice/grade.slice';
import schoolReducer from './slice/school.slice';
import schoolClassReducer from './slice/school-class.slice';

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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
