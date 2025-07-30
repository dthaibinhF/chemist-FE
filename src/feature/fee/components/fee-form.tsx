import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { FeeSchema, type FeeFormData } from '../schemas/fee.schema';

interface FeeFormProps {
  mode: 'create' | 'edit';
  initialData?: Fee;
  onSuccess: () => void;
}

export const FeeForm = ({ mode, initialData, onSuccess }: FeeFormProps) => {
  const { handleCreateFee, handleUpdateFee, loading } = useFee();

  const form = useForm<FeeFormData>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      name: initialData?.name || '',
      amount: initialData?.amount || 0,
      start_time: initialData?.start_time ? new Date(initialData.start_time) : new Date(),
      end_time: initialData?.end_time ? new Date(initialData.end_time) : new Date(),
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: FeeFormData) => {
    try {
      if (mode === 'create') {
        await handleCreateFee(data as Fee);
        toast.success('Tạo phí thành công');
      } else {
        if (!initialData?.id) return;
        await handleUpdateFee(initialData.id, data as Fee);
        toast.success('Cập nhật phí thành công');
      }
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(mode === 'create' ? 'Tạo phí thất bại' : 'Cập nhật phí thất bại');
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
          {loading
            ? (mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...')
            : (mode === 'create' ? 'Tạo phí' : 'Cập nhật phí')
          }
        </Button>
      </form>
    </Form>
  );
};