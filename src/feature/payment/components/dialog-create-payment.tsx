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
import { getCurrentStudentDetail } from '@/lib/student-utils';
import { PaymentDetail, PaymentStatus } from '@/types/api.types';
import { handlePaymentApiError } from '@/utils/payment-utils';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PaymentSummaryCard } from '@/components/common/payment-summary-card';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Plus, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { groupService } from '@/service/group.service';

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
        handleFetchPaymentSummaryByStudentIdAndFeeId,
        handleClearPaymentSummary,
        paymentSummary,
        loading: summaryLoading,
        error: summaryError
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

    // Load fees and students when dialog opens - stabilized dependencies
    useEffect(() => {
        if (open) {
            handleFetchFees();
            loadStudents();
        }
    }, [open]); // Remove function dependencies to prevent re-renders

    console.log('fees', fees);

    // Auto-fill form when dialog opens
    useEffect(() => {
        if (open) {
            form.setValue('due_date', new Date().toISOString().split('T')[0]);
        }
    }, [open]);

    // Fetch group info when student is selected
    useEffect(() => {
        const fetchGroupInfo = async () => {
        if (selectedStudentId > 0) {
            const student = students.find(student => student.id === selectedStudentId);
            if (student) {
                const detail = getCurrentStudentDetail(student.student_details || []);
                if (detail?.group_id) {
                    const group = await groupService.getGroupBasicInfoById(detail.group_id);
                    form.setValue('fee_id', group.fee_id);
                    handleFetchPaymentSummaryByStudentIdAndFeeId(selectedStudentId, group.fee_id);
                }
            }
            }
        };
        fetchGroupInfo();
    }, [selectedStudentId, students]);

    // Set fee_id after group is loaded
    // useEffect(() => {
    //     if (selectedStudentId > 0 && group?.fee_id) {
    //         form.setValue('fee_id', group.fee_id);
    //     }
    // }, [selectedStudentId, group, form]);

    // Fetch payment summary when student and fee are selected
    // useEffect(() => {
    //     if (open && selectedStudentId > 0 && selectedFeeId > 0) {
    //         console.log('Fetching payment summary for student:', selectedStudentId, 'fee:', selectedFeeId);
    //         handleFetchPaymentSummaryByStudentIdAndFeeId(selectedStudentId, selectedFeeId);
    //     }
    // }, [open, selectedStudentId, selectedFeeId, handleFetchPaymentSummaryByStudentIdAndFeeId]);

    // Auto-suggest remaining amount when payment summary changes
    useEffect(() => {
        console.log('Payment summary changed:', paymentSummary);
        if (paymentSummary && !paymentSummary.is_fully_paid && paymentSummary.outstanding_amount > 0) {
            console.log('Setting amount to outstanding:', paymentSummary.outstanding_amount);
            form.setValue('amount', paymentSummary.outstanding_amount);
        } else if (!paymentSummary && selectedFeeId > 0) {
            // New student case - suggest full fee amount
            const selectedFee = fees.find(fee => fee.id === selectedFeeId);
            if (selectedFee) {
                console.log('Setting amount to full fee:', selectedFee.amount);
                form.setValue('amount', selectedFee.amount);
            }
        }
    }, [paymentSummary, selectedFeeId, fees, form]);


    const onSubmit = async (data: PaymentFormData) => {
        try {
            // Check if payment should be prevented - student already fully paid
            if (paymentSummary && paymentSummary.is_fully_paid) {
                toast.error('Không thể tạo thanh toán vì học sinh đã thanh toán đủ phí này');
                return;
            }

            // Check if amount exceeds remaining balance for existing students
            if (paymentSummary && paymentSummary.outstanding_amount > 0 && data.amount > paymentSummary.outstanding_amount) {
                toast.error(`Số tiền không được vượt quá ${paymentSummary.outstanding_amount.toLocaleString('vi-VN')} VNĐ (số tiền còn thiếu)`);
                return;
            }

            // For new students, check against full fee amount
            if (!paymentSummary) {
                const selectedFee = fees.find(fee => fee.id === data.fee_id);
                if (selectedFee && data.amount > selectedFee.amount) {
                    toast.error(`Số tiền không được vượt quá ${selectedFee.amount.toLocaleString('vi-VN')} VNĐ (tổng phí)`);
                    return;
                }
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
                due_date: selectedFee.end_time,
                generated_amount: selectedFee.amount,
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
            // Clear payment summary state when closing
            handleClearPaymentSummary();
            console.log('Dialog closed, clearing state');
        }
        onOpenChange?.(newOpen);
    };


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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                                            paymentSummary={paymentSummary}
                                            isLoading={summaryLoading}
                                        />
                                    );
                                })()}
                            </div>
                        )}

                        {/* Simple validation error for API issues */}
                        {summaryError && (
                            <div className="col-span-2">
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Lỗi kiểm tra</AlertTitle>
                                    <AlertDescription>{summaryError}</AlertDescription>
                                </Alert>
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
                                            }}
                                            placeholder="Nhập số tiền"
                                            disabled={paymentSummary?.is_fully_paid}
                                        />
                                        
                                    </FormControl>
                                    {paymentSummary?.is_fully_paid && (
                                            <p className="text-xs text-gray-500">
                                                Học sinh đã thanh toán đủ phí này
                                            </p>
                                        )}
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
                                            // min={format(new Date(), 'dd/MM/yyyy')}
                                            data-date-format="dd/MM/yyyy"
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
                                disabled={loading || (paymentSummary ? paymentSummary.is_fully_paid : false)}
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
