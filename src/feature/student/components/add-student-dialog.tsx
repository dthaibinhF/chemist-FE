import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
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
import {
  gradeService,
  groupService,
  type Grade,
  type GroupList,
} from '@/service';
import type { Student } from '@/types/api.types';

import { useStudent } from '../hooks';
import { studentFormSchema, type StudentFormData } from '../schemas/student.schema';

export const AddStudentDialog = memo(() => {
  const { addStudent } = useStudent();
  const [isOpen, setIsOpen] = useState(false);
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
      grade: '',
      group: '',
    },
  });

  // Memoize loadAllData function
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

  // Load data khi dialog mở
  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, loadAllData]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    form.reset();
  }, [form]);

  const handleSchoolSelect = (value: string) => {
    form.setValue('school', value);
  };

  const onSubmit = useCallback(
    async (data: StudentFormData) => {
      try {
        setSubmitting(true);
        await addStudent(data as unknown as Student);
        handleClose();
      } catch (error) {
        console.error('Error adding student:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [addStudent, handleClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm học sinh mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm học sinh mới</DialogTitle>
          <DialogDescription>Điền thông tin học sinh mới vào form bên dưới.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ tên học sinh" {...field} disabled={submitting} />
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
                    <FormLabel>SĐT Phụ huynh *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Trường</FormLabel>
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
                  <FormItem className="w-full">
                    <FormLabel>Khối</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full" disabled={loading || submitting}>
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
                name="group"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nhóm học</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full" disabled={loading || submitting}>
                          <SelectValue placeholder={loading ? 'Đang tải...' : 'Chọn nhóm học'} />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting || loading} className="min-w-[100px]">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm học sinh'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

AddStudentDialog.displayName = 'AddStudentDialog';
