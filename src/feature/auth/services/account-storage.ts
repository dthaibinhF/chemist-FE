// src/feature/auth/services/account-storage.ts
import type { TAccount } from '@/feature/auth/types/auth.type';

const ACCOUNT_STORAGE_KEY = 'chemist_account_data';

/**
 * Store account data in localStorage with integrity check
 */
export const storeAccountData = (account: TAccount): void => {
  try {
    const accountData = {
      ...account,
      _timestamp: Date.now(),
      _version: '1.0'
    };
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accountData));
  } catch (error) {
    console.error('Failed to store account data:', error);
  }
};

/**
 * Retrieve account data from localStorage with validation
 */
export const getStoredAccountData = (): TAccount | null => {
  try {
    const storedData = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!storedData) return null;

    const accountData = JSON.parse(storedData);
    
    // Basic validation
    if (!accountData || typeof accountData !== 'object') {
      clearStoredAccountData();
      return null;
    }

    // Check if data is too old (older than 7 days)
    const timestamp = accountData._timestamp;
    if (timestamp && Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      clearStoredAccountData();
      return null;
    }

    // Remove metadata before returning
    const { _timestamp, _version, ...account } = accountData;
    return account as TAccount;
  } catch (error) {
    console.error('Failed to retrieve account data:', error);
    clearStoredAccountData();
    return null;
  }
};

/**
 * Clear stored account data
 */
export const clearStoredAccountData = (): void => {
  try {
    localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear account data:', error);
  }
};

/**
 * Check if account data exists in storage
 */
export const hasStoredAccountData = (): boolean => {
  return localStorage.getItem(ACCOUNT_STORAGE_KEY) !== null;
};

/**
 * Validate account data integrity
 */
export const validateAccountData = (account: any): account is TAccount => {
  return (
    account &&
    typeof account === 'object' &&
    typeof account.id === 'number' &&
    typeof account.email === 'string' &&
    account.role_name &&
    typeof account.role_name === 'string'
  );
};