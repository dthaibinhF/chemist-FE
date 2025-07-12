import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Import fee components
import { FeeCharts } from '@/feature/fee/components/fee-charts';
import { FeeFilters } from '@/feature/fee/components/fee-filters';
import { FeeOverviewCards } from '@/feature/fee/components/fee-overview-cards';
import { FeeReports } from '@/feature/fee/components/fee-reports';
import FeeTable from '@/feature/fee/components/fee-table';

import { DialogCreatePayment } from '@/feature/payment/components';
import { useFee } from '@/hooks/useFee';
import { usePageTitle } from '@/hooks/usePageTitle';

const FeeManagement = () => {
  usePageTitle('Quản lý học phí');
  const [activeTab, setActiveTab] = useState('list');
  const { fees, loading } = useFee();
  const [open, setOpen] = useState(false);
  // Mock data cho thống kê - sẽ thay bằng data thực từ API
  const feeStats = {
    totalFees: fees?.length || 0,
    totalRevenue: 15000000,
    paidStudents: 85,
    unpaidStudents: 35,
    revenueGrowth: 12.5
  };

  const monthlyRevenueData = [
    { name: 'T1', value: 12000000 },
    { name: 'T2', value: 13500000 },
    { name: 'T3', value: 14200000 },
    { name: 'T4', value: 13800000 },
    { name: 'T5', value: 15000000 },
    { name: 'T6', value: 14800000 }
  ];

  const feeDistributionData = [
    { name: 'Học phí tháng', value: 12000000, color: '#0088FE' },
    { name: 'Phí cơ sở vật chất', value: 2000000, color: '#00C49F' },
    { name: 'Phí khác', value: 1000000, color: '#FFBB28' }
  ];

  const reportStats = {
    totalFees: fees?.length || 0,
    totalRevenue: 15000000,
    paidStudents: 85,
    unpaidStudents: 35,
    averageAmount: 500000,
    mostExpensiveFee: { name: 'Học phí tháng 12', amount: 800000 },
    cheapestFee: { name: 'Phí tài liệu', amount: 100000 }
  };

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Implement filter logic here
  };

  const handleExportReport = () => {
    toast.info('Đang xuất báo cáo...');
    // Implement export functionality
  };

  const handleExportExcel = () => {
    toast.success('Đã xuất file Excel thành công!');
    // Implement Excel export
  };

  const handleExportPDF = () => {
    toast.success('Đã xuất file PDF thành công!');
    // Implement PDF export
  };

  const handleSendReminder = () => {
    toast.success('Đã gửi nhắc nhở đến 35 học sinh chưa đóng phí!');
    // Implement reminder functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý học phí</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các loại học phí cho học sinh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DialogCreatePayment open={open} onOpenChange={setOpen} />
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <FeeOverviewCards stats={feeStats} />

      {/* Search and Filter */}
      <FeeFilters onFiltersChange={handleFiltersChange} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Danh sách học phí</TabsTrigger>
          <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <FeeTable />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <FeeCharts
            monthlyRevenue={monthlyRevenueData}
            feeDistribution={feeDistributionData}
          />
        </TabsContent>

        <TabsContent value="reports">
          <FeeReports
            stats={reportStats}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onSendReminder={handleSendReminder}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagement;
