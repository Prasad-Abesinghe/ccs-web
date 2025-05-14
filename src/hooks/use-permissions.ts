"use client";

import { useAuth } from "~/contexts/auth-context";

/**
 * Hook for checking user permissions in custom code.
 * 
 * @example
 * // In a component
 * const { canCreateUsers, canUpdateUsers, canDeleteUsers } = usePermissions();
 * 
 * if (canCreateUsers) {
 *   // Show create user button
 * }
 */
export function usePermissions() {
  const { hasPermission, userPermissions, isLoadingUser, user } = useAuth();
  
  return {
    // User data access
    isLoadingUser,
    user,
    userPermissions,
    
    // Direct permission check function
    hasPermission,
    
    // Common permission checks
    // User management
    canViewUsers: hasPermission("USER_VIEW"),
    canCreateUsers: hasPermission("USER_CREATE"),
    canUpdateUsers: hasPermission("USER_UPDATE"),
    canDeleteUsers: hasPermission("USER_DELETE"),
    
    // Role management
    canAssignRoles: hasPermission("ROLE_ASSIGN"),
    canCreateRoles: hasPermission("ROLE_CREATE"),
    canUpdateRoles: hasPermission("ROLE_UPDATE"),
    canDeleteRoles: hasPermission("ROLE_DELETE"),
    
    // Report management
    canViewReports: hasPermission("REPORT_VIEW"),
    canCreateReports: hasPermission("REPORT_CREATE"),
    canUpdateReports: hasPermission("REPORT_UPDATE"),
    canDeleteReports: hasPermission("REPORT_DELETE"),
    
    // Sensor data
    canViewSensorData: hasPermission("VIEW_SENSOR_DATA"),
    canCreateSensors: hasPermission("SENSOR_CREATE"),
    canUpdateSensors: hasPermission("SENSOR_UPDATE"),
    canDeleteSensors: hasPermission("SENSOR_DELETE"),
    
    // Node management
    canViewNodes: hasPermission("NODE_VIEW"),
    canCreateNodes: hasPermission("NODE_CREATE"),
    canUpdateNodes: hasPermission("NODE_UPDATE"),
    canDeleteNodes: hasPermission("NODE_DELETE"),
    
    // Alert management
    canAcknowledgeAlerts: hasPermission("ACKNOWLEDGE_ALERT"),
    
    // Check for multiple permissions (ANY)
    hasAnyPermission: (permissions: string[]) => {
      return permissions.some(permission => hasPermission(permission));
    },
    
    // Check for multiple permissions (ALL)
    hasAllPermissions: (permissions: string[]) => {
      return permissions.every(permission => hasPermission(permission));
    }
  };
} 
