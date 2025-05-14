"use client";

import { BreadcrumbList, BreadcrumbPage } from "~/components/ui/breadcrumb";
import { BreadcrumbItem } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Download, Filter, X, CircleCheck, TriangleAlert, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import Loading from "./loading";
import { type SensorReportFilterParams } from "~/types/sensors";
import { format, subDays } from "date-fns";
import { useSession } from "next-auth/react";
import { toast as uiToast } from "~/components/ui/use-toast";
import { toast } from "sonner";
import { useSensorExports, type ExportJob } from "~/hooks/use-sensor-exports";

export default function ReportsPage() {
  const { data: session } = useSession();
  const { hasPermission, isLoadingUser } = usePermissions();
  const canViewReports = hasPermission("REPORT_VIEW");
  const canCreateReports = hasPermission("REPORT_CREATE");
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SensorReportFilterParams>({
    limit: 50,
  });
  
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeJobPolling, setActiveJobPolling] = useState<Record<string, NodeJS.Timeout>>({});
  
  // Filter form state
  const [formFilters, setFormFilters] = useState<{
    location: string;
    value: string;
    operator: "greater" | "less" | "equal" | "";
    fromDate: string;
    toDate: string;
    aggregation: "max" | "min" | "avg" | "";
    limit: string;
  }>({
    location: "",
    value: "",
    operator: "",
    fromDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    toDate: format(new Date(), "yyyy-MM-dd"),
    aggregation: "",
    limit: "50",
  });

  // Use the combined hook
  const { 
    // Report data
    reports, 
    pagination, 
    isLoadingReports, 
    isError,
    refetchReports,
    
    // Export jobs
    activeJobs,
    refetchJobs,
    
    // Actions
    generateReport,
    checkJobStatus,
    downloadReport,
  } = useSensorExports(filters);

  // Store functions in refs to avoid circular dependencies
  const activeJobPollingRef = useRef(activeJobPolling);
  activeJobPollingRef.current = activeJobPolling;

  // Handle downloading a specific report
  const handleDownloadReport = useCallback((jobId: string) => {
    downloadReport.mutate(jobId);
  }, [downloadReport]);

  // Show toast for completed jobs with download button
  const showCompletedJobToast = useCallback((job: ExportJob) => {
    // Format the creation date
    const creationTime = new Date(job.createdAt).toLocaleString();
    
    toast.success(`Report from ${creationTime} ready for download`, {
      id: job.id,
      duration: 1000*60*10, // 10 minutes
      action: {
        label: "Download",
        onClick: () => handleDownloadReport(job.id),
      },
    });
  }, [handleDownloadReport]);

  // Poll for job status
  const startJobPolling = useCallback((job: ExportJob) => {
    // Format the creation time for the toast
    const creationTime = new Date(job.createdAt).toLocaleString();
    
    // Show initial toast for the job
    toast.loading(`Generating report from ${creationTime}...`, {
      id: job.id,
      description: "This may take a few moments",
      duration: Infinity,
    });

    // Set up polling every 5 seconds
    const intervalId = setInterval(() => {
      void checkJobStatus(job.id).then(updatedJob => {
        // Update toast based on new status
        if (updatedJob.status === 'completed') {
          showCompletedJobToast(updatedJob);
          // Clear the interval when job is done
          if (activeJobPollingRef.current[job.id]) {
            clearInterval(activeJobPollingRef.current[job.id]);
            setActiveJobPolling(prev => {
              const newPolling = { ...prev };
              delete newPolling[job.id];
              return newPolling;
            });
          }
        } else if (updatedJob.status === 'failed') {
          toast.error(`Report generation failed`, {
            id: job.id,
            description: updatedJob.error ?? "Unknown error occurred",
          });
          // Clear the interval when job is done (even if failed)
          if (activeJobPollingRef.current[job.id]) {
            clearInterval(activeJobPollingRef.current[job.id]);
            setActiveJobPolling(prev => {
              const newPolling = { ...prev };
              delete newPolling[job.id];
              return newPolling;
            });
          }
        }
      }).catch(error => {
        console.error(`Error polling job ${job.id}:`, error);
      });
    }, 5000);

    // Store the interval ID for cleanup
    setActiveJobPolling(prev => ({
      ...prev,
      [job.id]: intervalId
    }));
  }, [checkJobStatus, showCompletedJobToast]);
  
  // Start polling for active jobs when the component loads
  useEffect(() => {
    if (activeJobs && activeJobs.length > 0) {
      // For each job that isn't completed, show a toast and poll for updates
      activeJobs.forEach(job => {
        if (job.status !== 'completed' && job.status !== 'failed') {
          // If we're not already polling for this job, start polling
          if (!activeJobPolling[job.id]) {
            startJobPolling(job);
          }
        } else if (job.status === 'completed' && !job.downloaded) {
          // For completed jobs that haven't been downloaded, show a toast with download option
          showCompletedJobToast(job);
        }
      });
    }
    
    // Clean up all polling intervals on unmount
    return () => {
      Object.values(activeJobPolling).forEach(intervalId => clearInterval(intervalId));
    };
  }, [activeJobs, activeJobPolling, startJobPolling, showCompletedJobToast]);

  // Check for active jobs when component loads
  useEffect(() => {
    if (session?.user && 'id' in (session.user ?? {})) {
      void refetchJobs().catch(err => {
        console.error("Failed to fetch active jobs:", err);
      });
    }
  }, [session?.user, refetchJobs]);
  
  const handleApplyFilters = () => {
    const newFilters: SensorReportFilterParams = {
      limit: parseInt(formFilters.limit) || 50,
    };
    
    if (formFilters.location) newFilters.location = formFilters.location;
    if (formFilters.value) newFilters.value = parseFloat(formFilters.value);
    if (formFilters.operator) newFilters.operator = formFilters.operator;
    if (formFilters.fromDate) newFilters.fromDate = formFilters.fromDate;
    if (formFilters.toDate) newFilters.toDate = formFilters.toDate;
    if (formFilters.aggregation) newFilters.aggregation = formFilters.aggregation;
    
    setFilters(newFilters);
  };
  
  const loadMore = () => {
    if (pagination.hasNextPage && pagination.nextCursor) {
      setFilters(prev => ({
        ...prev,
        cursor: pagination.nextCursor ?? undefined,
      }));
    }
  };
  
  const handleGenerateNewReport = async () => {
    console.log("Session object:", session);
    
    if (!session) {
      uiToast({
        title: "Error",
        description: "User not logged in. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGeneratingReport(true);
      
      // Try to get user ID from session first
      if (session.user && 'id' in session.user) {
        const userId = session.user.id!;
        console.log("Using user ID from session:", userId);
        const result = await generateReport(userId);
        if (result.jobId) {
          // Format creation time for the toast
          const creationTime = new Date().toLocaleString();
          
          // Show toast with initial job status
          toast.loading(`Generating report from ${creationTime}...`, {
            id: result.jobId,
            description: "This may take a few moments",
            duration: Infinity,
          });
          
          // Fetch updated job list
          await refetchJobs();
          
          // Set up polling for this job
          const newJob: ExportJob = {
            id: result.jobId,
            userId: userId,
            status: "pending",
            filename: "",
            downloaded: false,
            downloadUrl: "",
            createdAt: new Date().toISOString(),
            completedAt: null,
            error: null
          };
          
          startJobPolling(newJob);
        }
        return;
      }
      
      // Next, try to get oid from the token as fallback
      if (session.accessToken) {
        try {
          const tokenParts = session.accessToken.split('.');
          if (tokenParts.length === 3) {
            const payloadPart = tokenParts[1];
            if (payloadPart) {
              const decodedPayload = atob(payloadPart);
              const payload = JSON.parse(decodedPayload) as { oid?: string };
              
              if (payload.oid) {
                console.log("Using oid from token:", payload.oid);
                await generateReport(payload.oid);
                return;
              }
            }
          }
        } catch (error) {
          console.error("Failed to parse token:", error);
        }
      }
      
      // Finally, try with email
      if (session.user?.email) {
        console.log("Using email as identifier:", session.user.email);
        await generateReport(session.user.email);
        return;
      }
      
      // If we get here, we couldn't find any identifier
      throw new Error("Could not determine user identifier");
      
    } catch (error) {
      console.error("Error generating report:", error);
      uiToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Show loading state while permissions are being checked
  if (isLoadingUser) {
    return <Loading />;
  }

  // Render unauthorized component if user doesn't have permission
  if (!canViewReports) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Unauthorized />
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Sensor Reports</h1>
            <p className="text-muted-foreground">
              Monitor and analyze sensor data across your organization
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            {canCreateReports && (
              <Button 
                onClick={handleGenerateNewReport}
                disabled={isGeneratingReport || !reports.length}
              >
                {isGeneratingReport ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Filter by location"
                  value={formFilters.location}
                  onChange={(e) => setFormFilters({ ...formFilters, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                <div className="flex gap-2">
                  <Select
                    value={formFilters.operator}
                    onValueChange={(value: "greater" | "less" | "equal" | "") => 
                      setFormFilters({ ...formFilters, operator: value })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater">Greater than</SelectItem>
                      <SelectItem value="less">Less than</SelectItem>
                      <SelectItem value="equal">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Value"
                    value={formFilters.value}
                    onChange={(e) => setFormFilters({ ...formFilters, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Limit</label>
                <Input
                  type="number"
                  placeholder="Results limit"
                  value={formFilters.limit}
                  onChange={(e) => setFormFilters({ ...formFilters, limit: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Aggregation</label>
                <Select
                  value={formFilters.aggregation}
                  onValueChange={(value: "max" | "min" | "avg" | "") => 
                    setFormFilters({ ...formFilters, aggregation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aggregation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="avg">Average</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formFilters.fromDate}
                    onChange={(e) => setFormFilters({ ...formFilters, fromDate: e.target.value })}
                  />
                  <Input
                    type="date"
                    value={formFilters.toDate}
                    onChange={(e) => setFormFilters({ ...formFilters, toDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleApplyFilters}
                disabled={isLoadingReports}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {isLoadingReports && reports.length === 0 ? (
          <Loading />
        ) : isError ? (
          <div className="py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load sensor data</h3>
            <p className="text-muted-foreground mb-4">There was an error fetching the sensor reports.</p>
            <Button onClick={() => refetchReports()}>Try Again</Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">No sensor data found with the current filters.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report, index) => (
                    <TableRow key={`${report.sensor_id}-${report.last_updated}-${index}`}>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>{report.value?.toFixed(2)}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{new Date(report.last_updated).toLocaleString()}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5">
                                {report.status === "normal" ? (
                                  <>
                                    <CircleCheck className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-500 font-medium">Normal</span>
                                  </>
                                ) : report.status === "warning" ? (
                                  <>
                                    <TriangleAlert className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm text-amber-500 font-medium">Warning</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                    <span className="text-sm text-destructive font-medium">Critical</span>
                                  </>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {report.status === "normal" 
                                  ? "Sensor is operating normally" 
                                  : report.status === "warning"
                                  ? "Sensor has detected values outside normal range"
                                  : "Sensor has detected critical values requiring immediate attention"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination.hasNextPage && (
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoadingReports}
                >
                  Load More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarInset>
  );
} 
