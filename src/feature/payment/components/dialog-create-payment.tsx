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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStudent } from '@/feature/student/hooks/useStudent';
import { useFee } from '@/hooks/useFee';
import { usePayment } from '@/hooks/usePayment';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { getCurrentStudentDetail } from '@/lib/student-utils';
import type { PaymentWithSummaryUpdateDTO, PaymentStatus } from '@/types/api.types';
import { validatePaymentAmounts, validatePaymentForm, handlePaymentApiError } from '@/utils/payment-utils';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Plus, DollarSign, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AcademicYearSelect from '@/components/features/academic-year-select';
import GroupSelect from '@/components/features/group-select';

const PaymentSchema = z.object({
    fee_id: z.number().min(1, { message: 'Vui lòng chọn loại phí' }),
    student_id: z.number().min(1, { message: 'Vui lòng chọn học sinh' }),
    pay_method: z.string().min(1, { message: 'Vui lòng chọn phương thức thanh toán' }),
    amount: z.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
    description: z.string().optional(),
    have_discount: z.number().min(0, { message: 'Giảm giá không được âm' }),
    academic_year_id: z.number().min(1, { message: 'Vui lòng chọn năm học' }),
    group_id: z.number().min(1, { message: 'Vui lòng chọn nhóm học' }),
    due_date: z.string().min(1, { message: 'Vui lòng chọn hạn thanh toán' }),
    payment_status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']),
});

type PaymentFormData = z.infer<typeof PaymentSchema>;


interface DialogCreatePaymentProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const DialogCreatePayment = ({ open, onOpenChange }: DialogCreatePaymentProps) => {
    const { handleCreatePaymentDetail, loading } = usePayment();
    const {
        paymentSummaries,
        handleFetchPaymentSummariesByStudent,
        formatCurrency,
        getPaymentStatusIcon
    } = useStudentPaymentSummary();
    const { fees, handleFetchFees } = useFee();
    const { students, loadStudents, selectedStudent, loadStudent } = useStudent();
    const [selectedStudentSummaries, setSelectedStudentSummaries] = useState<any[]>([]);
    const [paymentPreview, setPaymentPreview] = useState<{
        remainingAmount: number;
        newStatus: PaymentStatus;
        isValid: boolean;
        message?: string;
    } | null>(null);

    const studentdetail = selectedStudent?.student_details?.filter(detail => detail.end_at === null)[0];

