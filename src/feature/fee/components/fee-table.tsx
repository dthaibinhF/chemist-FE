import type { ColumnDef } from '@tanstack/react-table';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ButtonSortingDataTable } from '@/components/common/button-sorting-datatable';
import { DialogConfirmation } from '@/components/common/dialog-confirmation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFee } from '@/hooks/useFee';
import type { Fee } from '@/types/api.types';
import { displayDate } from '@/utils/date-formatters';
import { LoaderCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DialogAddFee } from './dialog-add-fee';
import { DialogEditFee } from './dialog-edit-fee';

const FeeTable = () => {
  const { fees, loading, handleFetchFees, handleDeleteFee } = useFee();

  useEffect(() => {
    handleFetchFees();
  }, [handleFetchFees]);

  const columns: ColumnDef<Fee>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => {
        return <ButtonSortingDataTable className="" column={column} label="ID" />;
      },
    },
    {
      accessorKey: 'name',
      header: 'Tên phí',
      cell: ({ row }) => {
        const fee = row.original;
        return (
          <Link to={`/fee/${fee.id}`} className="font-medium text-primary hover:underline">
            {fee.name}
          </Link>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Số tiền',
      cell: ({ row }) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.original.amount);
      }
    },
    {
      accessorKey: 'start_time',
      header: 'Ngày bắt đầu',
      cell: ({ row }) => {
        return displayDate(row.original.start_time);
      }
    },
    {
      accessorKey: 'end_time',
      header: 'Ngày kết thúc',
      cell: ({ row }) => {
        return displayDate(row.original.end_time);
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const fee = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DialogEditFee fee={fee}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
              </DialogEditFee>
              <DialogConfirmation
                title="Xóa phí"
                description={`Bạn có chắc chắn muốn xóa phí ${fee.name}?`}
                onConfirm={() => fee.id && handleDeleteFee(fee.id)}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DialogConfirmation>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle size={40} className="animate-spin" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <DataTable columns={columns} data={fees} ComponentForCreate={<DialogAddFee />} />
    </div>
  );
};

export default FeeTable;
