import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FeeHistoryTable, FeePaymentStats } from '@/feature/fee/components';
import { useFee } from '@/hooks/useFee';
import { usePayment } from '@/hooks/usePayment';

export const FeeDetail = () => {
  const { id } = useParams();
  const { fee: selectedFee, handleFetchFee: loadFee } = useFee();
  const { paymentDetails, loading: paymentLoading, handleFetchPaymentDetailByFeeId } = usePayment();

  useEffect(() => {
    if (id) {
      loadFee(Number(id));
      handleFetchPaymentDetailByFeeId(Number(id));
    }
  }, [id, loadFee, handleFetchPaymentDetailByFeeId]);

  if (!selectedFee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{selectedFee.name}</h2>
        <p className="text-muted-foreground">Chi tiết khoản phí</p>
      </div>

      <FeePaymentStats
        fee={selectedFee}
        paymentDetails={paymentDetails}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <FeeHistoryTable
            fee={selectedFee}
            paymentDetails={paymentDetails}
            isLoading={paymentLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
