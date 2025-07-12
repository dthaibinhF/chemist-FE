import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { usePayment } from '@/hooks/usePayment';
import { PaymentDetail } from '@/types/api.types';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useEffect } from 'react';

interface PaymentHistoryTableProps {
  studentId?: number;
  feeId?: number;
  paymentDetails?: PaymentDetail[];
  isLoading?: boolean;
}

const getPaymentMethodLabel = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'Tiền mặt';
    case 'bank_transfer':
      return 'Chuyển khoản';
    case 'card':
      return 'Thẻ';
    default:
      return method;
  }
};

const getPaymentStatusBadge = (amount: number, haveDiscount: number) => {
  const totalAmount = amount - haveDiscount;
  if (totalAmount <= 0) {
    return <Badge variant="default" className="bg-green-500">Đã thanh toán đủ</Badge>;
  }
  return <Badge variant="secondary">Chưa thanh toán đủ</Badge>;
};

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A';

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid date';
  }
};

export const PaymentHistoryTable = ({
  studentId,
  feeId,
  paymentDetails: externalPaymentDetails,
  isLoading: externalLoading
}: PaymentHistoryTableProps) => {
  const {
    paymentDetails,
    loading,
    handleFetchPaymentDetails,
    handleFetchPaymentDetailByStudentId,
    handleFetchPaymentDetailByFeeId,
    handleFetchPaymentDetailByStudentIdAndFeeId
  } = usePayment();


  const isExternalData = externalPaymentDetails !== undefined;
  const displayPaymentDetails = isExternalData ? externalPaymentDetails : paymentDetails;
  const displayLoading = isExternalData ? externalLoading : loading;

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
  }, [studentId, feeId, isExternalData, handleFetchPaymentDetails, handleFetchPaymentDetailByStudentId, handleFetchPaymentDetailByFeeId, handleFetchPaymentDetailByStudentIdAndFeeId]);

  const columns: ColumnDef<PaymentDetail>[] = [
    {
      accessorKey: 'fee_name',
      header: 'Loại phí',
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue('fee_name')}
          </div>
        );
      },
    },
    {
      accessorKey: 'student_name',
      header: 'Học sinh',
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue('student_name')}
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
            {amount.toLocaleString('vi-VN')} VNĐ
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
            {discount > 0 ? `-${discount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
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
          <div className="text-muted-foreground">
            {getPaymentMethodLabel(method)}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Ngày thanh toán',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string | Date;
        return (
          <div className="text-muted-foreground">
            {formatDate(date)}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const discount = row.getValue('have_discount') as number;
        return getPaymentStatusBadge(amount, discount);
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
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (!displayPaymentDetails || displayPaymentDetails.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Không có lịch sử thanh toán nào</div>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={displayPaymentDetails}
      pagination={true}
      filterColumn="student_name"
      filterPlaceholder="Tìm kiếm học sinh..."
    />
  );
};
