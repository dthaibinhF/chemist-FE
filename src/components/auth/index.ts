/**
 * Auth Components Export Index
 * 
 * Centralized exports for all authentication and authorization components
 */

// Core Components
export { RoleBasedAccess, withRoleBasedAccess, useRoleBasedAccess } from './RoleBasedAccess';
export { ProtectedRoute, withProtectedRoute, useRouteAccess } from './ProtectedRoute';

// Type exports for TypeScript users
export type { default as RoleBasedAccessProps } from './RoleBasedAccess';
export type { default as ProtectedRouteProps } from './ProtectedRoute';