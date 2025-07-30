import { z } from 'zod';

export const FeeSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên phí' }),
  amount: z.coerce.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  description: z.string().optional(),
});

export type FeeFormData = z.infer<typeof FeeSchema>;