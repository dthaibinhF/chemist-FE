import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { EnhancedFinanceOverviewCards } from '@/components/common/enhanced-finance-overview-cards';
import { PaymentStatusCharts } from '@/components/common/payment-status-charts';
import { OverduePaymentAlerts } from '@/components/common/overdue-payment-alerts';
import { EnhancedPaymentSummaryTable } from '@/components/common/enhanced-payment-summary-table';
import { FinanceCalendar } from '@/components/common/finance-calendar';
import { PaymentHistoryTable } from '@/feature/payment/components/payment-history-table';
import { DialogCreatePayment } from '@/feature/payment/components/dialog-create-payment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { usePayment } from '@/hooks/usePayment';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { SalaryManagementTab } from '@/feature/salary/components';
import { Plus, TrendingUp, AlertTriangle, BarChart3, Calendar as CalendarIcon, Users } from 'lucide-react';

// Import the FinanceFilters component and type
import { FinanceFilters, FinanceFilters as FinanceFiltersComponent } from '@/components/common/finance-filters';

export const FinanceManagement = () => {
  usePageTitle('Quản lý tài chính');
  const [activeTab, setActiveTab] = useState('overview');
  const [openAddPayment, setOpenAddPayment] = useState(false);
  const { financial, teacher } = useRolePermissions();
  // State for filters (currently not actively used but maintained for future features)
  // const [filters, setFilters] = useState<FinanceFilters>({
  //   dateRange: { from: undefined, to: undefined },
  //   feeType: 'all',
  //   paymentStatus: 'all',
  //   searchTerm: ''
  // });

  // Enhanced hooks for real data
  const {
    loading: dashboardLoading,
    handleFetchDashboardStatistics,
    handleFetchOverdueStatistics,
  } = useFinancialDashboard();

  const {
    paymentDetails,
    loading: paymentLoading,
    handleFetchPaymentDetails,
    // handleDeletePaymentDetail, // Commented out - not currently used
  } = usePayment();

  const {
    // loading: summaryLoading, // Commented out - not currently used
  } = useStudentPaymentSummary();

  // Load initial data
  useEffect(() => {
    handleFetchDashboardStatistics();
    handleFetchOverdueStatistics();
    handleFetchPaymentDetails();
  }, [handleFetchDashboardStatistics, handleFetchOverdueStatistics, handleFetchPaymentDetails]);


  const handleFiltersChange = useCallback((newFilters: FinanceFilters) => {
    // setFilters(newFilters); // Commented out until filters are actively used
    console.log('Filters changed:', newFilters);
    toast.success('Đã cập nhật bộ lọc');
  }, []);

  // Commented out unused handlers - can be enabled when needed
  // const handlePaymentEdit = useCallback((paymentId: number) => {
  //   console.log('Edit payment:', paymentId);
  //   toast.info('Chức năng chỉnh sửa thanh toán');
  // }, []);

  // const handlePaymentDelete = useCallback(async (paymentId: number) => {
  //   try {
  //     handleDeletePaymentDetail(paymentId);
  //     toast.success('Đã xóa thanh toán thành công');
  //     // Refresh data after deletion
  //     handleFetchDashboardStatistics();
  //     handleFetchPaymentDetails();
  //   } catch (error) { 
  //     toast.error('Xóa thanh toán thất bại');
  //   }
  // }, [handleDeletePaymentDetail, handleFetchDashboardStatistics, handleFetchPaymentDetails]);

  // const handlePaymentView = useCallback((paymentId: number) => {
  //   console.log('View payment:', paymentId);
  //   toast.info('Xem chi tiết thanh toán');
  // }, []);

  const handleDateSelect = useCallback((date: Date) => {
    console.log('Selected date:', date);
    toast.info('Đã chọn ngày: ' + date.toLocaleDateString('vi-VN'));
  }, []);

  // Note: DialogCreatePayment handles success internally with toast notifications

  // Add refresh function for child components
  const handleRefreshDashboardData = useCallback(() => {
    handleFetchDashboardStatistics();
    handleFetchOverdueStatistics();
    handleFetchPaymentDetails();
  }, [handleFetchDashboardStatistics, handleFetchOverdueStatistics, handleFetchPaymentDetails]);

  // Convert payment details to calendar events (memoized)
  const paymentEvents = useMemo(() =>
    paymentDetails.map(payment => ({
      id: payment.id || 0,
      date: payment.create_at ? new Date(payment.create_at) : new Date(),
      studentName: payment.student_name || '',
      amount: payment.amount || 0,
      feeType: payment.fee_name || '',
      status: payment.payment_status === 'PAID' ? 'paid' as const :
        payment.payment_status === 'OVERDUE' ? 'overdue' as const :
          'pending' as const
    })), [paymentDetails]
  );

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quản lý tài chính</span>
            </CardTitle>
            <CardDescription>Đang tải dữ liệu tài chính...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Finance Overview Cards */}
      <EnhancedFinanceOverviewCards />

      {/* Overdue Payment Alerts */}
      <OverduePaymentAlerts onRefreshData={handleRefreshDashboardData} />

      {/* Filters */}
      <FinanceFiltersComponent onFiltersChange={handleFiltersChange} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="payments">Thanh toán</TabsTrigger>
          <TabsTrigger value="obligations">Nghĩa vụ</TabsTrigger>
          <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
          {(teacher.canViewAllSalaries || teacher.canViewOwnSalary) && (
            <TabsTrigger value="salary">Lương GV</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6">
            {/* Enhanced Payment Status Charts */}
            <PaymentStatusCharts />

            {/* Quick Actions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Thao tác nhanh</span>
                  </CardTitle>
                  <CardDescription>Các tác vụ quản lý thanh toán thường dùng</CardDescription>
                </div>
                {financial.canCreatePayments && (
                  <Button onClick={() => setOpenAddPayment(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">Báo cáo doanh thu</div>
                  </Card>
                  <Card className="p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-medium">Quản lý nợ quá hạn</div>
                  </Card>
                  <Card className="p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">Phân tích xu hướng</div>
                  </Card>
                  <Card className="p-4 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">Lịch thanh toán</div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentHistoryTable
            paymentDetails={paymentDetails}
            isLoading={paymentLoading}
            showSummary={true}
            showFilters={true}
            enableExport={true}
            title="Quản lý thanh toán toàn hệ thống"
            description="Tất cả các giao dịch thanh toán trong hệ thống"
          />
        </TabsContent>

        <TabsContent value="obligations" className="space-y-4">
          <EnhancedPaymentSummaryTable />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-6">
            <PaymentStatusCharts />

            <Card>
              <CardHeader>
                <CardTitle>Phân tích chi tiết</CardTitle>
                <CardDescription>Thống kê sâu và xu hướng thanh toán</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <div>Biểu đồ phân tích chi tiết đang được phát triển</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <FinanceCalendar
            paymentEvents={paymentEvents}
            onDateSelect={handleDateSelect}
          />
        </TabsContent>

{(teacher.canViewAllSalaries || teacher.canViewOwnSalary) && (
          <TabsContent value="salary" className="space-y-4">
            <SalaryManagementTab />
          </TabsContent>
        )}
      </Tabs>

      {/* Enhanced Add Payment Dialog - Only render if user can create payments */}
      {financial.canCreatePayments && (
        <DialogCreatePayment
          open={openAddPayment}
          onOpenChange={setOpenAddPayment}
        />
      )}
    </div>
  );
};

export default FinanceManagement;
