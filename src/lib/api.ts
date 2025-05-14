import { env } from "~/env";
import { type Level } from "./utils";
import { getSession } from "next-auth/react";
import { type CreateLevelResponse, type Node, type UpdateLevelResponse, type DeleteLevelResponse } from "~/types/levels";

interface LevelsResponse {
  levels: Level[];
}

interface LevelSummaryResponse {
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

interface SensorResponse {
  id: string;
  value: number;
  timestamp: string;
  type: string;
  warning: boolean;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Simplified error handling
    const status = response.status;
    try {
      // Only attempt to parse if there's a response body
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = (await response.json()) as Record<string, unknown>;
        if (typeof data === "object" && data !== null && "error" in data) {
          throw new Error(String(data.error));
        }
      }
    } catch (e) {
      // If parsing fails, use a generic error message
      if (e instanceof Error) throw e;
    }

    // Default error message if we couldn't extract one
    throw new Error(`HTTP error! Status: ${status}`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error("Failed to parse response as JSON:", error);
    throw new Error("Invalid response format");
  }
}

// Get auth headers using NextAuth
async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Get session from NextAuth
  const session = await getSession();

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
}

// API functions
export const api = {
  // Auth methods are no longer needed as we're using NextAuth
  logout: async (): Promise<void> => {
    // For client-side logout, NextAuth's signOut function should be used instead
    // This is kept for backward compatibility
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  },

  // Create new level
  createLevel: async (levelData: { name: string; description: string; parent_id?: string }): Promise<CreateLevelResponse> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/nodes`;
      console.log(`Creating new level at API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(levelData),
      });
      
      return handleResponse<CreateLevelResponse>(response);
    } catch (error) {
      console.error("Error in createLevel:", error);
      throw error;
    }
  },

  // Update existing level
  updateLevel: async (levelId: string, levelData: { name: string; description: string; parent_id?: string }): Promise<UpdateLevelResponse> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/nodes/${levelId}`;
      console.log(`Updating level at API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(levelData),
      });
      
      return handleResponse<UpdateLevelResponse>(response);
    } catch (error) {
      console.error("Error in updateLevel:", error);
      throw error;
    }
  },

  // Delete level/node
  deleteLevel: async (levelId: string): Promise<DeleteLevelResponse> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/nodes/${levelId}`;
      console.log(`Deleting level at API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
      });
      
      return handleResponse<DeleteLevelResponse>(response);
    } catch (error) {
      console.error("Error in deleteLevel:", error);
      throw error;
    }
  },

  // Levels
  getLevels: async (): Promise<Level[]> => {
    try {
      // Check if API URL is available
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        return [];
      }

      // Otherwise, use the actual API
      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/levels`;
      console.log(`Fetching levels from API: ${apiUrl}`);

      const headers = await getHeaders();
      console.log(
        "Headers present for levels request:",
        Object.keys(headers).join(", "),
      );

      const response = await fetch(apiUrl, { headers });
      const data = await handleResponse<LevelsResponse>(response);
      return data.levels;
    } catch (error) {
      console.error("Error in getLevels:", error);
      throw error;
    }
  },

  // Get a single level/node by ID
  getLevel: async (levelId: string): Promise<Node> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/nodes/${levelId}`;
      console.log(`Fetching level data from API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, { headers });
      const data = await handleResponse<{
        status: string;
        message: string;
        data: Node;
      }>(response);
      
      return data.data;
    } catch (error) {
      console.error(`Error in getLevel for level ${levelId}:`, error);
      throw error;
    }
  },

  // Level Summary
  getLevelSummary: async (levelId: string): Promise<LevelSummaryResponse> => {
    if (!levelId) {
      console.error("Level ID is required for getLevelSummary");
      throw new Error("Level ID is required");
    }

    try {
      // Check if API URL is available
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        return {
          id: levelId,
          name: "",
          type: "",
          levels: [],
          alerts: [],
          widget_url: ""
        };
      }
      
      // Otherwise, use the actual API
      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/levels/${levelId}/summary`;
      console.log(`Fetching summary from API: ${apiUrl}`);

      const headers = await getHeaders();
      console.log(
        "Headers present for level summary request:",
        Object.keys(headers).join(", "),
      );

      try {
        const response = await fetch(apiUrl, { headers });
        return handleResponse<LevelSummaryResponse>(response);
      } catch (fetchError) {
        console.error("Network error fetching from API:", fetchError);
        throw new Error(
          `Network error with API: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        );
      }
    } catch (error) {
      console.error(`Error in getLevelSummary for level ${levelId}:`, error);
      throw error;
    }
  },

  // Sensors
  getSensorData: async (sensorId: string): Promise<SensorResponse> => {
    // Otherwise, use the actual API
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/sensors/${sensorId}`,
      {
        headers: await getHeaders(),
      },
    );

    return handleResponse<SensorResponse>(response);
  },

  // Grafana
  getGrafanaUrl: async (dashboardUrl: string): Promise<string> => {
    return dashboardUrl;
  },

  // Create new sensor
  createSensor: async (sensorData: {
    node_id: string;
    type: string;
    sub_type?: string;
    section_name: string;
    unit_id: string;
    location_index?: string;
    vehicle_no?: string;
    unit_sub_id?: string;
    department?: string;
    warning_threshold: number;
    critical_threshold: number;
  }): Promise<{status: string; message: string; data: Record<string, unknown>}> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/sensors`;
      console.log(`Creating new sensor at API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(sensorData),
      });
      
      return handleResponse<{status: string; message: string; data: Record<string, unknown>}>(response);
    } catch (error) {
      console.error("Error in createSensor:", error);
      throw error;
    }
  },

  // Get a single sensor by ID
  getSensor: async (sensorId: string): Promise<{
    sensor_id: string;
    node_id: string;
    unit_id: string;
    unit_sub_id?: string;
    widget_url?: string;
    section_name: string;
    location_index?: string;
    vehicle_no?: string;
    department?: string;
    service_name?: string;
    service_type?: string;
    value?: string;
    warning_threshold: string | number;
    critical_threshold: string | number;
    logged_time?: string;
    last_updated?: string;
    sensor_type?: string;
    configuration_file?: string;
    qube_device_id?: string;
  }> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/sensors/${sensorId}`;
      console.log(`Fetching sensor data from API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, { headers });
      
      const data = await handleResponse<{
        status: string;
        message: string;
        data: {
          sensor_id: string;
          node_id: string;
          unit_id: string;
          unit_sub_id?: string;
          widget_url?: string;
          section_name: string;
          location_index?: string;
          vehicle_no?: string;
          department?: string;
          service_name?: string;
          service_type?: string;
          value?: string;
          warning_threshold: string | number;
          critical_threshold: string | number;
          logged_time?: string;
          last_updated?: string;
          sensor_type?: string;
          configuration_file?: string;
          qube_device_id?: string;
        };
      }>(response);
      
      return data.data;
    } catch (error) {
      console.error(`Error in getSensor for sensor ${sensorId}:`, error);
      throw error;
    }
  },

  // Update an existing sensor
  updateSensor: async (
    sensorId: string, 
    sensorData: {
      node_id: string;
      type?: string;
      sub_type?: string;
      section_name: string;
      unit_id: string;
      location_index?: string;
      vehicle_no?: string;
      unit_sub_id?: string;
      department?: string;
      warning_threshold: number;
      critical_threshold: number;
    }
  ): Promise<{status: string; message: string; data: Record<string, unknown>}> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/sensors/${sensorId}`;
      console.log(`Updating sensor at API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(sensorData),
      });
      
      return handleResponse<{status: string; message: string; data: Record<string, unknown>}>(response);
    } catch (error) {
      console.error("Error in updateSensor:", error);
      throw error;
    }
  },

  // Delete a sensor
  deleteSensor: async (sensorId: string): Promise<{status: string; message: string; data: {id: string}}> => {
    try {
      if (!env.NEXT_PUBLIC_API_URL) {
        console.error("API URL is not defined. Please check your environment variables.");
        throw new Error("API URL is not defined");
      }

      const apiUrl = `${env.NEXT_PUBLIC_API_URL}/sensors/${sensorId}`;
      console.log(`Deleting sensor at API: ${apiUrl}`);

      const headers = await getHeaders();
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers,
      });
      
      return handleResponse<{status: string; message: string; data: {id: string}}>(response);
    } catch (error) {
      console.error("Error in deleteSensor:", error);
      throw error;
    }
  },
};
