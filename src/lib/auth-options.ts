import { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env";

// Extend the Session type to include our custom properties
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    tokenType?: string;
    user?: {
      id?: string;
      email?: string | null;
      role?: string; // Keep role as it's essential for auth decisions
    };
  }

  // Add role to user type
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: string; // Keep role
    email?: string;
  }
}

// Response type for the backend API
interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      username: string;
      role: {
        id: string;
        name: string;
      };
    };
  };
  error?: string;
}

// Helper function to fetch user role from backend
async function fetchUserRoleFromBackend(
  token: string,
  email: string,
): Promise<string | null> {
  try {
    console.log(`[AUTH-DEBUG] Fetching role for user ${email}`);
    const encodedEmail = encodeURIComponent(email);
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/users/email/${encodedEmail}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 seconds timeout
      },
    );

    if (!response.ok) {
      console.error(
        `[AUTH-DEBUG] Failed to fetch user role: ${response.status}`,
      );
      return null;
    }

    // Type the API response appropriately
    interface UserRoleResponse {
      id?: string;
      email?: string;
      username?: string;
      role?: {
        id?: string;
        name?: string;
      };
    }

    const userData = (await response.json()) as UserRoleResponse;
    const role = userData?.role?.name ?? null;
    console.log(`[AUTH-DEBUG] Fetched role for ${email}: ${role}`);
    return role;
  } catch (error) {
    console.error("[AUTH-DEBUG] Error fetching user role:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Log the API URL we're calling
          const apiUrl = `${env.NEXT_PUBLIC_API_URL}/users/login`;
          console.log("[AUTH-DEBUG] Attempting login at:", apiUrl);

          // Call the real backend API for authentication with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Log response details
          console.log("[AUTH-DEBUG] Response status:", response.status);
          console.log(
            "[AUTH-DEBUG] Response headers:",
            Object.fromEntries(response.headers.entries()),
          );

          // Get response text first
          const responseText = await response.text();
          console.log("[AUTH-DEBUG] Raw response:", responseText);

          // Try to parse as JSON
          let data: LoginResponse;
          try {
            data = JSON.parse(responseText) as LoginResponse;
          } catch (parseError) {
            console.error(
              "[AUTH-DEBUG] Failed to parse response as JSON:",
              parseError,
            );
            throw new Error("Invalid JSON response from server");
          }

          if (!response.ok || data.status !== "success") {
            console.error(
              "[AUTH-DEBUG] Login error:",
              data.error ?? data.message ?? response.statusText,
            );
            return null;
          }

          // Return user object compatible with NextAuth
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            role: data.data.user.role.name,
            accessToken: data.data.token,
          };
        } catch (error) {
          console.error("[AUTH-DEBUG] Credentials authorize error:", error);
          if (error instanceof Error) {
            console.error("[AUTH-DEBUG] Error details:", error.message);
          }
          return null;
        }
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      try {
        console.log("[AUTH-DEBUG] JWT Callback - Input:", {
          token,
          account,
          user,
        });

        // If this is a sign-in with credentials
        if (user && "accessToken" in user) {
          console.log("[AUTH-DEBUG] Processing credentials sign-in");
          // Store the backend token in the accessToken field
          token.accessToken = user.accessToken as string;
          // For credential users, we already have the role from the login response
          if (user.role) {
            token.role = user.role;
          }
        }

        // Persist the Azure AD access token to the token
        if (account && account.provider === "azure-ad") {
          console.log("[AUTH-DEBUG] Processing Azure AD sign-in");
          token.accessToken = account.access_token;

          // For Azure AD users, try to fetch role from backend if we have an email
          if (token.email && account.access_token) {
            try {
              const role = await fetchUserRoleFromBackend(
                account.access_token,
                token.email,
              );
              if (role) {
                token.role = role;
              }
            } catch (error) {
              console.error(
                "[AUTH-DEBUG] Error fetching Azure user role:",
                error,
              );
            }
          }
        }

        console.log("[AUTH-DEBUG] JWT Callback - Output token:", token);
        return token;
      } catch (error) {
        console.error("[AUTH-DEBUG] JWT Callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        // Log the token and session for debugging
        console.log("[AUTH-DEBUG] Session callback - Token:", token);
        console.log("[AUTH-DEBUG] Session callback - Session:", session);

        // IMPORTANT: Minimize data in the session cookie to reduce size
        const minimizedSession = {
          ...session,
          accessToken: token.accessToken,
          tokenType: "Bearer",
          user: {
            id: token.sub,
            email: token.email,
            role: token.role,
          },
        };

        console.log("[AUTH-DEBUG] Minimized session:", minimizedSession);
        return minimizedSession;
      } catch (error) {
        console.error("[AUTH-DEBUG] Session callback error:", error);
        // Return a minimal valid session to prevent errors
        return {
          ...session,
          user: {
            email: token.email,
          },
        };
      }
    },
    async redirect({ url, baseUrl }) {
      // If the url starts with the base url, it's a relative url, so allow it
      if (url.startsWith(baseUrl)) return url;
      // Allow redirect to our configured NextAuth URL
      if (url.startsWith(process.env.NEXTAUTH_URL ?? "")) return url;
      // Otherwise, redirect to base url
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login", // Use our custom login page
    error: "/login", // Error page
  },
  logger: {
    error(code, metadata) {
      console.error(`Auth Error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`Auth Warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`Auth Debug: ${code}`, metadata);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // useSecureCookies: false,
  // cookies: {
  //   sessionToken: {
  //     name: `next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //     },
  //   },
  // },
};
