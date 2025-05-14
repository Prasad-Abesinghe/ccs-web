import { NextResponse } from 'next/server';

// This endpoint provides instructions for the client to clear auth cookies
// The actual clearing must happen in the browser due to Next.js cookie limitations
export async function GET() {
  try {
    return NextResponse.json({
      message: "To clear authentication, please use the 'Force Complete Relogin' button on the debug page",
      instructions: "Client-side code should delete cookies containing 'next-auth' in their names",
      hint: "Use the /debug-tools page to manage authentication state"
    });
  } catch (error) {
    console.error('Error in auth-reset endpoint:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
