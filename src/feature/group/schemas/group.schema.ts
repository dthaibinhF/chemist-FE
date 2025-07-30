import { z } from 'zod/v4';

// Days of the week constant
export const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

// Base group schedule schema
const GroupScheduleBaseSchema = z.object({
  day_of_week: z.enum(daysOfWeek, { message: 'Hãy chọn ngày trong tuần' }),
  start_time: z.string().min(1, { message: 'Hãy chọn thời gian bắt đầu' }),
  end_time: z.string().min(1, { message: 'Hãy chọn thời gian kết thúc' }),
  room_id: z.number().min(1, { message: 'Hãy chọn phòng học' }),
});

// Group schedule schema for create (no id field)
export const GroupScheduleCreateSchema = GroupScheduleBaseSchema;

// Group schedule schema for edit (optional id field)
export const GroupScheduleEditSchema = GroupScheduleBaseSchema.extend({
  id: z.number().optional(),
});

// Base group schema
const GroupBaseSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên nhóm' }),
  level: z.enum(['REGULAR', 'ADVANCED', 'VIP'], {
    message: 'Hãy chọn loại nhóm',
  }),
  fee_id: z.number().min(1, { message: 'Hãy chọn học phí' }),
  academic_year_id: z.number().min(1, { message: 'Hãy chọn năm học' }),
  grade_id: z.number().min(1, { message: 'Hãy chọn khối lớp' }),
});

// Group schema for create
export const GroupCreateSchema = GroupBaseSchema.extend({
  group_schedules: z.array(GroupScheduleCreateSchema),
});

// Group schema for edit
export const GroupEditSchema = GroupBaseSchema.extend({
  group_schedules: z.array(GroupScheduleEditSchema),
});

// Export the main schema (for backward compatibility)
export const GroupSchema = GroupCreateSchema;

// Type exports
export type GroupCreateFormData = z.infer<typeof GroupCreateSchema>;
export type GroupEditFormData = z.infer<typeof GroupEditSchema>;
export type GroupFormData = GroupCreateFormData | GroupEditFormData;