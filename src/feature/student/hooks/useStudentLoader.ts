import { useLoader } from "@/hooks/useLoader";
import { getAllStudents } from "../services/studentApi";
import { Student } from "../../../types/student.type";
import { useCallback } from "react";

// Wrapper function để đảm bảo stable reference
const loadStudents = async (): Promise<Student[]> => {
    return getAllStudents();
};

export function useStudentLoader() {
    const loadStudents = useCallback(async (): Promise<Student[]> => {
        return getAllStudents();
    }, []);

    return useLoader<Student[]>(loadStudents, {
        autoLoad: true,
        onSuccess: (data) => {
            console.log("Students loaded successfully:", data.length);
        },
        onError: (error) => {
            console.error("Failed to load students:", error);
        }
    });
}

// Hook cho student detail
export function useStudentDetailLoader(studentId: number | undefined) {
    const loader = useCallback(async () => {
        if (!studentId) throw new Error("Student ID is required");
        return await getAllStudents().then(students => 
            students.find(s => s.id === studentId)
        );
    }, [studentId]);

    return useLoader(loader, {
        autoLoad: !!studentId,
        dependencies: [studentId],
        onSuccess: (data) => {
            console.log("Student detail loaded successfully:", data?.name);
        },
        onError: (error) => {
            console.error("Failed to load student detail:", error);
        }
    });
} 