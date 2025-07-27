import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { BulkPaymentGenerationDialog } from '@/components/common/bulk-payment-generation-dialog';
import { EnhancedFinanceOverviewCards } from '@/components/common/enhanced-finance-overview-cards';
import { EnhancedPaymentSummaryTable } from '@/components/common/enhanced-payment-summary-table';
import { FinanceCalendar } from '@/components/common/finance-calendar';
import { OverduePaymentAlerts } from '@/components/common/overdue-payment-alerts';
import { PaymentStatusCharts } from '@/components/common/payment-status-charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalaryManagementTab } from '@/feature/salary/components';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePayment } from '@/hooks/usePayment';
import { 
  BarChart3, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  FileText, 
  PlusCircle, 
  Settings, 
  TrendingUp,
  Users,
  AlertTriangle,
  Download
} from 'lucide-react';

const EnhancedFinancePage = () => {
  usePageTitle('Quản lý tài chính nâng cao');
  
  const [bulkPaymentDialogOpen, setBulkPaymentDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Payment data for calendar
  const { paymentDetails } = usePayment();
  
  // Convert payment details to calendar events
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
  
  const handleDateSelect = useCallback((date: Date) => {
    console.log('Selected date:', date);
    toast.info('Đã chọn ngày: ' + date.toLocaleDateString('vi-VN'));
  }, []);

  const handleBulkPaymentSuccess = (count: number) => {
    toast.success(`Đã tạo thành công ${count} nghĩa vụ thanh toán`);
    setBulkPaymentDialogOpen(false);
  };

  const handleExportFinancialReport = () => {
    toast.info('Đang xuất báo cáo tài chính...');
    // Mock export functionality
    setTimeout(() => {
      toast.success('Đã xuất báo cáo tài chính thành công');
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý tài chính</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tình hình tài chính của trung tâm
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportFinancialReport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button onClick={() => setBulkPaymentDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo nghĩa vụ hàng loạt
          </Button>
        </div>
      </div>

      {/* Enhanced Finance Overview Cards */}
      <EnhancedFinanceOverviewCards />

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Thanh toán</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Quá hạn</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Phân tích</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Lương</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PaymentStatusCharts />
            </div>
            <div>
              <OverduePaymentAlerts maxItems={5} />
            </div>
          </div>
          
          <EnhancedPaymentSummaryTable
            showBulkActions={true}
            maxHeight="400px"
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Quản lý thanh toán</span>
                </CardTitle>
                <CardDescription>
                  Theo dõi và quản lý tất cả các khoản thanh toán của học sinh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedPaymentSummaryTable
                  showBulkActions={true}
                  maxHeight="600px"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <OverduePaymentAlerts
                showActions={true}
                maxItems={20}
              />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Gửi nhắc nhở hàng loạt
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Tạo báo cáo quá hạn
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt nhắc nhở
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Quá hạn trong tuần:</span>
                      <span className="font-medium text-destructive">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quá hạn trong tháng:</span>
                      <span className="font-medium text-orange-600">28</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đã xử lý hôm nay:</span>
                      <span className="font-medium text-green-600">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <PaymentStatusCharts />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Xu hướng thu tiền</CardTitle>
                  <CardDescription>
                    Phân tích hiệu suất thu tiền theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Biểu đồ xu hướng sẽ được hiển thị tại đây</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân tích theo nhóm</CardTitle>
                  <CardDescription>
                    Tình hình thanh toán theo từng nhóm học
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Phân tích nhóm sẽ được hiển thị tại đây</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Lịch thanh toán</span>
              </CardTitle>
              <CardDescription>
                Xem lịch thanh toán và các sự kiện tài chính quan trọng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinanceCalendar
                paymentEvents={paymentEvents}
                onDateSelect={handleDateSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Tab */}
        <TabsContent value="salary" className="space-y-6">
          <SalaryManagementTab />
        </TabsContent>
      </Tabs>

      {/* Bulk Payment Generation Dialog */}
      <BulkPaymentGenerationDialog
        open={bulkPaymentDialogOpen}
        onOpenChange={setBulkPaymentDialogOpen}
        onSuccess={handleBulkPaymentSuccess}
      />
    </div>
  );
};

export default EnhancedFinancePage;