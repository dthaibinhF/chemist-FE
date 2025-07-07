import type { ColumnDef } from '@tanstack/react-table';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ButtonSortingDataTable } from '@/components/common/button-sorting-datatable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { Group } from '@/types/api.types';

import { useGroup } from '../hooks/useGroup';
import { DialogAddGroup } from './dialog-add-group';

const columns: ColumnDef<Group>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return <ButtonSortingDataTable className="" column={column} label="ID" />;
    },
    cell: ({ row }) => <p className="font-mono text-sm pl-7">{row.original.id}</p>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <ButtonSortingDataTable className="" column={column} label="Tên nhóm" />
    ),
    cell: ({ row }) => {
      return (
        <Button variant="ghost" className="w-fit" asChild>
          <Link to={`/group/${row.original.id}`} className="text-center hover:underline">
            {row.original.name}
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: 'level',
    header: ({ column }) => {
      return <ButtonSortingDataTable className="text-center " column={column} label="Loại nhóm" />;
    },
    cell: ({ row }) => {
      let label;
      switch (row.original.level) {
        case 'ADVANCED':
          label = 'Nâng cao';
          break;
        case 'REGULAR':
          label = 'Thường';
          break;
        case 'VIP':
          label = 'VIP';
          break;
        default:
          label = 'Không xác định';
      }
      return (
        <div className="flex items-center justify-center">
          <Badge className="bg-primary text-primary-foreground">{label}</Badge>
        </div>
      );
    },
  },
  {
    header: () => <div className="text-center">Số lượng học sinh hiện tại</div>,
    accessorKey: 'student_details',
    cell: ({ row }) => {
      return <p className="text-center">{row.original.student_details?.length ?? 0}</p>;
    },
  },
  {
    header: 'Khối',
    accessorKey: 'grade_name',
  },
  {
    header: 'Năm học',
    accessorKey: 'academic_year',
  },
];

const GroupTable = () => {
  const { groups, fetchGroupsWithDetail, loading } = useGroup();
  const [sortedGroups, setSortedGroups] = useState<Group[]>([]);
  useEffect(() => {
    fetchGroupsWithDetail();
  }, [fetchGroupsWithDetail]);

  useEffect(() => {
    // Sort groups by id in descending order
    const sortedGroups = [...groups].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    setSortedGroups(() => [...sortedGroups]);
  }, [groups]);
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
      <DataTable
        pagination={false}
        columns={columns}
        data={sortedGroups}
        ComponentForCreate={<DialogAddGroup />}
      />
    </div>
  );
};

export default GroupTable;
