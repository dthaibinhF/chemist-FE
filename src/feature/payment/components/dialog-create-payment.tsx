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
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { usePaymentDuplicateCheck } from '@/hooks/usePaymentDuplicateCheck';
import { getCurrentStudentDetail } from '@/lib/student-utils';
import { PaymentDetail, PaymentStatus } from '@/types/api.types';
import { handlePaymentApiError } from '@/utils/payment-utils';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { shouldPreventSubmission, suggestPaymentAmount } from '@/utils/payment-duplicate-validation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaymentSummaryCard } from '@/components/common/payment-summary-card';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Plus, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const PaymentSchema = z.object({
    fee_id: z.number().min(1, { message: 'Vui lòng chọn loại phí' }),
    student_id: z.number().min(1, { message: 'Vui lòng chọn học sinh' }),
    pay_method: z.string().min(1, { message: 'Vui lòng chọn phương thức thanh toán' }),
    amount: z.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
    description: z.string().optional(),
    have_discount: z.number().min(0, { message: 'Giảm giá không được âm' }),
    due_date: z.string().min(1, { message: 'Vui lòng chọn hạn thanh toán' }),
});

type PaymentFormData = z.infer<typeof PaymentSchema>;

interface DialogCreatePaymentProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const DialogCreatePayment = ({ open, onOpenChange }: DialogCreatePaymentProps) => {
    const { handleCreatePaymentDetail, loading } = usePayment();
    const {
        handleFetchPaymentSummariesByStudent,
    } = useStudentPaymentSummary();
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
            due_date: '',
        },
    });

    const selectedStudentId = form.watch('student_id');
    const selectedFeeId = form.watch('fee_id');
    
    const { validationResult, isValidating, error: validationError } = usePaymentDuplicateCheck({
        studentId: selectedStudentId,
        feeId: selectedFeeId,
        enabled: open && selectedStudentId > 0 && selectedFeeId > 0
    });

    // Load fees and students when dialog opens - stabilized dependencies
    useEffect(() => {
        if (open) {
            handleFetchFees();
            loadStudents();
        }
    }, [open]); // Remove function dependencies to prevent re-renders


    // Auto-fill form when dialog opens
    useEffect(() => {
        if (open) {
            form.setValue('due_date', new Date().toISOString().split('T')[0]);
        }
    }, [open]);

    // Auto-suggest remaining amount when validation result changes
    useEffect(() => {
        if (validationResult && !validationResult.isFullyPaid && validationResult.remainingAmount > 0) {
            const suggestedAmount = suggestPaymentAmount(validationResult);
            if (suggestedAmount > 0) {
                form.setValue('amount', suggestedAmount);
            }
        }
    }, [validationResult, form]);


    const onSubmit = async (data: PaymentFormData) => {
        try {
            // Check if payment should be prevented
            if (validationResult && shouldPreventSubmission(validationResult)) {
                toast.error('Không thể tạo thanh toán vì học sinh đã thanh toán đủ phí này');
                return;
            }

            // Check if amount exceeds remaining balance
            if (validationResult && validationResult.remainingAmount > 0 && data.amount > validationResult.remainingAmount) {
                toast.error(`Số tiền không được vượt quá ${validationResult.remainingAmount.toLocaleString('vi-VN')} VNĐ (số tiền còn thiếu)`);
                return;
            }

            const selectedFee = fees.find(fee => fee.id === data.fee_id);
            const selectedStudent = students.find(student => student.id === data.student_id);

            if (!selectedFee || !selectedStudent) {
                toast.error('Vui lòng chọn học sinh và loại phí hợp lệ');
                return;
            }

            // Create simple payment detail
            const paymentDetail: Omit<PaymentDetail, 'id'> = {
                fee_id: data.fee_id,
                fee_name: selectedFee.name,
                student_id: data.student_id,
                student_name: selectedStudent.name,
                pay_method: data.pay_method,
                amount: data.amount,
                description: data.description || '',
                have_discount: data.have_discount,
                payment_status: PaymentStatus.PENDING, // Let backend determine the actual status
                due_date: new Date(data.due_date),
                generated_amount: data.amount + data.have_discount,
                is_overdue: false, // Let backend determine this
            };

            await handleCreatePaymentDetail(paymentDetail as PaymentDetail);

            toast.success('Tạo thanh toán thành công');
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
            // Reset form to default values
            form.reset({
                fee_id: 0,
                student_id: 0,
                pay_method: '',
                amount: 0,
                description: '',
                have_discount: 0,
                due_date: '',
            });
        }
        onOpenChange?.(newOpen);
    };

    // console.log('validationResult', validationResult);


    return (
        <Dialog key={open ? 'open' : 'closed'} open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {
                    onOpenChange 
                    ? null
                    : <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
                </Button>
                }
                
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
                                                    {fee.name} - {formatCurrencyVND(fee.amount || 0)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Payment Summary Card */}
                        {selectedStudentId > 0 && selectedFeeId > 0 && (
                            <div className="col-span-2">
                                {(() => {
                                    const selectedFee = fees.find(fee => fee.id === selectedFeeId);
                                    if (!selectedFee) return null;
                                    
                                    return (
                                        <PaymentSummaryCard
                                            fee={selectedFee}
                                            totalPaid={validationResult?.totalPaid || 0}
                                            remainingAmount={validationResult?.remainingAmount || selectedFee.amount}
                                            existingPayments={validationResult?.existingPayments || []}
                                            isLoading={isValidating}
                                        />
                                    );
                                })()}
                            </div>
                        )}

                        {/* Payment Validation Alert */}
                        {(validationResult || isValidating || validationError) && (
                            <div className="col-span-2">
                                {isValidating && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Đang kiểm tra...</AlertTitle>
                                        <AlertDescription>
                                            Đang kiểm tra trạng thái thanh toán cho học sinh và phí đã chọn.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {validationError && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Lỗi kiểm tra</AlertTitle>
                                        <AlertDescription>{validationError}</AlertDescription>
                                    </Alert>
                                )}
                                
                                {validationResult && validationResult.message && (
                                    <Alert variant={validationResult.severity === 'error' ? 'destructive' : 'default'}>
                                        {validationResult.severity === 'error' && <AlertTriangle className="h-4 w-4" />}
                                        {validationResult.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                        {validationResult.severity === 'info' && <CheckCircle className="h-4 w-4" />}
                                        
                                        <AlertTitle>
                                            {validationResult.isFullyPaid && 'Đã thanh toán đủ'}
                                            {!validationResult.isFullyPaid && validationResult.totalPaid > 0 && 'Đã thanh toán một phần'}
                                            {validationResult.totalPaid === 0 && validationResult.existingPayments.length > 0 && 'Có thanh toán chờ xử lý'}
                                        </AlertTitle>
                                        
                                        <AlertDescription>
                                            <div className="space-y-1">
                                                <p>{validationResult.message}</p>
                                                {validationResult.existingPayments.length > 0 && (
                                                    <p className="text-xs">
                                                        Có {validationResult.existingPayments.length} khoản thanh toán liên quan.
                                                    </p>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

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
                            render={({ field }) => {
                                const currentAmount = field.value;
                                const remainingAmount = validationResult?.remainingAmount || 0;
                                const isExceedingLimit = currentAmount > remainingAmount && remainingAmount > 0;
                                
                                return (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            <span>Số tiền</span>
                                            {validationResult && remainingAmount > 0 && (
                                                <span className="text-xs text-muted-foreground">
                                                    Tối đa: {formatCurrencyVND(remainingAmount)}
                                                </span>
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        field.onChange(value);
                                                    }}
                                                    placeholder="Nhập số tiền"
                                                    className={isExceedingLimit ? 'border-red-500 focus:border-red-500' : ''}
                                                />
                                                {isExceedingLimit && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        {isExceedingLimit && (
                                            <div className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Vượt quá số tiền còn thiếu ({formatCurrencyVND(remainingAmount)})
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
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
                            <Button 
                                type="submit" 
                                disabled={loading || (validationResult ? shouldPreventSubmission(validationResult) : false)}
                            >
                                {loading ? 'Đang tạo...' : 'Tạo thanh toán'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}; 