import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { DialogEditFee, FeeHistoryTable, FeePaymentStats } from '@/feature/fee/components';
import { useFee } from '@/hooks/useFee';
import { usePayment } from '@/hooks/usePayment';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Pencil } from 'lucide-react';

export const FeeDetail = () => {
  const { id } = useParams();
  const { fee: selectedFee, handleFetchFee: loadFee } = useFee();
  const { paymentDetails, loading: paymentLoading, handleFetchPaymentDetailByFeeId } = usePayment();
  const { financial } = useRolePermissions();

  const [openCreatePayment, setOpenCreatePayment] = useState(false);

  useEffect(() => {
    if (id) {
      loadFee(Number(id));
      handleFetchPaymentDetailByFeeId(Number(id));
    }
  }, [id, loadFee, handleFetchPaymentDetailByFeeId]);

  if (!selectedFee) {
    return (
      <div>Loading...</div>
    );
  }

  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{selectedFee.name}</h2>
          <p className="text-muted-foreground">Chi tiết khoản phí</p>
        </div>
        {financial.canManageFees && (
          <DialogEditFee fee={selectedFee}>
            <Button variant={'secondary'}>
              <Pencil />
              Cập nhật phí
            </Button>
          </DialogEditFee>
        )}
      </div>

      <FeePaymentStats
        fee={selectedFee}
        paymentDetails={paymentDetails}
      />
      {
        paymentLoading ? <div>Loading...</div> :
          <FeeHistoryTable
            fee={selectedFee}
            paymentDetails={paymentDetails}
            isLoading={paymentLoading}
            openCreatePayment={openCreatePayment}
            setOpenCreatePayment={setOpenCreatePayment}
          />
      }


    </div>
  );
};
