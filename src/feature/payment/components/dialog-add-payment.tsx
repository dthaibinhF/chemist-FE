import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudent } from '@/feature/student/hooks/useStudent';
import { useFee } from '@/hooks/useFee';
import { usePayment } from '@/hooks/usePayment';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { useGroup } from '@/hooks/useGroup';
import { useAppDispatch } from '@/redux/hook';
import { createPaymentDetail } from '@/redux/slice/payment.slice';
import { updateSummaryAfterPayment } from '@/redux/slice/student-payment-summary.slice';
import { getCurrentStudentDetail } from '@/lib/student-utils';
import type { PaymentDetail, StudentPaymentSummary } from '@/types/api.types';
import { PaymentStatus } from '@/types/api.types';
import { validatePaymentAmounts, calculateFinalAmount, validatePaymentForm, handlePaymentApiError } from '@/utils/payment-utils';
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { useEffect, useState } from 'react';

const EnhancedPaymentSchema = z.object({
  fee_id: z.number().min(1, { message: 'Vui lòng chọn loại phí' }),
  student_id: z.number().min(1, { message: 'Vui lòng chọn học sinh' }),
  pay_method: z.string().min(1, { message: 'Vui lòng chọn phương thức thanh toán' }),
  amount: z.number().min(1, { message: 'Số tiền phải lớn hơn 0' }),
  description: z.string().optional(),
  have_discount: z.number().min(0, { message: 'Giảm giá không được âm' }),
  group_id: z.number().min(1, { message: 'Vui lòng chọn nhóm học' }),
  academic_year_id: z.number().min(1, { message: 'Vui lòng chọn năm học' }),
  due_date: z.string().min(1, { message: 'Vui lòng chọn hạn thanh toán' }),
});

type EnhancedPaymentFormData = z.infer<typeof EnhancedPaymentSchema>;

interface DialogAddPaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (payment: any) => void;
  preselectedStudentId?: number;
  preselectedFeeId?: number;
}

