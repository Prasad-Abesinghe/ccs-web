"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import { type Sensor, type SensorsResponse } from "~/types/sensors";

// Export the type for convenience
export type { Sensor };

export function useSensors() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchSensors = async (): Promise<Sensor[]> => {
    
    if (!session?.accessToken) {
      return [];
    }
    
    try {
      const response = await fetch('/api/sensors', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      
      if (!response.ok) {
        const error = await response.text();
        console.error("[DEBUG-CLIENT] Error response:", error);
        throw new Error(error || `Failed to fetch sensors: ${response.status}`);
      }
      
      const data = await response.json() as SensorsResponse;
      return data.data;
    } catch (error) {
      console.error("[DEBUG-CLIENT] Error in fetchSensors:", error);
      throw error;
    }
  };
  
  const {
    data: sensors = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sensors'],
    queryFn: fetchSensors,
    enabled: !!session?.accessToken,
  });

  // Handle errors with useEffect instead of during render
  useEffect(() => {
    if (isError && error instanceof Error) {
      console.error("[DEBUG-CLIENT] Error fetching sensors:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load sensors. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    sensors,
    isLoading,
    isError,
    error,
    refetch
  };
} 
