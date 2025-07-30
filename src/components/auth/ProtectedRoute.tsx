import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/feature/auth/hooks/useAuth';
import { hasPermission } from '@/utils/rbac-utils';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Content to render when user has access */
  children: React.ReactNode;
  /** Array of role names that are allowed to access this route */
  allowedRoles: string[];
  /** Path to redirect to when user is not authenticated (default: '/login') */
  loginRedirect?: string;
  /** Path to redirect to when user lacks permission (default: '/unauthorized') */
  unauthorizedRedirect?: string;
  /** Whether to show loading state while checking authentication */
  showLoading?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Whether to preserve the attempted URL for redirect after login */
  preserveRedirect?: boolean;
}

/**
 * Default loading component
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * Component that protects routes based on user authentication and role permissions
 * 
 * This component performs two levels of protection:
 * 1. Authentication check - redirects to login if not authenticated
 * 2. Authorization check - redirects to unauthorized page if user lacks required role
 * 
 * @example
 * ```tsx
 * // Protect admin-only routes
 * <ProtectedRoute allowedRoles={['ADMIN']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * // Protect routes for multiple roles
 * <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TEACHER']}>
 *   <StudentManagement />
 * </ProtectedRoute>
 * 
 * // Custom redirect paths
 * <ProtectedRoute 
 *   allowedRoles={['ADMIN']} 
 *   loginRedirect="/auth/login"
 *   unauthorizedRedirect="/access-denied"
 * >
 *   <SystemSettings />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  loginRedirect = '/login',
  unauthorizedRedirect = '/unauthorized',
  showLoading = true,
  loadingComponent,
  preserveRedirect = true
}) => {
  const { account, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading state while authentication is being determined
  if (isLoading && showLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !account) {
    const redirectTo = preserveRedirect 
      ? `${loginRedirect}?redirect=${encodeURIComponent(location.pathname + location.search)}`
      : loginRedirect;
    
    return <Navigate to={redirectTo} replace />;
  }
  
  // Check if user has required role permission
  const hasAccess = hasPermission(account.role_name, allowedRoles);
  
  if (!hasAccess) {
    return <Navigate to={unauthorizedRedirect} replace />;
  }
  
  // User is authenticated and has permission, render the protected content
  return <>{children}</>;
};

/**
 * Higher-order component version of ProtectedRoute
 * 
 * @example
 * ```tsx
 * const ProtectedAdminComponent = withProtectedRoute(['ADMIN'])(AdminComponent);
 * ```
 */
export const withProtectedRoute = (
  allowedRoles: string[],
  options: Omit<ProtectedRouteProps, 'children' | 'allowedRoles'> = {}
) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    const WrappedComponent: React.FC<P> = (props) => (
      <ProtectedRoute allowedRoles={allowedRoles} {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
    
    WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
  };
};

/**
 * Hook for checking route access without redirecting
 * Useful for conditional rendering or programmatic navigation
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { hasAccess, reason } = useRouteAccess(['ADMIN', 'MANAGER']);
 *   
 *   if (!hasAccess) {
 *     return <div>You don't have access: {reason}</div>;
 *   }
 *   
 *   return <ProtectedContent />;
 * };
 * ```
 */
export const useRouteAccess = (allowedRoles: string[]) => {
  const { account, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return {
      hasAccess: false,
      reason: 'loading',
      isLoading: true
    };
  }
  
  if (!isAuthenticated || !account) {
    return {
      hasAccess: false,
      reason: 'not_authenticated',
      isLoading: false
    };
  }
  
  const hasAccess = hasPermission(account.role_name, allowedRoles);
  
  return {
    hasAccess,
    reason: hasAccess ? null : 'insufficient_permissions',
    isLoading: false,
    userRole: account.role_name
  };
};

export default ProtectedRoute;