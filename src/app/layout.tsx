import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";

import { type Metadata } from "next";
import { UserProvider } from "~/context/user-context";
import { Toaster } from "~/components/ui/toaster";
import { Toaster as SonnerToaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/components/theme-provider";
import { ReactQueryProvider } from "~/components/react-query-provider";
import NextAuthProvider from "~/components/next-auth-provider";
import { AuthSync } from "~/components/auth-sync";
import { AuthProvider } from "~/contexts/auth-context";

export const metadata: Metadata = {
  title: "BEELIVE",
  description:
    "BEELIVE is a platform for monitoring and managing temperature in supply chains.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark">
          <NextAuthProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <UserProvider>
                  <AuthSync />
                  {children}
                  <Toaster />
                  <SonnerToaster richColors />
                </UserProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
