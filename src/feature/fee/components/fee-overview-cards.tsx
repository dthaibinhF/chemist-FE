import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency-utils';
import { AlertCircle, DollarSign, Users } from 'lucide-react';

interface FeeStats {
    totalFees: number;
    totalRevenue: number;
    paidStudents: number;
    unpaidStudents: number;
    revenueGrowth?: number;
}

interface FeeOverviewCardsProps {
    stats: FeeStats;
}

export const FeeOverviewCards = ({ stats }: FeeOverviewCardsProps) => {

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng loại học phí</CardTitle>
                    <Badge variant="secondary">{stats.totalFees}</Badge>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalFees}</div>
                    <p className="text-xs text-muted-foreground">
                        Loại phí đang áp dụng
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.revenueGrowth && stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth || 0}% so với tháng trước
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đã đóng phí</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.paidStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        Học sinh đã thanh toán
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chưa đóng phí</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{stats.unpaidStudents}</div>
                    <p className="text-xs text-muted-foreground">
                        Cần nhắc nhở
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}; 