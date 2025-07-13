import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudent } from '@/feature/student/hooks/useStudent';
import { useFee } from '@/hooks/useFee';
import { usePayment } from '@/hooks/usePayment';
import { getCurrentStudentDetail } from '@/lib/student-utils';
import type { PaymentDetail } from '@/types/api.types';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';

const PaymentSchema = z.object({
    fee_id: z.number().min(1, { message: 'Vui lòng chọn loại phí' }),
    student_id: z.number().min(1, { message: 'Vui lòng chọn học sinh' }),
    pay_method: z.string().min(1, { message: 'Vui lòng chọn phương thức thanh toán' }),
    amount: z.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
    description: z.string().optional(),
    have_discount: z.number().min(0, { message: 'Giảm giá không được âm' }),
});

type PaymentFormData = {
    fee_id: number;
    student_id: number;
    pay_method: string;
    amount: number;
    description?: string;
    have_discount: number;
};


interface DialogCreatePaymentProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const DialogCreatePayment = ({ open, onOpenChange }: DialogCreatePaymentProps) => {
    const { handleCreatePaymentDetail, loading, paymentDetails } = usePayment();
    const { fees, handleFetchFees } = useFee();
    const { students, loadStudents } = useStudent();


    const form = useForm<PaymentFormData>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            fee_id: 0,
            student_id: 0,
            pay_method: '',
            amount: 0,
            description: '',
            have_discount: 0,
        },
    });

    // Load fees and students when dialog opens
    useEffect(() => {
        if (open) {
            handleFetchFees();
            loadStudents();
        }
    }, [open, handleFetchFees, loadStudents]);

    // Add validation function to check if student has already paid enough
    const validatePaymentAmount = (studentId: number, feeId: number, newAmount: number, haveDiscount: number) => {
        const selectedFee = fees.find(fee => fee.id === feeId);
        if (!selectedFee) return { isValid: false, message: 'Không tìm thấy thông tin phí' };

        // Get all payments for this student and fee
        const existingPayments = paymentDetails.filter(
            payment => payment.student_id === studentId && payment.fee_id === feeId
        );

        // Calculate total amount already paid (including discounts)
        const totalPaid = existingPayments.reduce((sum, payment) => {
            return sum + payment.amount - haveDiscount;
        }, 0);

        const feeAmount = selectedFee.amount;
        const remainingAmount = feeAmount - totalPaid;

        if (remainingAmount <= 0) {
            return {
                isValid: false,
                message: `Học sinh đã đóng đủ tiền cho loại phí này (${selectedFee.name})`
            };
        }

        if (newAmount > remainingAmount) {
            return {
                isValid: false,
                message: `Số tiền vượt quá mức cần thiết. Còn thiếu: ${remainingAmount.toLocaleString('vi-VN')} VNĐ`
            };
        }

        return { isValid: true, remainingAmount };
    };

    const onSubmit = async (data: PaymentFormData) => {
        try {
            // Validate payment amount
            const validation = validatePaymentAmount(data.student_id, data.fee_id, data.amount, data.have_discount);
            if (!validation.isValid) {
                toast.error(validation.message);
                return;
            }
            const selectedFee = fees.find(fee => fee.id === data.fee_id);
            const selectedStudent = students.find(student => student.id === data.student_id);

            const paymentDetail: PaymentDetail = {
                fee_id: data.fee_id,
                fee_name: selectedFee?.name || '',
                student_id: data.student_id,
                student_name: selectedStudent?.name || '',
                pay_method: data.pay_method,
                amount: data.amount,
                description: data.description || '',
                have_discount: data.have_discount,
            };

            await handleCreatePaymentDetail(paymentDetail);
            if (paymentDetail.id) {
                toast.success('Tạo thanh toán thành công');
            }
        } catch (error) {
            toast.error('Tạo thanh toán thất bại');
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange?.(newOpen);
    };

    // Add real-time validation for amount field
    const handleAmountChange = (value: number, studentId: number, feeId: number, haveDiscount: number) => {
        if (studentId && feeId && value > 0) {
            const validation = validatePaymentAmount(studentId, feeId, value, haveDiscount);
            if (!validation.isValid) {
                form.setError('amount', {
                    type: 'manual',
                    message: validation.message
                });
            } else {
                form.clearErrors('amount');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo thanh toán mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin thanh toán cho học sinh.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Học sinh</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            options={students.map((student) => ({
                                                value: student.id?.toString() || '',
                                                label: student.name + ' - ' +
                                                    (() => {
                                                        const detail = getCurrentStudentDetail(student.student_details || []);
                                                        const schoolName = detail?.school?.name ?? '';
                                                        // Remove "Trường", "THPT", etc., then take first letter of each remaining word
                                                        const words = schoolName
                                                            .split(' ')
                                                            .filter(w => w && !['Trường', 'THPT'].includes(w));
                                                        return words.map(w => w[0]?.toUpperCase() || '').join('');
                                                    })(),
                                            }))}
                                            value={field.value?.toString()}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            placeholder="Chọn học sinh"
                                            searchPlaceholder="Tìm kiếm học sinh..."
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fee_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Loại phí</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn học phí" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent >
                                            {fees.map((fee) => (
                                                <SelectItem key={fee.id} value={fee.id?.toString() || ''}>
                                                    {fee.name} - {fee.amount?.toLocaleString('vi-VN')} VNĐ
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pay_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phương thức thanh toán</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn phương thức thanh toán" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASH">Tiền mặt</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                field.onChange(value);
                                                handleAmountChange(value, form.getValues('student_id'), form.getValues('fee_id'), form.getValues('have_discount'));
                                            }}
                                            placeholder="Nhập số tiền"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="have_discount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giảm giá</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                field.onChange(value);
                                                handleAmountChange(form.getValues('amount'), form.getValues('student_id'), form.getValues('fee_id'), value);
                                            }}
                                            placeholder="Nhập số tiền giảm giá"
                                        />
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
                                        <Textarea {...field} placeholder="Nhập mô tả (tùy chọn)" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    handleOpenChange(false);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Đang tạo...' : 'Tạo thanh toán'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}; 