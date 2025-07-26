import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
    updateTeacherSalaryConfig,
    fetchTeacherSalaryConfig,
    calculateMonthlySalary,
    calculateAllMonthlySalaries,
    recalculateMonthlySalary,
    fetchTeacherSalarySummaries,
    fetchSpecificMonthlySummary,
    fetchSalaryHistory,
    setSelectedTeacher,
    setSelectedMonth,
    setSelectedYear,
    clearSelectedSummary,
    clearErrors,
    resetSalaryState,
} from '@/redux/slice/salary.slice';
import type { 
    SalaryConfigurationDTO, 
    SalaryCalculationParams,
    SalaryHistoryParams,
    SalarySummariesParams 
} from '@/types/api.types';

export const useSalary = () => {
    const dispatch = useAppDispatch();
    const {
        teacherConfigs,
        configLoading,
        configError,
        monthlySummaries,
        currentSummary,
        calculationLoading,
        calculationError,
        salaryHistory,
        paginatedSummaries,
        historyLoading,
        historyError,
        selectedTeacherId,
        selectedMonth,
        selectedYear,
    } = useAppSelector((state) => state.salary);

    // 🔧 Configuration Actions
    const handleUpdateTeacherSalaryConfig = useCallback(
        (teacherId: number, config: SalaryConfigurationDTO) => {
            dispatch(updateTeacherSalaryConfig({ teacherId, config }));
        },
        [dispatch]
    );

    const handleFetchTeacherSalaryConfig = useCallback(
        (teacherId: number) => {
            dispatch(fetchTeacherSalaryConfig(teacherId));
        },
        [dispatch]
    );

    // 💰 Calculation Actions
    const handleCalculateMonthlySalary = useCallback(
        (teacherId: number, params: SalaryCalculationParams) => {
            return dispatch(calculateMonthlySalary({ teacherId, params }));
        },
        [dispatch]
    );

    const handleCalculateAllMonthlySalaries = useCallback(
        (params: SalaryCalculationParams) => {
            return dispatch(calculateAllMonthlySalaries(params));
        },
        [dispatch]
    );

    const handleRecalculateMonthlySalary = useCallback(
        (teacherId: number, params: SalaryCalculationParams) => {
            return dispatch(recalculateMonthlySalary({ teacherId, params }));
        },
        [dispatch]
    );

    // 📊 History & Reporting Actions
    const handleFetchTeacherSalarySummaries = useCallback(
        (teacherId: number, params?: SalarySummariesParams) => {
            dispatch(fetchTeacherSalarySummaries({ teacherId, params }));
        },
        [dispatch]
    );

    const handleFetchSpecificMonthlySummary = useCallback(
        (teacherId: number, year: number, month: number) => {
            dispatch(fetchSpecificMonthlySummary({ teacherId, year, month }));
        },
        [dispatch]
    );

    const handleFetchSalaryHistory = useCallback(
        (teacherId: number, params: SalaryHistoryParams) => {
            dispatch(fetchSalaryHistory({ teacherId, params }));
        },
        [dispatch]
    );

    // 🎯 UI State Management Actions
    const handleSetSelectedTeacher = useCallback(
        (teacherId: number | null) => {
            dispatch(setSelectedTeacher(teacherId));
        },
        [dispatch]
    );

    const handleSetSelectedMonth = useCallback(
        (month: number | null) => {
            dispatch(setSelectedMonth(month));
        },
        [dispatch]
    );

    const handleSetSelectedYear = useCallback(
        (year: number | null) => {
            dispatch(setSelectedYear(year));
        },
        [dispatch]
    );

    const handleClearSelectedSummary = useCallback(() => {
        dispatch(clearSelectedSummary());
    }, [dispatch]);

    const handleClearErrors = useCallback(() => {
        dispatch(clearErrors());
    }, [dispatch]);

    const handleResetSalaryState = useCallback(() => {
        dispatch(resetSalaryState());
    }, [dispatch]);

    // 🔍 Computed Values & Utilities
    const getTeacherConfig = useCallback(
        (teacherId: number) => {
            return teacherConfigs[teacherId] || null;
        },
        [teacherConfigs]
    );

    const getCurrentMonthSummary = useCallback(
        (teacherId: number, year: number, month: number) => {
            return monthlySummaries.find(
                s => s.teacher_id === teacherId && s.year === year && s.month === month
            ) || null;
        },
        [monthlySummaries]
    );

    const getTeacherSummaries = useCallback(
        (teacherId: number) => {
            return monthlySummaries.filter(s => s.teacher_id === teacherId);
        },
        [monthlySummaries]
    );

    const isLoading = configLoading || calculationLoading || historyLoading;
    const hasError = configError || calculationError || historyError;

    return {
        // 📊 State Data
        teacherConfigs,
        monthlySummaries,
        currentSummary,
        salaryHistory,
        paginatedSummaries,
        selectedTeacherId,
        selectedMonth,
        selectedYear,

        // 🔄 Loading States
        configLoading,
        calculationLoading,
        historyLoading,
        isLoading,

        // ❌ Error States
        configError,
        calculationError,
        historyError,
        hasError,

        // 🔧 Configuration Actions
        handleUpdateTeacherSalaryConfig,
        handleFetchTeacherSalaryConfig,

        // 💰 Calculation Actions
        handleCalculateMonthlySalary,
        handleCalculateAllMonthlySalaries,
        handleRecalculateMonthlySalary,

        // 📊 History & Reporting Actions
        handleFetchTeacherSalarySummaries,
        handleFetchSpecificMonthlySummary,
        handleFetchSalaryHistory,

        // 🎯 UI State Management Actions
        handleSetSelectedTeacher,
        handleSetSelectedMonth,
        handleSetSelectedYear,
        handleClearSelectedSummary,
        handleClearErrors,
        handleResetSalaryState,

        // 🔍 Utility Functions
        getTeacherConfig,
        getCurrentMonthSummary,
        getTeacherSummaries,
    };
};