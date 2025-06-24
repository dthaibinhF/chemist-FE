import { useCallback, useEffect } from "react";
import { Student } from "@/types/student.type";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate, useLoaderData, useRevalidator } from "react-router-dom";
import {
    StudentTable,
    StudentTableHeader,
    StudentStatsCards,
} from "@/feature/student/components";
import { StudentFormData } from "@/feature/student/schemas/student.schema";
import { toast } from "sonner";
import { useStudent } from "@/feature/student/hooks/useStudent";

export const StudentManagement = () => {
    const {students,removeStudent, loadStudents} = useStudent();
    // const students: Student[] = useLoaderData();
    const navigate = useNavigate();
    const revalidate = useRevalidator();

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    usePageTitle("Quản lý học sinh");

    const handleViewStudent = useCallback((student: Student) => {
        navigate(`/student/${student.id}`);
    }, [navigate]);

    const handleEditStudent = useCallback(async (id: number, formData: StudentFormData) => {
        try {
            // TODO: Gọi API để cập nhật học sinh
            console.log("Editing student:", id, formData);
            revalidate.revalidate();
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Cập nhật học sinh thành công!");
        } catch (error) {
            console.error("Error editing student:", error);
            toast.error("Cập nhật học sinh thất bại!");
            throw error;
        }
    }, [revalidate]);

    const handleDeleteStudent = async (student: Student) => {
        try {
            removeStudent(student.id);
            revalidate.revalidate();
            // navigate(0);
            toast.success("Xóa học sinh thành công!");
        } catch {
            toast.error("Xóa học sinh thất bại!");
        }
    };

    const handleAddStudent = useCallback(async (formData: StudentFormData) => {
        try {
            // TODO: Gọi API để thêm học sinh
            console.log("Adding student:", formData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            revalidate.revalidate();
            toast.success("Thêm học sinh thành công!");
        } catch (error) {
            console.error("Error adding student:", error);
            toast.error("Thêm học sinh thất bại!");
            throw error;
        }
    }, [revalidate]);

    return (
        <div className="grid grid-cols-[2fr_1fr] gap-4 h-full">
            <div className="min-h-0 space-y-4">
                <StudentTableHeader onAddStudent={handleAddStudent} />
                <StudentTable 
                    students={students}
                    onViewStudent={handleViewStudent}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                />
            </div>
            <StudentStatsCards students={students} />
        </div>
    );
};
    