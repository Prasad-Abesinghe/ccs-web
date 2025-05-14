// Role interface
export interface Role {
  id: string;
  name: string;
  description: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  ms_teams_enabled: boolean;
  has_root_access: boolean;
  role_actions: RoleAction[];
}

// Role action interface
export interface RoleAction {
  actions: string[];
  node_id: string | null;
}

// Available actions for roles
export const AVAILABLE_ACTIONS = [
  'USER_VIEW',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'REPORT_VIEW',
  'REPORT_CREATE',
  'REPORT_UPDATE',
  'REPORT_DELETE',
  'VIEW_SENSOR_DATA',
  'SENSOR_CREATE',
  'SENSOR_UPDATE',
  'SENSOR_DELETE',
  'ROLE_ASSIGN',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_DELETE',
  'NODE_VIEW',
  'NODE_CREATE',
  'NODE_UPDATE',
  'NODE_DELETE',
  'ACKNOWLEDGE_ALERT'
];

// Node level specific actions
export const NODE_LEVEL_ACTIONS = [
  'NODE_VIEW',
  'NODE_CREATE',
  'NODE_UPDATE',
  'NODE_DELETE',
  'VIEW_SENSOR_DATA',
  'SENSOR_CREATE',
  'SENSOR_UPDATE',
  'SENSOR_DELETE',
  'REPORT_VIEW',
  'REPORT_CREATE',
  'REPORT_UPDATE',
  'REPORT_DELETE'
];

// API response types
export interface RolesResponse {
  roles: Role[];
}

export interface GetRoleResponse {
  role: Role;
}

// Create role input interface
export interface CreateRoleInput {
  name: string;
  description: string;
  role_actions: RoleAction[];
  full_node_access?: boolean;
  accessible_nodes?: string[];
}

// Create role response
export interface CreateRoleResponse {
  data: Role;
}

// Update role input interface
export interface UpdateRoleInput {
  name: string;
  description: string;
  role_actions: RoleAction[];
}

// Update role response
export interface UpdateRoleResponse {
  data: Role;
}

// Delete role response
export interface DeleteRoleResponse {
  data: {
    id: string;
    message: string;
  };
} 
