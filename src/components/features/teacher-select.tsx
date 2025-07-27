import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTeacher } from '@/hooks/useTeacher';
import { SalaryType, type Teacher } from '@/types/api.types';

interface TeacherSelectProps {
  handleSelect: (value: string) => void;
  value?: string;
  placeholder?: string;
  className?: string;
}

const TeacherSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên giáo viên' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  phone: z.string().min(1, { message: 'Hãy nhập số điện thoại' }),
});

const TeacherSelect: FC<TeacherSelectProps> = ({
  handleSelect,
  value,
  placeholder = "Chọn giáo viên",
  className = "w-full"
}) => {
  const { teachers, loading, handleFetchTeachers, handleCreateTeacher } = useTeacher();
  const [selectedValue, setSelectedValue] = useState<string>(value || '');
  const [isNewTeacherDialogOpen, setIsNewTeacherDialogOpen] = useState(false);
  const [creatingTeacher, setCreatingTeacher] = useState(false);

  const teacherForm = useForm<z.infer<typeof TeacherSchema>>({
    resolver: zodResolver(TeacherSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    handleFetchTeachers();
  }, [handleFetchTeachers]);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const options = [
    { value: 'none', label: 'Không chọn' },
    ...teachers.map((teacher: Teacher) => ({
      value: teacher.id?.toString() ?? '',
      label: teacher.account?.name || 'Chưa có tên',
    })),
    { value: 'new', label: '+ Tạo giáo viên mới...' },
  ];

  const handleChange = (val: string) => {
    if (val === 'new') {
      setIsNewTeacherDialogOpen(true);
      return;
    }
    setSelectedValue(val);
    handleSelect(val);
  };

  const handleCreateNewTeacher = async (data: z.infer<typeof TeacherSchema>) => {
    try {
      setCreatingTeacher(true);
      const newTeacher: Teacher = {
        account: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role_id: 2, // Teacher role ID hardcoded as requested
          role_name: 'TEACHER',
        },
        teacher_details: [],
        salary_type: SalaryType.PER_LESSON,
        base_rate: 0,
        monthly_summaries: [],
      };

      await handleCreateTeacher(newTeacher);
      toast.success('Tạo giáo viên mới thành công');
      setIsNewTeacherDialogOpen(false);
      teacherForm.reset();
      handleFetchTeachers();
    } catch (error) {
      console.error('Lỗi khi tạo giáo viên:', error);
      toast.error('Không thể tạo giáo viên mới');
    } finally {
      setCreatingTeacher(false);
    }
  };

  if (loading) {
    return (
      <SearchableSelect
        options={[{ value: 'loading', label: 'Đang tải...' }]}
        value="loading"
        onValueChange={() => { }}
        placeholder="Đang tải giáo viên..."
        searchPlaceholder="Đang tải..."
        className={className}
        disabled
      />
    );
  }

  return (
    <div>
      <SearchableSelect
        options={options}
        value={selectedValue}
        onValueChange={handleChange}
        placeholder={placeholder}
        searchPlaceholder="Tìm kiếm giáo viên..."
        className={className}
      />

      <Dialog open={isNewTeacherDialogOpen} onOpenChange={setIsNewTeacherDialogOpen}>
        <DialogContent aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>Tạo giáo viên mới</DialogTitle>
            <DialogDescription id="dialog-description" className="text-sm text-muted-foreground">
              Điền thông tin để tạo giáo viên mới
            </DialogDescription>
          </DialogHeader>
          <Form {...teacherForm}>
            <form onSubmit={teacherForm.handleSubmit(handleCreateNewTeacher)} className="space-y-4">
              <FormField
                control={teacherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên giáo viên</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên giáo viên" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Nhập email giáo viên" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teacherForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập số điện thoại" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewTeacherDialogOpen(false)}
                  disabled={creatingTeacher}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={creatingTeacher}>
                  {creatingTeacher ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo giáo viên'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherSelect;