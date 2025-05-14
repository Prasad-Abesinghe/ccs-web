import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { NextResponse } from 'next/server';
import { env } from "~/env";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

interface RoleData {
  id: string;
  name: string;
  description: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  ms_teams_enabled: boolean;
  has_root_access: boolean;
  role_actions: {
    actions: string[];
    node_id: string | null;
  }[];
}

/**
 * Checks if the current user has the required permissions to access an API route.
 * 
 * @param requiredPermissions String or array of strings representing the required permissions
 * @returns Object containing the verification result and user data
 * 
 * @example
 * // In an API route
 * export async function GET(request: NextRequest) {
 *   const { hasAccess, errorResponse } = await checkApiPermissions("USER_VIEW");
 *   
 *   if (!hasAccess) {
 *     return errorResponse;
 *   }
 *   
 *   // Continue with the API logic
 * }
 */
export async function checkApiPermissions(requiredPermissions: string | string[]) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.accessToken || !session?.user?.email) {
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      };
    }
    
    // Convert to array for consistent handling
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // If no permissions required, grant access
    if (permissions.length === 0) {
      return { 
        hasAccess: true, 
        errorResponse: null,
        user: null
      };
    }
    
    // Fetch user data by email instead of /me endpoint
    const encodedEmail = encodeURIComponent(session.user.email);
    const userResponse = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/users/email/${encodedEmail}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!userResponse.ok) {
      console.error(`Failed to fetch user data: ${userResponse.status}`);
      // For debugging, log response text
      try {
        const responseText = await userResponse.text();
        console.error(`Error response: ${responseText}`);
      } catch (e) {
        console.error('Could not read response text', e);
      }
      
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Failed to fetch user data" },
          { status: 500 }
        )
      };
    }
    
    const userData = await userResponse.json() as {
      status: string;
      message: string;
      data?: UserData;
    };
    
    // Since the API might return data wrapped in a data field
    const user = userData.data ?? userData as unknown as UserData;
    
    if (!user?.role?.id) {
      console.error('Invalid user data format:', user);
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Invalid user data format" },
          { status: 500 }
        )
      };
    }
    
    // Fetch role data
    const roleResponse = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/roles/${user.role.id}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!roleResponse.ok) {
      console.error(`Failed to fetch role data: ${roleResponse.status}`);
      // For debugging, log response text
      try {
        const responseText = await roleResponse.text();
        console.error(`Error response: ${responseText}`);
      } catch (e) {
        console.error('Could not read response text', e);
      }
      
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Failed to fetch role data" },
          { status: 500 }
        )
      };
    }
    
    const roleData = await roleResponse.json() as {
      status: string;
      message: string;
      role?: RoleData;
    };
    
    // Since the API might return role wrapped in a role field
    const role = roleData.role ?? roleData as unknown as RoleData;
    
    if (!role || !Array.isArray(role.role_actions)) {
      console.error('Invalid role data format:', role);
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Invalid role data format" },
          { status: 500 }
        )
      };
    }
    
    // Check if user has root access
    if (role.has_root_access) {
      return { 
        hasAccess: true, 
        errorResponse: null,
        user
      };
    }
    
    // Get all user permissions
    const userPermissions = role.role_actions.flatMap(ra => ra.actions);
    
    // Check if user has ANY of the required permissions
    const hasRequiredPermission = permissions.some(
      permission => userPermissions.includes(permission)
    );
    
    if (hasRequiredPermission) {
      return { 
        hasAccess: true, 
        errorResponse: null,
        user
      };
    }
    
    // User doesn't have required permissions
    return {
      hasAccess: false,
      errorResponse: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    };
    
  } catch (error) {
    console.error("Error checking API permissions:", error);
    return {
      hasAccess: false,
      errorResponse: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    };
  }
}

/**
 * Checks if the current user has ALL the required permissions to access an API route.
 */
export async function checkAllApiPermissions(requiredPermissions: string | string[]) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.accessToken || !session?.user?.email) {
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      };
    }
    
    // Convert to array for consistent handling
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // If no permissions required, grant access
    if (permissions.length === 0) {
      return { 
        hasAccess: true, 
        errorResponse: null,
        user: null
      };
    }
    
    // Fetch user data by email instead of /me endpoint
    const encodedEmail = encodeURIComponent(session.user.email);
    const userResponse = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/users/email/${encodedEmail}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!userResponse.ok) {
      console.error(`Failed to fetch user data: ${userResponse.status}`);
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Failed to fetch user data" },
          { status: 500 }
        )
      };
    }
    
    const userData = await userResponse.json() as {
      status: string;
      message: string;
      data?: UserData;
    };
    
    // Since the API might return data wrapped in a data field
    const user = userData.data ?? userData as unknown as UserData;
    
    if (!user?.role?.id) {
      console.error('Invalid user data format:', user);
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Invalid user data format" },
          { status: 500 }
        )
      };
    }
    
    // Fetch role data
    const roleResponse = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/roles/${user.role.id}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!roleResponse.ok) {
      console.error(`Failed to fetch role data: ${roleResponse.status}`);
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Failed to fetch role data" },
          { status: 500 }
        )
      };
    }
    
    const roleData = await roleResponse.json() as {
      status: string;
      message: string;
      role?: RoleData;
    };
    
    // Since the API might return role wrapped in a role field
    const role = roleData.role ?? roleData as unknown as RoleData;
    
    if (!role || !Array.isArray(role.role_actions)) {
      console.error('Invalid role data format:', role);
      return {
        hasAccess: false,
        errorResponse: NextResponse.json(
          { error: "Invalid role data format" },
          { status: 500 }
        )
      };
    }
    
    // Check if user has root access
    if (role.has_root_access) {
      return { 
        hasAccess: true, 
        errorResponse: null,
        user
      };
    }
    
    // Get all user permissions
    const userPermissions = role.role_actions.flatMap(ra => ra.actions);
    
    // Check if user has ALL of the required permissions
    const hasAllRequiredPermissions = permissions.every(
      permission => userPermissions.includes(permission)
    );
    
    if (hasAllRequiredPermissions) {
      return { 
        hasAccess: true, 
        errorResponse: null,
        user
      };
    }
    
    // User doesn't have all required permissions
    return {
      hasAccess: false,
      errorResponse: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    };
    
  } catch (error) {
    console.error("Error checking API permissions:", error);
    return {
      hasAccess: false,
      errorResponse: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    };
  }
} 
