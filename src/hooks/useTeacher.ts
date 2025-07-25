import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
    createTeacher,
    deleteTeacher,
    fetchTeacher,
    fetchTeachers,
    searchTeachers,
    updateTeacher,
} from '@/redux/slice/teacher.slice';
import type { Teacher, TeacherSearchParams } from '@/types/api.types';

export const useTeacher = () => {
    const dispatch = useAppDispatch();
    const { teachers, teacher, loading, error, total } = useAppSelector((state) => state.teacher);

    const handleFetchTeachers = useCallback(() => {
        dispatch(fetchTeachers());
    }, [dispatch]);

    const handleFetchTeacher = useCallback(
        (id: number) => {
            dispatch(fetchTeacher(id));
        },
        [dispatch]
    );

    const handleCreateTeacher = useCallback(
        (teacher: Teacher) => {
            dispatch(createTeacher(teacher));
        },
        [dispatch]
    );

    const handleUpdateTeacher = useCallback(
        (id: number, teacher: Teacher) => {
            dispatch(updateTeacher({ id, data: teacher }));
        },
        [dispatch]
    );

    const handleDeleteTeacher = useCallback(
        (id: number) => {
            dispatch(deleteTeacher(id));
        },
        [dispatch]
    );

    const handleSearchTeachers = useCallback(
        (params: TeacherSearchParams) => {
            dispatch(searchTeachers(params));
        },
        [dispatch]
    );

    return {
        // Data
        teachers,
        teacher,
        loading,
        error,
        total,

        // Actions
        handleFetchTeachers,
        handleFetchTeacher,
        handleCreateTeacher,
        handleUpdateTeacher,
        handleDeleteTeacher,
        handleSearchTeachers,
    };
}; 