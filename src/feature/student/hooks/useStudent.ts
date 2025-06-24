import {useAppDispatch, useAppSelector} from "@/redux/hook";
import {fetchStudents, createStudent, updateStudent, deleteStudent, setSelectedStudent, fetchStudent} from "../slice/studentSlice";
import {Student} from "../../../types/student.type";
import {useCallback} from "react";

export const useStudent = () => {
    const dispatch = useAppDispatch();
    const {students, selectedStudent, loading, error} = useAppSelector(state => state.student);

    const loadStudents = useCallback(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    const addStudent = useCallback((student: Student) => {
        dispatch(createStudent(student));
    }, [dispatch]);

    const editStudent = useCallback((id: number, student: Student) => {
        dispatch(updateStudent({id, student}));
    }, [dispatch]);

    const removeStudent = async (id: number) => {
        return await dispatch(deleteStudent(id));
    };

    const selectStudent = useCallback((student?: Student) => {
        dispatch(setSelectedStudent(student));
    }, [dispatch]);

    const loadStudent = useCallback((id: number) => {
        console.log("loadStudent called with ID:", id);
        dispatch(fetchStudent(id));
    }, [dispatch]);

    return {
        loadStudent,
        students,
        selectedStudent,
        loading,
        error,
        loadStudents,
        addStudent,
        editStudent,
        removeStudent,
        selectStudent,
    };
}; 