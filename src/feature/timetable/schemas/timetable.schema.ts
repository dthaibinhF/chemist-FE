import { z } from "zod";

// Schedule form validation schema
export const scheduleFormSchema = z.object({
  group_id: z.number().min(1, "Vui lòng chọn nhóm học"),
  start_time: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  end_time: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  delivery_mode: z.string().min(1, "Vui lòng chọn hình thức học"),
  meeting_link: z.string().url("Link meeting phải là URL hợp lệ").optional().or(z.literal("")),
  teacher_id: z.number().min(1, "Vui lòng chọn giáo viên"),
  room_id: z.number().min(1, "Vui lòng chọn phòng học"),
}).refine((data) => {
  // Parse datetime strings for comparison
  const startDate = new Date(data.start_time);
  const endDate = new Date(data.end_time);
  return endDate > startDate;
}, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["end_time"],
});

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

// Timetable filter schema
export const timetableFilterSchema = z.object({
  groupId: z.number().optional(),
  teacherId: z.number().optional(),
  roomId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  deliveryMode: z.string().optional(),
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

// Bulk schedule generation schema
export const bulkScheduleGenerationSchema = z.object({
  generation_mode: z.enum(['selected-groups', 'all-groups', 'next-week', 'auto-trigger']),
  group_ids: z.array(z.number()).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
}).refine((data) => {
  // For selected-groups and all-groups modes, dates and groups are required
  if (data.generation_mode === 'selected-groups') {
    return data.group_ids && data.group_ids.length > 0 && data.start_date && data.end_date;
  }
  if (data.generation_mode === 'all-groups') {
    return data.start_date && data.end_date;
  }
  // For next-week and auto-trigger, no additional validation needed
  return true;
}, {
  message: "Vui lòng điền đầy đủ thông tin theo chế độ được chọn",
  path: ["generation_mode"],
}).refine((data) => {
  // Validate date range
  if (data.start_date && data.end_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
  path: ["end_date"],
});

export type BulkScheduleGenerationData = z.infer<typeof bulkScheduleGenerationSchema>;