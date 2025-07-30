import { zodResolver } from '@hookform/resolvers/zod';
import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useRevalidator } from 'react-router-dom';

import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useGrade } from '@/hooks/useGrade';
import { useGroup } from '@/hooks/useGroup';
import { useSchool } from '@/hooks/useSchool';
import { useSchoolClass } from '@/hooks/useSchoolClass';
import { studentService } from '@/service';

import AcademicYearSelect from '@/components/features/academic-year-select';
import GradeSelect from '@/components/features/grade-select';
import GroupSelect from '@/components/features/group-select';
import SchoolClassSelect from '@/components/features/school-class-select';
import SchoolSelect from '@/components/features/school-select';
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
import type { Student, StudentDetail, Group } from '@/types/api.types';

// Import extracted components and utilities
import { StudentPreviewTable } from './student-csv-preview-table';
import {
  CSV_TEMPLATE_COLUMNS,
  fileSchema,
  validateGroupNamesBatch,
  downloadCSVTemplate,
  validateCsvHeaders,
  validateStudentRow,
  debounce,
  type CSVStudentRow,
  type StudentPreview,
} from './csv-utils';






interface AddStudentCsvFileProps {
  groupId?: number;
  gradeId?: number;
  onStudentAdded?: () => void;
}

export const AddStudentCsvFile = ({ groupId, gradeId, onStudentAdded }: AddStudentCsvFileProps) => {
  const { schools, handleFetchSchools } = useSchool();
  const { academicYears, handleFetchAcademicYears } = useAcademicYear();
  const { grades, handleFetchGrades } = useGrade();
  const { schoolClasses, handleFetchSchoolClasses } = useSchoolClass();
  const { groups, handleFetchGroups } = useGroup();
  const revalidate = useRevalidator();

  // State for preview data
  const [studentsPreview, setStudentsPreview] = useState<StudentPreview[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);

  // State for default selections
  const [selectedGrade, setSelectedGrade] = useState<string>(gradeId?.toString() || '');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedSchoolClass, setSelectedSchoolClass] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>(groupId?.toString() || '');

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitializing(true);

        // Fetch data only if not already loaded
        const promises = [];

        if (schools.length === 0) {
          promises.push(handleFetchSchools());
        }
        if (academicYears.length === 0) {
          promises.push(handleFetchAcademicYears());
        }
        if (grades.length === 0) {
          promises.push(handleFetchGrades());
        }
        if (schoolClasses.length === 0) {
          promises.push(handleFetchSchoolClasses());
        }
        if (groups.length === 0) {
          promises.push(handleFetchGroups());
        }

        // Wait for all promises to resolve or reject
        await Promise.allSettled(promises);
      } catch (error) {
        console.error('Error initializing data:', error);
        // Don't show error toast here to avoid dialog closing
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, []); // Only run once on mount

  // Form for file upload
  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
  });

  // Memoized value for grade to prevent unnecessary re-renders of SchoolClassSelect
  const gradeValue = useMemo(() => (selectedGrade ? Number(selectedGrade) : undefined), [selectedGrade]);

  // Check if there are any errors in the preview data
  const hasErrors = useMemo(() => {
    if (studentsPreview.length === 0) return true; // Nothing to save
    return studentsPreview.some((student) => Object.values(student.errors).some((error) => error !== null));
  }, [studentsPreview]);

  // Handler for parsing the CSV file
  const handleFileParse = useCallback((file: File) => {
    const loadingToast = toast.loading('Đang đọc tệp CSV...');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        toast.dismiss(loadingToast);

        if (results.errors.length > 0) {
          toast.error('Có lỗi xảy ra khi đọc tệp. Vui lòng kiểm tra định dạng tệp CSV.');
          console.error('CSV Parsing Errors:', results.errors);
          return;
        }

        if (results.data.length === 0) {
          toast.error('Không tìm thấy dữ liệu trong tệp CSV.');
          return;
        }

        // Validate headers against template
        const headers = results.meta.fields || [];
        const headerValidation = validateCsvHeaders(headers);

        if (!headerValidation.valid) {
          toast.error('Tệp CSV không đúng định dạng template:');
          headerValidation.errors.forEach(error => {
            toast.error(error);
          });
          return;
        }

        // Show warnings if any
        if (headerValidation.warnings.length > 0) {
          headerValidation.warnings.forEach(warning => {
            toast.warning(warning);
          });
        }

        // Process CSV data directly (no transformation needed)
        const csvData = results.data as Partial<CSVStudentRow>[];

        const previewData = csvData.map((row, index) =>
          validateStudentRow(row, index, {
            school: selectedSchool || '',
            grade: selectedGrade || '',
            schoolClass: selectedSchoolClass || '',
            academicYear: selectedAcademicYear || '',
            groupName: selectedGroup || '',
          }),
        );

        setTableHeaders(Object.keys(CSV_TEMPLATE_COLUMNS));
        setStudentsPreview(previewData);
        toast.success(`Đã tải ${previewData.length} dòng để xem trước.`);
      },
      error: (error) => {
        toast.dismiss(loadingToast);
        toast.error(`Lỗi không xác định khi đọc tệp: ${error.message}`);
      },
    });
  }, [selectedAcademicYear, selectedGrade, selectedSchool, selectedSchoolClass, selectedGroup]);

  // Form submission handler
  const onSubmit = (data: z.infer<typeof fileSchema>) => {
    setStudentsPreview([]); // Clear previous preview
    handleFileParse(data.file);
  };

  const handleSave = async () => {
    if (hasErrors) {
      toast.error('Vui lòng sửa tất cả các lỗi trước khi lưu.');
      return;
    }

    try {
      // First, validate all group names using batch processing
      const loadingToast = toast.loading('Đang kiểm tra tên nhóm...');

      // Collect all unique group names
      const groupNames = studentsPreview
        .map(student => student.data.group_name)
        .filter((name): name is string => name !== undefined && name.trim() !== '');

      // Batch validate all group names
      const groupValidationMap = await validateGroupNamesBatch(groupNames);

      // Map results back to students
      const groupValidationResults: Array<{ student: StudentPreview; group?: Group; error?: string }> = [];

      for (const student of studentsPreview) {
        if (student.data.group_name) {
          const validation = groupValidationMap.get(student.data.group_name) || {};
          groupValidationResults.push({
            student,
            group: validation.group,
            error: validation.error,
          });
        } else {
          groupValidationResults.push({ student });
        }
      }

      toast.dismiss(loadingToast);

      // Check for any group validation errors
      const groupErrors = groupValidationResults.filter(result => result.error);
      if (groupErrors.length > 0) {
        toast.error('Có lỗi trong tên nhóm:');
        groupErrors.slice(0, 5).forEach(({ student, error }) => {
          toast.error(`Dòng ${student.rowIndex + 1}: ${error}`);
        });
        if (groupErrors.length > 5) {
          toast.error(`Và ${groupErrors.length - 5} lỗi khác...`);
        }
        return;
      }

      // Convert studentsPreview to Student interface format
      const studentsToSave = studentsPreview.map((s, index) => {
        // Find related entities
        const school = s.data.school
          ? schools.find((schoolItem) => schoolItem.name === s.data.school)
          : undefined;

        const grade = s.data.grade
          ? grades.find((gradeItem) => gradeItem.name === s.data.grade)
          : undefined;

        const schoolClass = s.data.school_class
          ? schoolClasses.find((schoolClassItem) => schoolClassItem.name === s.data.school_class)
          : undefined;

        const academicYear = s.data.academic_year
          ? academicYears.find((academicYearItem) =>
            Number(academicYearItem.id) === Number(s.data.academic_year)
          )
          : undefined;

        // Get group from validation results
        const groupResult = groupValidationResults[index];
        const groupId = groupResult?.group?.id;

        return {
          name: s.data.name,
          parent_phone: s.data.parent_phone || undefined,
          student_details: [
            {
              school: school,
              class: schoolClass,
              academic_year: academicYear,
              group_id: groupId,
              grade: grade,
              student_name: s.data.name,
            } as StudentDetail,
          ],
        } as Student;
      });

      toast.promise(
        studentService.createMultipleStudents(studentsToSave),
        {
          loading: 'Đang lưu danh sách học sinh...',
          success: () => {
            // Reset state after successful save
            setStudentsPreview([]);
            setTableHeaders([]);
            form.reset();
            revalidate.revalidate();
            if (onStudentAdded) {
              onStudentAdded();
            }
            return 'Đã lưu học sinh thành công!';
          },
          error: (error: any) => {
            console.error('Error saving students:', error);
            return 'Đã xảy ra lỗi khi lưu học sinh.';
          },
        }
      );
    } catch (error) {
      console.error('Unexpected error during save:', error);
      toast.error('Đã xảy ra lỗi không mong muốn.');
    }
  };

  // Debounced cell change handler to reduce re-validation frequency
  const debouncedValidation = useCallback(
    debounce((rowIndex: number, defaults: any) => {
      setStudentsPreview(currentPreview => {
        const newPreview = [...currentPreview];
        const revalidatedStudent = validateStudentRow(newPreview[rowIndex].data, rowIndex, defaults);
        newPreview[rowIndex] = revalidatedStudent;
        return newPreview;
      });
    }, 300),
    []
  );

  // Handler for inline cell editing with optimized validation
  const handleCellChange = useCallback((rowIndex: number, header: keyof CSVStudentRow, value: string) => {
    setStudentsPreview((currentPreview) => {
      const newPreview = [...currentPreview];
      const studentToUpdate = { ...newPreview[rowIndex] };

      // Update the specific field immediately
      studentToUpdate.data = {
        ...studentToUpdate.data,
        [header]: value || undefined,
      };

      newPreview[rowIndex] = studentToUpdate;

      // Debounce validation to avoid excessive re-computation
      debouncedValidation(rowIndex, {
        school: selectedSchool || '',
        grade: selectedGrade || '',
        schoolClass: selectedSchoolClass || '',
        academicYear: selectedAcademicYear || '',
        groupName: selectedGroup || '',
      });

      return newPreview;
    });
  }, [selectedSchool, selectedGrade, selectedSchoolClass, selectedAcademicYear, selectedGroup, debouncedValidation]);


  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="space-y-6 max-h-[500px] overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải dữ liệu...</CardTitle>
            <CardDescription>Vui lòng đợi trong giây lát</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Bước 1: Cấu hình giá trị mặc định (Tùy chọn)</CardTitle>
          <CardDescription>
            Thiết lập giá trị mặc định cho các trường không bắt buộc. Giá trị này sẽ được áp dụng khi cột tương ứng trong CSV để trống.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <SchoolSelect value={selectedSchool} handleSelect={setSelectedSchool} />
          <GradeSelect value={selectedGrade} handleSelect={setSelectedGrade} />
          <SchoolClassSelect grade={gradeValue} value={selectedSchoolClass} handleSelect={setSelectedSchoolClass} />
          <AcademicYearSelect value={selectedAcademicYear} handleSelect={setSelectedAcademicYear} />
          <GroupSelect value={selectedGroup} handleSelect={setSelectedGroup} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bước 2: Tải lên file CSV đã điền</CardTitle>
          <CardDescription>
            Tải lên file CSV đã điền theo template. Hệ thống sẽ kiểm tra định dạng và hiển thị dữ liệu để xác nhận.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Cấu trúc CSV Template cần sử dụng:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {Object.entries(CSV_TEMPLATE_COLUMNS).map(([column, config]) => (
                <p key={column}>
                  <strong className={config.required ? 'text-red-600' : ''}>
                    {column}{config.required ? '*' : ''}
                  </strong>
                  : {config.description}
                </p>
              ))}
              <p className="text-xs mt-2 text-red-600">
                * Cột bắt buộc phải có dữ liệu
              </p>
            </div>
          </div>

          <div className="rounded-md bg-green-50 p-4">
            <h4 className="font-medium text-green-900 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadCSVTemplate}
                className="mr-2"
              >
                Tải Template CSV
              </Button>
              Tải file mẫu và điền thông tin
            </h4>
            <div className="text-sm text-green-800">
              <p>1. Nhấn nút "Tải Template CSV" để tải file mẫu</p>
              <p>2. Mở file với Excel hoặc Google Sheets</p>
              <p>3. Điền thông tin học sinh vào các cột tương ứng</p>
              <p className="font-medium ml-4 text-red-700">• Cột "group_name": Nhập tên nhóm CHÍNH XÁC (VD: "12NC1", "11VL2") - không được sai một ký tự</p>
              <p className="font-medium ml-4">• Cột "school": Có thể dùng viết tắt (VD: AK, CVL) hoặc tên đầy đủ</p>
              <p>4. Lưu file dưới định dạng CSV và tải lên hệ thống</p>
            </div>
          </div>

          <div className="rounded-md bg-red-50 p-4 mb-4">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Lưu ý quan trọng về tên nhóm:</h4>
            <div className="text-sm text-red-800 space-y-1">
              <p><strong>Tên nhóm phải chính xác 100%</strong> - hệ thống sẽ từ chối nếu không khớp hoàn toàn</p>
              <p>• Ví dụ đúng: "12NC1", "11VL2", "10TK3"</p>
              <p>• Ví dụ sai: "12NC" (thiếu số), "12nc1" (sai viết hoa), "12NC 1" (có khoảng trắng)</p>
              <p className="font-medium">Kiểm tra kỹ tên nhóm trước khi import!</p>
            </div>
          </div>

          <div className="rounded-md bg-yellow-50 p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Các viết tắt tên trường hỗ trợ:</h4>
            <div className="text-sm text-yellow-800 grid grid-cols-2 gap-1">
              <p><strong>AK</strong> → Trường THPT An Khánh</p>
              <p><strong>CVL</strong> → Trường THPT Châu Văn Liêm</p>
              <p><strong>NVD</strong> → Trường THPT Nguyễn Việt Dũng</p>
              <p><strong>NVH</strong> → Trường THPT Nguyễn Việt Hồng</p>
              <p><strong>PNH</strong> → Trường THPT Phan Ngọc Hiển</p>
              <p><strong>BHN</strong> → Trường THPT Bùi Hữu Nghĩa</p>
              <p><strong>BM</strong> → Trường THPT Bình Minh</p>
              <p><strong>LTT</strong> → Trường THPT Lý Tự Trọng</p>
              <p><strong>LHP</strong> → Trường THPT Lưu Hữu Phước</p>
              <p><strong>NS</strong> → Trường THPT Ngã Sáu</p>
              <p><strong>THSP</strong> → Trường THPT Thực Hành Sư Phạm</p>
              <p><strong>TSTD</strong> → Thí Sinh Tự Do</p>
            </div>
            <p className="text-xs mt-2 text-yellow-700">
              Có thể sử dụng viết tắt hoặc tên đầy đủ của trường
            </p>
          </div>
          <Form {...form}>
            <form id="form-add-student-csv-file" onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Chọn file CSV (phải theo đúng template)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="whitespace-nowrap">
                Tải lên & Kiểm tra
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {studentsPreview.length > 0 && (
        <div className="flex-1 min-h-0">
          <StudentPreviewTable
            students={studentsPreview}
            headers={tableHeaders}
            onCellChange={handleCellChange}
            onSave={handleSave}
            hasErrors={hasErrors}
          />
        </div>
      )}
    </div>
  );
};
