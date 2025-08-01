import { useMemo } from 'react';

import { useAuth } from '@/feature/auth/hooks/useAuth';
import {
  multiRoleCheckers,
  accountHelpers,
  type Permission
} from '@/utils/rbac-utils';

/**
 * Hook that provides role-based permission checking utilities (UPDATED FOR MULTI-ROLE SUPPORT)
 * 
 * This hook consolidates all permission logic and provides convenient
 * boolean flags for common permission checks throughout the application.
 * Supports both single-role legacy accounts and new multi-role accounts.
 * 
 * @returns Object with permission flags and role information
 */
export const useRolePermissions = () => {
  const { account, isAuthenticated } = useAuth();

  // Get current role and all roles for the user
  const userRole = useMemo(() => accountHelpers.getCurrentRoleName(account), [account]);
  const allUserRoles = useMemo(() => accountHelpers.getAllRoleNames(account), [account]);

  // Multi-role permission checker function for any named permission
  const hasPermission = useMemo(() =>
    (permission: Permission) => accountHelpers.hasPermission(account, permission),
    [account]
  );

  // Dashboard permissions
  const dashboardPermissions = useMemo(() => ({
    canViewDashboard: hasPermission('VIEW_DASHBOARD'),
    canViewStatistics: hasPermission('VIEW_STATISTICS'),
  }), [hasPermission]);

  // Student management permissions
  const studentPermissions = useMemo(() => ({
    canViewAllStudents: hasPermission('VIEW_ALL_STUDENTS'),
    canCreateStudent: hasPermission('CREATE_STUDENT'),
    canEditStudent: hasPermission('EDIT_STUDENT'),
    canDeleteStudent: hasPermission('DELETE_STUDENT'),
    canViewOwnStudentData: hasPermission('VIEW_OWN_STUDENT_DATA'),
  }), [hasPermission]);

  // Financial management permissions
  const financialPermissions = useMemo(() => ({
    canViewAllFinances: hasPermission('VIEW_ALL_FINANCES'),
    canManageFees: hasPermission('MANAGE_FEES'),
    canCreatePayments: hasPermission('CREATE_PAYMENTS'),
    canViewOwnPayments: hasPermission('VIEW_OWN_PAYMENTS'),
    canGenerateBulkPayments: hasPermission('GENERATE_BULK_PAYMENTS'),
  }), [hasPermission]);

  // Group and schedule management permissions
  const groupPermissions = useMemo(() => ({
    canManageGroups: hasPermission('MANAGE_GROUPS'),
    canViewGroups: hasPermission('VIEW_GROUPS'),
    canViewOwnGroups: hasPermission('VIEW_OWN_GROUPS'),
    canMarkAttendance: hasPermission('MARK_ATTENDANCE'),
    canManageSchedules: hasPermission('MANAGE_SCHEDULES'),
    canViewSchedules: hasPermission('VIEW_SCHEDULES'),
  }), [hasPermission]);

  // Teacher and salary management permissions
  const teacherPermissions = useMemo(() => ({
    canManageTeachers: hasPermission('MANAGE_TEACHERS'),
    canViewAllSalaries: hasPermission('VIEW_ALL_SALARIES'),
    canViewOwnSalary: hasPermission('VIEW_OWN_SALARY'),
    canCalculateSalaries: hasPermission('CALCULATE_SALARIES'),
  }), [hasPermission]);

  // System administration permissions
  const adminPermissions = useMemo(() => ({
    canManageUsers: hasPermission('MANAGE_USERS'),
    canManageRoles: hasPermission('MANAGE_ROLES'),
    canSystemConfiguration: hasPermission('SYSTEM_CONFIGURATION'),
  }), [hasPermission]);

  // AI Assistant permissions
  const aiPermissions = useMemo(() => ({
    canAiFullAccess: hasPermission('AI_FULL_ACCESS'),
    canAiLimitedAccess: hasPermission('AI_LIMITED_ACCESS'),
    canAiOwnDataAccess: hasPermission('AI_OWN_DATA_ACCESS'),
    canAiPublicAccess: hasPermission('AI_PUBLIC_ACCESS'),
  }), [hasPermission]);

  // Timetable permissions
  const timetablePermissions = useMemo(() => ({
    canManageTimetable: hasPermission('MANAGE_TIMETABLE'),
    canViewTimetable: hasPermission('VIEW_TIMETABLE'),
    canCreateTimetableEvents: hasPermission('CREATE_TIMETABLE_EVENTS'),
  }), [hasPermission]);

  // Multi-role checker utilities
  const roleInfo = useMemo(() => ({
    userRole, // Primary role for legacy compatibility
    allUserRoles, // All roles the user has
    isAdmin: multiRoleCheckers.isAdmin(allUserRoles),
    isManager: multiRoleCheckers.isManager(allUserRoles),
    isTeacher: multiRoleCheckers.isTeacher(allUserRoles),
    isStudent: multiRoleCheckers.isStudent(allUserRoles),
    isParent: multiRoleCheckers.isParent(allUserRoles),
    isPublic: multiRoleCheckers.isPublic(allUserRoles),
    isAuthenticated: multiRoleCheckers.isAuthenticated(allUserRoles),
    isAdminOrManager: multiRoleCheckers.isAdminOrManager(allUserRoles),
    isStaffMember: multiRoleCheckers.isStaffMember(allUserRoles),
    hasRole: (role: string) => accountHelpers.hasRole(account, role),
    hasAnyRole: (roles: string[]) => accountHelpers.hasAnyRole(account, roles),
  }), [account, userRole, allUserRoles]);

  return {
    // Core permission checker
    hasPermission,

    // Permission categories
    dashboard: dashboardPermissions,
    student: studentPermissions,
    financial: financialPermissions,
    group: groupPermissions,
    teacher: teacherPermissions,
    admin: adminPermissions,
    ai: aiPermissions,
    timetable: timetablePermissions,

    // Role information
    ...roleInfo,

    // Account information
    account,
    isAuthenticated,

    // Commonly used permission combinations
    canManageSystem: adminPermissions.canManageUsers || adminPermissions.canManageRoles,
    canAccessFinancialData: financialPermissions.canViewAllFinances || financialPermissions.canViewOwnPayments,
    canManageStudentData: studentPermissions.canViewAllStudents || studentPermissions.canCreateStudent,
    canAccessTeachingTools: groupPermissions.canViewGroups || groupPermissions.canMarkAttendance,
  };
};

