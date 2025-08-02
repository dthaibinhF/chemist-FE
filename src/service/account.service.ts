import type { TAccount } from "@/feature/auth/types/auth.type.ts";
import { createApiClient } from "@/service/api-client.ts";

const apiClient = createApiClient("/");

export type TCreateAccountData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    role_ids?: number[];
};

export type TUpdateAccountData = {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
};

export const registerAccount = async (accountData: TCreateAccountData): Promise<TAccount> => {
    const response = await apiClient.post("auth/register", accountData);
    return response.data;
};

export const getAllAccounts = async (): Promise<TAccount[]> => {
    const response = await apiClient.get("account");
    return response.data;
};

export const getAccountById = async (accountId: number): Promise<TAccount> => {
    const response = await apiClient.get(`account/${accountId}`);
    return response.data;
};

export const updateAccount = async (accountId: number, updateData: TUpdateAccountData): Promise<TAccount> => {
    const response = await apiClient.put(`account/${accountId}`, updateData);
    return response.data;
};

export const deleteAccount = async (accountId: number): Promise<void> => {
    await apiClient.delete(`account/${accountId}`);
};

export const deactivateAccount = async (accountId: number): Promise<TAccount> => {
    const response = await apiClient.post(`account/${accountId}/deactivate`);
    return response.data;
};

export const reactivateAccount = async (accountId: number): Promise<TAccount> => {
    const response = await apiClient.post(`account/${accountId}/reactivate`);
    return response.data;
};