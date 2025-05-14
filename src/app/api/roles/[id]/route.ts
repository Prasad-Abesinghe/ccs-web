import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { env } from "~/env";

// Backend response interfaces
interface GetRoleResponse {
  data: {
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
  };
}

interface UpdateRoleResponse {
  data: {
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
  };
}

interface DeleteRoleResponse {
  data: {
    id: string;
    message: string;
  };
}

// GET handler for retrieving a role by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Skip authentication check in development mode
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && !session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Fetch role from the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/roles/${id}`, {
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch role: ${response.status}`);
      // For debugging
      try {
        const responseText = await response.text();
        console.error('Error response:', responseText);
      } catch (e) {
        console.error('Could not read response text', e);
      }
      
      return NextResponse.json(
        { error: `Failed to fetch role: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json() as GetRoleResponse;
    
    return NextResponse.json({ role: data.data });
    
  } catch (error) {
    console.error('Error fetching role:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler for updating a role
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse the request body
    const data = await request.json() as {
      name: string;
      description: string;
      role_actions: {
        actions: string[];
        node_id: string | null;
      }[];
    };

    // Send update request to the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to update role: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json() as UpdateRoleResponse;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error updating role:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler for deleting a role
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Send delete request to the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to delete role: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json() as DeleteRoleResponse;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error deleting role:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
