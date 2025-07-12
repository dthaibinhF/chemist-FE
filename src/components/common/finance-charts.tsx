import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
    name: string;
    value: number;
    color?: string;
}

interface FinanceChartsProps {
    monthlyRevenue: ChartData[];
    feeDistribution: ChartData[];
    paymentTrend: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FinanceCharts = ({ monthlyRevenue, feeDistribution, paymentTrend }: FinanceChartsProps) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Biểu đồ thống kê</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="revenue" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                        <TabsTrigger value="revenue">Thu nhập theo tháng</TabsTrigger>
                        <TabsTrigger value="distribution">Phân bố loại phí</TabsTrigger>
                        <TabsTrigger value="trend">Xu hướng thanh toán</TabsTrigger>
                    </TabsList>

                    <TabsContent value="revenue" className="space-y-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), 'Thu nhập']}
                                        labelFormatter={(label) => `Tháng ${label}`}
                                    />
                                    <Bar dataKey="value" fill="#0088FE" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="space-y-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={feeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {feeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), 'Số tiền']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="trend" className="space-y-4">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={paymentTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                    <Tooltip
                                        formatter={(value: number) => [formatCurrency(value), 'Số tiền']}
                                        labelFormatter={(label) => `Ngày ${label}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}; 