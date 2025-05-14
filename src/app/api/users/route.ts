import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { env } from "~/env";

// Backend user interface
interface BackendUser {
  id: string;
  username: string;
  email: string;
  role_id: string;
}

interface BackendUsersResponse {
  status: string;
  message: string;
  data: BackendUser[];
}

// Role interface
interface Role {
  id: string;
  name: string;
  description: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  ms_teams_enabled: boolean;
  has_root_access: boolean;
  role_actions: unknown[];
}

interface RolesResponse {
  data: Role[];
}

// Create user response
interface CreateUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role: {
      id: string;
      name: string;
    };
    created_at: string;
  };
}

// GET handler for retrieving all users
export async function GET(_req: NextRequest) {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Fetch users from the backend
    const backendResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/users/`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch users from backend: ${backendResponse.status}` },
        { status: backendResponse.status }
      );
    }

    const usersData = await backendResponse.json() as BackendUsersResponse;

    // Fetch roles to map role_id to role name
    const rolesResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    let roles: Role[] = [];
    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json() as RolesResponse;
      roles = rolesData.data;
    }

    // Map backend users to the format expected by the frontend
    const users = usersData.data.map(user => {
      // Find role name by role_id
      const role = roles.find(r => r.id === user.role_id);
      
      return {
        id: user.id,
        name: user.username,
        email: user.email,
        role: role?.name ?? 'Unknown',
        role_id: user.role_id
      };
    });
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Error fetching users:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler for creating a new user
export async function POST(req: NextRequest) {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse the request body
    const data = await req.json() as {
      name: string;
      email: string;
      role_id: string;
      is_ad_user: boolean;
      password?: string;
    };

    // Prepare the user data for the backend
    const userData = {
      username: data.name,
      email: data.email,
      role_id: data.role_id,
      is_ad_user: data.is_ad_user,
      ...(data.password && { password: data.password })
    };

    // Send the request to the backend
    const createResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText) as { message?: string };
      } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
        errorData = { message: errorText };
      }
      return NextResponse.json(
        { error: errorData.message ?? `Failed to create user: ${createResponse.status}` },
        { status: createResponse.status }
      );
    }

    const responseData = await createResponse.json() as CreateUserResponse;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error creating user:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
