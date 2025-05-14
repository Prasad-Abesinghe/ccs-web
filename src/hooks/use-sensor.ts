/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import { 
  type Sensor, 
  type SensorResponse, 
  type UpdateSensorInput,
  SENSOR_TYPES
} from "~/types/sensors";

// Export the types and constants for convenience
export type { Sensor, UpdateSensorInput };
export { SENSOR_TYPES };

// Hook to fetch a single sensor
export function useSensor(sensorId: string | null | undefined) {
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchSensor = async (): Promise<Sensor> => {
    if (!sensorId) {
      throw new Error("Sensor ID is required");
    }
    
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }
    
    try {
      const response = await fetch(`/api/sensors/${sensorId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG-CLIENT] Error response:", errorText);
        throw new Error(errorText || `Failed to fetch sensor: ${response.status}`);
      }
      
      const data = await response.json() as SensorResponse;
      return data.data;
    } catch (error) {
      console.error("[DEBUG-CLIENT] Error in fetchSensor:", error);
      throw error;
    }
  };
  
  const {
    data: sensor,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sensor', sensorId],
    queryFn: fetchSensor,
    enabled: !!session?.accessToken && !!sensorId,
  });

  // Handle errors with useEffect instead of during render
  useEffect(() => {
    if (isError && error instanceof Error) {
      console.error("[DEBUG-CLIENT] Error fetching sensor:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load sensor data. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return {
    sensor,
    isLoading,
    isError,
    error,
    refetch
  };
}

// Hook to update a sensor
export function useUpdateSensor() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sensorId,
      sensorData,
    }: {
      sensorId: string;
      sensorData: UpdateSensorInput;
    }) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`/api/sensors/${sensorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sensorData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorData = JSON.parse(errorText) as { error?: string };
          errorMessage = errorData.error ?? `Failed to update sensor: ${response.status}`;
        } catch (error) {
          errorMessage = errorText || `Failed to update sensor: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Return an empty object, as we don't need the response data
      return {};
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Sensor updated successfully",
      });
      
      // Invalidate both the sensors list and the specific sensor
      void queryClient.invalidateQueries({ queryKey: ["sensors"] });
      void queryClient.invalidateQueries({ 
        queryKey: ["sensor", variables.sensorId] 
      });
    },
    onError: (error) => {
      console.error("Error updating sensor:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to update sensor. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Hook to create a new sensor
export function useCreateSensor() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sensorData: UpdateSensorInput) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch('/api/sensors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sensorData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorData = JSON.parse(errorText) as { error?: string };
          errorMessage = errorData.error ?? `Failed to create sensor: ${response.status}`;
        } catch (error) {
          errorMessage = errorText || `Failed to create sensor: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Return an empty object, as we don't need the response data
      return {};
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sensor created successfully",
      });
      
      // Invalidate the sensors list to refetch it
      void queryClient.invalidateQueries({ queryKey: ["sensors"] });
    },
    onError: (error) => {
      console.error("Error creating sensor:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to create sensor. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Helper function to get required fields based on sensor type and subtype
export function getSensorFields(
  sensorType: string | null, 
  subType: string | null
): string[] {
  if (!sensorType) return [];
  
  const typeConfig = SENSOR_TYPES.find(type => 
    type.value.toLowerCase() === sensorType.toLowerCase());
  
  if (!typeConfig) return [];
  
  // If this sensor type has subtypes
  if (typeConfig.subTypes && subType) {
    const subTypeConfig = typeConfig.subTypes.find(sub => 
      sub.value.toLowerCase() === subType.toLowerCase());
    
    if (subTypeConfig) {
      return subTypeConfig.fields;
    }
  }
  
  // Fall back to type-level fields
  return typeConfig.fields ?? [];
}

// These are deprecated and will be removed in the future
export function useSensorData(sensorId: string | undefined) {
  const { data: session } = useSession();
  
  interface SensorDataResponse {
    data: {
      value: string | null;
      timestamp: string;
    }[];
  }
  
  return useQuery({
    queryKey: ["sensor-data", sensorId],
    queryFn: async () => {
      if (!sensorId) return null;
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`/api/sensors/${sensorId}/data`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sensor data: ${response.status}`);
      }
      
      return await response.json() as SensorDataResponse;
    },
    enabled: !!sensorId && !!session?.accessToken,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useGrafanaUrl(dashboardUrl: string | undefined) {
  const { data: session } = useSession();
  
  interface GrafanaUrlResponse {
    url: string;
  }
  
  return useQuery({
    queryKey: ["grafanaUrl", dashboardUrl],
    queryFn: async () => {
      if (!dashboardUrl) return '';
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`/api/grafana/url?dashboard=${encodeURIComponent(dashboardUrl)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Grafana URL: ${response.status}`);
      }
      
      const data = await response.json() as GrafanaUrlResponse;
      return data.url;
    },
    enabled: !!dashboardUrl && !!session?.accessToken,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - URLs rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (renamed from cacheTime in v5)
  });
}

export function useDeleteSensor() {
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async (sensorId: string) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      try {
        await fetch(`/api/sensors/${sensorId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        return true;
      } catch (_) {
        // Error is logged but not used
        console.error("Error deleting sensor");
        throw new Error('Failed to delete sensor');
      }
    },
    onSuccess: (data, variables) => {
      // Handle success
    },
    onError: (error) => {
      console.error("Error deleting sensor:", error);
      // Handle error
    },
  });
}

// Hook to patch a sensor (partial update)
export function usePatchSensor() {
  const { data: session } = useSession();
  
  return useMutation({
    mutationFn: async ({ sensorId, sensorData }: { sensorId: string; sensorData: UpdateSensorInput }) => {
      if (!session?.accessToken) {
        throw new Error("Authentication required");
      }
      
      try {
        const response = await fetch(`/api/sensors/${sensorId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sensorData)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update sensor: ${response.status}`);
        }
        
        const data = await response.json() as SensorResponse;
        return data;
      } catch (error) {
        // Error is logged but not used
        console.error("Error updating sensor");
        throw new Error('Failed to update sensor');
      }
    },
    onSuccess: (data, variables) => {
      // Handle success
    },
    onError: (error) => {
      console.error("Error updating sensor:", error);
      // Handle error
    },
  });
} 
