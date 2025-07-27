import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { ButtonSortingDataTable } from '@/components/common/button-sorting-datatable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSalary } from '@/hooks';
import type { Teacher, TeacherMonthlySummary } from '@/types/api.types';
import { displayDate } from '@/utils/date-formatters';
import {
  MoreHorizontal,
  Eye,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface SalarySummariesTableProps {
  teacher?: Teacher | null;
  showAllTeachers?: boolean;
}

export const SalarySummariesTable = ({ teacher, showAllTeachers = false }: SalarySummariesTableProps) => {
  const {
    handleFetchTeacherSalarySummaries,
    handleRecalculateMonthlySalary,
    paginatedSummaries,
    historyLoading,
    calculationLoading
  } = useSalary();

  const [page] = useState(0);
  const [size] = useState(12);

  useEffect(() => {
    if (teacher?.id) {
      handleFetchTeacherSalarySummaries(teacher.id, { page, size });
    }
  }, [teacher?.id, page, size, handleFetchTeacherSalarySummaries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getMonthYear = (month: number, year: number) => {
    const monthNames = [
      'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
      'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
    ];
    return `${monthNames[month - 1]}/${year}`;
  };

  const getCompletionRateBadge = (rate: number) => {
    if (rate >= 0.95) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          {formatPercentage(rate)}
        </Badge>
      );
    } else if (rate >= 0.85) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Minus className="h-3 w-3 mr-1" />
          {formatPercentage(rate)}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <TrendingDown className="h-3 w-3 mr-1" />
          {formatPercentage(rate)}
        </Badge>
      );
    }
  };

  const handleRecalculate = async (summary: TeacherMonthlySummary) => {
    try {
      await handleRecalculateMonthlySalary(summary.teacher_id, {
        month: summary.month,
        year: summary.year,
      });

      // Refresh the table
      if (teacher?.id) {
        handleFetchTeacherSalarySummaries(teacher.id, { page, size });
      }
    } catch (error) {
      console.error('Error recalculating salary:', error);
    }
  };

  const handleExport = (summary: TeacherMonthlySummary) => {
    // TODO: Implement export functionality
    console.log('Export salary summary:', summary);
  };

  const handleViewDetails = (summary: TeacherMonthlySummary) => {
    // TODO: Implement view details functionality
    console.log('View salary details:', summary);
  };

  const columns: ColumnDef<TeacherMonthlySummary>[] = [
    {
      accessorKey: 'month',
      header: ({ column }) => {
        return <ButtonSortingDataTable column={column} label="Tháng/Năm" />;
      },
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="font-medium">
            {getMonthYear(summary.month, summary.year)}
          </div>
        );
      },
    },
    ...(showAllTeachers ? [{
      accessorKey: 'teacher_name',
      header: 'Giáo viên',
      cell: ({ row }: { row: any }) => {
        return (
          <div className="font-medium">
            {row.original.teacher_name}
          </div>
        );
      },
    }] : []),
    {
      accessorKey: 'scheduled_lessons',
      header: ({ column }) => {
        return <ButtonSortingDataTable column={column} label="Buổi dạy" />;
      },
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-center">
            <div className="text-sm">
              <span className="font-medium text-green-600">{summary.completed_lessons}</span>
              <span className="text-muted-foreground">/{summary.scheduled_lessons}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              hoàn thành
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'completion_rate',
      header: ({ column }) => {
        return <ButtonSortingDataTable column={column} label="Tỷ lệ hoàn thành" />;
      },
      cell: ({ row }) => {
        return getCompletionRateBadge(row.original.completion_rate);
      },
    },
    {
      accessorKey: 'base_salary',
      header: ({ column }) => {
        return <ButtonSortingDataTable column={column} label="Lương cơ bản" />;
      },
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {formatCurrency(row.original.base_salary)}
          </div>
        );
      },
    },
    {
      accessorKey: 'performance_bonus',
      header: ({ column }) => {
        return <ButtonSortingDataTable column={column} label="Thưởng" />;
      },
      cell: ({ row }) => {
        const bonus = row.original.performance_bonus;
        return (
          <div className="text-right">
            {bonus > 0 ? (
              <span className="font-medium text-green-600">
                {formatCurrency(bonus)}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'total_salary',
      header: ({ column }) => {
        return <ButtonSortingDataTable column={column} label="Tổng lương" />;
      },
      cell: ({ row }) => {
        return (
          <div className="text-right font-bold text-lg">
            {formatCurrency(row.original.total_salary)}
          </div>
        );
      },
    },
    {
      accessorKey: 'create_at',
      header: 'Ngày tính',
      cell: ({ row }) => {
        return (
          <div className="text-sm text-muted-foreground">
            {displayDate(row.original.create_at as Date)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const summary = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(summary)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRecalculate(summary)}
                disabled={calculationLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tính lại
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(summary)}>
                <Download className="mr-2 h-4 w-4" />
                Xuất file
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (!teacher && !showAllTeachers) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Vui lòng chọn giáo viên để xem lịch sử lương</p>
        </div>
      </div>
    );
  }

  const summaries = paginatedSummaries?.content || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lịch sử lương</h3>
          {teacher && (
            <p className="text-sm text-muted-foreground">
              {teacher.account.name}
            </p>
          )}
        </div>

        {paginatedSummaries && (
          <Badge variant="outline">
            {paginatedSummaries.totalElements} bản ghi
          </Badge>
        )}
      </div>

      <DataTable
        columns={columns}
        data={summaries}
        pagination={true}
      />

      {summaries.length === 0 && !historyLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Chưa có dữ liệu lương</p>
          <p className="text-sm">Hãy tính lương để xem lịch sử</p>
        </div>
      )}
    </div>
  );
};