/**
 * Hook for checking a single permission (UPDATED FOR MULTI-ROLE SUPPORT)
 * Useful when you only need to check one specific permission
 * 
 * @param permission - The permission to check
 * @returns Boolean indicating if user has the permission
 */
export const usePermission = (permission: Permission): boolean => {
  const { account } = useAuth();
  return accountHelpers.hasPermission(account, permission);
};

/**
 * Hook for checking multiple permissions at once (UPDATED FOR MULTI-ROLE SUPPORT)
 * 
 * @param permissions - Array of permissions to check
 * @returns Object with permission results
 */
export const usePermissions = (permissions: Permission[]) => {
  const { account } = useAuth();

  return useMemo(() => {
    const results: Record<string, boolean> = {};

    permissions.forEach(permission => {
      results[permission] = accountHelpers.hasPermission(account, permission);
    });

    return results;
  }, [account, permissions]);
};

/**
 * Hook for role-based checks (NEW - Multi-role specific)
 * 
 * @param roles - Role or array of roles to check
 * @returns Boolean indicating if user has any of the specified roles
 */
export const useHasRole = (roles: string | string[]): boolean => {
  const { account } = useAuth();
  
  return useMemo(() => {
    if (typeof roles === 'string') {
      return accountHelpers.hasRole(account, roles);
    }
    return accountHelpers.hasAnyRole(account, roles);
  }, [account, roles]);
};

export default useRolePermissions;