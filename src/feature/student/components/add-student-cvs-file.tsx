import { zodResolver } from '@hookform/resolvers/zod';
import type { ParseResult } from 'papaparse';
import Papa from 'papaparse';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import AcademicYearSelect from '@/components/features/academic-year-select';
import GradeSelect from '@/components/features/grade-select';
import SchoolClassSelect from '@/components/features/school-class-select';
import SchoolSelect from '@/components/features/school-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Định nghĩa kiểu dữ liệu học sinh từ file
interface StudentInFile {
  name: string;
  parent_phone: string;
  school_id: number;
  grade_id: number;
  school_class_id: number;
  academic_year_id: number;
}

// Schema xác thực file CSV
const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), {
      message: 'File phải là file CSV',
    }),
});

const changeCsvToStudent = (cvsData: StudentInFile[]) => {
  cvsData.map((item) => {
    if (!Number.isNaN(item.school_id)) {
      console.log(item.school_id);
    }
    console.log(item);
  });
};

export const AddStudentCsvFile = () => {
  // State quản lý
  const [studentInFile, setStudentInFile] = useState<StudentInFile[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedSchoolClass, setSelectedSchoolClass] = useState<string | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);

  // Form validation
  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      file: undefined,
    },
  });

  // Handlers cho các select components
  const handleSelectSchool = useCallback((value: string) => {
    setSelectedSchool(value);
  }, []);

  const handleSelectGrade = useCallback((value: string) => {
    setSelectedGrade(value);
  }, []);

  const handleSelectSchoolClass = useCallback((value: string) => {
    setSelectedSchoolClass(value);
  }, []);

  const handleSelectAcademicYear = useCallback((value: string) => {
    setSelectedAcademicYear(value);
  }, []);

  // Xử lý file CSV
  const processCSVFile = useCallback(
    (file: File) => {
      if (!file) {
        toast.error('Vui lòng chọn file CSV');
        return;
      }

      const loadingToast = toast.loading('Đang xử lý file CSV...');

      Papa.parse(file, {
        header: true,
        transformHeader: (header) => header.toLowerCase().trim(),
        skipEmptyLines: true,
        complete: (result: ParseResult<any>) => {
          try {
            // Xử lý dữ liệu từ file CSV
            const parsedStudents: StudentInFile[] = result.data.map((row: any) => {
              // Ưu tiên lấy từ state, sau đó từ file CSV
              return {
                name: row.name || row['họ và tên'] || '',
                parent_phone: row.parent_phone || row['sdt ph'] || row['số điện thoại'] || '',
                school_id:
                  selectedSchool !== null
                    ? Number(selectedSchool)
                    : row.school_id || row['trường'] || null,
                grade_id: selectedGrade !== null ? Number(selectedGrade) : row.grade_id || null,
                school_class_id:
                  selectedSchoolClass !== null
                    ? Number(selectedSchoolClass)
                    : row.school_class_id || null,
                academic_year_id:
                  selectedAcademicYear !== null
                    ? Number(selectedAcademicYear)
                    : row.academic_year_id || null,
              };
            });

            // Lọc học sinh hợp lệ
            const validStudents = parsedStudents.filter(
              (student) => student.name && student.name.trim() !== ''
            );

            if (validStudents.length === 0) {
              toast.dismiss(loadingToast);
              toast.error('Không tìm thấy dữ liệu học sinh hợp lệ trong file CSV');
              return;
            }

            // Cập nhật state
            setStudentInFile(validStudents);
            changeCsvToStudent(validStudents);
            toast.dismiss(loadingToast);
            toast.success(`Đã xử lý ${validStudents.length} học sinh thành công`);
          } catch (err) {
            toast.dismiss(loadingToast);
            toast.error(`Lỗi xử lý file CSV: ${err}`);
          }
        },
        error: (err) => {
          toast.dismiss(loadingToast);
          toast.error(`Lỗi đọc file: ${err.message}`);
        },
      });
    },
    [selectedSchool, selectedGrade, selectedSchoolClass, selectedAcademicYear]
  );

  // Memoize grade value để tránh re-render không cần thiết
  const gradeValue = useMemo(
    () => (selectedGrade ? Number(selectedGrade) : undefined),
    [selectedGrade]
  );

  // Xử lý form submit
  const onSubmit = useCallback(
    (data: z.infer<typeof fileSchema>) => {
      processCSVFile(data.file);
    },
    [processCSVFile]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nhập học sinh từ file CSV</CardTitle>
          <CardDescription>
            Chọn các giá trị mặc định cho file. Nếu không chọn, hệ thống sẽ sử dụng dữ liệu từ file
            CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table className="w-full">
              <TableCaption className="text-sm font-medium">
                Chọn các giá trị mặc định cho tất cả học sinh
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">
                    <Badge variant="outline">Tên học sinh</Badge>
                  </TableHead>
                  <TableHead className="text-xs whitespace-nowrap">
                    <Badge variant="outline">SĐT phụ huynh</Badge>
                  </TableHead>
                  <TableHead className="text-xs whitespace-nowrap ">
                    <Badge variant="outline">Trường</Badge>
                  </TableHead>
                  <TableHead className="text-xs whitespace-nowrap">
                    <Badge variant="outline">Khối</Badge>
                  </TableHead>
                  <TableHead className="text-xs whitespace-nowrap">
                    <Badge variant="outline">Lớp</Badge>
                  </TableHead>
                  <TableHead className="text-xs whitespace-nowrap">
                    <Badge variant="outline">Năm học</Badge>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs text-wrap">Từ file CSV</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">Từ file CSV</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <SchoolSelect handleSelect={handleSelectSchool} />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <GradeSelect handleSelect={handleSelectGrade} />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <SchoolClassSelect grade={gradeValue} handleSelect={handleSelectSchoolClass} />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <AcademicYearSelect handleSelect={(value) => handleSelectAcademicYear(value)} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tải lên file CSV</CardTitle>
          <CardDescription>
            Chọn file CSV chứa danh sách học sinh cần nhập vào hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col md:flex-row items-end gap-4"
            >
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps }, formState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>File CSV</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv,text/csv"
                        {...fieldProps}
                        onChange={(e) => onChange(e.target.files?.[0])}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    {formState.errors.file && (
                      <p className="text-sm text-red-500">{formState.errors.file.message}</p>
                    )}
                  </FormItem>
                )}
              />
              <FormMessage />
              <Button type="submit" className="min-w-[100px]">
                Tải lên
              </Button>
            </form>
          </Form>

          {studentInFile.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium">
                Đã tải lên {studentInFile.length} học sinh thành công
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
