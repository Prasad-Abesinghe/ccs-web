"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "~/components/ui/use-toast";

export function useAuth() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    accessToken: session?.accessToken,
    error,
    login: () => {
      setError("Please use the sign in button to authenticate.");
      toast({
        variant: "destructive",
        title: "Authentication method changed",
        description: "Please use the sign in button to authenticate with Azure AD.",
      });
    },
    isPendingLogin: false, // No longer needed
    logout: handleLogout,
    isPendingLogout: false, // No longer needed
  };
} 
