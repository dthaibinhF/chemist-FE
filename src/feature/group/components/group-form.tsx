import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { useGroup } from '@/hooks/useGroup';
import type { Group, GroupSchedule } from '@/types/api.types';

import { FormAddGroupSchedule } from './form-add-group-schedule';
import {
  GroupCreateSchema,
  GroupEditSchema,
  type GroupEditFormData,
} from '../schemas/group.schema';

interface GroupFormProps {
  mode: 'create' | 'edit';
  initialData?: Group;
  onSuccess: () => void;
}

export const GroupForm = ({ mode, initialData, onSuccess }: GroupFormProps) => {
  const { handleCreateGroup, handleUpdateGroup, loading: loadingGroup } = useGroup();
  const { grades, handleFetchGrades, loading: loadingGrades } = useGrade();
  const { fees, handleFetchFees, loading: loadingFees } = useFee();
  const {
    academicYears,
    handleFetchAcademicYears,
    loading: loadingAcademicYears,
  } = useAcademicYear();

  // Convert group schedules to form format
  const convertSchedulesToForm = (schedules?: GroupSchedule[]) => {
    if (!schedules || schedules.length === 0) {
      return [
        {
          id: mode === 'edit' ? 0 : undefined,
          day_of_week: 'MONDAY' as const,
          start_time: '08:00:00',
          end_time: '10:00:00',
          room_id: 0,
        },
      ];
    }

    return schedules.map((schedule) => {
      // Properly handle room_id - use room_id first, then fallback to room.id
      let roomId = 0;
      if (schedule.room_id) {
        roomId = schedule.room_id;
      } else if (schedule.room_name) {
        roomId = schedule?.room_id || 0;
      }

      return {
        ...(mode === 'edit' && { id: schedule.id || 0 }),
        day_of_week: schedule.day_of_week as any,
        // GroupSchedule times are already in Vietnam local time (LocalTimeString)
        // No conversion needed - use as-is
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        room_id: roomId,
      };
    });
  };

  const schema = mode === 'create' ? GroupCreateSchema : GroupEditSchema;
  const form = useForm<any>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: initialData?.name || '',
      level: initialData?.level || 'REGULAR',
      fee_id: initialData?.fee_id || 0,
      academic_year_id: initialData?.academic_year_id || 0,
      grade_id: initialData?.grade_id || 0,
      group_schedules: convertSchedulesToForm(initialData?.group_schedules),
    },
  });

  useEffect(() => {
    handleFetchGrades();
    handleFetchAcademicYears();
    handleFetchFees();
  }, [handleFetchGrades, handleFetchAcademicYears, handleFetchFees]);

  const handleSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        const newGroup: Partial<Group> = {
          name: data.name,
          level: data.level,
          fee_id: data.fee_id,
          academic_year_id: data.academic_year_id,
          grade_id: data.grade_id,
          group_schedules: data.group_schedules.map((schedule: any) => ({
            day_of_week: schedule.day_of_week,
            // GroupSchedule times should remain in Vietnam local time (LocalTimeString)
            // No conversion needed - send as-is
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            room_id: schedule.room_id,
          })),
        };
        await handleCreateGroup(newGroup as Group);
        toast.success('Tạo nhóm thành công');
        form.reset();
      } else {
        const editData = data as GroupEditFormData;
        const updatedGroup: Partial<Group> = {
          ...initialData,
          name: editData.name,
          level: editData.level,
          fee_id: editData.fee_id,
          academic_year_id: editData.academic_year_id,
          grade_id: editData.grade_id,
          group_schedules: editData.group_schedules.map((schedule) => ({
            id: schedule.id || 0,
            day_of_week: schedule.day_of_week,
            // GroupSchedule times should remain in Vietnam local time (LocalTimeString)
            // No conversion needed - send as-is
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            room_id: schedule.room_id,
          })),
        };
        await handleUpdateGroup(initialData!.id as number, updatedGroup as Group);
        toast.success('Cập nhật nhóm thành công');
      }
      onSuccess();
    } catch (error) {
      const errorMessage = mode === 'create' ? 'Tạo nhóm thất bại' : 'Cập nhật nhóm thất bại';
      toast.error(errorMessage);
      console.log(error);
    }
  };

  if (loadingGroup || loadingGrades || loadingAcademicYears || loadingFees) {
    return <div className="flex space-x-1 justify-center items-center">
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>;
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại nhóm</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
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
            control={form.control as any}
            name="group_schedules"
            fields={form.watch('group_schedules')}
          />
          <Button type="submit" disabled={loadingGroup}>
            {loadingGroup ? 'Đang xử lý...' : (mode === 'create' ? 'Tạo nhóm' : 'Cập nhật nhóm')}
          </Button>
        </form>
      </Form>
    </div>
  );
};