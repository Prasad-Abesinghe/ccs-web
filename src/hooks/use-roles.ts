/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import { 
  type Role, 
  type RoleAction,
  type RolesResponse, 
  type GetRoleResponse,
  type CreateRoleInput, 
  type CreateRoleResponse,
  type UpdateRoleInput, 
  type UpdateRoleResponse,
  type DeleteRoleResponse,
  AVAILABLE_ACTIONS,
  NODE_LEVEL_ACTIONS
} from "~/types/roles";

// Re-export for convenience
export type { Role, RoleAction, CreateRoleInput, UpdateRoleInput };
export { AVAILABLE_ACTIONS, NODE_LEVEL_ACTIONS };

export function useRoles() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchRoles = async (): Promise<Role[]> => {
    if (!session?.accessToken) {
      return [];
    }
    
    const response = await fetch('/api/roles', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Failed to fetch roles: ${response.status}`);
    }
    
    const data = await response.json() as RolesResponse;
    return data.roles;
  };
  
  const {
    data: roles = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: !!session?.accessToken,
  });

  // Handle errors with useEffect instead of during render
  useEffect(() => {
    if (isError && error instanceof Error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load roles. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    roles,
    isLoading,
    isError,
    error,
    refetch
  };
}

// Hook to fetch a single role
export function useRole(roleId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchRole = async (): Promise<Role> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to fetch role: ${response.status}`, error);
        throw new Error(error || `Failed to fetch role: ${response.status}`);
      }
      
      const data = await response.json() as GetRoleResponse;
      
      if (!data.role) {
        console.error('Role data is undefined in the response', data);
        throw new Error('Role data is undefined in the response');
      }
      
      return data.role;
    } catch (error) {
      console.error('Error in fetchRole:', error);
      throw error;
    }
  };
  
  const {
    data: role,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['role', roleId],
    queryFn: fetchRole,
    enabled: !!session?.accessToken && !!roleId,
  });

  // Handle errors
  if (isError && error instanceof Error) {
    console.error("Error fetching role:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to load role data. Please try again.",
      variant: "destructive",
    });
  }

  return {
    role,
    isLoading,
    isError,
    error,
    refetch
  };
}

// Hook to create a role
export function useCreateRole() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRole = async (roleData: CreateRoleInput): Promise<CreateRoleResponse> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText) as { error?: string };
        errorMessage = errorData.error ?? `Failed to create role: ${response.status}`;
      } catch (e) {
        errorMessage = errorText || `Failed to create role: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json() as CreateRoleResponse;
  };
  
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      // Invalidate the roles list to refetch it
      void queryClient.invalidateQueries({ queryKey: ['roles'] });
      
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create role. Please try again.",
        variant: "destructive",
      });
    }
  });
}

// Hook to update a role
export function useUpdateRole(roleId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRole = async (roleData: UpdateRoleInput): Promise<UpdateRoleResponse> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch(`/api/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText) as { error?: string };
        errorMessage = errorData.error ?? `Failed to update role: ${response.status}`;
      } catch (e) {
        errorMessage = errorText || `Failed to update role: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json() as UpdateRoleResponse;
  };
  
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      // Invalidate the role query and roles list to refetch them
      void queryClient.invalidateQueries({ queryKey: ['role', roleId] });
      void queryClient.invalidateQueries({ queryKey: ['roles'] });
      
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  });
}

// Hook to delete a role
export function useDeleteRole(roleId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteRole = async (): Promise<DeleteRoleResponse> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    const response = await fetch(`/api/roles/${roleId}`, {
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
        errorMessage = errorData.error ?? `Failed to delete role: ${response.status}`;
      } catch (e) {
        errorMessage = errorText || `Failed to delete role: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json() as DeleteRoleResponse;
  };
  
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      // Invalidate the roles list to refetch it
      void queryClient.invalidateQueries({ queryKey: ['roles'] });
      
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role. Please try again.",
        variant: "destructive",
      });
    }
  });
} 
