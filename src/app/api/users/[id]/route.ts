import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { env } from "~/env";
import { checkApiPermissions } from "~/lib/api-permissions";

// Backend response interfaces
interface GetUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
    is_ad_user: boolean;
  };
}

interface UpdateUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role_id: string;
    is_ad_user: boolean;
  };
}

interface DeleteUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
  };
}

// GET handler for retrieving a user by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Skip permission checks in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev) {
      // Check if user has permission to view users
      const { hasAccess, errorResponse } = await checkApiPermissions("USER_VIEW");
      
      if (!hasAccess) {
        return errorResponse ?? NextResponse.json({ error: "Permission check failed" }, { status: 403 });
      }
    }

    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;

    // Fetch user from the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch user: ${response.status}`);
      // For debugging
      try {
        const responseText = await response.text();
        console.error('Error response:', responseText);
      } catch (e) {
        console.error('Could not read response text', e);
      }
      
      return NextResponse.json(
        { error: `Failed to fetch user: ${response.status}` },
        { status: response.status }
      );
    }

    const userData = await response.json() as GetUserResponse;
    
    // Return user data in the format expected by the frontend
    return NextResponse.json({
      user: {
        id: userData.data.id,
        name: userData.data.name,
        email: userData.data.email,
        role: userData.data.role.name,
        role_id: userData.data.role.id,
        is_ad_user: userData.data.is_ad_user || false
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler for updating a user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Skip permission checks in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev) {
      // Check if user has permission to update users
      const { hasAccess, errorResponse } = await checkApiPermissions("USER_UPDATE");
      
      if (!hasAccess) {
        return errorResponse ?? NextResponse.json({ error: "Permission check failed" }, { status: 403 });
      }
    }

    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;

    // Parse the request body
    const data = await request.json() as {
      name: string;
      role_id: string;
      is_ad_user: boolean;
    };

    // Prepare the update payload
    const updateData = {
      name: data.name,
      role_id: data.role_id,
      is_ad_user: data.is_ad_user
    };

    // Send update request to the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to update user: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json() as UpdateUserResponse;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error updating user:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler for deleting a user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Skip permission checks in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isDev) {
      // Check if user has permission to delete users
      const { hasAccess, errorResponse } = await checkApiPermissions("USER_DELETE");
      
      if (!hasAccess) {
        return errorResponse ?? NextResponse.json({ error: "Permission check failed" }, { status: 403 });
      }
    }

    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;

    // Send delete request to the backend
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `Failed to delete user: ${response.status}` },
        { status: response.status }
      );
    }

    const responseData = await response.json() as DeleteUserResponse;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error deleting user:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
