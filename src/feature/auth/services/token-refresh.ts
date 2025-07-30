// src/feature/auth/services/token-refresh.ts
import { getAccessToken, getRefreshToken } from './token-manager';
import { refreshToken as refreshTokenApi } from './authApi';


/**
 * Decode JWT token and extract expiration time
 */
export const getTokenExpiration = (token: string): number | null => {
  try {
    // Simple JWT decode without external library
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired or will expire within the specified buffer time
 */
export const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds
  const now = Date.now();
  
  return (expiration - now) <= bufferTime;
};

/**
 * Check if token is completely expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  return Date.now() >= expiration;
};

/**
 * Get time until token expires (in milliseconds)
 */
export const getTimeUntilExpiration = (token: string): number => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;

  return Math.max(0, expiration - Date.now());
};

/**
 * Token auto-refresh manager class
 */
class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshCallbacks: Array<(success: boolean) => void> = [];

  /**
   * Start the auto-refresh timer
   */
  startAutoRefresh(onRefreshSuccess?: () => void, onRefreshFailure?: () => void): void {
    this.clearRefreshTimer();

    const scheduleNextRefresh = () => {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const timeUntilExpiration = getTimeUntilExpiration(accessToken);
      const refreshTime = Math.max(0, timeUntilExpiration - (5 * 60 * 1000)); // Refresh 5 minutes before expiry

      if (refreshTime <= 0) {
        // Token is already expired or expires very soon - refresh immediately
        this.refreshTokenIfNeeded(onRefreshSuccess, onRefreshFailure);
      } else {
        // Schedule refresh
        this.refreshTimer = setTimeout(() => {
          this.refreshTokenIfNeeded(onRefreshSuccess, onRefreshFailure);
        }, refreshTime);
      }
    };

    scheduleNextRefresh();
  }

  /**
   * Stop the auto-refresh timer
   */
  stopAutoRefresh(): void {
    this.clearRefreshTimer();
    this.isRefreshing = false;
    this.refreshCallbacks = [];
  }

  /**
   * Manually trigger token refresh if needed
   */
  async refreshTokenIfNeeded(onSuccess?: () => void, onFailure?: () => void): Promise<boolean> {
    const accessToken = getAccessToken();
    const refreshTokenValue = getRefreshToken();

    if (!accessToken || !refreshTokenValue) {
      console.warn('No tokens available for refresh');
      onFailure?.();
      return false;
    }

    if (!isTokenExpiringSoon(accessToken)) {
      // Token is still valid, no need to refresh
      onSuccess?.();
      return true;
    }

    // Prevent multiple concurrent refresh attempts
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshCallbacks.push((success) => resolve(success));
      });
    }

    this.isRefreshing = true;

    try {
      await refreshTokenApi(refreshTokenValue);
      
      // The refreshTokenApi should handle storing the new tokens
      // Notify all waiting callbacks
      this.refreshCallbacks.forEach(callback => callback(true));
      this.refreshCallbacks = [];
      
      onSuccess?.();
      
      // Schedule next refresh
      this.startAutoRefresh(onSuccess, onFailure);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Notify all waiting callbacks
      this.refreshCallbacks.forEach(callback => callback(false));
      this.refreshCallbacks = [];
      
      onFailure?.();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

// Export singleton instance
export const tokenRefreshManager = new TokenRefreshManager();

/**
 * Initialize token auto-refresh system
 */
export const initializeTokenRefresh = (
  onRefreshSuccess?: () => void,
  onRefreshFailure?: () => void
): void => {
  tokenRefreshManager.startAutoRefresh(onRefreshSuccess, onRefreshFailure);
};

/**
 * Stop token auto-refresh system
 */
export const stopTokenRefresh = (): void => {
  tokenRefreshManager.stopAutoRefresh();
};

/**
 * Manually refresh token if needed
 */
export const refreshTokenIfNeeded = (
  onSuccess?: () => void,
  onFailure?: () => void
): Promise<boolean> => {
  return tokenRefreshManager.refreshTokenIfNeeded(onSuccess, onFailure);
};