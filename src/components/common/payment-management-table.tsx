import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DialogCreatePayment } from '@/feature/payment/components/dialog-create-payment';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download, Edit, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DialogConfirmation } from './dialog-confirmation';

interface Payment {
    id: number;
    studentName: string;
    feeType: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    status: 'paid' | 'pending' | 'overdue';
    description?: string;
}

interface PaymentManagementTableProps {
    payments: Payment[];
    onEdit?: (payment: Payment) => void;
    onDelete?: (paymentId: number) => void;
    onView?: (payment: Payment) => void;
}

export const PaymentManagementTable = ({
    payments,
    onEdit,
    onDelete,
    onView
}: PaymentManagementTableProps) => {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="default" className="bg-green-500">Đã thanh toán</Badge>;
            case 'pending':
                return <Badge variant="secondary">Chưa thanh toán</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Quá hạn</Badge>;
            default:
                return <Badge variant="outline">Không xác định</Badge>;
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'CASH':
                return 'Tiền mặt';
            case 'BANK_TRANSFER':
                return 'Chuyển khoản';
            default:
                return method;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const exportToExcel = () => {
        // Implement export functionality
        console.log('Exporting to Excel...');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quản lý thanh toán</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportToExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Xuất Excel
                    </Button>
                    <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tạo thanh toán
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">Học sinh</TableHead>
                                <TableHead className="min-w-[120px] hidden md:table-cell">Loại phí</TableHead>
                                <TableHead className="min-w-[120px]">Số tiền</TableHead>
                                <TableHead className="min-w-[120px] hidden lg:table-cell">Ngày thanh toán</TableHead>
                                <TableHead className="min-w-[120px] hidden lg:table-cell">Phương thức</TableHead>
                                <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                                <TableHead className="min-w-[120px] text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Không có dữ liệu thanh toán
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-medium">{payment.studentName}</div>
                                                <div className="text-sm text-muted-foreground md:hidden">
                                                    {payment.feeType}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{payment.feeType}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(payment.amount)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {format(payment.paymentDate, 'dd/MM/yyyy', { locale: vi })}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {getPaymentMethodLabel(payment.paymentMethod)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onView?.(payment)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit?.(payment)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <DialogConfirmation
                                                    title="Xóa thanh toán"
                                                    description={`Bạn có chắc chắn muốn xóa thanh toán của ${payment.studentName}?`}
                                                    onConfirm={() => onDelete?.(payment.id)}
                                                >
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogConfirmation>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Create Payment Dialog */}
                <DialogCreatePayment
                    open={openCreateDialog}
                    onOpenChange={setOpenCreateDialog}
                />
            </CardContent>
        </Card>
    );
}; 