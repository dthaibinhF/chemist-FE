import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchFees, fetchFee, createFee, updateFee, deleteFee } from "@/redux/slice/fee.slice";
import { Fee } from "@/types/api.types";
import { useCallback } from "react";

export const useFee = () => {
    const dispatch = useAppDispatch();
    const { fees, fee, loading, error } = useAppSelector(state => state.fee);

    const handleFetchFees = useCallback(() => {
        dispatch(fetchFees());
    }, [dispatch]);

    const handleFetchFee = useCallback((id: number) => {
        dispatch(fetchFee(id));
    }, [dispatch]);

    const handleCreateFee = useCallback((fee: Fee) => {
        dispatch(createFee(fee));
    }, [dispatch]);

    const handleUpdateFee = useCallback((id: number, fee: Fee) => {
        dispatch(updateFee({ id, data: fee }));
    }, [dispatch]);

    const handleDeleteFee = useCallback((id: number) => {
        dispatch(deleteFee(id));
    }, [dispatch]);

    return {
        // Data
        fees,
        fee,
        loading,
        error,

        // Actions
        handleFetchFees,
        handleFetchFee,
        handleCreateFee,
        handleUpdateFee,
        handleDeleteFee,
    };
}