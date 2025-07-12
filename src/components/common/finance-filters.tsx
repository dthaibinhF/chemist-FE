import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Filter, Search } from 'lucide-react';
import { useState } from 'react';

interface FinanceFiltersProps {
    onFiltersChange: (filters: FinanceFilters) => void;
}

export interface FinanceFilters {
    dateRange: {
        from: Date | undefined;
        to: Date | undefined;
    };
    feeType: string;
    paymentStatus: string;
    searchTerm: string;
}

export const FinanceFilters = ({ onFiltersChange }: FinanceFiltersProps) => {
    const [filters, setFilters] = useState<FinanceFilters>({
        dateRange: {
            from: undefined,
            to: undefined,
        },
        feeType: 'all',
        paymentStatus: 'all',
        searchTerm: '',
    });

    const handleFilterChange = (key: keyof FinanceFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
        const newFilters = {
            ...filters,
            dateRange: { from, to }
        };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: FinanceFilters = {
            dateRange: { from: undefined, to: undefined },
            feeType: 'all',
            paymentStatus: 'all',
            searchTerm: '',
        };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Bộ lọc
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Date Range Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Khoảng thời gian</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.dateRange.from ? (
                                        filters.dateRange.to ? (
                                            <>
                                                {format(filters.dateRange.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                                                {format(filters.dateRange.to, 'dd/MM/yyyy', { locale: vi })}
                                            </>
                                        ) : (
                                            format(filters.dateRange.from, 'dd/MM/yyyy', { locale: vi })
                                        )
                                    ) : (
                                        'Chọn khoảng thời gian'
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={filters.dateRange.from}
                                    selected={{
                                        from: filters.dateRange.from,
                                        to: filters.dateRange.to,
                                    }}
                                    onSelect={(range) => {
                                        handleDateRangeChange(range?.from, range?.to);
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Fee Type Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Loại phí</label>
                        <Select
                            value={filters.feeType}
                            onValueChange={(value) => handleFilterChange('feeType', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả loại phí" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại phí</SelectItem>
                                <SelectItem value="hoc_phi">Học phí</SelectItem>
                                <SelectItem value="phi_co_so">Phí cơ sở vật chất</SelectItem>
                                <SelectItem value="phi_khac">Phí khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Trạng thái</label>
                        <Select
                            value={filters.paymentStatus}
                            onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="paid">Đã thanh toán</SelectItem>
                                <SelectItem value="pending">Chưa thanh toán</SelectItem>
                                <SelectItem value="overdue">Quá hạn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tên học sinh..."
                                value={filters.searchTerm}
                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                    <Button variant="outline" onClick={clearFilters}>
                        Xóa bộ lọc
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}; 