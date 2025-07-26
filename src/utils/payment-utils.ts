import { PaymentDetail } from '@/types/api.types';

/**
 * Payment validation utilities following the new API constraint:
 * amount + have_discount = generated_amount
 */

/**
 * Calculate the effective discount amount from payment detail
 * @param paymentDetail - Payment detail object
 * @returns The discount amount applied
 */
export function getEffectiveDiscount(paymentDetail: PaymentDetail): number {
  return paymentDetail.have_discount || 0;
}

/**
 * Get the original amount before discount
 * @param paymentDetail - Payment detail object
 * @returns The original fee amount
 */
export function getOriginalAmount(paymentDetail: PaymentDetail): number {
  return paymentDetail.generated_amount;
}

/**
 * Verify payment integrity based on the constraint
 * @param paymentDetail - Payment detail object
 * @returns true if payment amounts are valid
 */
export function isPaymentValid(paymentDetail: PaymentDetail): boolean {
  const discount = paymentDetail.have_discount || 0;
  return paymentDetail.amount + discount === paymentDetail.generated_amount;
}

/**
 * Payment form data interface for validation
 */
export interface PaymentFormData {
  fee_id: number;
  student_id: number;
  generated_amount: number;  // Original fee amount
  have_discount?: number;    // Discount given (optional)
  amount: number;           // Final amount = generated_amount - have_discount
  payment_status: string;
  due_date: string;
}

/**
 * Validate payment form data before submission
 * @param data - Payment form data
 * @returns Error message if invalid, null if valid
 */
export function validatePaymentForm(data: PaymentFormData): string | null {
  const discount = data.have_discount || 0;
  const expectedAmount = data.generated_amount - discount;

  if (data.amount !== expectedAmount) {
    return `Amount must equal generated_amount (${data.generated_amount}) minus discount (${discount}) = ${expectedAmount}`;
  }

  if (data.amount < 0) {
    return "Amount cannot be negative";
  }

  if (discount > data.generated_amount) {
    return "Discount cannot exceed generated amount";
  }

  return null; // Valid
}

/**
 * Auto-calculate final amount when discount changes
 * @param generatedAmount - Original fee amount
 * @param discount - Discount amount (default 0)
 * @returns Final amount after discount
*/
export function calculateFinalAmount(generatedAmount: number, discount: number = 0): number {
  return Math.max(0, generatedAmount - discount);
}

/**
 * Calculate savings percentage
 * @param paymentDetail - Payment detail object
 * @returns Percentage of savings from discount (0-100)
 */
export function calculateSavingsPercentage(paymentDetail: PaymentDetail): number {
  const discount = getEffectiveDiscount(paymentDetail);
  const originalAmount = getOriginalAmount(paymentDetail);

  if (originalAmount === 0) return 0;

  return Math.round((discount / originalAmount) * 100);
}

/**
 * Validate payment amounts in real-time for form inputs
 * @param amount - Payment amount
 * @param discount - Discount amount
 * @param generatedAmount - Original fee amount
 * @returns Validation result with error message if invalid
 */
export function validatePaymentAmounts(
  amount: number,
  discount: number,
  generatedAmount: number
): { isValid: boolean; message?: string } {
  // Check if discount exceeds generated amount
  if (discount > generatedAmount) {
    return {
      isValid: false,
      message: `Discount (${discount}) cannot exceed original amount (${generatedAmount})`
    };
  }

  // Check if amount is negative
  if (amount < 0) {
    return {
      isValid: false,
      message: "Payment amount cannot be negative"
    };
  }

  // Check constraint: amount + discount = generated_amount
  const expectedAmount = generatedAmount - discount;
  if (amount !== expectedAmount) {
    return {
      isValid: false,
      message: `Amount should be ${expectedAmount} (${generatedAmount} - ${discount})`
    };
  }

  return { isValid: true };
}

/**
 * Format payment amounts for display with discount information
 * @param paymentDetail - Payment detail object
 * @returns Formatted display object
 */
export function formatPaymentDisplay(paymentDetail: PaymentDetail) {
  const originalAmount = getOriginalAmount(paymentDetail);
  const discount = getEffectiveDiscount(paymentDetail);
  const finalAmount = paymentDetail.amount;
  const savingsPercentage = calculateSavingsPercentage(paymentDetail);

  return {
    originalAmount,
    discount,
    finalAmount,
    savingsPercentage,
    hasDiscount: discount > 0,
    isValid: isPaymentValid(paymentDetail)
  };
}

/**
 * Handle API errors related to payment validation
 * @param error - Error object from API response
 * @returns User-friendly error message
 */
export function handlePaymentApiError(error: any): string {
  // Handle payment integrity validation error
  if (error?.message?.includes('Payment amount integrity violation') ||
    error?.response?.data?.includes('Payment amount integrity violation')) {
    return 'Payment amounts don\'t add up correctly. Please check the values.';
  }

  // Handle constraint violation errors
  if (error?.message?.includes('constraint') ||
    error?.response?.data?.includes('constraint')) {
    return 'Payment data violates system constraints. Please verify all amounts.';
  }

  // Handle discount exceeds amount errors
  if (error?.message?.includes('discount') ||
    error?.response?.data?.includes('discount')) {
    return 'Discount amount is invalid. Please check the discount value.';
  }

  // Handle negative amount errors
  if (error?.message?.includes('negative') ||
    error?.response?.data?.includes('negative')) {
    return 'Payment amount cannot be negative.';
  }

  // Generic payment error
  if (error?.message?.includes('payment') ||
    error?.response?.data?.includes('payment')) {
    return 'Payment validation failed. Please check all payment details.';
  }

  // Fallback to original error message or generic message
  return error?.message || error?.response?.data || 'Payment operation failed. Please try again.';
}

/**
 * Create payment with enhanced error handling
 * @param createPaymentFn - Function to create payment
 * @param paymentData - Payment data to create
 * @returns Promise with enhanced error handling
 */
export async function createPaymentWithErrorHandling<T>(
  createPaymentFn: (data: T) => Promise<any>,
  paymentData: T
): Promise<any> {
  try {
    const result = await createPaymentFn(paymentData);
    return result;
  } catch (error) {
    console.error('Payment creation failed:', error);
    const friendlyError = handlePaymentApiError(error);
    throw new Error(friendlyError);
  }
}