// src/features/auth/hooks/useAuth.ts
import { useCallback } from "react";

import {
  clearTokens,
  getRefreshToken,
  storeTokens,
} from "@/feature/auth/services/token-manager.ts";
import type {
  TAuthResponse,
  TCredentials,
} from "@/feature/auth/types/auth.type.ts";
import { useAppDispatch, useAppSelector } from "@/redux/hook.ts";
import { accountHelpers, PERMISSIONS } from "@/utils/rbac-utils";

import {
  loginWithEmailAndPassword,
  refreshToken as refreshTokenApi,
} from "../services/authApi";
import {
  loginFailure,
  loginStart,
  loginSuccess,
  logout,
  refreshTokenFailure,
  refreshTokenSuccess,
} from "../slice/auth.slice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {
    account,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    refreshToken,
    isInitializing,
  } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: TCredentials) => {
      dispatch(loginStart());
      try {
        const response: TAuthResponse =
          await loginWithEmailAndPassword(credentials);
        const { access_token, refresh_token } = response;
        storeTokens(access_token, refresh_token); // Store server-provided tokens
        dispatch(loginSuccess({ access_token, refresh_token }));
      } catch (err) {
        dispatch(loginFailure("Login failed. Please check your credentials."));
        throw err;
      }
    },
    [dispatch]
  );

  const logoutAction = useCallback(() => {
    try {
      clearTokens();
      dispatch(logout());
    } catch (err) {
      dispatch(loginFailure("Logout failed."));
      throw err;
    }
  }, [dispatch]);

  const refreshTokenAction = useCallback(async () => {
    dispatch(loginStart());
    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) throw new Error("No refresh token");
      const response = await refreshTokenApi(currentRefreshToken);
      const { access_token, refresh_token } = response;
      storeTokens(access_token, refresh_token);
      dispatch(refreshTokenSuccess({ access_token, refresh_token }));
      return access_token;
    } catch (err) {
      dispatch(refreshTokenFailure("Token refresh failed."));
      logoutAction();
      throw err;
    }
  }, [dispatch, logoutAction]);

  // Multi-role helper functions
  const hasRole = useCallback((role: string) => {
    return accountHelpers.hasRole(account, role);
  }, [account]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return accountHelpers.hasAnyRole(account, roles);
  }, [account]);

  const hasPermission = useCallback((permission: keyof typeof PERMISSIONS) => {
    return accountHelpers.hasPermission(account, permission);
  }, [account]);

  const getCurrentRole = useCallback(() => {
    return accountHelpers.getCurrentRoleName(account);
  }, [account]);

  const getAllRoles = useCallback(() => {
    return accountHelpers.getAllRoleNames(account);
  }, [account]);

  return {
    // Core auth state
    account,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    refreshToken,
    isInitializing,
    
    // Auth actions
    refreshTokenAction,
    login,
    logout: logoutAction,
    
    // Multi-role helpers
    hasRole,
    hasAnyRole,
    hasPermission,
    getCurrentRole,
    getAllRoles,
    
    // Legacy compatibility
    userRole: getCurrentRole(), // For backward compatibility with single-role logic
  };
};
