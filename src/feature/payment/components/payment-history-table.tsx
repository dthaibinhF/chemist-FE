import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayment } from '@/hooks/usePayment';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { PaymentDetail, PaymentStatus } from '@/types/api.types';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { router } from '@/router/route';

interface PaymentHistoryTableProps {
  studentId?: number;
  feeId?: number;
  paymentDetails?: PaymentDetail[];
  isLoading?: boolean;
  showSummary?: boolean;
  showFilters?: boolean;
  enableExport?: boolean;
  title?: string;
  description?: string;
  onOpenAddPayment?: () => void;
}

const getPaymentMethodLabel = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'Tiền mặt';
    case 'bank_transfer':
      return 'Chuyển khoản';
    case 'card':
      return 'Thẻ tín dụng';
    case 'e_wallet':
      return 'Ví điện tử';
    default:
      return method;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return <DollarSign className="h-4 w-4" />;
    case 'bank_transfer':
      return <TrendingUp className="h-4 w-4" />;
    case 'card':
    case 'e_wallet':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

const getPaymentStatusBadge = (paymentStatus?: PaymentStatus, amount?: number, haveDiscount?: number) => {
  // Use payment_status if available, otherwise fallback to legacy calculation
  if (paymentStatus) {
    switch (paymentStatus) {
      case 'PAID':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Đã thanh toán</Badge>;
      case 'PARTIAL':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Thanh toán một phần</Badge>;
      case 'PENDING':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Chưa thanh toán</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Quá hạn</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  }

  // Legacy calculation for backward compatibility
  if (amount !== undefined && haveDiscount !== undefined) {
    const totalAmount = amount - haveDiscount;
    if (totalAmount <= 0) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Đã thanh toán đủ</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Chưa thanh toán đủ</Badge>;
  }

  return <Badge variant="secondary">Không xác định</Badge>;
};


export const PaymentHistoryTable = ({
  studentId,
  feeId,
  paymentDetails: externalPaymentDetails,
  isLoading: externalLoading,
  onOpenAddPayment,
  showSummary = false,
  showFilters = true,
  enableExport = false,
  title = "Lịch sử thanh toán",
  description = "Danh sách các giao dịch thanh toán đã thực hiện"
}: PaymentHistoryTableProps) => {
  const {
    paymentDetails,
    loading,
    handleFetchPaymentDetails,
    handleFetchPaymentDetailByStudentId,
    handleFetchPaymentDetailByFeeId,
    handleFetchPaymentDetailByStudentIdAndFeeId
  } = usePayment();

  const {
    loading: loadingPaymentSummary,
  } = useStudentPaymentSummary();

  // Enhanced filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '90d' | '1y'>('all');


  const isExternalData = externalPaymentDetails !== undefined;
  const displayPaymentDetails = isExternalData ? externalPaymentDetails : paymentDetails;
  const displayLoading = isExternalData || loadingPaymentSummary ? externalLoading : loading;

  // // Load payment details and summaries
  useEffect(() => {
    if (!isExternalData) {
      if (studentId && feeId) {
        handleFetchPaymentDetailByStudentIdAndFeeId(studentId, feeId);
      } else if (studentId) {
        handleFetchPaymentDetailByStudentId(studentId);
      } else if (feeId) {
        handleFetchPaymentDetailByFeeId(feeId);
      } else {
        handleFetchPaymentDetails();
      }
    }
  }, [studentId, feeId, isExternalData]);
  // Memoized filter functions for better performance
  const searchFilter = useCallback((payment: PaymentDetail, searchTerm: string) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.student_name?.toLowerCase().includes(searchLower) ||
      payment.fee_name?.toLowerCase().includes(searchLower) ||
      payment.description?.toLowerCase().includes(searchLower)
    );
  }, []);

  const dateRangeFilter = useCallback((payment: PaymentDetail, dateRange: string) => {
    if (dateRange === 'all' || !payment.create_at) return true;

    const paymentDate = new Date(payment.create_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (dateRange) {
      case '30d': return daysDiff <= 30;
      case '90d': return daysDiff <= 90;
      case '1y': return daysDiff <= 365;
      default: return true;
    }
  }, []);

  // Enhanced filtering and search with optimized performance
  const filteredPaymentDetails = useMemo(() => {
    if (!displayPaymentDetails) return [];

    return displayPaymentDetails.filter((payment) => {
      return (
        searchFilter(payment, searchTerm) &&
        (statusFilter === 'all' || payment.payment_status === statusFilter) &&
        (methodFilter === 'all' || payment.pay_method === methodFilter) &&
        dateRangeFilter(payment, dateRange)
      );
    });
  }, [displayPaymentDetails, searchTerm, statusFilter, methodFilter, dateRange, searchFilter, dateRangeFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!filteredPaymentDetails.length) {
      return {
        totalAmount: 0,
        totalDiscount: 0,
        netAmount: 0,
        transactionCount: 0,
        paidCount: 0,
        partialCount: 0,
        pendingCount: 0,
        overdueCount: 0
      };
    }

    const stats = filteredPaymentDetails.reduce((acc, payment) => {
      acc.totalAmount += payment.amount || 0;
      acc.totalDiscount += payment.have_discount || 0;
      acc.transactionCount += 1;

      switch (payment.payment_status) {
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
      totalAmount: 0,
      totalDiscount: 0,
      netAmount: 0,
      transactionCount: 0,
      paidCount: 0,
      partialCount: 0,
      pendingCount: 0,
      overdueCount: 0
    });

    stats.netAmount = stats.totalAmount - stats.totalDiscount;

    return stats;
  }, [filteredPaymentDetails]);


  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';

    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const columns: ColumnDef<PaymentDetail>[] = [
    {
      accessorKey: 'fee_name',
      header: 'Loại phí',
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            <Button onClick={() => {
              return router.navigate(`/fee/${row.original.fee_id}`);
            }} variant="link" size="sm" className="text-gray-700 hover:text-gray-600">
              {row.getValue('fee_name')}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'student_name',
      header: 'Học sinh',
      cell: ({ row }: { row: any }) => {
        return (
          <div className="font-medium">
            <Button onClick={() => {
              return router.navigate(`/student/${row.original.student_id}`);
            }} variant="link" size="sm" className="text-blue-500 hover:text-blue-600">
              {row.getValue('student_name')}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Số tiền',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        return (
          <div className="font-medium">
            {formatCurrencyVND(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'have_discount',
      header: 'Giảm giá',
      cell: ({ row }) => {
        const discount = row.getValue('have_discount') as number;
        return (
          <div className="text-muted-foreground">
            {discount > 0 ? `-${formatCurrencyVND(discount)}` : formatCurrencyVND(0)}
          </div>
        );
      },
    },
    {
      accessorKey: 'net_amount',
      header: 'Thực thu',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const discount = row.getValue('have_discount') as number;
        const netAmount = (amount || 0) - (discount || 0);
        return (
          <div className="font-semibold text-green-600">
            {formatCurrencyVND(netAmount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'pay_method',
      header: 'Phương thức',
      cell: ({ row }) => {
        const method = row.getValue('pay_method') as string;
        return (
          <div className="flex items-center space-x-2">
            {getPaymentMethodIcon(method)}
            <span className="text-sm">{getPaymentMethodLabel(method)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'create_at',
      header: 'Ngày thanh toán',
      cell: ({ row }) => {
        const date = row.getValue('create_at') as Date;
        return (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'payment_status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const paymentStatus = row.getValue('payment_status') as PaymentStatus;
        const amount = row.getValue('amount') as number;
        const discount = row.getValue('have_discount') as number;
        return getPaymentStatusBadge(paymentStatus, amount, discount);
      },
    },
    {
      accessorKey: 'due_date',
      header: 'Hạn thanh toán',
      cell: ({ row }) => {
        const dueDate = row.original.due_date;
        if (!dueDate) return <span className="text-muted-foreground">Không có</span>;

        const isOverdue = new Date(dueDate) < new Date();
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
            {formatDate(dueDate)}
            {isOverdue && <AlertCircle className="inline h-3 w-3 ml-1" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Ghi chú',
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return (
          <div className="text-muted-foreground max-w-[200px] truncate" title={description}>
            {description || 'Không có ghi chú'}
          </div>
        );
      },
    },
  ];

  if (displayLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!displayPaymentDetails || displayPaymentDetails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Không có lịch sử thanh toán nào</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {showSummary && !loadingPaymentSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Tổng quan thanh toán</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrencyVND(summaryStats.netAmount)}</div>
                <div className="text-sm text-muted-foreground">Tổng thực thu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.transactionCount}</div>
                <div className="text-sm text-muted-foreground">Giao dịch</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatCurrencyVND(summaryStats.totalDiscount)}</div>
                <div className="text-sm text-muted-foreground">Tổng giảm giá</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  <span className="text-green-600">{summaryStats.paidCount}</span>/
                  <span className="text-orange-600">{summaryStats.partialCount}</span>/
                  <span className="text-gray-600">{summaryStats.pendingCount}</span>/
                  <span className="text-red-600">{summaryStats.overdueCount}</span>
                </div>
                <div className="text-sm text-muted-foreground">Đã thanh toán / Một phần / Chưa / Quá hạn</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>{title}</span>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {enableExport && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Enhanced Filters */}
        {showFilters && (
          <CardContent className="border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm học sinh, phí, ghi chú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={statusFilter} onValueChange={(value: PaymentStatus | 'all') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                    <SelectItem value="PARTIAL">Thanh toán một phần</SelectItem>
                    <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
                    <SelectItem value="OVERDUE">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phương thức</label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phương thức</SelectItem>
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                    <SelectItem value="CARD">Thẻ tín dụng</SelectItem>
                    <SelectItem value="E_WALLET">Ví điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thời gian</label>
                <Select value={dateRange} onValueChange={(value: 'all' | '30d' | '90d' | '1y') => setDateRange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                    <SelectItem value="30d">30 ngày qua</SelectItem>
                    <SelectItem value="90d">90 ngày qua</SelectItem>
                    <SelectItem value="1y">1 năm qua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateRange !== 'all') && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Đang hiển thị {filteredPaymentDetails.length} trong tổng số {displayPaymentDetails.length} giao dịch</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setMethodFilter('all');
                      setDateRange('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}

        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredPaymentDetails}
            pagination={true} filterColumn="fee_name"
            filterPlaceholder="Tìm kiếm phí..."
            ComponentForCreate={onOpenAddPayment ? <Button onClick={() => onOpenAddPayment()}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm thanh toán
          </Button> : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
};
