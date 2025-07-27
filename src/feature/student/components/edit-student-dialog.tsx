import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Building, Calendar, Edit, GraduationCap, Loader2, Phone, User, Users } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import SchoolSelect from '@/components/features/school-select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AcademicYear,
  SchoolClass,
  academicYearService,
  gradeService,
  groupService,
  schoolClassService,
  type Grade,
  type Group,
  type School,
} from '@/service';

import type { Student } from '@/types/api.types';
import { studentFormSchema, type StudentFormData } from '../schemas/student.schema';
import { useSchool } from '@/hooks/useSchool';

// Type for mapped data that matches API structure
interface MappedStudentData extends Omit<StudentFormData, 'school' | 'grade' | 'academic_year' | 'school_class' | 'group'> {
  student_details: Array<{
    school?: School | null;
    grade?: Grade;
    group_id?: number;
    academic_year?: AcademicYear;
    school_class?: SchoolClass;
  }>;
}

interface EditStudentDialogProps {
  student: Student;
  onEditStudent: (id: number, formData: MappedStudentData) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const EditStudentDialog = memo(
  ({ student, onEditStudent, open, onOpenChange }: EditStudentDialogProps) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = typeof open === 'boolean' && typeof onOpenChange === 'function';
    const dialogOpen = isControlled ? open : internalOpen;
    const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;
    const { handleFetchSchool, school } = useSchool();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<StudentFormData>({
      resolver: zodResolver(studentFormSchema),
      defaultValues: {
        name: '',
        parent_phone: '',
        school: '',
        grade: '',
        group: '',
        academic_year: '',
        school_class: '',
      },
    });

    // Memoize loadAllData function
    const loadAllData = useCallback(async () => {
      try {
        setLoading(true);
        const [gradesData, groupsData, academicYearsData, schoolClassesData] =
          await Promise.all([
            gradeService.getAllGrades(),
            groupService.getAllGroups(),
            academicYearService.getAllAcademicYears(),
            schoolClassService.getAllSchoolClasses(),
          ]);
        setGrades(gradesData);
        setGroups(groupsData);
        setAcademicYears(academicYearsData);
        setSchoolClasses(schoolClassesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }, []);

    // Load data khi dialog mở
    useEffect(() => {
      if (dialogOpen) {
        loadAllData();
      }
    }, [dialogOpen, loadAllData]);

    // Cập nhật form khi student thay đổi
    useEffect(() => {
      if (student && dialogOpen) {
        const studentDetail = student.student_details?.[0];
        form.reset({
          name: student.name ?? '',
          parent_phone: student.parent_phone ?? '',
          school: studentDetail?.school?.id?.toString() ?? '',
          grade: studentDetail?.grade?.id?.toString() ?? '',
          group: studentDetail?.group_id?.toString() ?? '',
          academic_year: studentDetail?.academic_year?.id?.toString() ?? '',
          school_class: studentDetail?.school_class?.id?.toString() ?? '',
        });
      }
    }, [student, dialogOpen, form]);

    const handleClose = useCallback(() => {
      setDialogOpen(false);
      form.reset();
    }, [form, setDialogOpen]);

    const handleSchoolSelect = (value: string) => {
      form.setValue('school', value);
      handleFetchSchool(Number(value));
    };

    const onSubmit = useCallback(
      async (data: StudentFormData) => {
        try {
          setSubmitting(true);
          console.log('data-school', data.school)

          // Map form data to match API structure
          const mappedData: MappedStudentData = {
            name: data.name,
            parent_phone: data.parent_phone,
            student_details: [{
              ...student.student_details?.[0],
              school: data.school ? school : undefined,
              grade: data.grade ? grades.find(g => g.id?.toString() === data.grade) : undefined,
              group_id: data.group ? parseInt(data.group) : undefined,
              academic_year: data.academic_year ? academicYears.find(ay => ay.id?.toString() === data.academic_year) : undefined,
              school_class: data.school_class ? schoolClasses.find(sc => sc.id?.toString() === data.school_class) : undefined,
            }]
          };

          console.log('mappedData', mappedData);
          await onEditStudent(student.id!, mappedData);
          handleClose();
        } catch (error) {
          console.error('Error editing student:', error);
        } finally {
          setSubmitting(false);
        }
      },
      [onEditStudent, student.id, handleClose, school, grades, groups, academicYears, schoolClasses]
    );

    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {!isControlled && (
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Chỉnh sửa học sinh
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cập nhật thông tin học sinh <span className="font-medium">{student.name}</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Thông tin cá nhân
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Họ tên *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập họ tên học sinh"
                            {...field}
                            disabled={submitting}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          SĐT Phụ huynh
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập số điện thoại"
                            {...field}
                            disabled={submitting}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* School Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building className="h-4 w-4" />
                  Thông tin trường học
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Trường học
                        </FormLabel>
                        <FormControl>
                          <SchoolSelect value={field.value} handleSelect={handleSchoolSelect} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Khối
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loading || submitting} className="h-10">
                              <SelectValue placeholder={loading ? 'Đang tải...' : 'Chọn khối'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade.id} value={grade.id?.toString() ?? ''}>
                                {grade.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="school_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Lớp
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loading || submitting} className="h-10">
                              <SelectValue placeholder={loading ? 'Đang tải...' : 'Chọn lớp'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolClasses.map((sc) => (
                              <SelectItem key={sc.id} value={sc.id?.toString() ?? ''}>
                                {sc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Academic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Thông tin học tập
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="academic_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Năm học
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loading || submitting} className="h-10">
                              <SelectValue
                                placeholder={loading ? 'Đang tải...' : 'Chọn năm học'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((ay) => (
                              <SelectItem key={ay.id} value={ay.id?.toString() ?? ''}>
                                {ay.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Nhóm học
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={loading || submitting} className="h-10">
                              <SelectValue
                                placeholder={loading ? 'Đang tải...' : 'Chọn nhóm học'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.id?.toString() ?? ''}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                  className="min-w-[100px]"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || loading}
                  className="min-w-[120px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);

EditStudentDialog.displayName = 'EditStudentDialog';
