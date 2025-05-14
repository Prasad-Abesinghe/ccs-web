import "~/styles/globals.css";

import { type Metadata } from "next";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AuthCheck } from "~/components/auth-check";

export const metadata: Metadata = {
  title: "BEELIVE",
  description:
    "BEELIVE is a platform for monitoring and managing temperature in supply chains.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthCheck>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </AuthCheck>
  );
}
