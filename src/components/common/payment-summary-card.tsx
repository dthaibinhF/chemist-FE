import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { PaymentStatus, Fee, StudentPaymentSummary } from '@/types/api.types';
import { CheckCircle, Clock, AlertCircle, XCircle, CreditCard, TrendingUp, Users } from 'lucide-react';

interface PaymentSummaryCardProps {
    fee: Fee;
    paymentSummary: StudentPaymentSummary | null;
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
    paymentSummary,
    isLoading = false
}: PaymentSummaryCardProps) => {
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

    // Handle new student case (no payment summary)
    if (!paymentSummary) {
        return (
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {fee.name}
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Học sinh mới
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Tổng phí: {formatCurrencyVND(fee.amount)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Tiến độ thanh toán</span>
                            <span className="font-medium">0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Đã thanh toán</span>
                            <div className="font-medium text-green-600">
                                {formatCurrencyVND(0)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Còn thiếu</span>
                            <div className="font-medium text-orange-600">
                                {formatCurrencyVND(fee.amount)}
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground py-2 bg-gray-50 rounded">
                        Chưa có lịch sử thanh toán
                    </div>
                </CardContent>
            </Card>
        );
    }

    const completionPercentage = Math.round(paymentSummary.completion_rate * 100);
    const isFullyPaid = paymentSummary.is_fully_paid;

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {fee.name}
                    </div>
                    <Badge className={`${getStatusColor(paymentSummary.payment_status)} flex items-center gap-1`}>
                        {getStatusIcon(paymentSummary.payment_status)}
                        {getStatusLabel(paymentSummary.payment_status)}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Tổng phí: {formatCurrencyVND(paymentSummary.total_amount_due)}
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
                            {formatCurrencyVND(paymentSummary.total_amount_paid)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Còn thiếu</span>
                        <div className={`font-medium ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrencyVND(paymentSummary.outstanding_amount)}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        {paymentSummary.is_overdue ? (
                            <>
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">Quá hạn</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">Đúng hạn</span>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-muted-foreground">Nhóm: </span>
                        <span className="font-medium">{paymentSummary.group_name}</span>
                    </div>
                </div>

                {/* Quick Info */}
                {!isFullyPaid && paymentSummary.outstanding_amount > 0 && (
                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                        💡 Số tiền đề xuất: {formatCurrencyVND(paymentSummary.outstanding_amount)}
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