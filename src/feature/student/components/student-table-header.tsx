import { memo } from "react";
import { AddStudentDialog } from "./add-student-dialog";
import { StudentFormData } from "../schemas/student.schema";

interface StudentTableHeaderProps {
    onAddStudent: (formData: StudentFormData) => Promise<void>;
}

export const StudentTableHeader = memo(({ onAddStudent }: StudentTableHeaderProps) => {
    return (
        <div className="flex justify-end items-center mb-2">
            <AddStudentDialog onAddStudent={onAddStudent} />
        </div>
    );
});

StudentTableHeader.displayName = "StudentTableHeader"; 