export const DialogAddPayment = ({
  open,
  onOpenChange,
  onSuccess,
  preselectedStudentId,
  preselectedFeeId
}: DialogAddPaymentProps) => {
  const dispatch = useAppDispatch();
  const { loading } = usePayment();
  const {
    paymentSummaries,
    handleFetchPaymentSummariesByStudent,
    formatCurrency,
    getPaymentStatusIcon,
    calculateCompletionPercentage
  } = useStudentPaymentSummary();
  const { fees, handleFetchFees } = useFee();
  const { students, loadStudents } = useStudent();
  const { handleFetchGroups } = useGroup();

  const [selectedPaymentSummary, setSelectedPaymentSummary] = useState<StudentPaymentSummary | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<{
    remainingAmount: number;
    newStatus: PaymentStatus;
    completionRate: number;
    isValid: boolean;
    message?: string;
  } | null>(null);

  const form = useForm<EnhancedPaymentFormData>({
    resolver: zodResolver(EnhancedPaymentSchema),
    defaultValues: {
      fee_id: preselectedFeeId || 0,
      student_id: preselectedStudentId || 0,
      pay_method: '',
      amount: 0,
      description: '',
      have_discount: 0,
      group_id: 0,
      academic_year_id: 0,
      due_date: '',
    },
    mode: 'onChange',
  });

  // Load initial data
  useEffect(() => {
    if (open) {
      handleFetchFees();
      loadStudents();
      handleFetchGroups();
    }
  }, [open, handleFetchFees, loadStudents, handleFetchGroups]);

  // Load student payment summaries when student is selected
  useEffect(() => {
    const studentId = form.watch('student_id');
    if (studentId && studentId > 0) {
      handleFetchPaymentSummariesByStudent(studentId);
    }
  }, [form.watch('student_id'), handleFetchPaymentSummariesByStudent]);

  // Find relevant payment summary when student and fee are selected
  useEffect(() => {
    const studentId = form.watch('student_id');
    const feeId = form.watch('fee_id');

    if (studentId && feeId && paymentSummaries.length > 0) {
      const summary = paymentSummaries.find(
        s => s.student_id === studentId && s.fee_id === feeId
      );
      setSelectedPaymentSummary(summary || null);

      // Auto-fill group and academic year if found
      if (summary) {
        form.setValue('group_id', summary.group_id);
        form.setValue('academic_year_id', summary.academic_year_id);
      }
    } else {
      setSelectedPaymentSummary(null);
    }
  }, [form.watch('student_id'), form.watch('fee_id'), paymentSummaries, form]);

  // Calculate payment preview with enhanced validation
  const calculatePaymentPreview = (amount: number, discount: number) => {
    if (!selectedPaymentSummary || amount <= 0) {
      setPaymentPreview(null);
      return;
    }

    // First validate the payment amounts using utility functions
    const generatedAmount = amount + discount;
    const amountValidation = validatePaymentAmounts(amount, discount, generatedAmount);
    
    if (!amountValidation.isValid) {
      setPaymentPreview({
        remainingAmount: 0,
        newStatus: PaymentStatus.PENDING,
        completionRate: 0,
        isValid: false,
        message: amountValidation.message
      });
      return;
    }

    const netAmount = amount; // Final amount after discount is already calculated
    const remainingAmount = Math.max(0, selectedPaymentSummary.outstanding_amount - netAmount);
    const newTotalPaid = selectedPaymentSummary.total_amount_paid + netAmount;
    const completionRate = calculateCompletionPercentage(newTotalPaid, selectedPaymentSummary.total_amount_due);

    let newStatus: PaymentStatus = PaymentStatus.PARTIAL;
    let isValid = true;
    let message = '';

    if (netAmount > selectedPaymentSummary.outstanding_amount) {
      isValid = false;
      message = `Số tiền vượt quá mức cần thiết. Còn thiếu: ${formatCurrency(selectedPaymentSummary.outstanding_amount)}`;
    } else if (remainingAmount === 0) {
      newStatus = PaymentStatus.PAID;
    } else if (newTotalPaid > 0) {
      newStatus = PaymentStatus.PARTIAL;
    } else {
      newStatus = PaymentStatus.PENDING;
    }

    setPaymentPreview({
      remainingAmount,
      newStatus,
      completionRate,
      isValid,
      message
    });
  };

  // Handle amount and discount changes
  const handleAmountChange = (value: number) => {
    const discount = form.getValues('have_discount');
    calculatePaymentPreview(value, discount);
  };

  const handleDiscountChange = (value: number) => {
    const amount = form.getValues('amount');
    calculatePaymentPreview(amount, value);
  };

  const onSubmit = async (data: EnhancedPaymentFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Payment preview:', paymentPreview);
    console.log('Loading state:', loading);

    try {
      if (!paymentPreview?.isValid) {
        console.log('Payment preview invalid:', paymentPreview?.message);
        toast.error(paymentPreview?.message || 'Thông tin thanh toán không hợp lệ');
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
        payment_status: paymentPreview.newStatus.toString(),
        due_date: data.due_date,
      });

      if (formValidation) {
        toast.error(formValidation);
        return;
      }

      const selectedFee = fees.find(fee => fee.id === data.fee_id);
      const selectedStudent = students.find(student => student.id === data.student_id);

      // Step 1: Create payment detail using the correct API
      const paymentDetail: PaymentDetail = {
        fee_id: data.fee_id,
        fee_name: selectedFee?.name || '',
        student_id: data.student_id,
        student_name: selectedStudent?.name || '',
        pay_method: data.pay_method,
        amount: data.amount,
        description: data.description || '',
        have_discount: data.have_discount,
        payment_status: paymentPreview.newStatus,
        due_date: new Date(data.due_date),
        generated_amount: data.amount + data.have_discount, // Following constraint: amount + have_discount = generated_amount
        is_overdue: new Date(data.due_date) < new Date(),
      };

      console.log('Creating payment detail:', paymentDetail);
      const paymentResult = await dispatch(createPaymentDetail(paymentDetail)).unwrap();
      console.log('Payment detail created:', paymentResult);

      // Step 2: Update payment summary after payment creation
      console.log('Updating payment summary after payment');
      await dispatch(updateSummaryAfterPayment({
        studentId: data.student_id,
        feeId: data.fee_id,
        academicYearId: data.academic_year_id,
        groupId: data.group_id
      })).unwrap();
      console.log('Payment summary updated');

      toast.success('Tạo thanh toán thành công');
      form.reset();
      onOpenChange(false);
      onSuccess?.(paymentDetail);

      // Refresh payment summaries to show updated data
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
      setSelectedPaymentSummary(null);
      setPaymentPreview(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Thêm thanh toán nâng cao</span>
          </DialogTitle>
          <DialogDescription>
            Tạo thanh toán với theo dõi nghĩa vụ và cập nhật trạng thái tự động
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Student and Fee Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại phí" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fees.map((fee) => (
                            <SelectItem key={fee.id} value={fee.id?.toString() || ''}>
                              {fee.name} - {formatCurrency(fee.amount)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Summary Information */}
              {selectedPaymentSummary && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Thông tin nghĩa vụ thanh toán</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tổng phí</p>
                        <p className="font-semibold">{formatCurrency(selectedPaymentSummary.total_amount_due)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Đã thanh toán</p>
                        <p className="font-semibold text-green-600">{formatCurrency(selectedPaymentSummary.total_amount_paid)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Còn thiếu</p>
                        <p className="font-semibold text-orange-600">{formatCurrency(selectedPaymentSummary.outstanding_amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Trạng thái</p>
                        <Badge variant="outline" className="mt-1">
                          {getPaymentStatusIcon(selectedPaymentSummary.payment_status)} {selectedPaymentSummary.payment_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tiến độ thanh toán</span>
                        <span>{calculateCompletionPercentage(selectedPaymentSummary.total_amount_paid, selectedPaymentSummary.total_amount_due)}%</span>
                      </div>
                      <Progress
                        value={calculateCompletionPercentage(selectedPaymentSummary.total_amount_paid, selectedPaymentSummary.total_amount_due)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Preview */}
              {paymentPreview && (
                <Alert variant={paymentPreview.isValid ? "default" : "destructive"}>
                  {paymentPreview.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>
                    {paymentPreview.isValid ? 'Xem trước thanh toán' : 'Lỗi thông tin thanh toán'}
                  </AlertTitle>
                  <AlertDescription>
                    {paymentPreview.isValid ? (
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div>Số tiền còn lại: {formatCurrency(paymentPreview.remainingAmount)}</div>
                        <div>Tiến độ mới: {paymentPreview.completionRate}%</div>
                        <div>
                          Trạng thái mới:
                          <Badge variant={paymentPreview.newStatus === PaymentStatus.PAID ? 'default' : 'secondary'} className="ml-1">
                            {getPaymentStatusIcon(paymentPreview.newStatus)} {paymentPreview.newStatus}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      paymentPreview.message
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền thanh toán</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                            handleAmountChange(value);
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
                            handleDiscountChange(value);
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
                  name="pay_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương thức thanh toán</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phương thức" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Tiền mặt</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                          <SelectItem value="CARD">Thẻ tín dụng</SelectItem>
                          <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                        </SelectContent>
                      </Select>
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Nhập ghi chú (tùy chọn)" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || !paymentPreview?.isValid}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Tạo thanh toán</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};