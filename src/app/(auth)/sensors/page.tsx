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
import { Edit, Loader2, Plus, RefreshCcw, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import Loading from "./loading";
import { useSensors, type Sensor } from "~/hooks/use-sensors";

export default function SensorsPage() {
  const router = useRouter();
  const { hasPermission, isLoadingUser } = usePermissions();

  // Check permissions
  const canViewSensors = hasPermission("VIEW_SENSOR_DATA");
  const canCreateSensor = hasPermission("SENSOR_CREATE");
  const canUpdateSensor = hasPermission("SENSOR_UPDATE");

  // Fetch sensors
  const { sensors, isLoading: isLoadingSensors, refetch } = useSensors();

  const handleEdit = (sensor: Sensor) => {
    router.push(`/sensors/${sensor.id}`);
  };

  // Wait for permissions to load
  if (isLoadingUser) {
    return <Loading />;
  }

  // Render unauthorized component if user doesn't have permission
  if (!canViewSensors) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Sensors</BreadcrumbPage>
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
                <BreadcrumbPage>Sensors</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Sensors</h1>
            <p className="text-muted-foreground">
              Sensor data from all sensors in the organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4" />
            </Button>

            {canCreateSensor && (
              <Link href="/sensors/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Sensor
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isLoadingSensors ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p>Loading sensors...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Node</TableHead>
                  <TableHead>Thresholds</TableHead>
                  <TableHead>Status</TableHead>
                  {canUpdateSensor && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canUpdateSensor ? 7 : 6}
                      className="py-4 text-center"
                    >
                      No sensors found
                    </TableCell>
                  </TableRow>
                ) : (
                  sensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell className="font-mono text-xs">{sensor.id}</TableCell>
                      <TableCell>{sensor.sensor_type ?? '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{sensor.node}</TableCell>
                      <TableCell>
                        <div>
                          <span className="text-yellow-500">W: {sensor.thresholds.warning}</span>
                          {' / '}
                          <span className="text-red-500">C: {sensor.thresholds.critical}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {sensor.status === "Active" ? (
                            <>
                              <Wifi className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-red-500">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      {canUpdateSensor && (
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(sensor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Sensor</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}
