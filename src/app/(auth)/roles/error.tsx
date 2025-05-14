"use client";

import { useEffect } from "react";
import { SidebarInset } from "~/components/ui/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function RolesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold tracking-tight">
            Roles
          </h1>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground max-w-md">
            An error occurred while trying to load roles. Please try again or contact support if the problem persists.
          </p>
          <p className="text-sm text-muted-foreground">
            Error: {error.message || "Unknown error"}
          </p>
          <Button onClick={reset} className="mt-4">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </SidebarInset>
  );
} 
