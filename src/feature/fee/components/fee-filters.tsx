import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

export interface FeeFilters {
    searchTerm: string;
    feeType: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

interface FeeFiltersProps {
    onFiltersChange: (filters: FeeFilters) => void;
}

export const FeeFilters = ({ onFiltersChange }: FeeFiltersProps) => {
    const [filters, setFilters] = useState<FeeFilters>({
        searchTerm: '',
        feeType: 'all',
        sortBy: 'name',
        sortOrder: 'asc',
    });

    const handleFilterChange = (key: keyof FeeFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters: FeeFilters = {
            searchTerm: '',
            feeType: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
        };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const hasActiveFilters = filters.searchTerm || filters.feeType !== 'all' || filters.sortBy !== 'name';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Tìm kiếm và lọc
                </CardTitle>
                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Xóa bộ lọc
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tên học phí..."
                                value={filters.searchTerm}
                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                className="pl-8"
                            />
                        </div>
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

                    {/* Sort By */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sắp xếp theo</label>
                        <Select
                            value={filters.sortBy}
                            onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Tên phí</SelectItem>
                                <SelectItem value="amount">Số tiền</SelectItem>
                                <SelectItem value="start_time">Ngày bắt đầu</SelectItem>
                                <SelectItem value="end_time">Ngày kết thúc</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Thứ tự</label>
                        <Select
                            value={filters.sortOrder}
                            onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Thứ tự" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Tăng dần</SelectItem>
                                <SelectItem value="desc">Giảm dần</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 