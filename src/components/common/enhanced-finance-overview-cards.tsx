import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { cn } from '@/lib/utils';
import { FinancialStatisticsDTO } from '@/types/api.types';
import { AlertCircle, DollarSign, TrendingDown, TrendingUp, Users, Wallet, Clock, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface EnhancedFinanceOverviewCardsProps {
  className?: string;
}

export const EnhancedFinanceOverviewCards = ({ className }: EnhancedFinanceOverviewCardsProps) => {
  const {
    dashboardStats,
    loading,
    error,
    handleFetchDashboardStatistics,
    formatCurrency,
    calculateGrowthRate,
    formatPercentage,
    getGrowthColor,
    getGrowthIcon,
  } = useFinancialDashboard();

  useEffect(() => {
    handleFetchDashboardStatistics();
  }, [handleFetchDashboardStatistics]);

  if (loading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !dashboardStats) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {error || 'Không thể tải dữ liệu thống kê'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const growthRate = calculateGrowthRate(
    dashboardStats.current_month_revenue,
    dashboardStats.previous_month_revenue
  );

  const collectionRate = dashboardStats.collection_rate;

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(dashboardStats.total_revenue)}</div>
          <div className="flex items-center space-x-1 text-xs">
            <span style={{ color: getGrowthColor(growthRate) }}>
              {getGrowthIcon(growthRate)}
            </span>
            <span 
              className="font-medium"
              style={{ color: getGrowthColor(growthRate) }}
            >
              {formatPercentage(growthRate)}
            </span>
            <span className="text-muted-foreground">so với tháng trước</span>
          </div>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tỷ lệ thu</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(collectionRate)}</div>
          <div className="flex items-center space-x-1 text-xs">
            <Badge 
              variant={collectionRate >= 80 ? "default" : collectionRate >= 60 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {collectionRate >= 80 ? "Tốt" : collectionRate >= 60 ? "Trung bình" : "Cần cải thiện"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Amount */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số tiền chưa thu</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(dashboardStats.total_outstanding)}
          </div>
          <p className="text-xs text-muted-foreground">
            Từ {dashboardStats.pending_payments_count + dashboardStats.partial_payments_count} khoản thanh toán
          </p>
        </CardContent>
      </Card>

      {/* Overdue Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quá hạn thanh toán</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {dashboardStats.overdue_payments_count}
          </div>
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-destructive font-medium">
              {formatCurrency(dashboardStats.overdue_amount)}
            </span>
            <span className="text-muted-foreground">cần xử lý</span>
          </div>
        </CardContent>
      </Card>

      {/* Paid Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {dashboardStats.paid_payments_count}
          </div>
          <p className="text-xs text-muted-foreground">
            Tổng {dashboardStats.total_transactions} giao dịch
          </p>
        </CardContent>
      </Card>

      {/* Active Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Học sinh tham gia</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardStats.active_students_count}</div>
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-muted-foreground">
              {formatPercentage(dashboardStats.student_participation_rate)} tỷ lệ tham gia
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};