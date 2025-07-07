import { z } from 'zod';

export const studentFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  parent_phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  school: z.string().optional(),
  grade: z.string().optional(),
  group: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

export const studentSearchSchema = z.object({
  search: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  group: z.string().optional(),
});

export type StudentSearchData = z.infer<typeof studentSearchSchema>;
