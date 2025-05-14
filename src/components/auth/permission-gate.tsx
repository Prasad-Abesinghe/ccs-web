"use client";

import { type ReactNode } from "react";
import { useAuth } from "~/contexts/auth-context";

interface PermissionGateProps {
  children: ReactNode;
  permissions?: string | string[];
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions.
 * Use this to protect UI elements that require specific permissions.
 * 
 * @example
 * // Single permission check
 * <PermissionGate permission="USER_CREATE">
 *   <Button>Create User</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions check (ANY of the permissions)
 * <PermissionGate permissions={["USER_UPDATE", "USER_DELETE"]}>
 *   <Button>Manage User</Button>
 * </PermissionGate>
 * 
 * @example
 * // With fallback content
 * <PermissionGate 
 *   permission="ROLE_UPDATE"
 *   fallback={<p>You don't have permission to edit roles</p>}
 * >
 *   <RoleEditForm />
 * </PermissionGate>
 */
export function PermissionGate({ 
  children, 
  permissions, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, isLoadingUser } = useAuth();

  // If still loading user data, don't render anything yet
  if (isLoadingUser) {
    return null;
  }

  // No permissions specified, render children
  if (!permissions) {
    return <>{children}</>;
  }

  // Convert to array for consistent handling
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  // Check if user has ANY of the specified permissions
  const hasRequiredPermission = requiredPermissions.some(permission => 
    hasPermission(permission)
  );

  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * A component that only renders its children if the user has ALL specified permissions.
 */
export function AllPermissionsGate({ 
  children, 
  permissions, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, isLoadingUser } = useAuth();

  // If still loading user data, don't render anything yet
  if (isLoadingUser) {
    return null;
  }

  // No permissions specified, render children
  if (!permissions) {
    return <>{children}</>;
  }

  // Convert to array for consistent handling
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  // Check if user has ALL of the specified permissions
  const hasAllRequiredPermissions = requiredPermissions.every(permission => 
    hasPermission(permission)
  );

  return hasAllRequiredPermissions ? <>{children}</> : <>{fallback}</>;
} 
