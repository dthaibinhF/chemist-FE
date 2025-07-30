/**
 * Currency formatting utilities for Vietnamese Dong (VND)
 * Centralized currency formatting to ensure consistency across the application
 */

/**
 * Format a number as Vietnamese currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "1.000.000 ₫")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format a number as Vietnamese currency without currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string with VNĐ suffix (e.g., "1.000.000 VNĐ")
 */
export const formatCurrencyVND = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} VNĐ`;
};

/**
 * Format a number with Vietnamese locale (no currency symbol)
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1.000.000")
 */
export const formatNumber = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};

/**
 * Format currency with compact notation for large amounts
 * @param amount - The amount to format
 * @returns Compact formatted currency (e.g., "1,2 triệu ₫")
 */
export const formatCurrencyCompact = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    compactDisplay: 'long',
  }).format(amount);
};

/**
 * Parse a formatted currency string back to number
 * @param currencyString - The formatted currency string
 * @returns Parsed number or 0 if parsing fails
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and Vietnamese formatting
  const cleanString = currencyString
    .replace(/[₫VNĐ\s]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Check if an amount is a valid currency value
 * @param amount - The amount to validate
 * @returns True if valid, false otherwise
 */
export const isValidCurrencyAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * Format currency for display in tables (shorter format)
 * @param amount - The amount to format
 * @returns Formatted currency optimized for table display
 */
export const formatCurrencyTable = (amount: number): string => {
  if (amount >= 1000000) {
    return formatCurrencyCompact(amount);
  }
  return formatCurrency(amount);
};