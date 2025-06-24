// src/features/auth/hooks/useAuth.ts
import {useCallback} from 'react';
import { loginWithEmailAndPassword, refreshToken as refreshTokenApi} from '../services/authApi';
import {
    loginFailure,
    loginStart,
    loginSuccess,
    logout,
    refreshTokenSuccess,
    refreshTokenFailure,
} from '../slice/authSlice';
import {TAuthResponse, TCredentials} from "@/feature/auth/types/auth.type.ts";
import {useAppDispatch, useAppSelector} from "@/redux/hook.ts";
import {clearTokens, storeTokens, getRefreshToken} from "@/feature/auth/services/token-manager.ts";

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const {
        account: account,
        isAuthenticated,
        isLoading,
        error,
        accessToken,
        refreshToken
    } = useAppSelector((state) => state.auth);

    const login = useCallback(
        async (credentials: TCredentials) => {
            dispatch(loginStart());
            try {
                const response: TAuthResponse = await loginWithEmailAndPassword(credentials);
                const {access_token, refresh_token} = response;
                storeTokens(access_token, refresh_token); // Store server-provided tokens
                dispatch(loginSuccess({access_token, refresh_token}));

            } catch (err) {
                dispatch(loginFailure('Login failed. Please check your credentials.'));
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
            dispatch(loginFailure('Logout failed.'));
            throw err;
        }
    }, [dispatch]);

    const refreshTokenAction = useCallback(async () => {
        dispatch(loginStart());
        try {
            const currentRefreshToken = getRefreshToken();
            if (!currentRefreshToken) throw new Error('No refresh token');
            const response = await refreshTokenApi(currentRefreshToken);
            const {access_token, refresh_token} = response;
            storeTokens(access_token, refresh_token);
            dispatch(refreshTokenSuccess({access_token, refresh_token}));
            return access_token;
        } catch (err) {
            dispatch(refreshTokenFailure('Token refresh failed.'));
            logoutAction();
            throw err;
        }
    }, [dispatch, logoutAction]);

    return {
        account,
        isAuthenticated,
        isLoading,
        error,
        accessToken,
        refreshToken: refreshTokenAction,
        login,
        logout: logoutAction,
    };
};
