import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { useCallback } from "react";
import { createGrade, deleteGrade, fetchGrade, fetchGrades, updateGrade } from "@/redux/slice/grade.slice";
import { Grade } from "@/types/api.types";

export const useGrade = () => {
    const dispatch = useAppDispatch();
    const { grades, grade, loading, error } = useAppSelector(state => state.grade);

    const handleFetchGrades = useCallback(() => {
        dispatch(fetchGrades());
    }, [dispatch]);

    const handleFetchGrade = useCallback((id: number) => {
        dispatch(fetchGrade(id));
    }, [dispatch])

    const handleCreateGrade = useCallback((grade: Grade) => {
        dispatch(createGrade(grade));
    }, [dispatch])

    const handleUpdateGrade = useCallback((id: number, grade: Grade) => {
        dispatch(updateGrade({ id, grade }));
    }, [dispatch])

    const handleDeleteGrade = useCallback((id: number) => {
        dispatch(deleteGrade(id));
    }, [dispatch])

    return {
        //Data
        grades,
        grade,
        loading,
        error,

        //Actions
        handleFetchGrades,
        handleFetchGrade,
        handleCreateGrade,
        handleUpdateGrade,
        handleDeleteGrade,
    }
}