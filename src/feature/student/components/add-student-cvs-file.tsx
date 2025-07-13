import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useGroup } from '@/hooks/useGroup';
import { useStudent } from '../hooks';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGrade } from '@/hooks/useGrade';
import { useSchool } from '@/hooks/useSchool';
import { useSchoolClass } from '@/hooks/useSchoolClass';
import type { Student, StudentDetail } from '@/types/api.types';
import { useRevalidator } from 'react-router-dom';

// Represents a row from the CSV for preview, including data and potential errors
interface StudentPreview {
  data: Record<string, any>;
  errors: Record<string, string | null>;
  rowIndex: number;
}

// Mapping from CSV headers to Student interface fields
const CSV_TO_STUDENT_MAPPING: Record<string, keyof Student> = {
  'name': 'name',
  'họ và tên': 'name',
  'tên': 'name',
  'full_name': 'name',
  'student_name': 'name',
  'parent_phone': 'parent_phone',
  'số điện thoại phụ huynh': 'parent_phone',
  'phone': 'parent_phone',
  'phone_number': 'parent_phone',
  'parent_phone_number': 'parent_phone',
};

const CSV_TO_STUDENT_DETAIL_MAPPING: Record<string, keyof StudentDetail> = {
  'school': 'school',
  'trường': 'school',
  'trường học': 'school',
  'class': 'school_class',
  'lớp': 'school_class',
  'academic_year': 'academic_year',
  'năm học': 'academic_year',
  'grade': 'grade',
  'khối': 'grade',
  'group': 'group_id',
  'nhóm': 'group_id',
};

// Mapping for abbreviated school names
const SCHOOL_MAPPING: Record<string, string> = {
  'AK': 'Trường THPT An Khánh',
  'CVL': 'Trường THPT Châu Văn Liêm',
  'NVD': 'Trường THPT Nguyễn Việt Dũng',
  'NVH': 'Trường THPT Nguyễn Việt Hồng',
  'PNH': 'Trường THPT Phan Ngọc Hiển',
  'BHN': 'Trường THPT Bùi Hữu Nghĩa',
  'BM': 'Trường THPT Bình Minh',
  'LTT': 'Trường THPT Lý Tự Trọng',
  'LHP': 'Trường THPT Lưu Hữu Phước',
  'NS': 'Trường THPT Ngã Sáu',
  'THSP': 'Trường THPT Thực Hành Sư Phạm',
  'TĐN': 'Trường THPT Trần Đại Nghĩa',
  'NBK': 'Trường THPT Nguyễn Bình Khiêm',
  'TSTD': 'Thí Sinh Tự Do',
  'PVT': 'Trường THPT Phan Văn Trị',
  'TV': 'Trường THPT Tầm Vu',
  'TẦM VU': 'Trường THPT Tầm Vu',
  'SP': 'Trường THPT Song Phú',
  'Song Phú': 'Trường THPT Song Phú',
  'GX': 'Trường THPT Giai Xuân',
  'ALT': 'Trường THPT An Lạc Thôn',
  'TL': 'Trường THPT Thới Lai',
  'QTHB': 'Trường THPT Quốc Tế Hòa Bình',
  'CTA': 'Trường THPT Châu Thành A',
  'Giai Xuân': 'Trường THPT Giai Xuân',
  'An Lạc Thôn': 'Trường THPT An Lạc Thôn',
  'Thới Lai': 'Trường THPT Thới Lai',
  'Quốc Tế Hòa Bình': 'Trường THPT Quốc Tế Hòa Bình',
  'Châu Thành A': 'Trường THPT Châu Thành A',


  // Full names for backward compatibility
  'Trường THPT An Lạc Thôn': 'Trường THPT An Lạc Thôn',
  'Trường THPT Thới Lai': 'Trường THPT Thới Lai',
  'Trường THPT Quốc Tế Hòa Bình': 'Trường THPT Quốc Tế Hòa Bình',
  'Trường THPT Châu Thành A': 'Trường THPT Châu Thành A',
  'Trường THPT An Khánh': 'Trường THPT An Khánh',
  'Trường THPT Châu Văn Liêm': 'Trường THPT Châu Văn Liêm',
  'Trường THPT Nguyễn Việt Dũng': 'Trường THPT Nguyễn Việt Dũng',
  'Trường THPT Nguyễn Việt Hồng': 'Trường THPT Nguyễn Việt Hồng',
  'Trường THPT Phan Ngọc Hiển': 'Trường THPT Phan Ngọc Hiển',
  'Trường THPT Bùi Hữu Nghĩa': 'Trường THPT Bùi Hữu Nghĩa',
  'Trường THPT Bình Minh': 'Trường THPT Bình Minh',
  'Trường THPT Lý Tự Trọng': 'Trường THPT Lý Tự Trọng',
  'Trường THPT Lưu Hữu Phước': 'Trường THPT Lưu Hữu Phước',
  'Trường THPT Ngã Sáu': 'Trường THPT Ngã Sáu',
  'Trường THPT Thực Hành Sư Phạm': 'Trường THPT Thực Hành Sư Phạm',
  'Trường THPT Trần Đại Nghĩa': 'Trường THPT Trần Đại Nghĩa',
  'Trường THPT Nguyễn Bình Khiêm': 'Trường THPT Nguyễn Bình Khiêm',
  'Trường THPT Phan Văn Trị': 'Trường THPT Phan Văn Trị',
  'Trường THPT Tầm Vu': 'Trường THPT Tầm Vu',
  'Trường THPT Song Phú': 'Trường THPT Song Phú',
  'Trường THPT Giai Xuân': 'Trường THPT Giai Xuân',
  'Thí Sinh Tự Do': 'Thí Sinh Tự Do',
};

