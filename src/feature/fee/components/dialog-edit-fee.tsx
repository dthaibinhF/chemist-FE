import { useState } from 'react';


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Fee } from '@/types/api.types';

import { FeeForm } from './fee-form';

interface DialogEditFeeProps {
  fee: Fee;
  children: React.ReactNode;
}

export const DialogEditFee = ({ fee, children }: DialogEditFeeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật phí</DialogTitle>
          <DialogDescription>Cập nhật thông tin phí</DialogDescription>
        </DialogHeader>
        <FeeForm mode="edit" initialData={fee} onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
