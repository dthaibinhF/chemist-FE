import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { useFee } from '@/hooks/useFee';
import type { Fee } from '@/types/api.types';

const FeeSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên phí' }),
  amount: z.coerce.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  description: z.string().optional(),
});

interface FormEditFeeProps {
  setOpen: (open: boolean) => void;
  fee: Fee;
}

export const FormEditFee = ({ setOpen, fee }: FormEditFeeProps) => {
  const { handleUpdateFee, loading } = useFee();

  const form = useForm<z.infer<typeof FeeSchema>>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      name: fee.name,
      amount: fee.amount,
      start_time: new Date(fee.start_time),
      end_time: new Date(fee.end_time),
      description: fee.description || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FeeSchema>) => {
    try {
      if (!fee.id) return;
      await handleUpdateFee(fee.id, data as Fee);
      toast.success('Cập nhật phí thành công');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Cập nhật phí thất bại');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên phí</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nhập tên phí" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày bắt đầu</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value.toISOString().split('T')[0]} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày kết thúc</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value.toISOString().split('T')[0]} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nhập mô tả" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật phí'}
        </Button>
      </form>
    </Form>
  );
};
