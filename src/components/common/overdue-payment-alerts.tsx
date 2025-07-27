import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface OverduePaymentAlertsProps {
  className?: string;
  maxItems?: number;
  showActions?: boolean;
  onRefreshData?: () => void; // New prop for refreshing data
}

export const OverduePaymentAlerts = ({
  className,
  maxItems = 10,
  showActions = true,
  onRefreshData
}: OverduePaymentAlertsProps) => {
  const {
    overdueStats,
    overduePaymentSummaries,
    loading,
    error,
    handleUpdateOverdueStatuses,
    formatCurrency,
  } = useFinancialDashboard();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatuses = async () => {
    setIsUpdating(true);
    try {
      await handleUpdateOverdueStatuses();
      // Call parent's refresh function if provided
      onRefreshData?.();
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateDaysOverdue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getPriorityLevel = (daysOverdue: number) => {
    if (daysOverdue >= 30) return { level: 'critical', color: 'destructive', label: 'Khẩn cấp' };
    if (daysOverdue >= 14) return { level: 'high', color: 'default', label: 'Cao' };
    if (daysOverdue >= 7) return { level: 'medium', color: 'secondary', label: 'Trung bình' };
    return { level: 'low', color: 'outline', label: 'Thấp' };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Cảnh báo thanh toán quá hạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Cảnh báo thanh toán quá hạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const displayItems = overduePaymentSummaries.slice(0, maxItems);
  const hasMoreItems = overduePaymentSummaries.length > maxItems;

  if (!overdueStats || overduePaymentSummaries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Cảnh báo thanh toán quá hạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">Tuyệt vời!</h3>
            <p className="text-muted-foreground">Hiện tại không có khoản thanh toán nào quá hạn.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Cảnh báo thanh toán quá hạn</span>
            <Badge variant="destructive" className="ml-2">
              {overdueStats.overduePaymentSummariesCount}
            </Badge>
          </CardTitle>
          {showActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateStatuses}
              disabled={isUpdating}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
              <span>Cập nhật</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Alert */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Tổng quan quá hạn</AlertTitle>
          <AlertDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">
                  <strong>{formatCurrency(overdueStats.totalOverdueAmount)}</strong> cần thu
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  <strong>{overdueStats.uniqueStudentsWithOverduePayments}</strong> học sinh
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Cập nhật: {format(new Date(overdueStats.asOfDate), 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Overdue Payments List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Danh sách quá hạn</h4>
            {hasMoreItems && (
              <Button variant="link" size="sm" className="h-auto p-0">
                <ExternalLink className="h-3 w-3 mr-1" />
                Xem tất cả ({overduePaymentSummaries.length})
              </Button>
            )}
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {displayItems.map((payment, index) => {
                const daysOverdue = calculateDaysOverdue(payment.due_date);
                const priority = getPriorityLevel(daysOverdue);

                return (
                  <div key={payment.id || index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-sm">{payment.student_name}</h5>
                          <Badge variant={priority.color as any} className="text-xs">
                            {priority.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{payment.fee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Nhóm: {payment.group_name} • Năm học: {payment.academic_year_name}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium text-destructive">
                          {formatCurrency(payment.outstanding_amount)}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{daysOverdue} ngày</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>Hạn thanh toán:</span>
                        <span>{format(new Date(payment.due_date), 'dd/MM/yyyy', { locale: vi })}</span>
                      </div>

                      {showActions && (
                        <div className="flex items-center space-x-1">
                          <Button variant="outline" size="sm" className="h-6 text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Nhắc nhở
                          </Button>
                          <Button variant="outline" size="sm" className="h-6 text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Gọi điện
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div className="pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Gửi nhắc nhở hàng loạt
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Lập lịch thu tiền
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};