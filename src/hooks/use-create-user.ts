"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";

// New user input interface
export interface CreateUserInput {
  name: string;
  email: string;
  role_id: string;
  is_ad_user: boolean;
  password?: string;
}

// Backend response interface
interface CreateUserResponse {
  status: string;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role: {
      id: string;
      name: string;
    };
    created_at: string;
  };
}

interface ErrorResponse {
  error?: string;
}

export function useCreateUser() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUser = async (userData: CreateUserInput): Promise<CreateUserResponse> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText) as ErrorResponse;
        errorMessage = errorData.error ?? `Failed to create user: ${response.status}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        errorMessage = errorText || `Failed to create user: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json() as CreateUserResponse;
  };
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate the users query to refetch the list
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  });
} 
