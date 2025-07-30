/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * This module provides centralized utilities for handling role-based permissions
 * in the Chemist-FE application. All roles use the ROLE_ prefix format.
 */

// Role Constants with ROLE_ prefix (matches backend JWT format)
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  MANAGER: 'ROLE_MANAGER',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT',
  PARENT: 'ROLE_PARENT',
  PUBLIC: 'PUBLIC' // For users without authentication
} as const;

// Internal role names without prefix (for cleaner permission logic)
export const ROLE_NAMES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  PUBLIC: 'PUBLIC'
} as const;

// Permission definitions by feature area  
export const PERMISSIONS: Record<string, string[]> = {
  // Dashboard Access
  VIEW_DASHBOARD: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER, ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT],

  // Student Management
  VIEW_ALL_STUDENTS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER],
  CREATE_STUDENT: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  EDIT_STUDENT: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  DELETE_STUDENT: [ROLE_NAMES.ADMIN],
  VIEW_OWN_STUDENT_DATA: [ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT],

  // Financial Management
  VIEW_ALL_FINANCES: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  MANAGE_FEES: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  CREATE_PAYMENTS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  VIEW_OWN_PAYMENTS: [ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT, ROLE_NAMES.TEACHER],
  GENERATE_BULK_PAYMENTS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],

  // Group & Schedule Management
  MANAGE_GROUPS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  VIEW_GROUPS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER],
  VIEW_OWN_GROUPS: [ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT],
  MARK_ATTENDANCE: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER],
  MANAGE_SCHEDULES: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  VIEW_SCHEDULES: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER, ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT],

  // Teacher & Salary Management
  MANAGE_TEACHERS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  VIEW_ALL_SALARIES: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  VIEW_OWN_SALARY: [ROLE_NAMES.TEACHER],
  CALCULATE_SALARIES: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],

  // System Administration
  MANAGE_USERS: [ROLE_NAMES.ADMIN],
  MANAGE_ROLES: [ROLE_NAMES.ADMIN],
  VIEW_STATISTICS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  SYSTEM_CONFIGURATION: [ROLE_NAMES.ADMIN],

  // AI Assistant Access
  AI_FULL_ACCESS: [ROLE_NAMES.ADMIN],
  AI_LIMITED_ACCESS: [ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER],
  AI_OWN_DATA_ACCESS: [ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT],
  AI_PUBLIC_ACCESS: [ROLE_NAMES.PUBLIC],

  // Timetable Management
  MANAGE_TIMETABLE: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER],
  VIEW_TIMETABLE: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER, ROLE_NAMES.STUDENT, ROLE_NAMES.PARENT],
  CREATE_TIMETABLE_EVENTS: [ROLE_NAMES.ADMIN, ROLE_NAMES.MANAGER, ROLE_NAMES.TEACHER],
};

/**
 * Extracts the role name from a JWT role string by removing the ROLE_ prefix
 * @param jwtRole - Role string from JWT token (e.g., "ROLE_ADMIN") 
 * @returns Clean role name (e.g., "ADMIN") or "PUBLIC" for invalid/missing roles
 */
export const extractRoleName = (jwtRole?: string | null): string => {
  if (!jwtRole) {
    return ROLE_NAMES.PUBLIC;
  }

  // Handle ROLE_ prefix
  if (jwtRole.startsWith('ROLE_')) {
    return jwtRole.replace('ROLE_', '');
  }

  // If no prefix, check if it's a valid role name
  const roleValues = Object.values(ROLE_NAMES);
  if (roleValues.includes(jwtRole as any)) {
    return jwtRole;
  }

  // Default to PUBLIC for unknown roles
  return ROLE_NAMES.PUBLIC;
};

/**
 * Checks if a user role has permission for a specific action
 * @param userRole - User's role from JWT token (with or without ROLE_ prefix)
 * @param allowedRoles - Array of role names that have permission
 * @returns Boolean indicating if user has permission
 */
export const hasPermission = (userRole: string | null | undefined, allowedRoles: string[]): boolean => {
  const cleanRole = extractRoleName(userRole);
  return allowedRoles.includes(cleanRole);
};

/**
 * Checks if a user role has a specific named permission
 * @param userRole - User's role from JWT token 
 * @param permission - Permission key from PERMISSIONS object
 * @returns Boolean indicating if user has the permission
 */
export const hasNamedPermission = (
  userRole: string | null | undefined,
  permission: keyof typeof PERMISSIONS
): boolean => {
  const allowedRoles = PERMISSIONS[permission];
  return hasPermission(userRole, allowedRoles);
};

/**
 * Gets all permissions for a specific role
 * @param userRole - User's role from JWT token
 * @returns Array of permission keys that the role has access to
 */
export const getRolePermissions = (userRole: string | null | undefined): (keyof typeof PERMISSIONS)[] => {
  const cleanRole = extractRoleName(userRole);

  return (Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).filter(permission => {
    return PERMISSIONS[permission].includes(cleanRole);
  });
};

/**
 * Utility to check if user is in a specific role
 * @param userRole - User's role from JWT token
 * @param targetRole - Role to check against (without ROLE_ prefix)
 * @returns Boolean indicating if user has the target role
 */
export const isRole = (userRole: string | null | undefined, targetRole: string): boolean => {
  const cleanRole = extractRoleName(userRole);
  return cleanRole === targetRole;
};

/**
 * Utility functions for common role checks
 */
export const roleCheckers = {
  isAdmin: (userRole: string | null | undefined) => isRole(userRole, ROLE_NAMES.ADMIN),
  isManager: (userRole: string | null | undefined) => isRole(userRole, ROLE_NAMES.MANAGER),
  isTeacher: (userRole: string | null | undefined) => isRole(userRole, ROLE_NAMES.TEACHER),
  isStudent: (userRole: string | null | undefined) => isRole(userRole, ROLE_NAMES.STUDENT),
  isParent: (userRole: string | null | undefined) => isRole(userRole, ROLE_NAMES.PARENT),
  isPublic: (userRole: string | null | undefined) => isRole(userRole, ROLE_NAMES.PUBLIC),
  isAuthenticated: (userRole: string | null | undefined) => !isRole(userRole, ROLE_NAMES.PUBLIC),
  isAdminOrManager: (userRole: string | null | undefined) =>
    roleCheckers.isAdmin(userRole) || roleCheckers.isManager(userRole),
  isStaffMember: (userRole: string | null | undefined) =>
    roleCheckers.isAdmin(userRole) || roleCheckers.isManager(userRole) || roleCheckers.isTeacher(userRole)
};

/**
 * Type definitions for TypeScript support
 */
export type Role = typeof ROLES[keyof typeof ROLES];
export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];
export type Permission = keyof typeof PERMISSIONS;

/**
 * Default export with commonly used functions
 */
export default {
  ROLES,
  ROLE_NAMES,
  PERMISSIONS,
  hasPermission,
  hasNamedPermission,
  extractRoleName,
  getRolePermissions,
  isRole,
  ...roleCheckers
};