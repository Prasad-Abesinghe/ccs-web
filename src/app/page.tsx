"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "~/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/levels");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
} 
