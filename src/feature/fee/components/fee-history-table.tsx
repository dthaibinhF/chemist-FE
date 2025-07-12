import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Fee, PaymentDetail } from '@/types/api.types';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FeeHistoryTableProps {
    fee?: Fee;
    paymentDetails: PaymentDetail[];
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

const getPaymentStatusBadge = (amount: number, haveDiscount: number, feeAmount: number) => {
    const totalAmount = amount + haveDiscount;
    if (totalAmount === feeAmount) {
        return <Badge variant="default" className="bg-green-500 w-full">Đã thanh toán đủ</Badge>;
    }
    return <Badge variant="secondary" className="w-full bg-red-100">Chưa thanh toán đủ</Badge>;
};

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

export const FeeHistoryTable = ({ fee, paymentDetails, isLoading = false }: FeeHistoryTableProps) => {
    const columns: ColumnDef<PaymentDetail>[] = [
        {
            accessorKey: 'student_name',
            header: () => <div className='w-full text-center font-bold'>Học sinh</div>,
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
            header: () => <div className='w-full text-center font-bold'>Số tiền</div>,
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
            header: () => <div className='w-full font-bold'>Giảm giá</div>,
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
            header: () => <div className='w-full font-bold'>Phương thức</div>,
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
            accessorKey: 'status',
            header: () => <div className='w-full text-center font-bold'>Trạng thái</div>,
            cell: ({ row }) => {
                const amount = row.getValue('amount') as number;
                const discount = row.getValue('have_discount') as number;
                return getPaymentStatusBadge(amount, discount, fee?.amount ?? 0);
            },
        },
        {
            accessorKey: 'create_at',
            header: () => <div className='w-full text-center font-bold'>Ngày thanh toán</div>,
            cell: ({ row }) => {
                const date = row.getValue('create_at') as Date;
                return (
                    <div className="text-muted-foreground text-center">
                        {formatDate(date)}
                    </div>
                );
            },
        },
        {
            accessorKey: 'description',
            header: () => <div className='w-full font-bold'>Ghi chú</div>,
            cell: ({ row }) => {
                const description = row.getValue('description') as string;
                return (
                    <div className="text-muted-foreground max-w-[200px] truncate" title={description}>
                        {description || ''}
                    </div>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="rounded-md border p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    if (!paymentDetails || paymentDetails.length === 0) {
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
            data={paymentDetails}
            pagination={true}
            filterColumn="student_name"
            filterPlaceholder="Tìm kiếm học sinh..."
        />
    );
}; 