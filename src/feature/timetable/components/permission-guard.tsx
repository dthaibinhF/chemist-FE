import React from "react";
import { usePermissions } from "../hooks/usePermissions";
import type { TimetablePermissions } from "../types/timetable.types";

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Allow specific permission checks
  permission?: keyof TimetablePermissions;
  // Allow multiple permission checks (OR logic)
  permissions?: (keyof TimetablePermissions)[];
  // Allow custom permission check function
  customCheck?: (permissions: TimetablePermissions) => boolean;
  // For schedule-specific permissions
  schedule?: any;
  schedulePermission?: 'canView' | 'canEdit' | 'canDelete';
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null,
  permission,
  permissions,
  customCheck,
  schedule,
  schedulePermission,
}) => {
  const { permissions: userPermissions, checkScheduleAccess } = usePermissions();

  const hasAccess = (): boolean => {
    // Schedule-specific permission check
    if (schedule && schedulePermission) {
      const scheduleAccess = checkScheduleAccess(schedule);
      return scheduleAccess[schedulePermission];
    }

    // Custom permission check
    if (customCheck) {
      return customCheck(userPermissions);
    }

    // Single permission check
    if (permission) {
      return userPermissions[permission];
    }

    // Multiple permissions check (OR logic)
    if (permissions) {
      return permissions.some(perm => userPermissions[perm]);
    }

    // Default to denying access if no checks provided
    return false;
  };

  if (!hasAccess()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard
    permissions={['canCreate', 'canEdit', 'canDelete']}
    customCheck={(perms) => perms.canDelete} // Only admins have delete permission
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const TeacherAndAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard
    permissions={['canCreate', 'canEdit']}
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ViewOnlyGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard
    permission="canView"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);