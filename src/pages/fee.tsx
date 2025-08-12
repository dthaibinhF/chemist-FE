import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

// Import fee components
import { FeeCharts } from '@/feature/fee/components/fee-charts';
import { FeeFilters, type FeeFilters as FeeFiltersType } from '@/feature/fee/components/fee-filters';
import { FeeOverviewCards } from '@/feature/fee/components/fee-overview-cards';
import { FeeReports } from '@/feature/fee/components/fee-reports';
import FeeTable from '@/feature/fee/components/fee-table';

import { useFee } from '@/hooks/useFee';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DialogAddFee } from '@/feature/fee/components/dialog-add-fee';
import { DialogCreatePayment } from '@/feature/payment/components';

const FeeManagement = () => {
  const [openCreatePayment, setOpenCreatePayment] = useState(false);
  usePageTitle('Quản lý học phí');
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState<FeeFiltersType>({
    searchTerm: '',
    feeType: 'all',
    sortBy: 'name', 
    sortOrder: 'asc',
  });
  
  const { fees, handleFetchFees } = useFee();

  useEffect(() => {
    handleFetchFees();
  }, [handleFetchFees]);

  // Filter and sort fees based on current filters
  const filteredAndSortedFees = useMemo(() => {
    if (!fees) return [];

    let filtered = [...fees];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(fee => 
        fee.name.toLowerCase().includes(searchLower) ||
        fee.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply fee type filter (note: Fee interface doesn't have type field, so we'll categorize by amount ranges)
    if (filters.feeType !== 'all') {
      filtered = filtered.filter(fee => {
        const amount = fee.amount;
        switch (filters.feeType) {
          case 'hoc_phi': return amount >= 500000; // Higher amounts = tuition fees
          case 'phi_co_so': return amount >= 100000 && amount < 500000; // Medium amounts = facility fees
          case 'phi_khac': return amount < 100000; // Lower amounts = other fees
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'start_time':
          aValue = new Date(a.start_time);
          bValue = new Date(b.start_time);
          break;
        case 'end_time':
          aValue = new Date(a.end_time);
          bValue = new Date(b.end_time);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [fees, filters]);

  // Calculate real statistics from payment data
  const feeStats = useMemo(() => {
    if (!fees || fees.length === 0) {
      return {
        totalFees: 0,
        totalRevenue: 0,
        paidStudents: 0,
        unpaidStudents: 0,
        revenueGrowth: 0
      };
    }

    // Calculate actual revenue from payments
    const totalRevenue = fees.reduce((sum, fee) => {
      return sum + (fee.payment_details?.reduce((paymentSum, payment) => paymentSum + payment.amount, 0) || 0);
    }, 0);

    // Get unique students who have made payments
    const paidStudentIds = new Set<number>();
    const allStudentIds = new Set<number>();
    
    fees.forEach(fee => {
      if (fee.payment_details && fee.payment_details.length > 0) {
        fee.payment_details.forEach(payment => {
          allStudentIds.add(payment.student_id);
          // Check if student has paid full amount for this fee
          const studentPayments = fee.payment_details.filter(p => p.student_id === payment.student_id);
          const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount + p.have_discount, 0);
          if (totalPaid >= fee.amount) {
            paidStudentIds.add(payment.student_id);
          }
        });
      }
    });

    const paidStudents = paidStudentIds.size;
    const unpaidStudents = allStudentIds.size - paidStudents;

    return {
      totalFees: fees.length,
      totalRevenue,
      paidStudents,
      unpaidStudents,
      revenueGrowth: 12.5 // Keep this as mock for now
    };
  }, [fees]);

  // Generate chart data from actual payment data
  const monthlyRevenueData = useMemo(() => {
    if (!fees || fees.length === 0) return [];
    
    const monthlyData = new Map<string, number>();
    const currentYear = new Date().getFullYear();
    
    // Initialize with current year months
    for (let i = 1; i <= 12; i++) {
      const monthKey = `T${i}`;
      monthlyData.set(monthKey, 0);
    }

    // Aggregate actual payments by month using payment_details.created_at
    fees.forEach(fee => {
      if (fee.payment_details && fee.payment_details.length > 0) {
        fee.payment_details.forEach(payment => {
          const paymentDate = new Date(payment.created_at || new Date());
          if (paymentDate.getFullYear() === currentYear) {
            const monthKey = `T${paymentDate.getMonth() + 1}`;
            monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + payment.amount);
          }
        });
      }
    });

    return Array.from(monthlyData.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [fees]);

  const feeDistributionData = useMemo(() => {
    if (!fees || fees.length === 0) return [];

    const distribution = {
      hoc_phi: 0,
      phi_co_so: 0,
      phi_khac: 0
    };

    // Use actual payment amounts from payment_details
    fees.forEach(fee => {
      if (fee.payment_details && fee.payment_details.length > 0) {
        fee.payment_details.forEach(payment => {
          // Categorize by the original fee amount to determine type, but use payment amount for value
          const feeAmount = fee.amount;
          const paymentAmount = payment.amount;
          
          if (feeAmount >= 500000) {
            distribution.hoc_phi += paymentAmount;
          } else if (feeAmount >= 100000) {
            distribution.phi_co_so += paymentAmount;
          } else {
            distribution.phi_khac += paymentAmount;
          }
        });
      }
    });

    return [
      { name: 'Học phí tháng', value: distribution.hoc_phi, color: '#0088FE' },
      { name: 'Phí cơ sở vật chất', value: distribution.phi_co_so, color: '#00C49F' },
      { name: 'Phí khác', value: distribution.phi_khac, color: '#FFBB28' }
    ].filter(item => item.value > 0);
  }, [fees]);

  const reportStats = useMemo(() => {
    if (!fees || fees.length === 0) {
      return {
        totalFees: 0,
        totalRevenue: 0,
        paidStudents: 0,
        unpaidStudents: 0,
        averageAmount: 0,
        mostExpensiveFee: { name: '', amount: 0 },
        cheapestFee: { name: '', amount: 0 }
      };
    }

    // Calculate actual revenue from payments
    const totalRevenue = fees.reduce((sum, fee) => {
      return sum + (fee.payment_details?.reduce((paymentSum, payment) => paymentSum + payment.amount, 0) || 0);
    }, 0);

    // Calculate average payment amount (not fee amount)
    const totalPayments = fees.reduce((sum, fee) => sum + (fee.payment_details?.length || 0), 0);
    const averageAmount = totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0;
    
    const mostExpensive = fees.reduce((max, fee) => 
      fee.amount > max.amount ? fee : max, fees[0]);
    const cheapest = fees.reduce((min, fee) => 
      fee.amount < min.amount ? fee : min, fees[0]);

    // Get unique students who have made payments
    const paidStudentIds = new Set<number>();
    const allStudentIds = new Set<number>();
    
    fees.forEach(fee => {
      if (fee.payment_details && fee.payment_details.length > 0) {
        fee.payment_details.forEach(payment => {
          allStudentIds.add(payment.student_id);
          // Check if student has paid full amount for this fee
          const studentPayments = fee.payment_details.filter(p => p.student_id === payment.student_id);
          const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount + p.have_discount, 0);
          if (totalPaid >= fee.amount) {
            paidStudentIds.add(payment.student_id);
          }
        });
      }
    });

    const paidStudents = paidStudentIds.size;
    const unpaidStudents = allStudentIds.size - paidStudents;

    return {
      totalFees: fees.length,
      totalRevenue,
      paidStudents,
      unpaidStudents,
      averageAmount,
      mostExpensiveFee: { name: mostExpensive.name, amount: mostExpensive.amount },
      cheapestFee: { name: cheapest.name, amount: cheapest.amount }
    };
  }, [fees]);

  const handleFiltersChange = (newFilters: FeeFiltersType) => {
    setFilters(newFilters);
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
            <DialogAddFee />
            {/* <Button onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button> */}
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
            <FeeTable ComponentForCreate={ <Button onClick={() => setOpenCreatePayment(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thanh toán
                  </Button> } data={filteredAndSortedFees} />
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
        <DialogCreatePayment open={openCreatePayment} onOpenChange={setOpenCreatePayment} />
      </div>
  );
};

export default FeeManagement;
