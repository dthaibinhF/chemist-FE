import { useState, useEffect } from "react";
import { groupService } from "@/service";
import { Group } from "@/types/api.types";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GroupListItem } from "@/types/group.types";

interface GroupListProps {
  groups: Group[];
  onEditGroup?: (group: Group) => void;
  onDeleteGroup?: (id: number) => void;
}

const columns: ColumnDef<GroupListItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "name",
    header: "Tên Nhóm",
  },
  {
    accessorKey: "grade_name",
    header: "Khoá Học",
  },
  {
    accessorKey: "student_count",
    header: "Số Học Sinh",
  },
  {
    id: "actions",
    header: "Hành Động",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => row.original.onEdit?.(row.original)}>
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => row.original.onDelete?.(row.original.id ?? -1)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const GroupList = ({ onEditGroup, onDeleteGroup }: GroupListProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const data = await groupService.getAllGroups();
        setGroups(data);
        setError(null);
      } catch {
        setError("Failed to fetch groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleDelete = async (id: number) => {
    if (!onDeleteGroup) return;
    
    try {
      await groupService.deleteGroup(id);
      onDeleteGroup(id);
    } catch (err) {
      console.error("Failed to delete group", err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={groups.map(group => ({
        ...group,
        onEdit: onEditGroup,
        onDelete: handleDelete,
      }))}
      pagination={true}
    />
  );
};
