import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Filter, X, Users, MapPin, User } from "lucide-react";

import { groupService } from "@/service/group.service";
import { roomService } from "@/service/room.service";
import type { TimetableFilterData } from "../schemas/timetable.schema";
import type { FilterOptions } from "../types/timetable.types";

interface TimetableFiltersProps {
  filters: TimetableFilterData;
  onFiltersChange: (filters: TimetableFilterData) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export const TimetableFilters: React.FC<TimetableFiltersProps> = ({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  className,
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    groups: [],
    teachers: [],
    rooms: [],
    deliveryModes: [
      { value: 1, label: "Trực tiếp" },
      { value: 2, label: "Trực tuyến" },
      { value: 3, label: "Kết hợp" },
    ],
  });
  const [, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [groupsData, roomsData] = await Promise.all([
          groupService.getAllGroups(),
          roomService.getAllRooms(),
          // TODO: Add teacher service
        ]);

        setFilterOptions({
          groups: groupsData.map(group => ({
            value: group.id || 0,
            label: group.name,
          })),
          teachers: [], // TODO: Load teachers
          rooms: roomsData.map(room => ({
            value: room.id || 0,
            label: `${room.name} - ${room.location}`,
          })),
          deliveryModes: [
            { value: 1, label: "Trực tiếp" },
            { value: 2, label: "Trực tuyến" },
            { value: 3, label: "Kết hợp" },
          ],
        });
      } catch (error) {
        console.error("Lỗi khi tải danh sách lọc:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearchChange(query);
    }, 300),
    [onSearchChange]
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof TimetableFilterData, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (key: 'start_date' | 'end_date', value: string) => {
    const date = value ? new Date(value) : undefined;
    handleFilterChange(key, date);
  };

  const clearFilter = (key: keyof TimetableFilterData) => {
    handleFilterChange(key, undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    onSearchChange("");
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

  const formatDateForInput = (date?: Date | string): string => {
  if (!date) return "";
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={className}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm nhóm, giáo viên, phòng học..."
            className="pl-9"
            defaultValue={searchQuery}
            onChange={handleSearchInput}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Lọc
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Đang lọc:</span>

          {searchQuery && (
            <Badge variant="secondary" className="flex items-center">
              <Search className="w-3 h-3 mr-1" />
              "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onSearchChange("")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.group_id && (
            <Badge variant="secondary" className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {filterOptions.groups.find(g => g.value === filters.group_id)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearFilter('group_id')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.room_id && (
            <Badge variant="secondary" className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {filterOptions.rooms.find(r => r.value === filters.room_id)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearFilter('room_id')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.teacher_id && (
            <Badge variant="secondary" className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {filterOptions.teachers.find(t => t.value === filters.teacher_id)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearFilter('teacher_id')}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-red-600"
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bộ lọc nâng cao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Group Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nhóm học</label>
                <Select
                  value={filters.group_id?.toString() || ""}
                  onValueChange={(value) => handleFilterChange('group_id', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả nhóm</SelectItem>
                    {filterOptions.groups.map(group => (
                      <SelectItem key={group.value} value={group.value.toString()}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phòng học</label>
                <Select
                  value={filters.room_id?.toString() || ""}
                  onValueChange={(value) => handleFilterChange('room_id', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả phòng</SelectItem>
                    {filterOptions.rooms.map(room => (
                      <SelectItem key={room.value} value={room.value.toString()}>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Giáo viên</label>
                <Select
                  value={filters.teacher_id?.toString() || ""}
                  onValueChange={(value) => handleFilterChange('teacher_id', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giáo viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả giáo viên</SelectItem>
                    {filterOptions.teachers.map(teacher => (
                      <SelectItem key={teacher.value} value={teacher.value.toString()}>
                        {teacher.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Mode Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hình thức</label>
                <Select
                  value={filters.delivery_mode || ""}
                  onValueChange={(value) => handleFilterChange('delivery_mode', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hình thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả hình thức</SelectItem>
                    <SelectItem value="OFFLINE">Trực tiếp</SelectItem>
                    <SelectItem value="ONLINE">Trực tuyến</SelectItem>
                    <SelectItem value="HYBRID">Kết hợp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Từ ngày</label>
                <Input
                  type="date"
                  value={formatDateForInput(filters.start_date)}
                  onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Đến ngày</label>
                <Input
                  type="date"
                  value={formatDateForInput(filters.end_date)}
                  onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}