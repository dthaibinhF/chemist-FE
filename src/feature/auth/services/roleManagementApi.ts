import type { TAccount } from "@/feature/auth/types/auth.type.ts";
import { createApiClient } from "@/service/api-client.ts";

const apiClient = createApiClient("auth");

/**
 * Role Management API Services
 * 
 * These services interact with the new many-to-many role management endpoints
 * introduced in the backend migration V7__Convert_account_role_to_many_to_many.sql
 */

/**
 * Add a specific role to an account
 * 
 * @param accountId - Account ID
 * @param roleId - Role ID to add
 * @returns Updated account data with new role
 */
export const addRoleToAccount = async (accountId: number, roleId: number): Promise<TAccount> => {
  const response = await apiClient.post(`/account/${accountId}/roles/${roleId}`);
  return response.data;
};

/**
 * Remove a specific role from an account
 * 
 * @param accountId - Account ID
 * @param roleId - Role ID to remove
 * @returns Updated account data without the removed role
 */
export const removeRoleFromAccount = async (accountId: number, roleId: number): Promise<TAccount> => {
  const response = await apiClient.delete(`/account/${accountId}/roles/${roleId}`);
  return response.data;
};

/**
 * Set all roles for an account (replaces existing roles)
 * 
 * @param accountId - Account ID
 * @param roleIds - Array of role IDs to set
 * @returns Updated account data with new roles
 */
export const setAccountRoles = async (accountId: number, roleIds: number[]): Promise<TAccount> => {
  const response = await apiClient.put(`/account/${accountId}/roles`, roleIds);
  return response.data;
};

/**
 * Get all available roles in the system
 * 
 * @returns Array of available roles
 */
export const getAllRoles = async () => {
  const response = await apiClient.get('/roles');
  return response.data;
};

/**
 * Get account details with role information
 * 
 * @param accountId - Account ID
 * @returns Account data with role information
 */
export const getAccountWithRoles = async (accountId: number): Promise<TAccount> => {
  const response = await apiClient.get(`/account/${accountId}`);
  return response.data;
};

/**
 * Bulk role assignment - assign same roles to multiple accounts
 * 
 * @param accountIds - Array of account IDs
 * @param roleIds - Array of role IDs to assign
 * @returns Array of updated accounts
 */
export const bulkAssignRoles = async (accountIds: number[], roleIds: number[]): Promise<TAccount[]> => {
  const response = await apiClient.post('/accounts/bulk-assign-roles', {
    account_ids: accountIds,
    role_ids: roleIds
  });
  return response.data;
};

/**
 * Bulk role removal - remove same roles from multiple accounts
 * 
 * @param accountIds - Array of account IDs
 * @param roleIds - Array of role IDs to remove
 * @returns Array of updated accounts
 */
export const bulkRemoveRoles = async (accountIds: number[], roleIds: number[]): Promise<TAccount[]> => {
  const response = await apiClient.post('/accounts/bulk-remove-roles', {
    account_ids: accountIds,
    role_ids: roleIds
  });
  return response.data;
};

/**
 * Get accounts by role - find all accounts with specific role(s)
 * 
 * @param roleIds - Role ID or array of role IDs to search for
 * @returns Array of accounts that have any of the specified roles
 */
export const getAccountsByRole = async (roleIds: number | number[]): Promise<TAccount[]> => {
  const ids = Array.isArray(roleIds) ? roleIds : [roleIds];
  const response = await apiClient.get('/accounts/by-roles', {
    params: { role_ids: ids.join(',') }
  });
  return response.data;
};

/**
 * Search accounts with role filters
 * 
 * @param filters - Search filters
 * @returns Filtered accounts
 */
export const searchAccountsWithRoles = async (filters: {
  name?: string;
  email?: string;
  role_ids?: number[];
  has_all_roles?: boolean; // true = must have ALL specified roles, false = must have ANY
}) => {
  const response = await apiClient.get('/accounts/search', {
    params: {
      ...filters,
      role_ids: filters.role_ids?.join(',')
    }
  });
  return response.data;
};