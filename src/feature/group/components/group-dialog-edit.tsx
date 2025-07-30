import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Group } from '@/types/api.types';
import { Edit } from 'lucide-react';

import { GroupForm } from './group-form';

interface GroupDialogEditProps {
    group: Group;
    variant?: 'button' | 'dropdown';
}

const GroupDialogEdit = ({ group, variant = 'button' }: GroupDialogEditProps) => {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === 'dropdown' ? (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </DropdownMenuItem>
                ) : (
                    <Button variant="outline" className="flex items-center gap-2 px-4 py-2" >
                        <Edit className="size-4" />
                        Chỉnh sửa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa nhóm</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin nhóm học và lịch học.
                    </DialogDescription>
                </DialogHeader>
                <GroupForm
                    mode="edit"
                    initialData={group}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
};

export default GroupDialogEdit;