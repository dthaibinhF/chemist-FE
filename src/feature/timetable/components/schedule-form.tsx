import React, { useEffect, useState } from "react";
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

import { groupService } from "@/service/group.service";
import { roomService } from "@/service/room.service";
import type { Group, Room, Teacher, Schedule } from "@/types/api.types";
import { scheduleFormSchema, type ScheduleFormData } from "../schemas/timetable.schema";

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teachers] = useState<Teacher[]>([]); // TODO: Add teacher service
  const [loadingOptions, setLoadingOptions] = useState(true);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      group_id: initialData?.group_id || 0,
      start_time: initialData?.start_time || new Date(),
      end_time: initialData?.end_time || new Date(),
      delivery_mode: initialData?.delivery_mode || "",
      meeting_link: initialData?.meeting_link || "",
      teacher_id: initialData?.teacher?.account?.id || 0,
      room_id: initialData?.room?.id || 0,
    },
  });

  // Load options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [groupsData, roomsData] = await Promise.all([
          groupService.getAllGroups(),
          roomService.getAllRooms(),
        ]);
        
        setGroups(groupsData);
        setRooms(roomsData);
      } catch (error) {
        console.error("Lỗi khi tải danh sách:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  if (loadingOptions) {
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
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
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
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng học" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id?.toString() || ""}>
                        {room.name} - {room.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giáo viên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.account?.id?.toString() || ""}>
                        {teacher.account?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectTrigger>
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
              <FormItem>
                <FormLabel>Thời gian bắt đầu</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeLocal(field.value)}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
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
              <FormItem>
                <FormLabel>Thời gian kết thúc</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeLocal(field.value)}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
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