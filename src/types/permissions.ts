// Permission types
export type Permission = 
  | 'USER_VIEW'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'REPORT_VIEW'
  | 'REPORT_CREATE'
  | 'REPORT_UPDATE'
  | 'REPORT_DELETE'
  | 'VIEW_SENSOR_DATA'
  | 'SENSOR_CREATE'
  | 'SENSOR_UPDATE'
  | 'SENSOR_DELETE'
  | 'ROLE_ASSIGN'
  | 'ROLE_CREATE'
  | 'ROLE_UPDATE'
  | 'ROLE_DELETE'
  | 'NODE_VIEW'
  | 'NODE_CREATE'
  | 'NODE_UPDATE'
  | 'NODE_DELETE'
  | 'ACKNOWLEDGE_ALERT';

// User permissions
export interface UserPermissions {
  permissions: Permission[];
  accessible_nodes?: string[];
  has_root_access: boolean;
}

// Permission check function type
export type PermissionCheck = (permission: Permission) => boolean;

// Permission checking utilities
export interface PermissionUtils {
  hasPermission: PermissionCheck;
  userPermissions?: UserPermissions;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
} 
