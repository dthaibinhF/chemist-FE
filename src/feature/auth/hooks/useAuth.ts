// src/features/auth/hooks/useAuth.ts
import {useCallback} from 'react';
import {getAccount, loginWithEmailAndPassword} from '../services/authApi';
import {
    loginFailure,
    loginStart,
    loginSuccess,
    logout, setAccount,
} from '../slice/authSlice';
import {TAuthResponse, TCredentials} from "@/feature/auth/types/auth.type.ts";
import {useAppDispatch, useAppSelector} from "@/redux/hook.ts";
import {clearTokens, getAccessToken, getRefreshToken, storeTokens} from "@/feature/auth/services/token-manager.ts";

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

    const fetchUser = async () => {
        try {
            const response = await getAccount();
            const account = response.payload;
            dispatch(setAccount(account));
            // return response;
        } catch (error) {
            console.log(error);
        }
    }

    const login = useCallback(
        async (credentials: TCredentials) => {
            dispatch(loginStart());
            try {
                const response : TAuthResponse = await loginWithEmailAndPassword(credentials);
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
    //
    // const refreshTokenAction = useCallback(async () => {
    //     dispatch(loginStart());
    //     try {
    //         const currentRefreshToken = getRefreshToken();
    //         if (!currentRefreshToken) throw new Error('No refresh token');
    //         const response = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', {refreshToken: currentRefreshToken});
    //         const {accessToken} = response.data;
    //         storeTokens(accessToken, currentRefreshToken); // Store new access token
    //         dispatch(refreshTokenSuccess(accessToken));
    //         return accessToken;
    //     } catch (err) {
    //         dispatch(refreshTokenFailure('Token refresh failed.'));
    //         logoutAction();
    //         throw err;
    //     }
    // }, [dispatch, logoutAction]);

    return {
        account,
        isAuthenticated,
        isLoading,
        error,
        accessToken,
        refreshToken,
        login,
        logout: logoutAction,
        fetchUser,
        // refreshToken: refreshTokenAction,
    };
};
