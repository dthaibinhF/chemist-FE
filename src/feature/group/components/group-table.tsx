import { DataTable } from "@/components/ui/data-table";
import { Group } from "@/types/api.types";
import { ColumnDef } from "@tanstack/react-table";
import { useGroup } from "../hooks/useGroup";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DialogAddGroup } from "./dialog-add-group";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";


const columns: ColumnDef<Group>[] = [
    {
        header: () => <div className="text-center">ID</div>,
        accessorKey: "id",
        cell: ({ row }) => {
            return <p className="text-center">{row.original.id}</p>
        }
    },
    {
        header: () => <div className="text-center">Tên nhóm</div>,
        accessorKey: "name",
        cell: ({ row }) => {
            return (
                <Button variant="link" asChild>
                    <Link to={`/group/${row.original.id}`} className="text-center hover:underline">
                        {row.original.name}
                    </Link>
                </Button>
            )
        }
    },
    {
        header: () => <div className="text-center">Loại nhóm</div>,
        accessorKey: "level",
        cell: ({ row }) => {
            let label;
            switch (row.original.level) {
                case "ADVANCED":
                    label = "Nâng cao";
                    break;
                case "REGULAR":
                    label = "Thường";
                    break;
                case "VIP":
                    label = "VIP";
                    break;
                default:
                    label = "Không xác định";
            }
            return (
                <div className="flex items-center justify-center">
                    <Badge className="bg-primary text-primary-foreground">{label}</Badge>
                </div>
            );
        }
    },
    {
        header: () => <div className="text-center">Số lượng học sinh hiện tại</div>,
        accessorKey: "student_details",
        cell: ({ row }) => {
            return <p className="text-center">{row.original.student_details?.length ?? 0}</p>
        }
    },
    {
        header: "Khối",
        accessorKey: "grade_name",
    },
    {
        header: "Năm học",
        accessorKey: "academic_year",
    }

]

const GroupTable = () => {
    const { groups, fetchGroupsWithDetail, loading } = useGroup();
    useEffect(() => {
        fetchGroupsWithDetail();
    }, [fetchGroupsWithDetail]);
    console.log(groups);
    if (loading) {
        return <div className="flex items-center justify-center py-12">
            <LoaderCircle size={40} className="animate-spin" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>;
    }
    return (
        <div>
            <DataTable
                pagination={false} columns={columns}
                data={groups}
                ComponentForCreate={<DialogAddGroup />}
            />
        </div>
    )
}

export default GroupTable;