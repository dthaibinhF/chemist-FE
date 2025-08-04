import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  createPaymentDetail,
  deletePaymentDetail,
  fetchPaymentDetailByFeeId,
  fetchPaymentDetailById,
  fetchPaymentDetailByStudentId,
  fetchPaymentDetailByStudentIdAndFeeId,
  fetchPaymentDetails,
  fetchPaymentsByDateRange,
  fetchPaymentsByStatus,
  searchPayments,
  updatePaymentDetail,
} from "@/redux/slice/payment.slice";
import { PaymentDetail, PaymentStatus, PaymentSearchParams } from "@/types/api.types";
import { useCallback } from "react";

export const usePayment = () => {
  const dispatch = useAppDispatch();
  const { paymentDetails, paymentDetail, loading, error } = useAppSelector(
    (state) => state.payment
  );

  const handleFetchPaymentDetails = useCallback(() => {
    dispatch(fetchPaymentDetails());
  }, [dispatch]);

  const handleFetchPaymentDetailById = useCallback(
    (id: number) => {
      dispatch(fetchPaymentDetailById(id));
    },
    [dispatch]
  );

  const handleCreatePaymentDetail = useCallback(
    (paymentDetail: PaymentDetail) => {
      dispatch(createPaymentDetail(paymentDetail));
    },
    [dispatch]
  );

  const handleUpdatePaymentDetail = useCallback(
    (id: number, paymentDetail: PaymentDetail) => {
      dispatch(updatePaymentDetail({ id, paymentDetail }));
    },
    [dispatch]
  );

  const handleDeletePaymentDetail = useCallback(
    (id: number) => {
      dispatch(deletePaymentDetail(id));
    },
    [dispatch]
  );

  const handleFetchPaymentDetailByStudentId = useCallback(
    (studentId: number) => {
      dispatch(fetchPaymentDetailByStudentId(studentId));
    },
    [dispatch]
  );

  const handleFetchPaymentDetailByFeeId = useCallback(
    (feeId: number) => {
      dispatch(fetchPaymentDetailByFeeId(feeId));
    },
    [dispatch]
  );

  const handleFetchPaymentDetailByStudentIdAndFeeId = useCallback(
    (studentId: number, feeId: number) => {
      dispatch(fetchPaymentDetailByStudentIdAndFeeId({ studentId, feeId }));
    },
    [dispatch]
  );

  // 🆕 NEW ENHANCED PAYMENT METHODS

  const handleFetchPaymentsByStatus = useCallback(
    (status: PaymentStatus) => {
      dispatch(fetchPaymentsByStatus(status));
    },
    [dispatch]
  );


  const handleFetchPaymentsByDateRange = useCallback(
    (params: PaymentSearchParams) => {
      dispatch(fetchPaymentsByDateRange(params));
    },
    [dispatch]
  );


  const handleSearchPayments = useCallback(
    (params: PaymentSearchParams) => {
      dispatch(searchPayments(params));
    },
    [dispatch]
  );

  return {
    paymentDetails,
    paymentDetail,
    loading,
    error,
    // Original methods
    handleFetchPaymentDetails,
    handleFetchPaymentDetailById,
    handleCreatePaymentDetail,
    handleUpdatePaymentDetail,
    handleDeletePaymentDetail,
    handleFetchPaymentDetailByStudentId,
    handleFetchPaymentDetailByFeeId,
    handleFetchPaymentDetailByStudentIdAndFeeId,
    // Enhanced methods
    handleFetchPaymentsByStatus,
    handleFetchPaymentsByDateRange,
    handleSearchPayments,
  };
};
