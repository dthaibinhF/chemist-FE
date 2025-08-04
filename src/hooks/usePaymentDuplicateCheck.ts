import { useState, useEffect, useCallback } from 'react';
import { checkDuplicatePayment, PaymentValidationResult } from '@/utils/payment-duplicate-validation';
import { useFee } from '@/hooks/useFee';

interface UsePaymentDuplicateCheckParams {
    studentId: number;
    feeId: number;
    enabled?: boolean;
}

interface UsePaymentDuplicateCheckReturn {
    validationResult: PaymentValidationResult | null;
    isValidating: boolean;
    error: string | null;
    refetch: () => void;
}

export const usePaymentDuplicateCheck = ({
    studentId,
    feeId,
    enabled = true
}: UsePaymentDuplicateCheckParams): UsePaymentDuplicateCheckReturn => {
    const [validationResult, setValidationResult] = useState<PaymentValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { fees } = useFee();

    const validatePayment = useCallback(async () => {
        if (!enabled || !studentId || !feeId || studentId === 0 || feeId === 0) {
            setValidationResult(null);
            setError(null);
            return;
        }

        const selectedFee = fees.find(fee => fee.id === feeId);
        if (!selectedFee || !selectedFee.amount) {
            setValidationResult(null);
            setError('Không tìm thấy thông tin phí');
            return;
        }

        console.log('selectedFee', selectedFee);

        setIsValidating(true);
        setError(null);

        try {
            const result = await checkDuplicatePayment(studentId, feeId, selectedFee.amount);
            console.log('result', result);
            setValidationResult(result);
        } catch (err) {
            console.error('Error in payment duplicate check:', err);
            setError('Lỗi khi kiểm tra thanh toán');
            setValidationResult(null);
        } finally {
            setIsValidating(false);
        }
    }, [studentId, feeId, enabled, fees]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            validatePayment();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [validatePayment]);

    const refetch = useCallback(() => {
        validatePayment();
    }, [validatePayment]);

    return {
        validationResult,
        isValidating,
        error,
        refetch
    };
};