import { z } from "zod";

// Schedule form validation schema
export const scheduleFormSchema = z.object({
  group_id: z.number().min(1, "Vui lòng chọn nhóm học"),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  delivery_mode: z.string().min(1, "Vui lòng chọn hình thức học"),
  meeting_link: z.string().url("Link meeting phải là URL hợp lệ").optional().or(z.literal("")),
  teacher_id: z.number().min(1, "Vui lòng chọn giáo viên"),
  room_id: z.number().min(1, "Vui lòng chọn phòng học"),
}).refine((data) => data.end_time > data.start_time, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["end_time"],
});

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

// Timetable filter schema
export const timetableFilterSchema = z.object({
  group_id: z.number().optional(),
  teacher_id: z.number().optional(),
  room_id: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  delivery_mode: z.string().optional(),
});

export type TimetableFilterData = z.infer<typeof timetableFilterSchema>;

// Search schema
export const timetableSearchSchema = z.object({
  search: z.string().optional(),
  group_name: z.string().optional(),
  teacher_name: z.string().optional(),
  room_name: z.string().optional(),
});

export type TimetableSearchData = z.infer<typeof timetableSearchSchema>;