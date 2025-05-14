import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { env } from "~/env";

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

interface RolesResponse {
  data: Role[];
}

interface CreateRoleRequest {
  name: string;
  description: string;
  role_actions: RoleAction[];
  full_node_access?: boolean;
  accessible_nodes?: string[];
}

interface CreateRoleResponse {
  data: Role;
}

// GET handler for retrieving all roles
export async function GET(_req: NextRequest) {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Fetch roles from the backend
    const rolesResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!rolesResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch roles from backend: ${rolesResponse.status}` },
        { status: rolesResponse.status }
      );
    }

    const rolesData = await rolesResponse.json() as RolesResponse;
    
    return NextResponse.json({ roles: rolesData.data });
    
  } catch (error) {
    console.error('Error fetching roles:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler for creating a new role
export async function POST(request: NextRequest) {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse the request body
    const data = await request.json() as CreateRoleRequest;

    // Send create request to the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to create role: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json() as CreateRoleResponse;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error creating role:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
