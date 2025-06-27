import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormCreateGroup } from "./form-create-group";
import { useState } from "react";

export const DialogAddGroup = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Tạo nhóm mới</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo nhóm mới</DialogTitle>
                    <DialogDescription>Tạo nhóm mới để quản lý học sinh</DialogDescription>
                </DialogHeader>
                <FormCreateGroup />
            </DialogContent>
        </Dialog>
    )
}

