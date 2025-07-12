import { z } from "zod";

export const studentFormSchema = z.object({
  name: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được quá 100 ký tự"),
  parent_phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Allow empty
      return (
        val.length >= 10 && val.length <= 15 && /^[0-9+\-\s()]+$/.test(val)
      );
    }, "Số điện thoại không hợp lệ"),
  school: z.string().optional(),
  school_class: z.string().optional(),
  academic_year: z.string().optional(),
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