// Zod schema for file upload
const fileSchema = z.object({
  file: z
    .instanceof(File, { message: 'Vui lòng chọn một tệp.' })
    .refine((file) => file.size > 0, { message: 'Tệp không được để trống.' })
    .refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), {
      message: 'Chỉ chấp nhận tệp có định dạng .csv.',
    }),
});

// Zod schema for a single student row for validation
const studentRowSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  parent_phone: z.string().optional(),
});

interface StudentPreviewTableProps {
  students: StudentPreview[];
  headers: string[];
  onCellChange: (rowIndex: number, header: string, value: string) => void;
  onSave: () => void;
  hasErrors: boolean;
}

const StudentPreviewTable = ({ students, headers, onCellChange, onSave, hasErrors }: StudentPreviewTableProps) => {
  const { academicYears, handleFetchAcademicYears } = useAcademicYear();
  const { grades, handleFetchGrades } = useGrade();
  const { schoolClasses, handleFetchSchoolClasses } = useSchoolClass();
  const { groups, handleFetchGroups } = useGroup();

  useEffect(() => {
    if (academicYears.length === 0) {
      handleFetchAcademicYears();
    }
    if (grades.length === 0) {
      handleFetchGrades();
    }
    if (schoolClasses.length === 0) {
      handleFetchSchoolClasses();
    }
    if (groups.length === 0) {
      handleFetchGroups();
    }
  }, [academicYears, grades, schoolClasses, groups]);

  if (students.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bước 3: Kiểm tra và xác nhận dữ liệu</CardTitle>
        <CardDescription>
          Kiểm tra lại dữ liệu đã được đọc từ tệp. Chỉnh sửa trực tiếp trên bảng nếu cần thiết.
          Các ô màu đỏ là dữ liệu không hợp lệ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto border rounded-md">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header} className="bg-background sticky top-0 z-10">
                      <div className="flex flex-col">
                        <span>{header}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.rowIndex}>
                    {headers.map((header) => {
                      const error = student.errors[header];
                      return (
                        <TableCell
                          key={`${student.rowIndex}-${header}`}
                          className={cn(
                            "min-w-[200px]",
                            error ? 'bg-red-100' : ''
                          )}
                        >
                          {
                            header === 'school' ? (
                              <Input
                                type="text"
                                value={student.data[header] || ''}
                                onChange={(e) => onCellChange(student.rowIndex, header, e.target.value)}
                                className="w-full bg-transparent p-1 border-none focus:ring-0 focus:ring-offset-0"
                              />
                            )
                              : header === 'grade' ? (
                                <GradeSelect value={student.data[header] || ''} handleSelect={(value) => onCellChange(student.rowIndex, header, value)} />
                              )
                                : header === 'school_class' ? (
                                  <SchoolClassSelect value={student.data[header] || ''} handleSelect={(value) => onCellChange(student.rowIndex, header, value)} />
                                )
                                  : header === 'academic_year' ? (
                                    <AcademicYearSelect value={student.data[header] || ''} handleSelect={(value) => onCellChange(student.rowIndex, header, value)} />
                                  )
                                    : header === 'group_id' ? (
                                      <GroupSelect value={student.data[header] || ''} handleSelect={(value) => onCellChange(student.rowIndex, header, value)} />
                                    )
                                      : <Input
                                        type="text"
                                        value={student.data[header] || ''}
                                        onChange={(e) => onCellChange(student.rowIndex, header, e.target.value)}
                                        className="w-full bg-transparent p-1 border-none focus:ring-offset-0"
                                      />
                          }
                          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onSave} disabled={hasErrors}>
            Lưu {students.length} học sinh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to map school abbreviations to full names
const mapSchoolName = (schoolValue: string): string => {
  if (!schoolValue) return '';
  const upperSchoolValue = schoolValue.toUpperCase().split(' ').join('');
  return SCHOOL_MAPPING[upperSchoolValue] || schoolValue;
};

// Helper function to map CSV data to Student interface
const mapCsvToStudent = (csvRow: Record<string, any>): Partial<Student> => {
  const student: Partial<Student> = {};

  Object.keys(csvRow).forEach(header => {
    const studentField = CSV_TO_STUDENT_MAPPING[header.toLowerCase()];
    if (studentField && csvRow[header]) {
      let value = csvRow[header];

      // Special handling for school field
      if (header.toLowerCase().includes('school') || header.toLowerCase().includes('trường')) {
        value = mapSchoolName(value);
      }

      (student as any)[studentField] = value;
    }
  });

  return student;
};

// Helper function to validate CSV headers
const validateCsvHeaders = (headers: string[]): { valid: boolean; warnings: string[]; errors: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Get all expected headers from mappings
  const expectedStudentHeaders = Object.keys(CSV_TO_STUDENT_MAPPING);
  const expectedDetailHeaders = Object.keys(CSV_TO_STUDENT_DETAIL_MAPPING);
  const allExpectedHeaders = [...expectedStudentHeaders, ...expectedDetailHeaders];

  // Check for required headers (name is required)
  const requiredHeaders = ['name', 'họ và tên', 'tên', 'full_name', 'student_name'];
  const hasRequiredHeader = requiredHeaders.some(header =>
    headers.some(h => h.toLowerCase().trim() === header.toLowerCase().trim())
  );

  if (!hasRequiredHeader) {
    errors.push('Tệp CSV phải có ít nhất một cột chứa tên học sinh (name, họ và tên, tên, full_name, student_name)');
  }

  // Check for unrecognized headers
  const unrecognizedHeaders = headers.filter(header => {
    const normalizedHeader = header.toLowerCase().trim();
    return !allExpectedHeaders.some(expected =>
      expected.toLowerCase().trim() === normalizedHeader
    );
  });

  if (unrecognizedHeaders.length > 0) {
    warnings.push(`Các cột sau sẽ được bỏ qua: ${unrecognizedHeaders.join(', ')}`);
  }

  // Check for duplicate headers (case-insensitive)
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const uniqueHeaders = new Set(normalizedHeaders);
  if (uniqueHeaders.size !== headers.length) {
    errors.push('Tệp CSV có các cột trùng tên (không phân biệt hoa thường)');
  }

  // Check for empty headers
  const emptyHeaders = headers.filter(header => !header.trim());
  if (emptyHeaders.length > 0) {
    errors.push('Tệp CSV có các cột không có tên');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
};

// Helper function to validate a single student row
const validateStudentRow = (
  row: Record<string, any>,
  index: number,
  defaults: {
    school: string;
    grade: string;
    schoolClass: string;
    academicYear: string;
    group: string;
  },
): StudentPreview => {
  const dataWithDefaults = { ...row };
  if (defaults.school) dataWithDefaults['school'] = defaults.school;
  if (defaults.grade) dataWithDefaults['grade'] = defaults.grade;
  if (defaults.schoolClass) dataWithDefaults['school_class'] = defaults.schoolClass;
  if (defaults.academicYear) dataWithDefaults['academic_year'] = defaults.academicYear;
  if (defaults.group) dataWithDefaults['group_id'] = defaults.group;

  // Map CSV data to Student interface for validation
  const mappedData = mapCsvToStudent(dataWithDefaults);
  const validationResult = studentRowSchema.safeParse(mappedData);
  const errors: Record<string, string | null> = {};

  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue: z.ZodIssue) => {
      // Find the original CSV header that maps to this field
      const fieldName = issue.path[0];
      const originalHeader = Object.keys(CSV_TO_STUDENT_MAPPING).find(
        key => CSV_TO_STUDENT_MAPPING[key] === fieldName
      );
      if (originalHeader) {
        errors[originalHeader] = issue.message;
      }
    });
  }

  return {
    data: dataWithDefaults,
    errors,
    rowIndex: index,
  };
};

interface AddStudentCsvFileProps {
  groupId?: number;
  gradeId?: number;
  onStudentAdded?: () => void;
}

export const AddStudentCsvFile = ({ groupId, gradeId, onStudentAdded }: AddStudentCsvFileProps) => {
  const { addMultipleStudents } = useStudent();
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
      transformHeader: (header) => {
        const newHeader = header.toLowerCase().trim();
        return CSV_TO_STUDENT_MAPPING[newHeader] || CSV_TO_STUDENT_DETAIL_MAPPING[newHeader] || newHeader;
      },
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

        // Validate headers first
        const originalHeaders = results.meta.fields || [];
        const headerValidation = validateCsvHeaders(originalHeaders);

        if (!headerValidation.valid) {
          toast.error('Tệp CSV có lỗi trong cấu trúc cột:');
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

        // Transform headers to normalized form
        const transformedData = (results.data as Record<string, any>[]).map((row: Record<string, any>) => {
          const transformedRow: Record<string, any> = {};
          originalHeaders.forEach((header) => {
            const normalizedHeader = header.toLowerCase().trim();
            const mappedHeader = CSV_TO_STUDENT_MAPPING[normalizedHeader] ||
              CSV_TO_STUDENT_DETAIL_MAPPING[normalizedHeader] ||
              normalizedHeader;
            transformedRow[mappedHeader] = row[header];
          });
          return transformedRow;
        });

        // Map the 'school' field in each row using SCHOOL_MAPPING if present
        if (transformedData && Array.isArray(transformedData)) {
          transformedData.forEach((row) => {
            if (row.school && SCHOOL_MAPPING[row.school.toUpperCase().split(' ')[0]]) {
              row.school = SCHOOL_MAPPING[row.school.toUpperCase().split(' ')[0]];
            }
          });
        }

        const previewData = transformedData.map((row, index) =>
          validateStudentRow(row, index, {
            school: selectedSchool || '',
            grade: selectedGrade || '',
            schoolClass: selectedSchoolClass || '',
            academicYear: selectedAcademicYear || '',
            group: selectedGroup || '',
          }),
        );
        setTableHeaders(originalHeaders);
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

    //convert studentsPreview to array of objects to Student interface
    const studentsToSave = studentsPreview.map((s) => {

      let school = undefined;
      if (s.data.school) {
        school = schools.find((schoolItem) => schoolItem.name === s.data.school);
      }

      let grade = undefined;
      if (s.data.grade) {
        grade = grades.find((gradeItem) => gradeItem.name === s.data.grade);
      }

      let schoolClass = undefined;
      if (s.data.school_class) {
        schoolClass = schoolClasses.find((schoolClassItem) => schoolClassItem.name === s.data.school_class);
      }

      let academicYear = undefined;
      if (s.data.academic_year) {
        academicYear = academicYears.find((academicYearItem) => Number(academicYearItem.id) === Number(s.data.academic_year));
      }

      let groupId = undefined;
      if (s.data.group_id) {
        groupId = s.data.group_id;
      }

      return {
        name: s.data.name,
        parent_phone: s.data.parent_phone || undefined,
        student_details: [
          {
            school: school,
            school_class: schoolClass,
            academic_year: academicYear,
            group_id: groupId,
            grade: grade,
            student_id: s.data.id || undefined,
            student_name: s.data.name,
          } as StudentDetail,
        ],
      };
    });

    toast.promise(addMultipleStudents(studentsToSave), {
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
      error: 'Đã xảy ra lỗi khi lưu.',
    });

  };

  // Handler for inline cell editing
  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    setStudentsPreview((currentPreview) => {
      const newPreview = [...currentPreview];
      const studentToUpdate = { ...newPreview[rowIndex] };

      // Store the value directly
      studentToUpdate.data[header] = value;

      // Re-validate the row after edit
      const revalidatedStudent = validateStudentRow(studentToUpdate.data, rowIndex, {
        school: selectedSchool || '',
        grade: selectedGrade || '',
        schoolClass: selectedSchoolClass || '',
        academicYear: selectedAcademicYear || '',
        group: selectedGroup || '',
      });

      newPreview[rowIndex] = revalidatedStudent;
      return newPreview;
    });
  };

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
    <div className="space-y-6 max-h-[500px] overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bước 1: Cấu hình giá trị mặc định (Tùy chọn)</CardTitle>
          <CardDescription>
            Chọn giá trị mặc định sẽ áp dụng cho tất cả học sinh trong tệp. Các cột tương ứng trong
            tệp CSV sẽ bị ghi đè.
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
          <CardTitle>Bước 2: Tải lên và xem trước tệp</CardTitle>
          <CardDescription>
            Tải lên tệp CSV của bạn. Dữ liệu sẽ được hiển thị bên dưới để bạn kiểm tra và chỉnh sửa
            trước khi lưu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn đặt tên cột trong file CSV:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Tên học sinh:</strong> name, họ và tên, tên, full_name, student_name</p>
              <p><strong>Số điện thoại phụ huynh:</strong> parent_phone, số điện thoại phụ huynh, phone, phone_number, parent_phone_number</p>
              <p><strong>Trường học:</strong> school, trường, trường học</p>
              <p className="text-xs mt-2">Các cột không khớp sẽ được bỏ qua. Giá trị trống sẽ được để null.</p>
            </div>
          </div>

          <div className="rounded-md bg-green-50 p-4">
            <h4 className="font-medium text-green-900 mb-2">Hướng dẫn viết tắt tên trường:</h4>
            <div className="text-sm text-green-800 space-y-1">
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
              <p><strong>TDN</strong> → Trường THPT Trần Đại Nghĩa</p>
              <p><strong>NBK</strong> → Trường THPT Nguyễn Bình Khiêm</p>
              <p><strong>TSTD</strong> → Thí Sinh Tự Do</p>
            </div>
          </div>
          <Form {...form}>
            <form id="form-add-student-csv-file" onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Chọn tệp CSV</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Tải lên & Xem trước</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <StudentPreviewTable
        students={studentsPreview}
        headers={tableHeaders}
        onCellChange={handleCellChange}
        onSave={handleSave}
        hasErrors={hasErrors}
      />
    </div>
  );
};
