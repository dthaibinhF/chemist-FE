import axios from "axios";

import {
  getAccessToken,
  getRefreshToken,
  storeTokens,
} from "@/feature/auth/services/token-manager.ts";

const API_URL = import.meta.env.VITE_SERVER_ROOT_URL;

interface ApiOptions {
  auth: boolean;
}

export function createApiClient(
  resourceUrl: string,
  options: ApiOptions = { auth: true }
) {
  const axiosInstance = axios.create({
    baseURL: `${API_URL}/${resourceUrl}`,
    withCredentials: true,
  });
  if (options.auth) {
    axiosInstance.interceptors.request.use((config) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const accessToken = getAccessToken();
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          accessToken
        ) {
          originalRequest._retry = true;
          try {
            const refreshToken = getRefreshToken();
            const response = await axios.post(
              `${API_URL}/auth/refresh-token`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
                withCredentials: true,
              }
            );
            const newAccessToken = response.data.access_token;
            const newRefreshToken = response.data.refresh_token;
            storeTokens(newAccessToken, newRefreshToken);
            return axiosInstance(originalRequest);
          } catch (error) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }
  return axiosInstance;
}
