import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fee, PaymentDetail } from '@/types/api.types';

interface FeePaymentStatsProps {
    fee: Fee;
    paymentDetails: PaymentDetail[];
}

interface StudentPaymentSummary {
    studentId: number;
    studentName: string;
    totalPaid: number;
    totalDiscount: number;
    isFullyPaid: boolean;
    paymentCount: number;
}

export const FeePaymentStats = ({ fee, paymentDetails }: FeePaymentStatsProps) => {
    // Group payments by student
    const studentPayments = paymentDetails.reduce((acc, payment) => {
        const studentId = payment.student_id;
        if (!acc[studentId]) {
            acc[studentId] = {
                studentId,
                studentName: payment.student_name,
                totalPaid: 0,
                totalDiscount: 0,
                isFullyPaid: false,
                paymentCount: 0,
            };
        }

        acc[studentId].totalPaid += payment.amount;
        acc[studentId].totalDiscount += payment.have_discount;
        acc[studentId].paymentCount += 1;

        return acc;
    }, {} as Record<number, StudentPaymentSummary>);

    // Calculate payment status for each student
    const studentSummaries = Object.values(studentPayments).map(student => ({
        ...student,
        isFullyPaid: (student.totalPaid + student.totalDiscount) >= fee.amount,
    }));

    // Calculate statistics
    const totalStudents = studentSummaries.length;
    const fullyPaidStudents = studentSummaries.filter(student => student.isFullyPaid).length;
    const partiallyPaidStudents = totalStudents - fullyPaidStudents;
    const totalAmountCollected = studentSummaries.reduce((sum, student) => sum + student.totalPaid, 0);
    const totalDiscountGiven = studentSummaries.reduce((sum, student) => sum + student.totalDiscount, 0);
    const totalPayments = studentSummaries.reduce((sum, student) => sum + student.paymentCount, 0);

    const getPaymentStatusBadge = (isFullyPaid: boolean) => {
        if (isFullyPaid) {
            return <Badge variant="default" className="bg-green-500 w-full">Đã đóng đủ</Badge>;
        }
        return <Badge variant="secondary" className="w-full bg-yellow-100 text-yellow-800">Chưa đóng đủ</Badge>;
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Số học sinh đã đóng đủ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{fullyPaidStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        {totalStudents > 0 ? `${((fullyPaidStudents / totalStudents) * 100).toFixed(1)}%` : '0%'} tổng số học sinh
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Số học sinh chưa đóng đủ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{partiallyPaidStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        {totalStudents > 0 ? `${((partiallyPaidStudents / totalStudents) * 100).toFixed(1)}%` : '0%'} tổng số học sinh
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng tiền đã thu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAmountCollected.toLocaleString('vi-VN')} VNĐ</div>
                    <p className="text-xs text-muted-foreground">
                        {totalDiscountGiven > 0 && `Giảm giá: ${totalDiscountGiven.toLocaleString('vi-VN')} VNĐ`}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng số lần thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalPayments}</div>
                    <p className="text-xs text-muted-foreground">
                        Trung bình {totalStudents > 0 ? (totalPayments / totalStudents).toFixed(1) : '0'} lần/học sinh
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}; 