import { getServerSession } from "next-auth/next";
import { authOptions } from "~/lib/auth-options";

// Helper function to get the session on the server
export function auth() {
  return getServerSession(authOptions);
} 
