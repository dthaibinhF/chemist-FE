export type TRole = {
    id: number,
    name: string
    createdAt: string,
    updatedAt: string,
}

export type TAccount = {
    id: number,
    fullName: string,
    role: TRole,
    phone: string,
    email: string,
    activeAt: Date,
    deactivateAt: Date | null,
}

export type TAuthProps = {
    account: TAccount |null,
    email: string,
    password: string,
    accessToken: string | null,
    refreshToken: string |null,
    isAuthenticated: boolean,
}

export type TCredentials = {
    email: string;
    password: string;
    twoFactorCode?: string;
}

export type TAuthResponse = {
    accessToken: string;
    refreshToken: string;
}