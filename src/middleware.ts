import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  console.log("[MIDDLEWARE-DEBUG] Processing path:", path);

  // Testing and auth-related paths should never be intercepted
  if (
    path.startsWith("/api/auth") ||
    path === "/debug" ||
    path.startsWith("/api/debug") ||
    path.startsWith("/api/session-debug")
  ) {
    console.log("[MIDDLEWARE-DEBUG] Skipping auth check for path:", path);
    return NextResponse.next();
  }

  // Public paths that don't require authentication
  const isPublicPath = path === "/login";

  // Check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  console.log(
    "[MIDDLEWARE-DEBUG] Token status:",
    token ? "Present" : "Missing",
  );

  if (token) {
    console.log("[MIDDLEWARE-DEBUG] Token details:", {
      email: token.email,
      role: token.role,
      exp: token.exp,
    });
  }

  // Redirect logic
  if (isPublicPath && token) {
    console.log(
      "[MIDDLEWARE-DEBUG] Authenticated user accessing login page, redirecting to home",
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isPublicPath && !token) {
    console.log(
      "[MIDDLEWARE-DEBUG] Unauthenticated user accessing protected route, redirecting to login",
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For API routes that need authentication, return 401 if not authenticated
  if (path.startsWith("/api/") && !token) {
    console.log(
      "[MIDDLEWARE-DEBUG] Unauthenticated API request, returning 401",
    );
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  console.log("[MIDDLEWARE-DEBUG] Allowing request to proceed");
  return NextResponse.next();
}

// Specify which paths should be protected by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
