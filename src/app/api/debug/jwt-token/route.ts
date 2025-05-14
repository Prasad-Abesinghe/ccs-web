import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the raw token (this bypasses the session transformation)
    const token = await getToken({ 
      req: request,
      raw: true, // Get the encoded token
    });
    
    // Get the decoded token as well
    const decodedToken = await getToken({ 
      req: request,
    });
    
    return NextResponse.json({
      hasRawToken: !!token,
      hasDecodedToken: !!decodedToken,
      rawTokenPreview: token ? `${String(token).substring(0, 20)}...` : null,
      decodedToken: decodedToken,
    });
    
  } catch (error) {
    console.error('Error in JWT debug endpoint:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
