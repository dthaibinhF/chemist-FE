import { PaymentDetail, PaymentStatus } from '@/types/api.types';
import { paymentService } from '@/service/payment.service';

export interface PaymentValidationResult {
    isDuplicate: boolean;
    isFullyPaid: boolean;
    totalPaid: number;
    remainingAmount: number;
    existingPayments: PaymentDetail[];
    message: string;
    severity: 'error' | 'warning' | 'info';
}

export const checkDuplicatePayment = async (
    studentId: number,
    feeId: number,
    feeAmount: number
): Promise<PaymentValidationResult> => {
    console.log('feeAmount', feeAmount);
    console.log('studentId', studentId);
    console.log('feeId', feeId); 
    try {
        const existingPayments = await paymentService.getPaymentDetailByStudentIdAndFeeId(studentId, feeId);
        console.log('existingPayments', existingPayments);
        
        // Calculate total paid from existing payments
        const totalPaid = existingPayments
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        console.log('totalPaid', totalPaid); 

        const remainingAmount = Math.max(0, feeAmount - totalPaid); 
        const isFullyPaid = totalPaid >= feeAmount;
        const hasExistingPayments = existingPayments && existingPayments.length > 0;

        console.log('remainingAmount', remainingAmount);
        console.log('isFullyPaid', isFullyPaid);
        console.log('hasExistingPayments', hasExistingPayments); 

        if (isFullyPaid) {
            return {
                isDuplicate: true,
                isFullyPaid: true,
                totalPaid,
                remainingAmount: 0,
                existingPayments: existingPayments || [],
                message: `Học sinh đã thanh toán đủ phí này. Tổng đã thanh toán: ${totalPaid.toLocaleString('vi-VN')} VNĐ`,
                severity: 'error'
            };
        }

        if (hasExistingPayments && totalPaid > 0) {
            return {
                isDuplicate: false,
                isFullyPaid: false,
                totalPaid,
                remainingAmount,
                existingPayments: existingPayments || [],
                message: `Học sinh đã thanh toán một phần. Còn lại: ${remainingAmount.toLocaleString('vi-VN')} VNĐ`,
                severity: 'warning'
            };
        }

        if (hasExistingPayments) {
            const pendingPayments = existingPayments?.filter((p: PaymentDetail) => p.payment_status === PaymentStatus.PENDING) || [];
            if (pendingPayments.length > 0) {
                return {
                    isDuplicate: false,
                    isFullyPaid: false,
                    totalPaid,
                    remainingAmount,
                    existingPayments: existingPayments || [],
                    message: `Đã có ${pendingPayments.length} khoản thanh toán đang chờ xử lý cho phí này`,
                    severity: 'warning'
                };
            }
        }

        return {
            isDuplicate: false,
            isFullyPaid: false,
            totalPaid,
            remainingAmount: feeAmount,
            existingPayments: existingPayments || [],
            message: '',
            severity: 'info'
        };

    } catch (error) {
        console.error('Error checking duplicate payment:', error);
        return {
            isDuplicate: false,
            isFullyPaid: false,
            totalPaid: 0,
            remainingAmount: feeAmount,
            existingPayments: [],
            message: 'Không thể kiểm tra trạng thái thanh toán',
            severity: 'warning'
        };
    }
};

export const getPaymentSummaryMessage = (result: PaymentValidationResult): string => {
    if (result.isFullyPaid) {
        return `✅ Đã thanh toán đủ (${result.totalPaid.toLocaleString('vi-VN')} VNĐ)`;
    }
    
    if (result.totalPaid > 0) {
        return `⚠️ Đã thanh toán ${result.totalPaid.toLocaleString('vi-VN')} VNĐ, còn lại ${result.remainingAmount.toLocaleString('vi-VN')} VNĐ`;
    }
    
    return '💡 Chưa có khoản thanh toán nào';
};

export const shouldPreventSubmission = (result: PaymentValidationResult): boolean => {
    return result.isFullyPaid;
};

export const suggestPaymentAmount = (result: PaymentValidationResult): number => {
    return result.remainingAmount > 0 ? result.remainingAmount : 0;
};