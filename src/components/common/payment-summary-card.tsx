import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { PaymentDetail, PaymentStatus, Fee } from '@/types/api.types';
import { CheckCircle, Clock, AlertCircle, XCircle, CreditCard, TrendingUp } from 'lucide-react';

interface PaymentSummaryCardProps {
    fee: Fee;
    totalPaid: number;
    remainingAmount: number;
    existingPayments: PaymentDetail[];
    isLoading?: boolean;
}

const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.PAID:
            return <CheckCircle className="h-3 w-3" />;
        case PaymentStatus.PARTIAL:
            return <TrendingUp className="h-3 w-3" />;
        case PaymentStatus.PENDING:
            return <Clock className="h-3 w-3" />;
        case PaymentStatus.OVERDUE:
            return <XCircle className="h-3 w-3" />;
        default:
            return <AlertCircle className="h-3 w-3" />;
    }
};

const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.PAID:
            return 'bg-green-100 text-green-800 border-green-200';
        case PaymentStatus.PARTIAL:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case PaymentStatus.PENDING:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case PaymentStatus.OVERDUE:
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.PAID:
            return 'Đã thanh toán';
        case PaymentStatus.PARTIAL:
            return 'Thanh toán một phần';
        case PaymentStatus.PENDING:
            return 'Chờ thanh toán';
        case PaymentStatus.OVERDUE:
            return 'Quá hạn';
        default:
            return 'Không xác định';
    }
};

export const PaymentSummaryCard = ({
    fee,
    totalPaid,
    remainingAmount,
    existingPayments,
    isLoading = false
}: PaymentSummaryCardProps) => {
    const completionPercentage = fee.amount > 0 ? Math.round((totalPaid / fee.amount) * 100) : 0;
    const isFullyPaid = remainingAmount <= 0;
    const hasPayments = existingPayments.length > 0;

    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
                    {fee.name}
                </CardTitle>
                <CardDescription>
                    Tổng phí: {formatCurrencyVND(fee.amount)}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Tiến độ thanh toán</span>
                        <span className="font-medium">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </div>

                {/* Payment Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Đã thanh toán</span>
                        <div className="font-medium text-green-600">
                            {formatCurrencyVND(totalPaid)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Còn thiếu</span>
                        <div className={`font-medium ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrencyVND(remainingAmount)}
                        </div>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trạng thái</span>
                    <Badge className={`${getStatusColor(
                        isFullyPaid ? PaymentStatus.PAID :
                        totalPaid > 0 ? PaymentStatus.PARTIAL :
                        PaymentStatus.PENDING
                    )} flex items-center gap-1`}>
                        {getStatusIcon(
                            isFullyPaid ? PaymentStatus.PAID :
                            totalPaid > 0 ? PaymentStatus.PARTIAL :
                            PaymentStatus.PENDING
                        )}
                        {getStatusLabel(
                            isFullyPaid ? PaymentStatus.PAID :
                            totalPaid > 0 ? PaymentStatus.PARTIAL :
                            PaymentStatus.PENDING
                        )}
                    </Badge>
                </div>

                {/* Payment History */}
                {hasPayments && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Lịch sử thanh toán</span>
                            <span className="text-xs text-muted-foreground">
                                {existingPayments.length} khoản
                            </span>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                            {existingPayments.slice(0, 3).map((payment, index) => (
                                <div key={payment.id || index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(payment.payment_status)}
                                        <span>{formatCurrencyVND(payment.amount)}</span>
                                        {payment.have_discount > 0 && (
                                            <span className="text-green-600">
                                                (-{formatCurrencyVND(payment.have_discount)})
                                            </span>
                                        )}
                                    </div>
                                    <Badge className={getStatusColor(payment.payment_status)}>
                                        {getStatusLabel(payment.payment_status)}
                                    </Badge>
                                </div>
                            ))}
                            {existingPayments.length > 3 && (
                                <div className="text-xs text-center text-muted-foreground py-1">
                                    +{existingPayments.length - 3} khoản thanh toán khác
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Info */}
                {!isFullyPaid && remainingAmount > 0 && (
                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                        💡 Số tiền đề xuất: {formatCurrencyVND(remainingAmount)}
                    </div>
                )}

                {isFullyPaid && (
                    <div className="text-xs text-green-700 bg-green-50 p-2 rounded flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Học sinh đã hoàn thành thanh toán phí này
                    </div>
                )}
            </CardContent>
        </Card>
    );
};