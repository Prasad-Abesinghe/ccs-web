"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api";
import { type Level, type NewLevelFormData, type Node } from "~/types/levels";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";

export function useLevels() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchLevels = async (): Promise<Level[]> => {
    if (!session?.accessToken) {
      console.log("No access token found in session");
      return [];
    }
    
    try {
      console.log("Fetching levels data");
      return await api.getLevels();
    } catch (error) {
      console.error("Error fetching levels:", error);
      throw error;
    }
  };

  const {
    data: levels = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["levels"],
    queryFn: fetchLevels,
    enabled: !!session?.accessToken,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle errors
  if (isError && error instanceof Error) {
    console.error("Error fetching levels:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to load levels. Please try again.",
      variant: "destructive",
    });
  }

  return {
    levels,
    isLoading,
    isError,
    error,
    refetch
  };
}

export interface LevelSummary {
  id: string;
  name: string;
  type: string;
  levels: {
    id: string;
    name: string;
    active: number;
    inactive: number;
    normal: number;
    warnings: number;
    critical: number;
  }[];
  alerts: {
    level_id: string;
    level_name: string;
    sensors: {
      severity: string;
      value: number;
    }[];
  }[];
  widget_url: string;
}

export function useLevelSummary(levelId: string) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchLevelSummary = async (): Promise<LevelSummary> => {
    if (!session?.accessToken) {
      console.log("No access token found in session");
      throw new Error("Authentication required");
    }
    
    if (!levelId) {
      console.log("No level ID provided");
      throw new Error("Level ID is required");
    }
    
    try {
      console.log(`Fetching summary data for level: ${levelId}`);
      return await api.getLevelSummary(levelId);
    } catch (error) {
      console.error("Error fetching level summary:", error);
      throw error;
    }
  };
  
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["level-summary", levelId],
    queryFn: fetchLevelSummary,
    enabled: !!session?.accessToken && !!levelId,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds (more frequent updates for summary)
  });

  // Handle errors
  if (isError && error instanceof Error) {
    console.error("Error fetching level summary:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to load level summary. Please try again.",
      variant: "destructive",
    });
  }

  return {
    summary,
    isLoading,
    isError,
    error,
    refetch
  };
}

export function useFindLevel(levels: Level[] | undefined, id: string) {
  // Special case: if id is "0" or empty and levels exist, return the first level
  if ((id === "0" || !id) && levels && levels.length > 0) {
    return levels[0];
  }

  // Otherwise, search for the level by id
  if (!levels) return null;

  function searchLevel(level: Level): Level | null {
    if (level.id === id) return level;

    for (const child of level.children) {
      const result = searchLevel(child);
      if (result) return result;
    }

    return null;
  }

  for (const level of levels) {
    const result = searchLevel(level);
    if (result) return result;
  }

  return null;
}

export function useFindParentLevel(levels: Level[] | undefined, childId: string) {
  if (!levels) return null;

  function findParent(level: Level): Level | null {
    // Check if any direct child matches the childId
    if (level.children.some(child => child.id === childId)) {
      return level;
    }
    
    // Check deeper in the hierarchy
    for (const child of level.children) {
      const result = findParent(child);
      if (result) return result;
    }
    
    return null;
  }

  for (const level of levels) {
    const result = findParent(level);
    if (result) return result;
  }
  
  return null;
}

export function useLevel(levelId: string | null | undefined) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchLevel = async (): Promise<Node> => {
    if (!session?.accessToken) {
      console.log("No access token found in session");
      throw new Error("Authentication required");
    }
    
    if (!levelId) {
      console.log("No level ID provided");
      throw new Error("Level ID is required");
    }
    
    try {
      console.log(`Fetching level data for ID: ${levelId}`);
      return await api.getLevel(levelId);
    } catch (error) {
      console.error("Error fetching level:", error);
      throw error;
    }
  };
  
  const {
    data: level,
    isLoading,
    isError,
    error
  } = useQuery<Node>({
    queryKey: ["level", levelId],
    queryFn: fetchLevel,
    enabled: !!session?.accessToken && !!levelId,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle errors
  if (isError && error instanceof Error) {
    console.error("Error fetching level:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to load level. Please try again.",
      variant: "destructive",
    });
  }

  return {
    level,
    isLoading,
    isError,
    error
  };
}

export function useCreateLevel() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (levelData: NewLevelFormData) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      return await api.createLevel(levelData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Level created successfully",
      });
      
      // Invalidate levels query to refresh the data
      void queryClient.invalidateQueries({ queryKey: ["levels"] });
    },
    onError: (err) => {
      console.error("Error creating level:", err);
      toast({
        title: "Error",
        description: err instanceof Error 
          ? err.message 
          : "Failed to create level. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createLevel: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}

export function useUpdateLevel() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      levelId,
      levelData,
    }: {
      levelId: string;
      levelData: { name: string; description: string; parent_id?: string };
    }) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      return await api.updateLevel(levelId, levelData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Level updated successfully",
      });
      
      // Invalidate levels query to refresh the data
      void queryClient.invalidateQueries({ queryKey: ["levels"] });
      // Also invalidate specific level if cached
      void queryClient.invalidateQueries({ queryKey: ["level"] });
    },
    onError: (err) => {
      console.error("Error updating level:", err);
      toast({
        title: "Error",
        description: err instanceof Error 
          ? err.message 
          : "Failed to update level. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    updateLevel: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
}

export function useDeleteLevel() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (levelId: string) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      return await api.deleteLevel(levelId);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Level deleted successfully",
      });
      
      // Invalidate levels query to refresh the data
      void queryClient.invalidateQueries({ queryKey: ["levels"] });
      
      // Also invalidate the specific level if it's cached
      void queryClient.invalidateQueries({ 
        queryKey: ["level", data.data.id]
      });
    },
    onError: (err) => {
      console.error("Error deleting level:", err);
      toast({
        title: "Error",
        description: err instanceof Error 
          ? err.message 
          : "Failed to delete level. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    deleteLevel: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
} 
