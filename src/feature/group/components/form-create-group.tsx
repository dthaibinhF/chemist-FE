import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { DataSelect } from '@/components/common/data-select';
import { FeeSelect } from '@/components/features/fee-select';
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
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGrade } from '@/hooks';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useFee } from '@/hooks/useFee';
import type { Group } from '@/types/api.types';

import { useGroup } from '@/hooks/useGroup';
import { FormAddGroupSchedule } from './form-add-group-schedule';

// Days of the week for the select dropdown
const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const GroupSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên nhóm' }),
  level: z.enum(['REGULAR', 'ADVANCED', 'VIP'], {
    message: 'Hãy chọn loại nhóm',
  }),
  fee_id: z.number().min(1, { message: 'Hãy chọn học phí' }),
  academic_year_id: z.number().min(1, { message: 'Hãy chọn năm học' }),
  grade_id: z.number().min(1, { message: 'Hãy chọn khối lớp' }),
  group_schedules: z.array(
    z.object({
      day_of_week: z.enum(daysOfWeek, { message: 'Hãy chọn ngày trong tuần' }),
      start_time: z.iso.time({ precision: -1 }),
      end_time: z.iso.time({ precision: -1 }),
    })
  ),
});

export const FormCreateGroup = () => {
  const { handleCreateGroup, loading } = useGroup();
  const { grades, handleFetchGrades, loading: loadingGrades } = useGrade();
  const { fees, handleFetchFees, loading: loadingFees } = useFee();
  const {
    academicYears,
    handleFetchAcademicYears,
    loading: loadingAcademicYears,
  } = useAcademicYear();

  useEffect(() => {
    handleFetchGrades();
    handleFetchAcademicYears();
    handleFetchFees();
  }, [handleFetchGrades, handleFetchAcademicYears, handleFetchFees]);

  const form = useForm<z.infer<typeof GroupSchema>>({
    resolver: zodResolver(GroupSchema),
    defaultValues: {
      name: '',
      level: 'REGULAR',
      fee_id: 0,
      academic_year_id: 0,
      grade_id: 0,
      group_schedules: [
        {
          day_of_week: 'MONDAY',
          start_time: '00:00',
          end_time: '00:00',
        },
      ],
    },
  });

  const handleCreateGroupForm = async (data: z.infer<typeof GroupSchema>) => {
    try {
      const newGroup: Partial<Group> = {
        name: data.name,
        level: data.level,
        fee_id: data.fee_id,
        academic_year_id: data.academic_year_id,
        grade_id: data.grade_id,
        group_schedules: data.group_schedules.map((schedule) => ({
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        })),
      };
      await handleCreateGroup(newGroup as Group);
      toast.success('Tạo nhóm thành công');
    } catch (error) {
      toast.error('Tạo nhóm thất bại');
      console.log(error);
    }
  };

  if (loading && loadingGrades && loadingAcademicYears && loadingFees) {
    // nên sử dụng toast aka sooner
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateGroupForm)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên nhóm</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập tên nhóm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại nhóm</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn loại nhóm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="REGULAR">Thường</SelectItem>
                          <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm học</FormLabel>
                  <FormControl>
                    <DataSelect
                      items={academicYears}
                      labelKey="year"
                      valueKey="id"
                      defaultValue={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn năm học"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khối lớp</FormLabel>
                  <FormControl>
                    <DataSelect
                      items={grades}
                      labelKey="name"
                      valueKey="id"
                      defaultValue={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn khối lớp"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="fee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Học phí</FormLabel>
                <FormControl>
                  <FeeSelect
                    onSelect={(fee) => field.onChange(fee.id)}
                    value={fees.find((fee) => fee.id === field.value)?.id?.toString()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Group Schedules */}
          <FormAddGroupSchedule
            control={form.control}
            name="group_schedules"
            fields={form.watch('group_schedules')}
          />
          <Button type="submit">Tạo nhóm</Button>
        </form>
      </Form>
    </div>
  );
};
