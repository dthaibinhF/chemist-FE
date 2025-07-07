import type { TCredentials } from '@/feature/auth/types/auth.type.ts';
import { createApiClient } from '@/service/api-client.ts';

const apiClient = createApiClient('auth', { auth: false });

export const loginWithEmailAndPassword = async (credential: TCredentials) => {
  const response = await apiClient.post('/login', {
    email: credential.email,
    password: credential.password,
  });
  return response.data;
};

export const getAccount = async () => {
  const apiFetchUser = createApiClient('auth');
  const response = await apiFetchUser.get('/me');
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const apiClient = createApiClient('auth', { auth: false });
  const response = await apiClient.post(
    '/refresh-token',
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );
  return response.data;
};
