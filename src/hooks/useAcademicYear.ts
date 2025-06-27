import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { useCallback } from "react";
import { createAcademicYear, deleteAcademicYear, fetchAcademicYear, fetchAcademicYears, updateAcademicYear } from "@/redux/slice/academic-year.slice";
import { AcademicYear } from "@/types/api.types";

export const useAcademicYear = () => {
    const dispatch = useAppDispatch();
    const { academicYears, academicYear, loading, error } = useAppSelector(state => state.academicYear);

    const handleFetchAcademicYears = useCallback(() => {
        dispatch(fetchAcademicYears());
    }, [dispatch]);

    const handleFetchAcademicYear = useCallback((id: number) => {
        dispatch(fetchAcademicYear(id));
    }, [dispatch]);

    const handleCreateAcademicYear = useCallback((academicYear: AcademicYear) => {
        dispatch(createAcademicYear(academicYear));
    }, [dispatch]);

    const handleUpdateAcademicYear = useCallback((id: number, academicYear: AcademicYear) => {
        dispatch(updateAcademicYear({ id, academicYear }));
    }, [dispatch]);

    const handleDeleteAcademicYear = useCallback((id: number) => {
        dispatch(deleteAcademicYear(id));
    }, [dispatch]);

    return {
        academicYears,
        academicYear,
        loading,
        error,

        //Actions
        handleFetchAcademicYears,
        handleFetchAcademicYear,
        handleCreateAcademicYear,
        handleUpdateAcademicYear,
        handleDeleteAcademicYear,
    }
}