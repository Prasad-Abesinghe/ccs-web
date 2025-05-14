import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";
import { env } from "~/env";

export async function GET() {
  try {
    // Get authentication session from NextAuth
    const session = await getServerSession(authOptions);
    
    // If no session or token, return unauthorized
    if (!session?.accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: "No access token found in session" 
      }, { status: 401 });
    }
    
    // Try making a simple request to the backend API
    // using the user's token to verify it works
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get response body for debugging
    const responseText = await response.text();
    let responseData: unknown;
    try {
      responseData = JSON.parse(responseText);
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      responseData = { raw: responseText };
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      tokenType: session.tokenType,
      tokenPreview: session.accessToken.substring(0, 20) + '...',
      response: responseData
    });
    
  } catch (error) {
    console.error('Error in token test endpoint:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
