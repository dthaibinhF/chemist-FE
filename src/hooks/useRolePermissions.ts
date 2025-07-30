import { useMemo } from 'react';

import { useAuth } from '@/feature/auth/hooks/useAuth';
import {
  hasNamedPermission,
  extractRoleName,
  roleCheckers,
  type Permission
} from '@/utils/rbac-utils';

/**
 * Hook that provides role-based permission checking utilities
 * 
 * This hook consolidates all permission logic and provides convenient
 * boolean flags for common permission checks throughout the application.
 * 
 * @returns Object with permission flags and role information
 */
export const useRolePermissions = () => {
  const { account, isAuthenticated } = useAuth();

  // Get clean role name from JWT token
  const userRole = useMemo(() => extractRoleName(account?.role_name), [account?.role_name]);

  // Permission checker function for any named permission
  const hasPermission = useMemo(() =>
    (permission: Permission) => hasNamedPermission(account?.role_name, permission),
    [account?.role_name]
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

  // Role checker utilities
  const roleInfo = useMemo(() => ({
    userRole,
    isAdmin: roleCheckers.isAdmin(account?.role_name),
    isManager: roleCheckers.isManager(account?.role_name),
    isTeacher: roleCheckers.isTeacher(account?.role_name),
    isStudent: roleCheckers.isStudent(account?.role_name),
    isParent: roleCheckers.isParent(account?.role_name),
    isPublic: roleCheckers.isPublic(account?.role_name),
    isAuthenticated: roleCheckers.isAuthenticated(account?.role_name),
    isAdminOrManager: roleCheckers.isAdminOrManager(account?.role_name),
    isStaffMember: roleCheckers.isStaffMember(account?.role_name),
  }), [account?.role_name, userRole]);

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
 * Hook for checking a single permission
 * Useful when you only need to check one specific permission
 * 
 * @param permission - The permission to check
 * @returns Boolean indicating if user has the permission
 */
export const usePermission = (permission: Permission): boolean => {
  const { account } = useAuth();
  return hasNamedPermission(account?.role_name, permission);
};

/**
 * Hook for checking multiple permissions at once
 * 
 * @param permissions - Array of permissions to check
 * @returns Object with permission results
 */
export const usePermissions = (permissions: Permission[]) => {
  const { account } = useAuth();

  return useMemo(() => {
    const results: Record<string, boolean> = {};

    permissions.forEach(permission => {
      results[permission] = hasNamedPermission(account?.role_name, permission);
    });

    return results;
  }, [account?.role_name, permissions]);
};

export default useRolePermissions;