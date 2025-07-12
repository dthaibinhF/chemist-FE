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

export const FormCreateFee = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const { handleCreateFee, loading } = useFee();

  const form = useForm<z.infer<typeof FeeSchema>>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      name: '',
      amount: 0,
      start_time: new Date(),
      end_time: new Date(),
      description: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FeeSchema>) => {
    try {
      await handleCreateFee(data as Fee);
      toast.success('Tạo phí thành công');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Tạo phí thất bại');
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
          {loading ? 'Đang tạo...' : 'Tạo phí'}
        </Button>
      </form>
    </Form>
  );
};
