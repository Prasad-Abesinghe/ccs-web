import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { env } from "~/env";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ email: string }> }
) {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);

    // Check auth regardless of environment
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { email } = await context.params;
    
    // Encode the email for use in the URL
    const encodedEmail = encodeURIComponent(email);

    // Fetch user from the backend by email
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/users/email/${encodedEmail}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch user by email: ${response.status}`);
      // For debugging
      try {
        const responseText = await response.text();
        console.error('Error response:', responseText);
      } catch (e) {
        console.error('Could not read response text', e);
      }
      
      return NextResponse.json(
        { error: `Failed to fetch user by email: ${response.status}` },
        { status: response.status }
      );
    }

    // Add type annotation to avoid unsafe assignment error
    const userData: unknown = await response.json();
    
    return NextResponse.json(userData);
    
  } catch (error) {
    console.error('Error fetching user by email:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
