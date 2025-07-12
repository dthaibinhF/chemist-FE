import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { DialogCreatePayment } from './dialog-create-payment';

export const PaymentExampleUsage = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Quản lý thanh toán</h2>
                <Button onClick={() => setOpen(true)}>
                    Tạo thanh toán mới
                </Button>
            </div>

            <DialogCreatePayment
                open={open}
                onOpenChange={setOpen}
            />

            {/* Nội dung trang thanh toán ở đây */}
            <div className="mt-4">
                <p>Danh sách thanh toán sẽ được hiển thị ở đây...</p>
            </div>
        </div>
    );
}; 