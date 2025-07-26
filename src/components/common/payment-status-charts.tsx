import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard';
import { cn } from '@/lib/utils';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Legend
} from 'recharts';
import { useEffect } from 'react';
import { AlertCircle, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface PaymentStatusChartsProps {
  className?: string;
}

export const PaymentStatusCharts = ({ className }: PaymentStatusChartsProps) => {
  const {
    dashboardStats,
    loading,
    error,
    handleFetchDashboardStatistics,
    formatCurrency,
    getPaymentStatusColor,
    prepareRevenueChartData,
    preparePaymentStatusChartData,
  } = useFinancialDashboard();

  useEffect(() => {
    handleFetchDashboardStatistics();
  }, [handleFetchDashboardStatistics]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Biểu đồ thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboardStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Biểu đồ thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {error || 'Không thể tải dữ liệu biểu đồ'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const revenueData = prepareRevenueChartData(dashboardStats);
  const paymentStatusData = preparePaymentStatusChartData(dashboardStats);

  // Collection trend data (mock data for demonstration)
  const collectionTrendData = [
    { month: 'T1', collected: dashboardStats.total_revenue * 0.7, target: dashboardStats.total_amount_due * 0.8 },
    { month: 'T2', collected: dashboardStats.total_revenue * 0.8, target: dashboardStats.total_amount_due * 0.85 },
    { month: 'T3', collected: dashboardStats.total_revenue * 0.9, target: dashboardStats.total_amount_due * 0.9 },
    { month: 'T4', collected: dashboardStats.total_revenue, target: dashboardStats.total_amount_due },
  ];

  // Overdue analysis data
  const overdueAnalysisData = [
    { category: 'Đúng hạn', count: dashboardStats.paid_payments_count, color: '#4ECDC4' },
    { category: 'Quá hạn < 7 ngày', count: Math.floor(dashboardStats.overdue_payments_count * 0.4), color: '#FFA500' },
    { category: 'Quá hạn 7-30 ngày', count: Math.floor(dashboardStats.overdue_payments_count * 0.4), color: '#FF6B6B' },
    { category: 'Quá hạn > 30 ngày', count: Math.floor(dashboardStats.overdue_payments_count * 0.2), color: '#FF0000' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name?.includes('số tiền') || entry.name?.includes('collected') || entry.name?.includes('target') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Phân tích thanh toán chi tiết</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
            <TabsTrigger value="status" className="flex items-center space-x-1">
              <PieChartIcon className="h-4 w-4" />
              <span>Trạng thái</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>Doanh thu</span>
            </TabsTrigger>
            <TabsTrigger value="collection" className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>Thu tiền</span>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>Quá hạn</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {paymentStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              So sánh doanh thu tháng này với tháng trước
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collectionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="collected" 
                    name="Đã thu"
                    stroke="#4ECDC4" 
                    strokeWidth={3}
                    dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    name="Mục tiêu"
                    stroke="#FF6B6B" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Xu hướng thu tiền so với mục tiêu đề ra
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overdueAnalysisData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Số lượng">
                    {overdueAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Phân tích chi tiết các khoản thanh toán quá hạn
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};