    const form = useForm<PaymentFormData>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            fee_id: 0,
            student_id: 0,
            pay_method: '',
            amount: 0,
            description: '',
            have_discount: 0,
            academic_year_id: studentdetail?.academic_year?.id || 0,
            group_id: studentdetail?.group_id || 0,
            due_date: '',
            payment_status: 'PENDING',
        },
    });

    // Load fees and students when dialog opens
    useEffect(() => {
        if (open) {
            handleFetchFees();
            loadStudents();
        }
    }, [open, handleFetchFees, loadStudents]);

    useEffect(() => {
        if (form.watch('student_id') && form.watch('student_id') > 0) {
            loadStudent(form.watch('student_id')!);
        }
    }, [form.watch('student_id')]);

    // Load student payment summaries when student is selected
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'student_id' && value.student_id && value.student_id > 0) {
                handleFetchPaymentSummariesByStudent(value.student_id);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, handleFetchPaymentSummariesByStudent]);

    // Update selected student summaries when paymentSummaries change
    useEffect(() => {
        setSelectedStudentSummaries(paymentSummaries);
    }, [paymentSummaries]);

    // Auto-fill form when studentdetail changes
    useEffect(() => {
        if (studentdetail && selectedStudent) {
            form.setValue('academic_year_id', studentdetail.academic_year?.id || 0);
            form.setValue('group_id', studentdetail.group_id || 0);
            form.setValue('due_date', new Date().toISOString().split('T')[0]);
        }
    }, [studentdetail, selectedStudent, form]);

    // Enhanced validation function using payment summaries and utility functions
    const validatePaymentAmount = (studentId: number, feeId: number, newAmount: number, haveDiscount: number) => {
        const selectedFee = fees.find(fee => fee.id === feeId);
        if (!selectedFee) return { isValid: false, message: 'Không tìm thấy thông tin phí' };

        // First validate the payment constraint using utility functions
        const generatedAmount = newAmount + haveDiscount;
        const amountValidation = validatePaymentAmounts(newAmount, haveDiscount, generatedAmount);

        if (!amountValidation.isValid) {
            return {
                isValid: false,
                message: amountValidation.message
            };
        }

        // Find existing payment summary for this student and fee
        const existingSummary = selectedStudentSummaries.find(
            summary => summary.student_id === studentId && summary.fee_id === feeId
        );

        if (!existingSummary) {
            // No existing payment obligation - this might be a new obligation
            return {
                isValid: true,
                remainingAmount: selectedFee.amount,
                newStatus: newAmount >= selectedFee.amount ? 'PAID' : 'PARTIAL'
            };
        }

        const remainingAmount = existingSummary.outstanding_amount;

        if (remainingAmount <= 0) {
            return {
                isValid: false,
                message: `Học sinh đã đóng đủ tiền cho loại phí này (${selectedFee.name})`
            };
        }

        if (newAmount > remainingAmount) {
            return {
                isValid: false,
                message: `Số tiền vượt quá mức cần thiết. Còn thiếu: ${formatCurrency(remainingAmount)}`
            };
        }

        // Determine new payment status
        let newStatus: PaymentStatus = 'PARTIAL' as PaymentStatus;
        if (newAmount >= remainingAmount) {
            newStatus = 'PAID' as PaymentStatus;
        } else if (existingSummary.total_amount_paid + newAmount > 0) {
            newStatus = 'PARTIAL' as PaymentStatus;
        } else {
            newStatus = 'PENDING' as PaymentStatus;
        }

        return {
            isValid: true,
            remainingAmount: remainingAmount - newAmount,
            newStatus
        };
    };

    const onSubmit = async (data: PaymentFormData) => {
        try {
            // Validate payment amount
            const validation = validatePaymentAmount(data.student_id, data.fee_id, data.amount, data.have_discount);
            if (!validation.isValid) {
                toast.error(validation.message);
                return;
            }

            // Additional validation using utility functions
            const generatedAmount = data.amount + data.have_discount;
            const formValidation = validatePaymentForm({
                fee_id: data.fee_id,
                student_id: data.student_id,
                generated_amount: generatedAmount,
                have_discount: data.have_discount,
                amount: data.amount,
                payment_status: validation?.newStatus || data.payment_status,
                due_date: data.due_date,
            });

            if (formValidation) {
                toast.error(formValidation);
                return;
            }

            const selectedFee = fees.find(fee => fee.id === data.fee_id);
            const selectedStudent = students.find(student => student.id === data.student_id);

            // Create enhanced payment with summary update
            const paymentWithSummaryUpdate: PaymentWithSummaryUpdateDTO = {
                fee_id: data.fee_id,
                fee_name: selectedFee?.name || '',
                student_id: data.student_id,
                student_name: selectedStudent?.name || '',
                pay_method: data.pay_method,
                amount: data.amount,
                description: data.description || '',
                have_discount: data.have_discount,
                payment_status: validation?.newStatus as PaymentStatus || data.payment_status,
                due_date: new Date(data.due_date),
                generated_amount: data.amount + data.have_discount, // Following constraint: amount + have_discount = generated_amount
                is_overdue: new Date(data.due_date) < new Date(),
                academicYearId: data.academic_year_id,
                groupId: data.group_id,
            };

            await handleCreatePaymentDetail(paymentWithSummaryUpdate);

            toast.success('Tạo thanh toán và cập nhật hóa đơn thành công');
            form.reset();
            onOpenChange?.(false);

            // Refresh payment summaries
            if (data.student_id) {
                handleFetchPaymentSummariesByStudent(data.student_id);
            }

        } catch (error) {
            console.error('Payment creation error:', error);
            const friendlyError = handlePaymentApiError(error);
            toast.error(friendlyError);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
            setPaymentPreview(null);
            setSelectedStudentSummaries([]);
        }
        onOpenChange?.(newOpen);
    };

    // Enhanced real-time validation and preview
    const handleAmountChange = (value: number, studentId: number, feeId: number, haveDiscount: number) => {
        if (studentId && feeId && value > 0) {
            const validation = validatePaymentAmount(studentId, feeId, value, haveDiscount);

            if (!validation.isValid) {
                form.setError('amount', {
                    type: 'manual',
                    message: validation.message
                });
                setPaymentPreview(null);
            } else {
                form.clearErrors('amount');
                setPaymentPreview({
                    remainingAmount: validation.remainingAmount || 0,
                    newStatus: validation.newStatus as PaymentStatus || 'PENDING',
                    isValid: true
                });
            }
        } else {
            setPaymentPreview(null);
        }
    };

    // Get existing payment summary for selected student and fee
    const getExistingPaymentSummary = () => {
        const studentId = form.watch('student_id');
        const feeId = form.watch('fee_id');

        if (!studentId || !feeId) return null;

        return selectedStudentSummaries.find(
            summary => summary.student_id === studentId && summary.fee_id === feeId
        );
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-2 gap-4 w-full">
                        {/* Payment Summary Preview */}
                        {getExistingPaymentSummary() && (
                            <Alert className="col-span-2">
                                <DollarSign className="h-4 w-4" />
                                <AlertTitle>Thông tin hóa đơn hiện tại</AlertTitle>
                                <AlertDescription>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        <div>Tổng phí: {formatCurrency(getExistingPaymentSummary()!.total_amount_due)}</div>
                                        <div>Đã đóng: {formatCurrency(getExistingPaymentSummary()!.total_amount_paid)}</div>
                                        <div>Còn lại: {formatCurrency(getExistingPaymentSummary()!.outstanding_amount)}</div>
                                        <div>
                                            Trạng thái:
                                            <Badge variant="outline" className="ml-1">
                                                {getPaymentStatusIcon(getExistingPaymentSummary()!.payment_status)}
                                                {getExistingPaymentSummary()!.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Payment Preview */}
                        {paymentPreview && paymentPreview.isValid && (
                            <Alert className="col-span-2">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Xem trước thanh toán</AlertTitle>
                                <AlertDescription>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        <div>Số tiền còn lại sau thanh toán: {formatCurrency(paymentPreview.remainingAmount)}</div>
                                        <div>
                                            Trạng thái mới:
                                            <Badge
                                                variant={paymentPreview.newStatus === 'PAID' ? 'default' : 'secondary'}
                                                className="ml-1"
                                            >
                                                {getPaymentStatusIcon(paymentPreview.newStatus)} {paymentPreview.newStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
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
                                <FormItem className="col-span-2 ">
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
                                                <SelectValue placeholder="Chọn phương thức" className='text' />
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
                            name="academic_year_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Năm học</FormLabel>
                                    <FormControl>
                                        <AcademicYearSelect value={field.value.toString()} handleSelect={(value) => field.onChange(Number(value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="group_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nhóm học</FormLabel>
                                    <FormControl>
                                        <GroupSelect value={field.value.toString()} handleSelect={(value) => field.onChange(Number(value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hạn thanh toán</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            min={new Date().toISOString().split('T')[0]}
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
                                <FormItem className='col-span-2'>
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