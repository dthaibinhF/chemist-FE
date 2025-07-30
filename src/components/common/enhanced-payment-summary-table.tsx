import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudentPaymentSummary } from '@/hooks/useStudentPaymentSummary';
import { cn } from '@/lib/utils';
import { formatCurrencyVND } from '@/utils/currency-utils';
import { PaymentStatus } from '@/types/api.types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  AlertCircle,
  Clock,
  Download,
  DollarSign,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Users,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface EnhancedPaymentSummaryTableProps {
  className?: string;
  groupId?: number;
  studentId?: number;
  showBulkActions?: boolean;
  maxHeight?: string;
}

interface FilterState {
  search: string;
  status: PaymentStatus | 'ALL';
  dateFrom: string;
  dateTo: string;
  showOverdueOnly: boolean;
}

export const EnhancedPaymentSummaryTable = ({
  className,
  groupId,
  studentId,
  showBulkActions = true,
  maxHeight = "600px"
}: EnhancedPaymentSummaryTableProps) => {
  const {
    paymentSummaries,
    loading,
    error,
    handleFetchPaymentSummariesByGroup,
    handleFetchPaymentSummariesByStudent,
    // getPaymentStatusColor,
    getPaymentStatusIcon,
    calculateCompletionPercentage
  } = useStudentPaymentSummary();

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    showOverdueOnly: false
  });

  useEffect(() => {
    if (groupId) {
      handleFetchPaymentSummariesByGroup(groupId);
    } else if (studentId) {
      handleFetchPaymentSummariesByStudent(studentId);
    }
  }, [groupId, studentId, handleFetchPaymentSummariesByGroup, handleFetchPaymentSummariesByStudent]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = [...paymentSummaries];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.student_name.toLowerCase().includes(searchLower) ||
        item.fee_name.toLowerCase().includes(searchLower) ||
        item.group_name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(item => item.payment_status === filters.status);
    }

    // Overdue filter
    if (filters.showOverdueOnly) {
      filtered = filtered.filter(item => item.is_overdue);
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(item =>
        new Date(item.due_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item =>
        new Date(item.due_date) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }, [paymentSummaries, filters]);

  // Bulk selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map(item => item.id!)));
    } else {
      setSelectedItems(new Set());
    }
  }, [filteredData]);

  const handleSelectItem = useCallback((id: number, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedItems(newSelection);
  }, [selectedItems]);

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      dateFrom: '',
      dateTo: '',
      showOverdueOnly: false
    });
  };

  const getStatusBadge = (status: PaymentStatus, isOverdue: boolean) => {
    const icon = getPaymentStatusIcon(status);
    // const color = getPaymentStatusColor(status);

    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let label = "";

    switch (status) {
      case PaymentStatus.PAID:
        variant = "default";
        label = "Đã thanh toán";
        break;
      case PaymentStatus.PARTIAL:
        variant = "secondary";
        label = "Thanh toán một phần";
        break;
      case PaymentStatus.PENDING:
        variant = "outline";
        label = "Chờ thanh toán";
        break;
      case PaymentStatus.OVERDUE:
        variant = "destructive";
        label = "Quá hạn";
        break;
    }

    return (
      <Badge variant={variant} className="flex items-center space-x-1">
        <span>{icon}</span>
        <span>{label}</span>
        {isOverdue && status !== PaymentStatus.OVERDUE && (
          <AlertCircle className="h-3 w-3 text-destructive" />
        )}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tổng hợp thanh toán</CardTitle>
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
          <CardTitle>Tổng hợp thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Tổng hợp thanh toán</span>
            <Badge variant="outline" className="ml-2">
              {filteredData.length}
            </Badge>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Bộ lọc</span>
            </Button>

            {showBulkActions && selectedItems.size > 0 && (
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Nhắc nhở ({selectedItems.size})
              </Button>
            )}

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {isFiltersVisible && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tên học sinh, phí, nhóm..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={filters.status}
                onValueChange={(value: PaymentStatus | 'ALL') =>
                  setFilters(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value={PaymentStatus.PENDING}>Chờ thanh toán</SelectItem>
                  <SelectItem value={PaymentStatus.PARTIAL}>Thanh toán một phần</SelectItem>
                  <SelectItem value={PaymentStatus.PAID}>Đã thanh toán</SelectItem>
                  <SelectItem value={PaymentStatus.OVERDUE}>Quá hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Từ ngày</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Đến ngày</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="overdueOnly"
                checked={filters.showOverdueOnly}
                onCheckedChange={(checked) =>
                  setFilters(prev => ({ ...prev, showOverdueOnly: Boolean(checked) }))
                }
              />
              <Label htmlFor="overdueOnly">Chỉ hiển thị quá hạn</Label>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="rounded-md border" style={{ maxHeight, overflowY: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow>
                {showBulkActions && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === filteredData.length && filteredData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Học sinh</TableHead>
                <TableHead>Thông tin phí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tiến độ thanh toán</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Hạn thanh toán</TableHead>
                <TableHead className="w-12">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showBulkActions ? 8 : 7}
                    className="text-center py-6"
                  >
                    <div className="text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>Không có dữ liệu thanh toán</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const completionRate = calculateCompletionPercentage(
                    item.total_amount_paid,
                    item.total_amount_due
                  );
                  const isSelected = selectedItems.has(item.id!);

                  return (
                    <TableRow key={item.id} className={cn(
                      "hover:bg-muted/50",
                      isSelected && "bg-muted/30",
                      item.is_overdue && "border-l-4 border-l-destructive"
                    )}>
                      {showBulkActions && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectItem(item.id!, Boolean(checked))
                            }
                          />
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{item.student_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.group_name}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{item.fee_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.academic_year_name}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(item.payment_status, item.is_overdue)}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2 min-w-[120px]">
                          <div className="flex items-center justify-between text-xs">
                            <span>{completionRate}%</span>
                            <span className="text-muted-foreground">
                              {formatCurrencyVND(item.total_amount_paid)} / {formatCurrencyVND(item.total_amount_due)}
                            </span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-destructive">
                            {formatCurrencyVND(item.outstanding_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            còn lại
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {format(new Date(item.due_date), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                          {item.is_overdue && (
                            <div className="flex items-center space-x-1 text-xs text-destructive">
                              <Clock className="h-3 w-3" />
                              <span>Quá hạn</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Ghi nhận thanh toán
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Gửi nhắc nhở
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Liên hệ phụ huynh
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};