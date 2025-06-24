import { useMemo, useCallback, memo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Student } from "../../../types/student.type";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Eye } from "lucide-react";
import { EditStudentDialog } from "./edit-student-dialog";
import { StudentFormData } from "../schemas/student.schema";

interface StudentTableProps {
    students: Student[];
    onViewStudent: (student: Student) => void;
    onEditStudent: (id: number, formData: StudentFormData) => Promise<void>;
    onDeleteStudent: (student: Student) => void;
}

export const StudentTable = memo(({ 
    students, 
    onViewStudent, 
    onEditStudent, 
    onDeleteStudent
}: StudentTableProps) => {
    
    // Memoize handlers để tránh re-render không cần thiết
    const handleViewStudent = useCallback((student: Student) => {
        onViewStudent(student);
    }, [onViewStudent]);

    const handleDeleteStudent = useCallback((student: Student) => {
        onDeleteStudent(student);
    }, [onDeleteStudent]);

    // Định nghĩa cột cho data-table
    const columns = useMemo<ColumnDef<Student, any>[]>(() => [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.id}
                </span>
            ),
        },
        {
            accessorKey: "name",
            header: "Họ tên",
            cell: ({ row }) => (
                <button
                    onClick={() => handleViewStudent(row.original)}
                    className="text-left hover:text-primary hover:underline cursor-pointer transition-colors"
                >
                    {row.original.name}
                </button>
            ),
        },
        {
            accessorKey: "parentPhone",
            header: "SĐT Phụ huynh",
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.original.parentPhone || "-"}
                </span>
            ),
        },
        {
            id: "groupName",
            accessorKey: "groupName",
            header: "Nhóm học",
            cell: ({ row }) => {
                const groupName = row.original.studentDetails?.[0]?.group_name;
                return (
                    <span className="text-sm">
                        {groupName || "-"}
                    </span>
                );
            },
        },
        {
            id: "gradeName",
            accessorKey: "gradeName",
            header: "Khối",
            cell: ({ row }) => {
                const gradeName = row.original.studentDetails?.[0]?.grade?.name;
                return (
                    <span className="text-sm">
                        {gradeName || "-"}
                    </span>
                );
            },
        },
        {
            id: "schoolName",
            accessorKey: "schoolName",
            header: "Trường",
            cell: ({ row }) => {
                const schoolName = row.original.studentDetails?.[0]?.school?.name;
                return (
                    <span className="text-sm truncate max-w-[200px]" title={schoolName}>
                        {schoolName || "-"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewStudent(row.original)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <EditStudentDialog 
                                student={row.original}
                                onEditStudent={onEditStudent}
                            />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => handleDeleteStudent(row.original)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [handleViewStudent, handleDeleteStudent, onEditStudent]);

    // Hiển thị empty state nếu không có dữ liệu
    if (students.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Chưa có học sinh nào</h3>
                    <p className="text-muted-foreground">
                        Bắt đầu bằng cách thêm học sinh đầu tiên vào hệ thống.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <DataTable 
                pagination={false} 
                columns={columns} 
                data={students} 
            />
        </div>
    );
});

StudentTable.displayName = "StudentTable"; 