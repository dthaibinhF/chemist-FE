import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayment } from '@/hooks/usePayment';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DialogAddPayment } from './dialog-add-payment';
import { PaymentHistoryTable } from './payment-history-table';

interface StudentPaymentProps {
  studentId: number;
}

export const StudentPayment = ({ studentId }: StudentPaymentProps) => {
  const [openAddPayment, setOpenAddPayment] = useState(false);
  const { loading, paymentDetails, handleFetchPaymentDetailByStudentId } = usePayment();

  useEffect(() => {
    handleFetchPaymentDetailByStudentId(studentId);
  }, [studentId, handleFetchPaymentDetailByStudentId]);

  const handleAddPayment = () => {
    setOpenAddPayment(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lịch sử thanh toán</CardTitle>
          <Button size="sm" onClick={() => setOpenAddPayment(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm thanh toán
          </Button>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable
            studentId={studentId}
            paymentDetails={paymentDetails}
            isLoading={loading}
          />
        </CardContent>
      </Card>
      <DialogAddPayment
        open={openAddPayment}
        onOpenChange={setOpenAddPayment}
        onSubmit={handleAddPayment}
      />
    </>
  );
};

