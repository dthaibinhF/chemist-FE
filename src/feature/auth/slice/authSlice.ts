import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TAccount, TAuthResponse} from "@/feature/auth/types/auth.type.ts";
import {getAccessToken, getRefreshToken} from "@/feature/auth/services/token-manager.ts";

type AuthState =  {
    account: TAccount | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
    account: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
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
        refreshTokenSuccess(state, action: PayloadAction<string>) {
            state.accessToken = action.payload;
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
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    refreshTokenSuccess,
    refreshTokenFailure,
} = authSlice.actions;

export default authSlice.reducer;

// console.log(authSlice)

