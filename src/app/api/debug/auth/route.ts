import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";

export async function GET() {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);
    
    // Create a safe version of the session for debugging (omitting sensitive token values)
    const safeSession = {
      user: session?.user,
      expires: session?.expires,
      hasAccessToken: !!session?.accessToken,
      accessTokenPreview: session?.accessToken ? `${session.accessToken.substring(0, 30)}...` : null,
      tokenType: session?.tokenType,
    };
    
    return NextResponse.json({
      hasSession: !!session,
      sessionData: safeSession,
    });
    
  } catch (error) {
    console.error('Error in auth debug endpoint:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
