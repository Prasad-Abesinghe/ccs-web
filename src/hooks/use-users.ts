"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import { type User, type UsersResponse } from "~/types/users";

// For backwards compatibility
export type UserData = User;

export function useUsers() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchUsers = async (): Promise<User[]> => {
    if (!session?.accessToken) {
      return [];
    }
    
    const response = await fetch('/api/users', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Failed to fetch users: ${response.status}`);
    }
    
    const data = await response.json() as UsersResponse;
    return data.users;
  };
  
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!session?.accessToken,
  });

  // Handle errors with useEffect instead of during render
  useEffect(() => {
    if (isError && error instanceof Error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    users,
    isLoading,
    isError,
    error,
    refetch
  };
} 
