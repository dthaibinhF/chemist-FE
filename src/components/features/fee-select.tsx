import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useFee } from '@/hooks/useFee';
import type { Fee } from '@/types/api.types';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface FeeSelectProps {
  onSelect: (fee: Fee) => void;
  value?: string;
}

const FeeSchema = z.object({
  name: z.string().min(1, { message: 'Hãy nhập tên học phí' }),
  amount: z.string().min(1, { message: 'Hãy nhập số tiền' }),
  description: z.string().optional(),
});

export const FeeSelect = ({
  onSelect,
  value,
}: FeeSelectProps) => {
  const { fees, handleFetchFees, loading, handleCreateFee } = useFee();
  const [isNewFeeDialogOpen, setIsNewFeeDialogOpen] = useState(false);
  const [creatingFee, setCreatingFee] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(value || '');

  const feeForm = useForm<z.infer<typeof FeeSchema>>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      name: '',
      amount: '',
      description: '',
    },
  });

  useEffect(() => {
    if (fees.length === 0 && loading) {
      handleFetchFees();
    }
  }, [fees, handleFetchFees]);

  useEffect(() => {
    if (value) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelectValue = (value: string) => {
    if (value === 'new') {
      setIsNewFeeDialogOpen(true);
      return;
    }

    setSelectedValue(value);
    const selectedFee = fees.find((fee) => fee.id?.toString() === value);
    if (selectedFee) {
      onSelect(selectedFee);
    }
  };

  const handleCreateNewFee = async (data: z.infer<typeof FeeSchema>) => {
    try {
      setCreatingFee(true);
      const newFee: Partial<Fee> = {
        name: data.name,
        amount: parseFloat(data.amount),
        description: data.description || '',
        start_time: new Date(),
        end_time: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      };

      await handleCreateFee(newFee as Fee);
      toast.success('Tạo học phí mới thành công');
      setIsNewFeeDialogOpen(false);
      feeForm.reset();
      handleFetchFees();
    } catch (error) {
      toast.error('Không thể tạo học phí mới');
      console.error(error);
    } finally {
      setCreatingFee(false);
    }
  };

  return (
    <div>
      <Select onValueChange={handleSelectValue} value={selectedValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn học phí" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="-1">Không chọn</SelectItem>
            {fees.map((fee) => (
              <SelectItem key={fee.id} value={fee.id?.toString() ?? ''}>
                {fee.name} - {fee.amount?.toLocaleString('vi-VN')} VNĐ
              </SelectItem>
            ))}
            <SelectItem value="new" className="text-primary font-medium">
              + Tạo học phí mới...
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Dialog open={isNewFeeDialogOpen} onOpenChange={setIsNewFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo học phí mới</DialogTitle>
          </DialogHeader>
          <Form {...feeForm}>
            <form onSubmit={feeForm.handleSubmit(handleCreateNewFee)} className="space-y-4">
              <FormField
                control={feeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên học phí</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên học phí" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={feeForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Nhập số tiền" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={feeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập mô tả" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewFeeDialogOpen(false)}
                  disabled={creatingFee}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={creatingFee || loading}>
                  {creatingFee ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo học phí'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
