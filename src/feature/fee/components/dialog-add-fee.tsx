import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { FormCreateFee } from './form-create-fee';

export const DialogAddFee = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Tạo phí mới</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo phí mới</DialogTitle>
          <DialogDescription>Tạo phí mới để áp dụng cho các nhóm học</DialogDescription>
        </DialogHeader>
        <FormCreateFee setOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};
