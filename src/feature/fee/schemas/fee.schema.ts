import { z } from 'zod';

export const FeeSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên phí' }),
  amount: z.coerce.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
  date_range: z.object({
    from: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    to: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
  }).refine((data) => data.to >= data.from, {
    message: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
    path: ["to"],
  }),
  description: z.string().optional(),
});

export type FeeFormData = z.infer<typeof FeeSchema>;