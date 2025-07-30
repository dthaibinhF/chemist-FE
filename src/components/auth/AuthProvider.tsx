// src/components/auth/AuthProvider.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { getAccount } from '@/feature/auth/services/authApi';
import { getAccessToken, getRefreshToken } from '@/feature/auth/services/token-manager';
import { storeAccountData, getStoredAccountData, clearStoredAccountData, validateAccountData } from '@/feature/auth/services/account-storage';
import { initializeTokenRefresh, stopTokenRefresh } from '@/feature/auth/services/token-refresh';
import {
  initializeAuthStart,
  initializeAuthSuccess,
  initializeAuthFailure,
  setAccount,
  logout
} from '@/feature/auth/slice/auth.slice';
import { useAuth } from '@/feature/auth/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/redux/hook';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshTokenAction } = useAuth();
  const { isInitializing, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuthentication = async () => {
      dispatch(initializeAuthStart());

      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();
        const storedAccount = getStoredAccountData();

        // No tokens found - user is not authenticated
        if (!accessToken && !refreshToken) {
          dispatch(initializeAuthFailure('No authentication tokens found'));
          return;
        }

        // We have stored account data and access token - quick initialization
        if (storedAccount && accessToken && validateAccountData(storedAccount)) {
          dispatch(initializeAuthSuccess({
            account: storedAccount,
            hasValidTokens: true
          }));

          // Start token auto-refresh after successful initialization
          initializeTokenRefresh(
            () => {
              console.log('Token refreshed successfully');
            },
            () => {
              console.warn('Token refresh failed, logging out user');
              dispatch(logout());
              clearStoredAccountData();
              navigate('/login');
            }
          );
          return;
        }

        // We have tokens but no valid account data - fetch from server
        if (accessToken) {
          try {
            const response = await getAccount();
            const accountData = response.payload;

            // Store the account data for future use
            storeAccountData(accountData);
            dispatch(setAccount(accountData));
            dispatch(initializeAuthSuccess({
              account: accountData,
              hasValidTokens: true
            }));
          } catch (error) {
            console.error('Failed to fetch account with access token:', error);

            // Access token might be expired, try refresh token
            if (refreshToken) {
              try {
                await refreshTokenAction();
                // After successful refresh, try to get account again
                const response = await getAccount();
                const accountData = response.payload;

                storeAccountData(accountData);
                dispatch(setAccount(accountData));
                dispatch(initializeAuthSuccess({
                  account: accountData,
                  hasValidTokens: true
                }));
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Both access and refresh tokens are invalid
                clearStoredAccountData();
                dispatch(initializeAuthFailure('Authentication tokens expired'));
              }
            } else {
              // No refresh token available
              clearStoredAccountData();
              dispatch(initializeAuthFailure('Access token invalid and no refresh token'));
            }
          }
        } else if (refreshToken) {
          // Only refresh token available - try to refresh
          try {
            await refreshTokenAction();
            const response = await getAccount();
            const accountData = response.payload;

            storeAccountData(accountData);
            dispatch(setAccount(accountData));
            dispatch(initializeAuthSuccess({
              account: accountData,
              hasValidTokens: true
            }));
          } catch (error) {
            console.error('Token refresh failed:', error);
            clearStoredAccountData();
            dispatch(initializeAuthFailure('Token refresh failed'));
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        clearStoredAccountData();
        dispatch(initializeAuthFailure('Authentication initialization failed'));
      }
    };

    // Only initialize if we're still in initializing state
    if (isInitializing) {
      initializeAuthentication();
    }
  }, [dispatch, refreshTokenAction, isInitializing, navigate]);

  // Cleanup token refresh on unmount
  useEffect(() => {
    return () => {
      stopTokenRefresh();
    };
  }, []);

  // Handle navigation after initialization
  useEffect(() => {
    if (!isInitializing) {
      const isPublicRoute = ['/login', '/ai-assistant', '/unauthorized'].includes(location.pathname);

      if (!isAuthenticated && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        navigate('/login', { replace: true });
      } else if (isAuthenticated && location.pathname === '/login') {
        // User is authenticated but on login page - redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isInitializing, location.pathname, navigate]);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};