import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { getAccessToken, getRefreshToken } from '@/feature/auth/services/token-manager.ts';
import { getStoredAccountData } from '@/feature/auth/services/account-storage.ts';
import type { TAccount, TAuthResponse } from '@/feature/auth/types/auth.type.ts';

type AuthState = {
  account: TAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitializing: boolean;
};

const initialState: AuthState = {
  account: getStoredAccountData(),
  isAuthenticated: false, // Will be set by initialization
  isLoading: false,
  error: null,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  isInitializing: true, // Start as initializing
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<TAuthResponse>) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.account = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    refreshTokenSuccess(state, action: PayloadAction<TAuthResponse>) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.isLoading = false;
    },
    refreshTokenFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.account = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    setAccount(state, action: PayloadAction<TAccount>) {
      state.account = action.payload;
    },
    // Authentication initialization actions
    initializeAuthStart(state) {
      state.isInitializing = true;
      state.error = null;
    },
    initializeAuthSuccess(state, action: PayloadAction<{ account: TAccount; hasValidTokens: boolean }>) {
      state.isInitializing = false;
      state.account = action.payload.account;
      state.isAuthenticated = action.payload.hasValidTokens;
    },
    initializeAuthFailure(state, action: PayloadAction<string>) {
      state.isInitializing = false;
      state.isAuthenticated = false;
      state.account = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = action.payload;
    },
    // Quick initialization completion (when tokens are valid)
    completeInitialization(state) {
      state.isInitializing = false;
      if (state.accessToken && state.account) {
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  refreshTokenFailure,
  setAccount,
  initializeAuthStart,
  initializeAuthSuccess,
  initializeAuthFailure,
  completeInitialization,
} = authSlice.actions;

export default authSlice.reducer;

// console.log(authSlice)
