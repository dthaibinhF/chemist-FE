import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import SchoolSelect from '@/components/features/school-select';
import { Button } from '@/components/ui/button';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GroupList } from '@/service';
import { gradeService, groupService } from '@/service';
import type { Grade, Student } from '@/types/api.types';

import { toast } from 'sonner';
import { useStudent } from '../hooks';
import { StudentFormData, studentFormSchema } from '../schemas/student.schema';

interface FormAddStudentProps {
  groupId?: number;
  gradeId?: number;
}

export const FormAddStudent = ({ groupId, gradeId }: FormAddStudentProps) => {
  const { addStudent } = useStudent();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [groups, setGroups] = useState<GroupList[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      parent_phone: '',
      school: '',
      grade: gradeId?.toString() || '',
      group: groupId?.toString() || '',
      academic_year: '',
      school_class: '',
    },
  });

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [gradesData, groupsData] = await Promise.all([
        gradeService.getAllGrades(),
        groupService.getAllGroups(),
      ]);
      setGrades(gradesData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onSubmit = useCallback(
    async (data: StudentFormData) => {
      try {
        setSubmitting(true);
        // Map form data to match API structure (student_details)
        const mappedStudent: Student = {
          name: data.name,
          parent_phone: data.parent_phone,
          student_details: [
            {
              ...(data.school ? { school: grades.find(g => g.id?.toString() === data.school) } : {}),
              ...(data.grade ? { grade: grades.find(g => g.id?.toString() === data.grade) } : {}),
              ...(data.group ? { group_id: Number(data.group) } : {}),
              ...(data.academic_year ? { academic_year: grades.find(g => g.id?.toString() === data.academic_year) } : {}),
              ...(data.school_class ? { school_class: grades.find(g => g.id?.toString() === data.school_class) } : {}),
            },
          ] as Partial<import('@/types/api.types').StudentDetail>[],
        };
        await addStudent(mappedStudent);
        toast.success('Thêm học sinh thành công');
        // form.reset();
      } catch (error) {
        toast.error('Thêm học sinh thất bại');
      } finally {
        setSubmitting(false);
      }
    },
    [addStudent, form, grades]
  );

  const handleSchoolSelect = (value: string) => {
    form.setValue('school', value);
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form id="form-add-student" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Họ tên *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập họ tên học sinh"
                      className="h-10"
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">SĐT Phụ huynh *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      className="h-10"
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">Trường</FormLabel>
                  <FormControl>
                    <SchoolSelect value={field.value} handleSelect={handleSchoolSelect} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">Khối</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-10" disabled={loading || submitting}>
                        <SelectValue placeholder={loading ? 'Đang tải...' : 'Chọn khối'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Khối lớp - nếu ôn thi hãy chọn TSTD</SelectLabel>
                        {grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id?.toString() ?? ''}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">Nhóm học</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-10" disabled={loading || submitting}>
                        <SelectValue placeholder={loading ? 'Đang tải...' : 'Chọn nhóm học'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Danh sách nhóm học hiện tại</SelectLabel>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id?.toString() ?? ''}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => form.reset()}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting || loading} className="min-w-[120px]">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                'Thêm học sinh'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
