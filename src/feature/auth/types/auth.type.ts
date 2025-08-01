export type TRole = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TAccount = {
  id: number;
  name: string;
  phone: string;
  email: string;
  activeAt: Date;
  deactivateAt: Date | null;
  
  // Multiple roles support (NEW - from backend migration)
  role_ids: number[];
  role_names: string[];
  primary_role_id: number;
  primary_role_name: string;
  
  // Legacy single role support (DEPRECATED - for backward compatibility)
  role_name?: string;
  role_id?: number;
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

// Helper types for multi-role support
export type TRoleAssignment = {
  account_id: number;
  role_id: number;
};

export type TAccountWithLegacySupport = TAccount & {
  // Helper method to get role name (prioritizes primary_role_name, falls back to legacy role_name)
  getCurrentRoleName(): string;
  // Helper method to check if account has specific role
  hasRole(roleName: string): boolean;
  // Helper method to get all role names
  getAllRoleNames(): string[];
};

// Utility type for role checking
export type TRoleChecker = {
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isParent: () => boolean;
};
