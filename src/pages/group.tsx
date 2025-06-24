import { usePageTitle } from "@/hooks/usePageTitle";
import { useGroup } from "@/feature/group/hooks/useGroup";
import { GroupList } from "@/feature/group/components/group-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Group } from "@/types/api.types";

const GroupManagement = () => {
    usePageTitle("Quản lý nhóm học");
    const { groups, loading, error, fetchGroups, createGroup } = useGroup();

    const handleCreateGroup = async (data: Omit<Group, 'id'>) => {
        try {
            await createGroup(data);
        } catch (err) {
            console.error("Failed to create group", err);
        }
    };

    const handleOpenCreateModal = () => {
        const newGroup: Omit<Group, 'id'> = {
            name: "",
            gradeId: 0,
            maxStudents: 20
        };
        handleCreateGroup(newGroup);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Quản lý nhóm học</h1>
                <Button 
                    onClick={handleOpenCreateModal}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo mới
                </Button>
            </div>

            {error && (
                <Card className="bg-destructive/10 text-destructive border-destructive">
                    {error}
                </Card>
            )}

            <GroupList 
                groups={groups}
                onEditGroup={(group) => {
                    // TODO: Implement edit group modal
                    console.log("Edit group:", group);
                }}
                onDeleteGroup={(id) => {
                    // TODO: Implement delete confirmation
                    console.log("Delete group:", id);
                }}
            />
        </div>
    );
}

export default GroupManagement;