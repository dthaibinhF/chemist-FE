import type { ColumnDef } from '@tanstack/react-table';
import { Eye, LoaderCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';

import { ButtonSortingDataTable } from '@/components/common/button-sorting-datatable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { Group } from '@/types/api.types';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DialogAddGroup } from './dialog-add-group';
import GroupDialogEdit from './group-dialog-edit';
import { useGroup } from '@/hooks/useGroup';
import { useRolePermissions } from '@/hooks/useRolePermissions';
// import { EditGroupDialog } from './edit-group-dialog';

interface GroupTableProps {
  academicYearId?: string;
  gradeId?: string;
}

const GroupTable: React.FC<GroupTableProps> = ({ academicYearId, gradeId }) => {
  const { groups, handleFetchGroupsWithDetail, loading, handleDeleteGroup,  } = useGroup();
  const [sortedGroups, setSortedGroups] = useState<Group[]>([]);
  const navigate = useNavigate();
  const revalidate = useRevalidator();
  const { group: groupPermissions } = useRolePermissions();

  const handleViewGroup = useCallback((group: Group) => {
    navigate(`/group/${group.id}`);
  }, [navigate]);

  const deleteGroup = useCallback((group: Group) => {
    handleDeleteGroup(group.id as number);
    toast.success('Xóa nhóm thành công!');
    revalidate.revalidate();
  }, [handleDeleteGroup, revalidate]);

  useEffect(() => {
    handleFetchGroupsWithDetail();
  }, [handleFetchGroupsWithDetail]);

  useEffect(() => {
    let filteredGroups = [...groups];

    if (academicYearId) {
      filteredGroups = filteredGroups.filter(
        (group) => String(group.academic_year_id) === academicYearId
      );
    }

    if (gradeId) {
      filteredGroups = filteredGroups.filter((group) => String(group.grade_id) === gradeId);
    }

    // Sort groups by id in descending order
    const sortedGroups = [...filteredGroups].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    setSortedGroups(sortedGroups);
  }, [groups, academicYearId, gradeId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderCircle size={40} className="animate-spin" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

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
          <Button variant="link" className="w-fit" onClick={() => handleViewGroup(row.original)}>
            {row.original.name}
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
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const actionItems = [
          { 
            label: 'Xem chi tiết', 
            icon: Eye, 
            action: () => handleViewGroup(row.original), 
            show: true 
          },
          { 
            label: 'Chỉnh sửa', 
            component: <GroupDialogEdit group={row.original} variant="dropdown" />, 
            show: groupPermissions.canManageGroups 
          },
          { 
            label: 'Xóa', 
            icon: Trash2, 
            action: () => deleteGroup(row.original), 
            show: groupPermissions.canManageGroups,
            destructive: true 
          }
        ].filter(item => item.show);

        if (actionItems.length === 0) {
          return null;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actionItems.map((item, index) => (
                <div key={index}>
                  {item.component ? (
                    item.component
                  ) : (
                    <DropdownMenuItem
                      onClick={item.action}
                      className={item.destructive ? "text-destructive focus:text-destructive" : ""}
                    >
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.label}
                    </DropdownMenuItem>
                  )}
                  {item.destructive && index < actionItems.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },

    }
  ];


  return (
    <div>
      <DataTable
        pagination={false}
        columns={columns}
        data={sortedGroups}
        ComponentForCreate={groupPermissions.canManageGroups ? <DialogAddGroup /> : undefined}
      />
    </div>
  );
};

export default GroupTable;
