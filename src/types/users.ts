// Basic user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  role_id: string;
  is_ad_user: boolean;
}

// Alternative user interface (for consistency with other hooks)
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  role_id: string;
  is_ad_user: boolean;
}

// API Response types
export interface UsersResponse {
  users: User[];
}

export interface GetUserResponse {
  user: User;
}

// Update user input interface
export interface UpdateUserInput {
  name: string;
  role_id: string;
  is_ad_user: boolean;
}

// Update user response
export interface UpdateUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role_id: string;
  };
}

// Delete user response
export interface DeleteUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
  };
}

// Create user input
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role_id: string;
}

// Create user response
export interface CreateUserResponse {
  status: string;
  message: string;
  data: User;
} 
