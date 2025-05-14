/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import {
  type User,
  type GetUserResponse,
  type UpdateUserInput,
  type UpdateUserResponse,
  type DeleteUserResponse
} from "~/types/users";

// Re-export for convenience
export type { User, UpdateUserInput };

// Hook to fetch a single user
export function useUser(userId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchUser = async (): Promise<User> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Failed to fetch user: ${response.status}`);
    }
    
    const data = await response.json() as GetUserResponse;
    return data.user;
  };
  
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
    enabled: !!session?.accessToken && !!userId,
  });

  // Handle errors with useEffect instead of during render
  useEffect(() => {
    if (isError && error instanceof Error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load user data. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    user,
    isLoading,
    isError,
    error,
    refetch
  };
}

// Hook to update a user
export function useUpdateUser(userId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUser = async (userData: UpdateUserInput): Promise<UpdateUserResponse> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText) as { error?: string };
        errorMessage = errorData.error ?? `Failed to update user: ${response.status}`;
      } catch (e) {
        errorMessage = errorText || `Failed to update user: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json() as UpdateUserResponse;
  };
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate the user query and users list to refetch them
      void queryClient.invalidateQueries({ queryKey: ['user', userId] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  });
}

// Hook to delete a user
export function useDeleteUser(userId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUser = async (): Promise<DeleteUserResponse> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText) as { error?: string };
        errorMessage = errorData.error ?? `Failed to delete user: ${response.status}`;
      } catch (e) {
        errorMessage = errorText || `Failed to delete user: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json() as DeleteUserResponse;
  };
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate the users list to refetch it
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  });
} 
