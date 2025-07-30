import React from 'react';

import { useAuth } from '@/feature/auth/hooks/useAuth';
import { hasPermission } from '@/utils/rbac-utils';

/**
 * Props for the RoleBasedAccess component
 */
interface RoleBasedAccessProps {
  /** Array of role names that are allowed to see the children content */
  allowedRoles: string[];
  /** Content to render when user has permission */
  children: React.ReactNode;
  /** Optional content to render when user doesn't have permission */
  fallback?: React.ReactNode;
  /** Optional override for user role (useful for testing) */
  userRole?: string;
  /** Whether to show debug information in development */
  debug?: boolean;
}

/**
 * Component that conditionally renders children based on user role permissions
 * 
 * This component checks if the current user's role is included in the allowedRoles array.
 * If the user has permission, it renders the children. Otherwise, it renders the fallback
 * content (or nothing if no fallback is provided).
 * 
 * @example
 * ```tsx
 * // Show admin-only content
 * <RoleBasedAccess allowedRoles={['ADMIN']}>
 *   <AdminPanel />
 * </RoleBasedAccess>
 * 
 * // Show content for admin and manager with fallback
 * <RoleBasedAccess 
 *   allowedRoles={['ADMIN', 'MANAGER']} 
 *   fallback={<div>Access denied</div>}
 * >
 *   <ManagementPanel />
 * </RoleBasedAccess>
 * 
 * // Using with PERMISSIONS constants
 * <RoleBasedAccess allowedRoles={PERMISSIONS.VIEW_ALL_STUDENTS}>
 *   <StudentList />
 * </RoleBasedAccess>
 * ```
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  allowedRoles,
  children,
  fallback = null,
  userRole: overrideRole,
  debug = false
}) => {
  const { account, isAuthenticated } = useAuth();
  
  // Use override role for testing, otherwise get from authenticated account
  const currentUserRole = overrideRole || account?.role_name;
  
  // Check if user has permission
  const hasAccess = hasPermission(currentUserRole, allowedRoles);
  
  // Debug logging in development
  if (debug && process.env.NODE_ENV === 'development') {
    console.log('RoleBasedAccess Debug:', {
      currentUserRole,
      allowedRoles,
      hasAccess,
      isAuthenticated,
      account: account ? { id: account.id, role: account.role_name } : null
    });
  }
  
  // Render children if user has access, otherwise render fallback
  if (hasAccess) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

/**
 * Higher-order component version of RoleBasedAccess for wrapping entire components
 * 
 * @example
 * ```tsx
 * const AdminOnlyComponent = withRoleBasedAccess(['ADMIN'])(MyComponent);
 * ```
 */
export const withRoleBasedAccess = (
  allowedRoles: string[],
  fallback?: React.ReactNode
) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    const WrappedComponent: React.FC<P> = (props) => (
      <RoleBasedAccess allowedRoles={allowedRoles} fallback={fallback}>
        <Component {...props} />
      </RoleBasedAccess>
    );
    
    WrappedComponent.displayName = `withRoleBasedAccess(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
  };
};

/**
 * Hook version for components that need role-based conditional logic
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const canEdit = useRoleBasedAccess(['ADMIN', 'MANAGER']);
 *   
 *   return (
 *     <div>
 *       <ViewOnlyContent />
 *       {canEdit && <EditButton />}
 *     </div>
 *   );
 * };
 * ```
 */
export const useRoleBasedAccess = (allowedRoles: string[]): boolean => {
  const { account } = useAuth();
  return hasPermission(account?.role_name, allowedRoles);
};

export default RoleBasedAccess;