import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/currency-utils';
import { DollarSign, Download, FileText, Mail, TrendingUp, Users } from 'lucide-react';

interface FeeReportStats {
    totalFees: number;
    totalRevenue: number;
    paidStudents: number;
    unpaidStudents: number;
    averageAmount: number;
    mostExpensiveFee: { name: string; amount: number };
    cheapestFee: { name: string; amount: number };
}

interface FeeReportsProps {
    stats: FeeReportStats;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
    onSendReminder?: () => void;
}

export const FeeReports = ({
    stats,
    onExportExcel,
    onExportPDF,
    onSendReminder
}: FeeReportsProps) => {

    const paymentRate = stats.paidStudents + stats.unpaidStudents > 0
        ? ((stats.paidStudents / (stats.paidStudents + stats.unpaidStudents)) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Tổng quan báo cáo học phí
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                Thông tin cơ bản
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Tổng số loại học phí:</span>
                                    <span className="font-semibold">{stats.totalFees}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tổng thu nhập:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giá trung bình:</span>
                                    <span className="font-semibold">{formatCurrency(stats.averageAmount)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                Thống kê học sinh
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Đã đóng phí:</span>
                                    <span className="font-semibold text-green-600">{stats.paidStudents}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Chưa đóng phí:</span>
                                    <span className="font-semibold text-destructive">{stats.unpaidStudents}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tỷ lệ đóng phí:</span>
                                    <span className="font-semibold">{paymentRate}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                Chi tiết học phí
                            </div>
                            <div className="space-y-1">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Cao nhất:</div>
                                    <div className="text-sm">
                                        <div className="font-medium">{stats.mostExpensiveFee.name}</div>
                                        <div className="text-green-600">{formatCurrency(stats.mostExpensiveFee.amount)}</div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Thấp nhất:</div>
                                    <div className="text-sm">
                                        <div className="font-medium">{stats.cheapestFee.name}</div>
                                        <div className="text-blue-600">{formatCurrency(stats.cheapestFee.amount)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Hành động</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Xuất báo cáo</h4>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={onExportExcel}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Xuất Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={onExportPDF}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Xuất PDF
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Thông báo</h4>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={onSendReminder}
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Gửi nhắc nhở học phí
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    disabled
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Gửi báo cáo (Sắp có)
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Phân tích</h4>
                            <div className="space-y-2">
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-sm font-medium">Xu hướng thanh toán</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {stats.paidStudents > stats.unpaidStudents
                                            ? "Tình hình thanh toán tốt"
                                            : "Cần tăng cường nhắc nhở"
                                        }
                                    </div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-sm font-medium">Đề xuất</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {stats.unpaidStudents > 10
                                            ? "Nên gửi nhắc nhở hàng loạt"
                                            : "Liên hệ trực tiếp từng học sinh"
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 