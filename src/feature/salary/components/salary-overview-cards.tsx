import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Clock, DollarSign, Users } from 'lucide-react';

interface SalaryStats {
    totalTeachers: number;
    calculatedThisMonth: number;
    pendingCalculations: number;
    averageSalary: number;
    totalSalaryPaid: number;
    completionRate?: number;
}

interface SalaryOverviewCardsProps {
    stats: SalaryStats;
    isLoading?: boolean;
}

export const SalaryOverviewCards = ({ stats, isLoading }: SalaryOverviewCardsProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatPercentage = (rate: number) => {
        return `${(rate * 100).toFixed(1)}%`;
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-6 bg-gray-200 rounded w-8"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-32"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Teachers with Salary Config */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Giáo viên có cấu hình lương</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                    <p className="text-xs text-muted-foreground">
                        Giáo viên đã thiết lập lương
                    </p>
                </CardContent>
            </Card>

            {/* This Month Calculated */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Đã tính lương tháng này</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.calculatedThisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.completionRate && (
                            <span className="text-green-600">
                                {formatPercentage(stats.completionRate)} hoàn thành
                            </span>
                        )}
                    </p>
                </CardContent>
            </Card>

            {/* Pending Calculations */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chờ tính lương</CardTitle>
                    <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {stats.pendingCalculations > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {stats.pendingCalculations}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingCalculations}</div>
                    <p className="text-xs text-muted-foreground">
                        Giáo viên chưa tính lương
                    </p>
                </CardContent>
            </Card>

            {/* Average Salary */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lương trung bình</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.averageSalary > 0 ? formatCurrency(stats.averageSalary).replace('₫', '') : '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        VNĐ / tháng
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};