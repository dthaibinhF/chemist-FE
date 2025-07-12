import { useState } from 'react';
import { toast } from 'sonner';

import { FinanceCalendar } from '@/components/common/finance-calendar';
import { FinanceFilters } from '@/components/common/finance-filters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageTitle } from '@/hooks/usePageTitle';

// Mock data for demonstration
const mockFinanceStats = {
  totalRevenue: 15000000,
  totalExpenses: 8000000,
  netProfit: 7000000,
  pendingPayments: 2500000,
};

const mockMonthlyRevenue = [
  { month: 'T1', revenue: 12000000 },
  { month: 'T2', revenue: 13500000 },
  { month: 'T3', revenue: 14200000 },
  { month: 'T4', revenue: 13800000 },
  { month: 'T5', revenue: 15000000 },
  { month: 'T6', revenue: 14800000 },
];

const mockFeeDistribution = [
  { fee: 'Học phí cơ bản', amount: 8000000 },
  { fee: 'Học phí nâng cao', amount: 5000000 },
  { fee: 'Phí cơ sở vật chất', amount: 2000000 },
];

const mockPaymentTrend = [
  { date: '2024-01', paid: 85, pending: 15 },
  { date: '2024-02', paid: 88, pending: 12 },
  { date: '2024-03', paid: 92, pending: 8 },
  { date: '2024-04', paid: 90, pending: 10 },
  { date: '2024-05', paid: 95, pending: 5 },
  { date: '2024-06', paid: 93, pending: 7 },
];

const mockPayments = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    feeType: 'Học phí cơ bản',
    amount: 2000000,
    paymentDate: new Date('2024-01-15'),
    paymentMethod: 'Chuyển khoản',
    status: 'paid' as const,
    description: 'Thanh toán học phí tháng 1',
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    feeType: 'Học phí nâng cao',
    amount: 3000000,
    paymentDate: new Date('2024-01-20'),
    paymentMethod: 'Tiền mặt',
    status: 'pending' as const,
    description: 'Chờ xác nhận thanh toán',
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    feeType: 'Phí cơ sở vật chất',
    amount: 500000,
    paymentDate: new Date('2024-01-25'),
    paymentMethod: 'Chuyển khoản',
    status: 'paid' as const,
    description: 'Thanh toán phí cơ sở vật chất',
  },
];

const mockPaymentEvents = [
  {
    id: 1,
    date: new Date('2024-01-15'),
    studentName: 'Nguyễn Văn A',
    amount: 2000000,
    feeType: 'Học phí cơ bản',
    status: 'paid' as const,
  },
  {
    id: 2,
    date: new Date('2024-01-20'),
    studentName: 'Trần Thị B',
    amount: 3000000,
    feeType: 'Học phí nâng cao',
    status: 'pending' as const,
  },
  {
    id: 3,
    date: new Date('2024-01-25'),
    studentName: 'Lê Văn C',
    amount: 500000,
    feeType: 'Phí cơ sở vật chất',
    status: 'paid' as const,
  },
];

export const FinanceManagement = () => {
  usePageTitle('Quản lý tài chính');
  const [activeTab, setActiveTab] = useState('overview');

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    toast.success('Đã cập nhật bộ lọc');
  };

  const handlePaymentEdit = (paymentId: number) => {
    console.log('Edit payment:', paymentId);
    toast.info('Chức năng chỉnh sửa thanh toán');
  };

  const handlePaymentDelete = (paymentId: number) => {
    console.log('Delete payment:', paymentId);
    toast.success('Đã xóa thanh toán');
  };

  const handlePaymentView = (paymentId: number) => {
    console.log('View payment:', paymentId);
    toast.info('Xem chi tiết thanh toán');
  };

  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
    toast.info('Đã chọn ngày: ' + date.toLocaleDateString('vi-VN'));
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      {/* <FinanceOverviewCards stats={mockFinanceStats} /> */}

      {/* Filters */}
      <FinanceFilters onFiltersChange={handleFiltersChange} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="payments">Thanh toán</TabsTrigger>
          <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* <FinanceCharts
              monthlyRevenue={mockMonthlyRevenue}
              feeDistribution={mockFeeDistribution}
              paymentTrend={mockPaymentTrend}
            />
            <PaymentManagementTable
              payments={mockPayments}
              onEdit={handlePaymentEdit}
              onDelete={handlePaymentDelete}
              onView={handlePaymentView}
            /> */}
          </div>
        </TabsContent>

        {/* <TabsContent value="payments" className="space-y-4">
          <PaymentManagementTable
            payments={mockPayments}
            onEdit={handlePaymentEdit}
            onDelete={handlePaymentDelete}
            onView={handlePaymentView}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <FinanceCharts
            monthlyRevenue={mockMonthlyRevenue}
            feeDistribution={mockFeeDistribution}
            paymentTrend={mockPaymentTrend}
          />
        </TabsContent> */}

        <TabsContent value="calendar" className="space-y-4">
          <FinanceCalendar
            paymentEvents={mockPaymentEvents}
            onDateSelect={handleDateSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManagement;
