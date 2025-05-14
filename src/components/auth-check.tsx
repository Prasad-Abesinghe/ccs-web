"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/use-auth";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isLoading]);

  // Show nothing while loading or if there's no user
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
