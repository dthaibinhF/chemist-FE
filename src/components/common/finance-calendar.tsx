import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface PaymentEvent {
    id: number;
    date: Date;
    studentName: string;
    amount: number;
    feeType: string;
    status: 'paid' | 'pending' | 'overdue';
}

interface FinanceCalendarProps {
    paymentEvents: PaymentEvent[];
    onDateSelect?: (date: Date) => void;
}

export const FinanceCalendar = ({ paymentEvents, onDateSelect }: FinanceCalendarProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedEvents, setSelectedEvents] = useState<PaymentEvent[]>([]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const eventsOnDate = paymentEvents.filter(event =>
                format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            );
            setSelectedEvents(eventsOnDate);
            onDateSelect?.(date);
        }
    };

    const getDateClassName = (date: Date) => {
        const eventsOnDate = paymentEvents.filter(event =>
            format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );

        if (eventsOnDate.length === 0) return '';

        const hasOverdue = eventsOnDate.some(event => event.status === 'overdue');
        const hasPending = eventsOnDate.some(event => event.status === 'pending');
        const hasPaid = eventsOnDate.some(event => event.status === 'paid');

        if (hasOverdue) return 'bg-red-100 text-red-800 hover:bg-red-200';
        if (hasPending) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        if (hasPaid) return 'bg-green-100 text-green-800 hover:bg-green-200';

        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    };

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Lịch thanh toán
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <div>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                            // @ts-expect-error: Custom day className function for calendar days
                            classNames={{
                                day: (date: Date) => getDateClassName(date),
                            }}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                {selectedDate ? (
                                    `Sự kiện ngày ${format(selectedDate, 'dd/MM/yyyy', { locale: vi })}`
                                ) : (
                                    'Chọn ngày để xem chi tiết'
                                )}
                            </h3>

                            {selectedEvents.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedEvents.map((event) => (
                                        <Dialog key={event.id}>
                                            <DialogTrigger asChild>
                                                <div className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">{event.studentName}</span>
                                                        {getStatusBadge(event.status)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <div>{event.feeType}</div>
                                                        <div className="font-semibold">{formatCurrency(event.amount)}</div>
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Chi tiết thanh toán</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Học sinh:</label>
                                                        <p>{event.studentName}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Loại phí:</label>
                                                        <p>{event.feeType}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Số tiền:</label>
                                                        <p className="font-semibold">{formatCurrency(event.amount)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Ngày:</label>
                                                        <p>{format(event.date, 'dd/MM/yyyy', { locale: vi })}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Trạng thái:</label>
                                                        <div className="mt-1">{getStatusBadge(event.status)}</div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                                </div>
                            ) : selectedDate ? (
                                <p className="text-muted-foreground">Không có sự kiện nào trong ngày này</p>
                            ) : (
                                <p className="text-muted-foreground">Chọn một ngày để xem các sự kiện thanh toán</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Chú thích:</h4>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                                    <span>Đã thanh toán</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                                    <span>Chưa thanh toán</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-100 rounded"></div>
                                    <span>Quá hạn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 