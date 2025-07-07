export type TRole = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TAccount = {
  id: number;
  name: string;
  role_name: string;
  role_id: number;
  phone: string;
  email: string;
  activeAt: Date;
  deactivateAt: Date | null;
};

export type TAuthProps = {
  account: TAccount | null;
  email: string;
  password: string;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};

export type TCredentials = {
  email: string;
  password: string;
};

export type TAuthResponse = {
  access_token: string;
  refresh_token: string;
};
