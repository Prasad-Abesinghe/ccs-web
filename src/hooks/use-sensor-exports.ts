"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  type SensorReportResponse, 
  type SensorReportFilterParams,
  type GenerateReportResponse
} from "~/types/sensors";

export interface ExportJob {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  filename: string;
  downloaded: boolean;
  downloadUrl: string;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
}

export function useSensorExports(filters: SensorReportFilterParams = {}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch sensor reports based on filters
  const {
    data = { data: [], pagination: { nextCursor: null, hasNextPage: false } },
    isLoading: isLoadingReports,
    isError,
    error,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['sensorReports', filters],
    queryFn: async (): Promise<SensorReportResponse> => {
      if (!session?.accessToken) {
        return { data: [], pagination: { nextCursor: null, hasNextPage: false } };
      }

      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.value !== undefined) params.append('value', filters.value.toString());
        if (filters.operator) params.append('operator', filters.operator);
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.aggregation) params.append('aggregation', filters.aggregation);
        if (filters.location) params.append('location', filters.location);
        if (filters.cursor) params.append('cursor', filters.cursor);

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sensors/filter?${params.toString()}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sensor reports: ${response.status}`);
        }

        return await response.json() as SensorReportResponse;
      } catch (error) {
        console.error("Error fetching sensor reports:", error);
        throw error;
      }
    },
    enabled: !!session?.accessToken,
  });

  // Fetch active jobs for current user
  const {
    data: activeJobs = [],
    isLoading: isLoadingJobs,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["exportJobs"],
    queryFn: async (): Promise<ExportJob[]> => {
      if (!session?.accessToken || !session?.user?.id) {
        return [];
      }

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sensors/export/user/${session.user.id}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch export jobs: ${response.status}`);
        }

        return await response.json() as ExportJob[];
      } catch (error) {
        console.error("Error fetching export jobs:", error);
        throw error;
      }
    },
    enabled: !!session?.accessToken && !!session?.user?.id,
  });

  // Generate a new export report
  const generateReport = async (userIdentifier: string): Promise<GenerateReportResponse> => {
    if (!session?.accessToken) {
      toast.error("You must be logged in to generate reports");
      throw new Error("Not authenticated");
    }

    try {
      let userId = userIdentifier;
      
      // Determine if the identifier is an email and fetch user ID if needed
      if (userIdentifier.includes('@')) {
        try {
          // We need to fetch the user ID for this email
          const response = await fetch(`/api/users/email/${encodeURIComponent(userIdentifier)}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch user ID for email: ${response.status}`);
          }
          
          // Define the expected response type
          interface UserResponse {
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
            };
          }
          
          const userData = await response.json() as UserResponse;
          
          if (!userData?.data?.id) {
            throw new Error("User ID not found for this email");
          }
          
          userId = userData.data.id;
          console.log(`Resolved email ${userIdentifier} to user ID: ${userId}`);
        } catch (error) {
          console.error("Error fetching user ID from email:", error);
          throw new Error("Could not determine user ID from email");
        }
      }
      
      const payload = {
        ...filters,
        userId,
      };

      // Log the payload for debugging
      console.log("Export report payload:", payload);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sensors/export`;
      
      toast.loading("Your report is being generated. This may take a moment...");

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to generate report: ${response.status}`);
      }

      const data = await response.json() as GenerateReportResponse;
      
      // Invalidate the jobs cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["exportJobs"] });
      
      // We don't need this toast anymore as we'll use the job ID specific toast
      // toast.success("Report has been generated and will be sent to your email");

      return data;
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate report");
      throw error;
    }
  };

  // Check status of a specific job
  const checkJobStatus = async (jobId: string): Promise<ExportJob> => {
    if (!session?.accessToken) {
      throw new Error("Not authenticated");
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/sensors/export/job/${jobId}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.status}`);
      }

      return await response.json() as ExportJob;
    } catch (error) {
      console.error("Error checking job status:", error);
      throw error;
    }
  };

  // Download a completed report
  const downloadReport = useMutation({
    mutationFn: async (jobId: string): Promise<void> => {
      if (!session?.accessToken) {
        throw new Error("Not authenticated");
      }

      try {
        // First get the job details to get creation time
        const jobDetails = await checkJobStatus(jobId);
        
        // The actual URL without the /backend prefix since it's in the base URL
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/sensors/export/download/${jobId}`;
        
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download report: ${response.status}`);
        }

        // Create a blob from the response
        const blob = await response.blob();
        
        // Format date for filename
        const creationDate = new Date(jobDetails.createdAt);
        const formattedDate = `${creationDate.getFullYear()}-${String(creationDate.getMonth() + 1).padStart(2, '0')}-${String(creationDate.getDate()).padStart(2, '0')}`;
        const formattedTime = `${String(creationDate.getHours()).padStart(2, '0')}-${String(creationDate.getMinutes()).padStart(2, '0')}`;
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `sensor_report_${formattedDate}_${formattedTime}.csv`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Mark the job as downloaded
        await queryClient.invalidateQueries({ queryKey: ["exportJobs"] });
      } catch (error) {
        console.error("Error downloading report:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Report downloaded successfully");
    },
    onError: (error) => {
      toast.error(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  return {
    // Sensor reports data
    reports: data.data,
    pagination: data.pagination,
    isLoadingReports,
    isError,
    error,
    refetchReports,
    
    // Export jobs data
    activeJobs,
    isLoadingJobs,
    refetchJobs,
    
    // Actions
    generateReport,
    checkJobStatus,
    downloadReport,
  };
} 
