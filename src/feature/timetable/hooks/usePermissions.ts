import { useMemo } from "react";
import { useAuth } from "@/feature/auth/hooks/useAuth";
import type { TimetablePermissions } from "../types/timetable.types";

// Role definitions based on the PRD requirements
const ROLE_PERMISSIONS: Record<string, TimetablePermissions> = {
  // Student: View schedules relevant to their enrolled groups
  STUDENT: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
  
  // Teacher: View, create, and edit schedules for groups they teach
  TEACHER: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
  },
  
  // Administrator: Full CRUD access to all schedules
  ADMIN: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  
  ADMINISTRATOR: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
};

export const usePermissions = () => {
  const { account } = useAuth();

  const permissions = useMemo((): TimetablePermissions => {
    if (!account?.role_name) {
      // Default permissions for unauthenticated users
      return {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      };
    }

    const roleName = account.role_name.toUpperCase();
    
    // Return role-specific permissions or default to student-level permissions
    return ROLE_PERMISSIONS[roleName] || ROLE_PERMISSIONS.STUDENT;
  }, [account?.role_name]);

  const hasPermission = (action: keyof TimetablePermissions): boolean => {
    return permissions[action];
  };

  const checkScheduleAccess = (schedule?: any): {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
  } => {
    const basePermissions = {
      canView: permissions.canView,
      canEdit: permissions.canEdit,
      canDelete: permissions.canDelete,
    };

    // If no schedule provided or user is admin, return base permissions
    if (!schedule || !account) {
      return basePermissions;
    }

    const roleName = account.role_name?.toUpperCase();

    // For teachers, they can only edit/delete schedules they are assigned to
    if (roleName === 'TEACHER' && schedule.teacher?.account?.id !== account.id) {
      return {
        canView: basePermissions.canView,
        canEdit: false,
        canDelete: false,
      };
    }

    // For students, they can only view schedules for groups they're enrolled in
    // This would require additional group membership data
    if (roleName === 'STUDENT') {
      return {
        canView: basePermissions.canView,
        canEdit: false,
        canDelete: false,
      };
    }

    return basePermissions;
  };

  return {
    permissions,
    hasPermission,
    checkScheduleAccess,
    isStudent: account?.role_name?.toUpperCase() === 'STUDENT',
    isTeacher: account?.role_name?.toUpperCase() === 'TEACHER',
    isAdmin: ['ADMIN', 'ADMINISTRATOR'].includes(account?.role_name?.toUpperCase() || ''),
  };
};