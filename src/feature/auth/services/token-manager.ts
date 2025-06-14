// src/features/auth/services/tokenManager.ts
export const storeTokens = (accessToken: string, refreshToken: string) => {
    // Store tokens in HttpOnly, Secure cookies
    // Access token: 1 hour expiration
    // document.cookie = `accessToken=${accessToken}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`;
    document.cookie = `accessToken=${accessToken}; SameSite=Strict; Path=/; Max-Age=3600`;
    // Refresh token: 7 days expiration
    // document.cookie = `refreshToken=${refreshToken}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`;
    document.cookie = `refreshToken=${refreshToken}; SameSite=Strict; Path=/; Max-Age=604800`;
};

export const clearTokens = () => {
    document.cookie = `accessToken=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
    document.cookie = `refreshToken=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
};

export const getAccessToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['accessToken'] || null;
};

export const getRefreshToken = (): string | null => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    return cookies['refreshToken'] || null;
};