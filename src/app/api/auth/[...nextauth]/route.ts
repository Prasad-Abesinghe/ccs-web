import NextAuth from "next-auth";
import { authOptions } from "~/lib/auth-options";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions);

// Export the handlers with explicit types for App Router
export { handler as GET, handler as POST }; 
