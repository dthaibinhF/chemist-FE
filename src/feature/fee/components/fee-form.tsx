import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { vi } from 'date-fns/locale';

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
      date_range: {
        from: initialData?.start_time ? new Date(initialData.start_time) : new Date(),
        to: initialData?.end_time ? new Date(initialData.end_time) : new Date(),
      },
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: FeeFormData) => {
    try {
      if (mode === 'create') {
        await handleCreateFee({
          name: data.name,
          amount: data.amount,
          start_time: data.date_range.from,
          end_time: data.date_range.to,
          description: data.description,
          payment_details: [],
        } as Fee);
        toast.success('Tạo phí thành công');
      } else {
        if (!initialData?.id) return;
        await handleUpdateFee(initialData.id, {
          name: data.name,
          amount: data.amount,
          start_time: data.date_range.from,
          end_time: data.date_range.to,
          description: data.description,
          payment_details: [],
        } as Fee);
        toast.success('Cập nhật phí thành công');
      }
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(mode === 'create' ? 'Tạo phí thất bại' : 'Cập nhật phí thất bại');
    }
  };
  const formatDateDisplay = (date: Date | undefined): string => {
    if (!date) return "Chọn ngày";
    return format(date, "dd/MM/yyyy", { locale: vi });
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
          name="date_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Thời gian áp dụng</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          `${formatDateDisplay(field.value.from)} - ${formatDateDisplay(field.value.to)}`
                        ) : (
                          formatDateDisplay(field.value.from)
                        )
                      ) : (
                        "Chọn khoảng thời gian"
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="range"
                    defaultMonth={field.value?.from}
                    selected={field.value}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  // disabled={(date) =>
                  //   date < new Date(new Date().setHours(0, 0, 0, 0))
                  // }
                  />
                </PopoverContent>
              </Popover>
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