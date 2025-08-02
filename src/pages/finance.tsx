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
import { Plus, TrendingUp, Users } from 'lucide-react';

// Import the FinanceFilters component and type
import { FinanceFilters, FinanceFilters as FinanceFiltersComponent } from '@/components/common/finance-filters';

export const FinanceManagement = () => {
  usePageTitle('Quản lý tài chính');
  const [activeTab, setActiveTab] = useState('overview');
  const [openAddPayment, setOpenAddPayment] = useState(false);
  const { financial, teacher } = useRolePermissions();
  
  // State for filters
  const [filters, setFilters] = useState<FinanceFilters>({
    dateRange: { from: undefined, to: undefined },
    feeType: 'all',
    paymentStatus: 'all',
    searchTerm: ''
  });

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
  } = usePayment();

  const {} = useStudentPaymentSummary();

  // Load initial data
  useEffect(() => {
    handleFetchDashboardStatistics();
    handleFetchOverdueStatistics();
    handleFetchPaymentDetails();
  }, [handleFetchDashboardStatistics, handleFetchOverdueStatistics, handleFetchPaymentDetails]);


  const handleFiltersChange = useCallback((newFilters: FinanceFilters) => {
    setFilters(newFilters);
    
    // Only show toast for non-search filter changes to avoid spam during typing
    if (newFilters.searchTerm === filters.searchTerm) {
      toast.success('Đã cập nhật bộ lọc');
    }
  }, [filters.searchTerm]);


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

  // Filter payment details based on current filters
  const filteredPaymentDetails = useMemo(() => {
    return paymentDetails.filter(payment => {
      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const paymentDate = payment.create_at ? new Date(payment.create_at) : null;
        if (paymentDate) {
          if (filters.dateRange.from && paymentDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && paymentDate > filters.dateRange.to) return false;
        }
      }

      // Payment status filter
      if (filters.paymentStatus !== 'all') {
        const statusMap = {
          'paid': 'PAID',
          'pending': 'PENDING', 
          'overdue': 'OVERDUE'
        };
        if (payment.payment_status !== statusMap[filters.paymentStatus as keyof typeof statusMap]) return false;
      }

      // Fee type filter (simplified mapping)
      if (filters.feeType !== 'all') {
        const feeTypeMappings = {
          'hoc_phi': ['học phí', 'tuition'],
          'phi_co_so': ['phí cơ sở', 'facility'],
          'phi_khac': ['phí khác', 'other']
        };
        
        const feeTypeKey = filters.feeType as keyof typeof feeTypeMappings;
        if (feeTypeKey && feeTypeMappings[feeTypeKey]) {
          const feeName = (payment.fee_name || '').toLowerCase();
          const matchesType = feeTypeMappings[feeTypeKey].some(keyword => 
            feeName.includes(keyword.toLowerCase())
          );
          if (!matchesType) return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const studentName = (payment.student_name || '').toLowerCase();
        const feeName = (payment.fee_name || '').toLowerCase();
        
        if (!studentName.includes(searchTerm) && !feeName.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [paymentDetails, filters]);

  // Convert filtered payment details to calendar events (memoized)
  const paymentEvents = useMemo(() =>
    filteredPaymentDetails.map(payment => ({
      id: payment.id || 0,
      date: payment.create_at ? new Date(payment.create_at) : new Date(),
      studentName: payment.student_name || '',
      amount: payment.amount || 0,
      feeType: payment.fee_name || '',
      status: payment.payment_status === 'PAID' ? 'paid' as const :
        payment.payment_status === 'OVERDUE' ? 'overdue' as const :
          'pending' as const
    })), [filteredPaymentDetails]
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
          <TabsTrigger value="obligations">Học phí</TabsTrigger>
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
            {financial.canCreatePayments && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Thao tác nhanh</span>
                    </CardTitle>
                    <CardDescription>Các tác vụ quản lý thanh toán thường dùng</CardDescription>
                  </div>
                  {financial.canCreatePayments ? <Button onClick={() => setOpenAddPayment(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
                  </Button> : null}
                </CardHeader>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentHistoryTable
            paymentDetails={filteredPaymentDetails}
            isLoading={paymentLoading}
            showSummary={true}
            showFilters={false}
            enableExport={true}
            onOpenAddPayment={() => setOpenAddPayment(true)}
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
      {financial.canCreatePayments ? (
        <DialogCreatePayment
          open={openAddPayment}
          onOpenChange={setOpenAddPayment}
        />
      ) : <DialogCreatePayment
          open={false}
          onOpenChange={() => {}}
        />}
    </div>
  );
};

export default FinanceManagement;
