import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoomSelect from "@/components/features/room-select";
import TeacherSelect from "@/components/features/teacher-select";

import type { Schedule } from "@/types/api.types";
import { scheduleFormSchema, type ScheduleFormData } from "../schemas/timetable.schema";
import {
  formatApiDateTimeForInput,
} from "@/utils/timezone-utils";
import { useGroup } from "@/hooks/useGroup";
import { toast } from "sonner";

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  initialData?: Schedule | null;
  loading?: boolean;
  onCancel: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
  onCancel,
}) => {
  const { groups, handleFetchGroups, loading: loadingGroups } = useGroup();

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      group_id: initialData?.group_id || 0,
      start_time: initialData?.start_time ? formatApiDateTimeForInput(initialData.start_time) : "",
      end_time: initialData?.end_time ? formatApiDateTimeForInput(initialData.end_time) : "",
      delivery_mode: initialData?.delivery_mode || "",
      meeting_link: initialData?.meeting_link || "",
      teacher_id: initialData?.teacher_id || 0,
      room_id: initialData?.room?.id || 0,
    },
  });

  // Load options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        await handleFetchGroups();
      } catch (error) {
        toast.error("Lỗi khi tải danh sách nhóm");
      }
    };

    loadOptions();
  }, []);

  // Reset form when initialData changes (when schedule data loads)
  useEffect(() => {
    if (initialData) {
      console.log('Resetting form with new data:', initialData);
      // Use setTimeout to prevent rapid form resets that can cause DOM issues
      const timeoutId = setTimeout(() => {
        form.reset({
          group_id: initialData.group_id || 0,
          start_time: initialData.start_time ? formatApiDateTimeForInput(initialData.start_time) : "",
          end_time: initialData.end_time ? formatApiDateTimeForInput(initialData.end_time) : "",
          delivery_mode: initialData.delivery_mode || "",
          meeting_link: initialData.meeting_link || "",
          teacher_id: initialData.teacher_id || 0,
          room_id: initialData.room?.id || 0,
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [initialData, form]);

  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
    }
  };

  if (loadingGroups) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-sm text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Group Selection */}
          <FormField
            control={form.control}
            name="group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhóm học</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn nhóm học" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id?.toString() || ""}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room Selection */}
          <FormField
            control={form.control}
            name="room_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phòng học</FormLabel>
                <FormControl>
                  <RoomSelect
                    handleSelect={(value) => field.onChange(value)}
                    value={field.value}
                    placeholder="Chọn phòng học"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teacher Selection */}
          <FormField
            control={form.control}
            name="teacher_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giáo viên</FormLabel>
                <FormControl>
                  <TeacherSelect
                    handleSelect={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    placeholder="Chọn giáo viên"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delivery Mode */}
          <FormField
            control={form.control}
            name="delivery_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hình thức học</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn hình thức" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OFFLINE">Trực tiếp</SelectItem>
                    <SelectItem value="ONLINE">Trực tuyến</SelectItem>
                    <SelectItem value="HYBRID">Kết hợp</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Time */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Thời gian bắt đầu</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Time */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Thời gian kết thúc</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Meeting Link */}
        <FormField
          control={form.control}
          name="meeting_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link meeting (tùy chọn)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo lịch học"}
          </Button>
        </div>
      </form>
    </Form>
  );
};