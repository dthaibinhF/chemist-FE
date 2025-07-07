import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, LoaderCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Student } from '@/types/api.types';

import { useStudent } from '../hooks';
import type { StudentFormData } from '../schemas/student.schema';
import { AddStudentTab } from './add-student-tab';
import { EditStudentDialog } from './edit-student-dialog';

export const StudentTable = memo(() => {
  const { students, removeStudent, loadStudents, loading } = useStudent();
  const navigate = useNavigate();
  const revalidate = useRevalidator();

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleEditStudent = useCallback(
    async (id: number, formData: StudentFormData) => {
      try {
        // TODO: Gọi API để cập nhật học sinh
        console.log('Editing student:', id, formData);
        revalidate.revalidate();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Cập nhật học sinh thành công!');
      } catch (error) {
        console.error('Error editing student:', error);
        toast.error('Cập nhật học sinh thất bại!');
        throw error;
      }
    },
    [revalidate]
  );

  // Memoize handlers để tránh re-render không cần thiết
  const handleViewStudent = useCallback(
    (student: Student) => {
      navigate(`/student/${student.id}`);
    },
    [navigate]
  );

  const handleDeleteStudent = useCallback(
    (student: Student) => {
      removeStudent(student.id as number);
      revalidate.revalidate();
      toast.success('Xóa học sinh thành công!');
    },
    [removeStudent, revalidate]
  );

  // Định nghĩa cột cho data-table
  const columns = useMemo<ColumnDef<Student, any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="text-center"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <p className="font-mono text-sm pl-7">{row.original.id}</p>,
      },
      {
        accessorKey: 'name',
        header: 'Họ tên',
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
        accessorKey: 'parent_phone',
        header: 'SĐT Phụ huynh',
        cell: ({ row }) => {
          return <span className="font-mono text-sm">{row.original.parent_phone || '-'}</span>;
        },
      },
      {
        id: 'groupName',
        accessorKey: 'group_name',
        header: 'Nhóm học',
        cell: ({ row }) => {
          const groupName = row.original.student_details?.[0]?.group_name;
          return <span className="text-sm">{groupName || '-'}</span>;
        },
      },
      {
        id: 'gradeName',
        accessorKey: 'grade_name',
        header: 'Khối',
        cell: ({ row }) => {
          const gradeName = row.original.student_details?.[0]?.grade?.name;
          return <span className="text-sm">{gradeName || '-'}</span>;
        },
      },
      {
        id: 'schoolName',
        accessorKey: 'school_name',
        header: 'Trường',
        cell: ({ row }) => {
          const schoolName = row.original.student_details?.[0]?.school?.name;
          return (
            <span className="text-sm truncate max-w-[200px]" title={schoolName}>
              {schoolName || '-'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao tác',
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
                <EditStudentDialog student={row.original} onEditStudent={handleEditStudent} />
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
    ],
    [handleViewStudent, handleDeleteStudent, handleEditStudent]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle size={40} className="animate-spin" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

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
        ComponentForCreate={<AddStudentTab />}
      />
    </div>
  );
});

StudentTable.displayName = 'StudentTable';
