import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePayment } from '@/hooks/usePayment';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import {
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Target
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { DialogAddPayment } from './dialog-add-payment';
import { PaymentHistoryTable } from './payment-history-table';

interface StudentPaymentProps {
  studentId: number;
  studentName?: string;
}

export const StudentPayment = ({ studentId, studentName }: StudentPaymentProps) => {
  const [openAddPayment, setOpenAddPayment] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { loading, paymentDetails, handleFetchPaymentDetailByStudentId } = usePayment();
  const {
    paymentSummaries,
    loading: summaryLoading,
    handleFetchPaymentSummariesByStudent,
    formatCurrency,
    getPaymentStatusIcon,
    calculateCompletionPercentage
  } = useStudentPaymentSummary();

  useEffect(() => {
    handleFetchPaymentDetailByStudentId(studentId);
    handleFetchPaymentSummariesByStudent(studentId);
  }, [studentId, handleFetchPaymentDetailByStudentId, handleFetchPaymentSummariesByStudent]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!paymentSummaries.length) {
      return {
        totalObligations: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        overallProgress: 0,
        paidCount: 0,
        partialCount: 0,
        pendingCount: 0,
        overdueCount: 0
      };
    }

    const stats = paymentSummaries.reduce((acc, summary) => {
      acc.totalObligations += summary.total_amount_due || 0;
      acc.totalPaid += summary.total_amount_paid || 0;
      acc.totalOutstanding += summary.outstanding_amount || 0;

      switch (summary.payment_status) {
        case 'PAID':
          acc.paidCount += 1;
          break;
        case 'PARTIAL':
          acc.partialCount += 1;
          break;
        case 'PENDING':
          acc.pendingCount += 1;
          break;
        case 'OVERDUE':
          acc.overdueCount += 1;
          break;
      }

      return acc;
    }, {
      totalObligations: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      paidCount: 0,
      partialCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      overallProgress: 0
    });

    stats.overallProgress = stats.totalObligations > 0
      ? Math.round((stats.totalPaid / stats.totalObligations) * 100)
      : 0;

    return stats;
  }, [paymentSummaries]);

  // Identify overdue obligations
  const overdueObligations = useMemo(() => {
    return paymentSummaries.filter(summary =>
      summary.payment_status === 'OVERDUE' ||
      (summary.due_date && new Date(summary.due_date) < new Date() && summary.outstanding_amount > 0)
    );
  }, [paymentSummaries]);

  // Identify obligations needing attention
  const urgentObligations = useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return paymentSummaries.filter(summary =>
      summary.outstanding_amount > 0 &&
      summary.due_date &&
      new Date(summary.due_date) <= oneWeekFromNow &&
      new Date(summary.due_date) >= now
    );
  }, [paymentSummaries]);

  const handleAddPayment = () => {
    setOpenAddPayment(false);
    // DialogAddPayment already handles data refresh through Redux
  };

  if (loading || summaryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Quản lý thanh toán {studentName ? `- ${studentName}` : ''}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overdue Alerts */}
      {overdueObligations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cảnh báo: Có {overdueObligations.length} khoản thanh toán quá hạn!</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {overdueObligations.slice(0, 3).map((obligation, index) => (
                <div key={index} className="text-sm">
                  • {obligation.fee_name}: {formatCurrency(obligation.outstanding_amount)}
                  {obligation.due_date && ` (Hạn: ${new Date(obligation.due_date).toLocaleDateString('vi-VN')})`}
                </div>
              ))}
              {overdueObligations.length > 3 && (
                <div className="text-sm font-medium">... và {overdueObligations.length - 3} khoản khác</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Urgent Payments Alert */}
      {urgentObligations.length > 0 && overdueObligations.length === 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Lưu ý: Có {urgentObligations.length} khoản cần thanh toán trong tuần tới</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {urgentObligations.slice(0, 2).map((obligation, index) => (
                <div key={index} className="text-sm">
                  • {obligation.fee_name}: {formatCurrency(obligation.outstanding_amount)}
                  {obligation.due_date && ` (Hạn: ${new Date(obligation.due_date).toLocaleDateString('vi-VN')})`}
                </div>
              ))}
              {urgentObligations.length > 2 && (
                <div className="text-sm font-medium">... và {urgentObligations.length - 2} khoản khác</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Summary Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Tổng quan học phí thanh toán</span>
          </CardTitle>
          <CardDescription>
            Trạng thái tổng thể các khoản phí của học sinh {studentName || ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summaryStats.totalObligations)}</div>
              <div className="text-sm text-muted-foreground">Tổng học phí</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalPaid)}</div>
              <div className="text-sm text-muted-foreground">Đã thanh toán</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(summaryStats.totalOutstanding)}</div>
              <div className="text-sm text-muted-foreground">Còn thiếu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{summaryStats.overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Tiến độ</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Tiến độ thanh toán tổng thể</span>
              <span>{summaryStats.overallProgress}%</span>
            </div>
            <Progress value={summaryStats.overallProgress} className="h-2" />

            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {summaryStats.paidCount}
                </Badge>
                <div className="text-muted-foreground mt-1">Đã xong</div>
              </div>
              <div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {summaryStats.partialCount}
                </Badge>
                <div className="text-muted-foreground mt-1">Một phần</div>
              </div>
              <div>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {summaryStats.pendingCount}
                </Badge>
                <div className="text-muted-foreground mt-1">Chưa đóng</div>
              </div>
              <div>
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {summaryStats.overdueCount}
                </Badge>
                <div className="text-muted-foreground mt-1">Quá hạn</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Chi tiết thanh toán</span>
            </CardTitle>
            <CardDescription>Quản lý chi tiết các giao dịch và học phí thanh toán</CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpenAddPayment(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm thanh toán
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">học phí</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              <TabsTrigger value="analytics">Thống kê</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Danh sách các học phí thanh toán hiện tại
              </div>

              {paymentSummaries.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">Chưa có học phí thanh toán nào</div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {paymentSummaries.map((summary, index) => (
                    <Card key={index} className="border-l-4" style={{
                      borderLeftColor: summary.outstanding_amount > 0
                        ? (summary.payment_status === 'OVERDUE' ? '#ef4444' : '#f59e0b')
                        : '#10b981'
                    }}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{summary.fee_name}</div>
                          <Badge variant={summary.payment_status === 'PAID' ? 'default' :
                            summary.payment_status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                            {getPaymentStatusIcon(summary.payment_status)} {summary.payment_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <div className="text-muted-foreground">Tổng phí</div>
                            <div className="font-semibold">{formatCurrency(summary.total_amount_due)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Đã đóng</div>
                            <div className="font-semibold text-green-600">{formatCurrency(summary.total_amount_paid)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Còn thiếu</div>
                            <div className="font-semibold text-orange-600">{formatCurrency(summary.outstanding_amount)}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Tiến độ</span>
                            <span>{calculateCompletionPercentage(summary.total_amount_paid, summary.total_amount_due)}%</span>
                          </div>
                          <Progress
                            value={calculateCompletionPercentage(summary.total_amount_paid, summary.total_amount_due)}
                            className="h-1.5"
                          />
                        </div>

                        {summary.due_date && (
                          <div className="flex items-center space-x-2 mt-3 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Hạn: {new Date(summary.due_date).toLocaleDateString('vi-VN')}</span>
                            {new Date(summary.due_date) < new Date() && summary.outstanding_amount > 0 && (
                              <Badge variant="destructive" className="ml-2">Quá hạn</Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <PaymentHistoryTable
                studentId={studentId}
                paymentDetails={paymentDetails}
                isLoading={loading}
                showSummary={true}
                showFilters={true}
                title="Lịch sử giao dịch chi tiết"
                description="Tất cả các giao dịch thanh toán đã thực hiện"
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Phân bố trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Đã thanh toán</span>
                        </div>
                        <span className="font-semibold">{summaryStats.paidCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Thanh toán một phần</span>
                        </div>
                        <span className="font-semibold">{summaryStats.partialCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-sm">Chưa thanh toán</span>
                        </div>
                        <span className="font-semibold">{summaryStats.pendingCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Quá hạn</span>
                        </div>
                        <span className="font-semibold">{summaryStats.overdueCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tóm tắt tài chính</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tổng học phí</span>
                        <span className="font-semibold">{formatCurrency(summaryStats.totalObligations)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Đã thanh toán</span>
                        <span className="font-semibold text-green-600">{formatCurrency(summaryStats.totalPaid)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Còn phải trả</span>
                        <span className="font-semibold text-orange-600">{formatCurrency(summaryStats.totalOutstanding)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tỷ lệ hoàn thành</span>
                        <span className="font-bold text-blue-600">{summaryStats.overallProgress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DialogAddPayment
        open={openAddPayment}
        onOpenChange={setOpenAddPayment}
        onSuccess={handleAddPayment}
        preselectedStudentId={studentId}
      />
    </div>
  );
};

