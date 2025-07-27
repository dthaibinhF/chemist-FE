import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSalary } from '@/hooks';
import type { Teacher, SalaryType } from '@/types/api.types';
import { Edit, Save, X, DollarSign, Clock } from 'lucide-react';

const salaryConfigSchema = z.object({
  salaryType: z.enum(['PER_LESSON', 'FIXED'] as const, {
    required_error: 'Vui lòng chọn loại lương',
  }),
  baseRate: z.string().min(1, 'Vui lòng nhập mức lương cơ bản').refine(
    (val) => {
      const num = parseFloat(val.replace(/[,\s]/g, ''));
      return !isNaN(num) && num > 0;
    },
    'Mức lương phải là số dương'
  ),
});

interface SalaryConfigCardProps {
  teacher: Teacher | null;
  onConfigUpdate?: () => void;
}

export const SalaryConfigCard = ({ teacher, onConfigUpdate }: SalaryConfigCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { handleUpdateTeacherSalaryConfig, configLoading, configError } = useSalary();

  const form = useForm<z.infer<typeof salaryConfigSchema>>({
    resolver: zodResolver(salaryConfigSchema),
    defaultValues: {
      salaryType: teacher?.salary_type as SalaryType || 'PER_LESSON',
      baseRate: teacher?.base_rate ? teacher.base_rate.toString() : '',
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getSalaryTypeLabel = (type: SalaryType) => {
    return type === 'PER_LESSON' ? 'Theo buổi học' : 'Lương cố định';
  };

  const getSalaryTypeIcon = (type: SalaryType) => {
    return type === 'PER_LESSON' ? <Clock className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />;
  };

  const handleEdit = () => {
    if (teacher) {
      form.reset({
        salaryType: teacher.salary_type as SalaryType || 'PER_LESSON',
        baseRate: teacher.base_rate ? teacher.base_rate.toString() : '',
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof salaryConfigSchema>) => {
    if (!teacher?.id) return;

    try {
      const baseRate = parseFloat(values.baseRate.replace(/[,\s]/g, ''));

      await handleUpdateTeacherSalaryConfig(teacher.id, {
        salaryType: values.salaryType as SalaryType,
        baseRate: baseRate,
      });

      toast.success('Cập nhật cấu hình lương thành công');
      setIsEditing(false);
      onConfigUpdate?.();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật cấu hình lương');
    }
  };

  if (!teacher) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cấu hình lương
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vui lòng chọn giáo viên để xem cấu hình lương</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cấu hình lương
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            {/* Display Mode */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Giáo viên</label>
                <p className="text-lg font-semibold">
                  {teacher.account.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Loại lương</label>
                <div className="flex items-center gap-2 mt-1">
                  {getSalaryTypeIcon(teacher.salary_type as SalaryType || 'PER_LESSON')}
                  <Badge variant={teacher.salary_type === 'PER_LESSON' ? 'default' : 'secondary'}>
                    {getSalaryTypeLabel(teacher.salary_type as SalaryType || 'PER_LESSON')}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {teacher.salary_type === 'PER_LESSON' ? 'Mức lương / buổi' : 'Lương cố định / tháng'}
                </label>
                <p className="text-xl font-bold text-green-600">
                  {teacher.base_rate ? formatCurrency(teacher.base_rate) : 'Chưa thiết lập'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Giáo viên</label>
                  <p className="text-lg font-semibold">
                    {teacher.account.name}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="salaryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại lương</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PER_LESSON" id="per-lesson" />
                            <label htmlFor="per-lesson" className="flex items-center gap-2 cursor-pointer">
                              <Clock className="h-4 w-4" />
                              <span>Theo buổi học</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FIXED" id="fixed" />
                            <label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer">
                              <DollarSign className="h-4 w-4" />
                              <span>Lương cố định</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch('salaryType') === 'PER_LESSON'
                          ? 'Mức lương / buổi (VNĐ)'
                          : 'Lương cố định / tháng (VNĐ)'
                        }
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ví dụ: 500,000"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            const formatted = Number(value).toString();
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {configError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {configError}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={configLoading} className="flex-1">
                    {configLoading ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </CardContent>
    </Card>
  );
};