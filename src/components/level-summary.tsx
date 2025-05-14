"use client";

import * as React from "react";
import Link from "next/link";
import { type Level, findParentLevel } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TriangleAlert, AlertCircle, Thermometer } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { type LevelSummary as LevelSummaryType } from "~/hooks/use-levels";

interface LevelSummaryProps {
  level: Level;
  summaryData?: LevelSummaryType;
}

type SensorParentMap = Record<string, string>;

function getAllSensorChildren(level: Level): Level[] {
  const sensors: Level[] = [];
  for (const child of level.children) {
    if (child.has_sensor && child.sensor_data) {
      sensors.push(child);
    }
    sensors.push(...getAllSensorChildren(child));
  }
  return sensors;
}

// Helper function to determine if a warning is critical (just for demo)
function isCriticalWarning(sensorValue: number): boolean {
  return sensorValue >= 25; // Example threshold
}

export function LevelSummary({ level, summaryData }: LevelSummaryProps) {
  const [sensorParents, setSensorParents] = useState<SensorParentMap>({});
  const router = useRouter();

  // Load parent information for all sensors if not using summary data
  useEffect(() => {
    // Skip if we have summary data
    if (summaryData) return;

    const sensorChildren = getAllSensorChildren(level).filter((sensor) =>
      sensor.sensor_data?.some((s) => s.warning),
    );

    if (sensorChildren.length > 0) {
      // Fetch levels data for navigation
      fetch("/api/levels")
        .then((response) => response.json())
        .then((data) => {
          // Type assertion for the data object
          const typedData = data as { levels: Level[] };

          if (
            data &&
            typeof data === "object" &&
            "levels" in data &&
            Array.isArray(typedData.levels)
          ) {
            const parents: SensorParentMap = {};

            sensorChildren.forEach((sensor) => {
              // Find parent for each sensor
              const parent = findParentLevel(typedData.levels, sensor.id);
              if (parent) {
                parents[sensor.id] = parent.id;
              }
            });

            setSensorParents(parents);
          }
        })
        .catch((error) => {
          console.error("Error fetching parent data:", error);
        });
    }
  }, [level, summaryData]);

  // Show children summary if no sensor data in current level
  const sensorsWithChildren = level.children
    .map((child) => ({
      ...child,
      summaryInfo: child.level_summary ?? {
        active: 0,
        inactive: 0,
        normal: 0,
        warnings: 0,
        critical: 0,
      },
    }))
    .filter((child) => {
      const total = child.summaryInfo.active + child.summaryInfo.inactive;
      return total > 0;
    })
    .sort(
      (a, b) =>
        b.summaryInfo.warnings +
        b.summaryInfo.critical -
        (a.summaryInfo.warnings + a.summaryInfo.critical),
    );

  // Get all sensor children with warnings and sort by severity
  const sensorChildren = getAllSensorChildren(level)
    .filter((sensor) => {
      const hasSensorWarnings =
        sensor.sensor_data?.some((s) => s.warning) ?? false;
      const hasLevelWarnings =
        (sensor.level_summary?.warnings ?? 0) > 0 ||
        (sensor.level_summary?.critical ?? 0) > 0;
      return hasSensorWarnings || hasLevelWarnings;
    })
    .sort((a, b) => {
      // Get max temperature for each sensor or use summary data
      const aSeverityValue = a.level_summary?.critical ?? 0;
      const bSeverityValue = b.level_summary?.critical ?? 0;

      // Sort by severity in descending order
      return bSeverityValue - aSeverityValue;
    });

  const hasChildrenSensors =
    sensorsWithChildren.length > 0 ||
    (summaryData?.levels && summaryData.levels.length > 0);
  const hasWarningSensors =
    sensorChildren.length > 0 ||
    (summaryData?.alerts && summaryData.alerts.length > 0);

  // Get widget URL, preferring summary data if available
  const widgetUrl = undefined;

  // Navigate to sensor's parent page with sensor ID as query param
  const handleSensorClick = (e: React.MouseEvent, sensorId: string) => {
    e.preventDefault();

    if (sensorParents[sensorId]) {
      // If we have the parent, navigate directly
      router.push(`/levels?pid=${sensorParents[sensorId]}&cid=${sensorId}`);
    } else {
      // Default fallback to current page
      router.push(`/levels?pid=${level.id}&cid=${sensorId}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Render widget URL if available */}
      {widgetUrl && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{level.name} Sensor Data</CardTitle>
          </CardHeader>
          <CardContent
            className="space-y-4 pt-0"
            style={{
              backgroundColor: "rgb(17, 18, 23)",
              borderRadius: "0 0 0.75rem 0.75rem",
            }}
          >
            <iframe
              id="iframe"
              src={widgetUrl}
              className="h-[600px] w-full"
              frameBorder="0"
              onError={(e) => {
                console.error("Iframe loading error:", e);
                // In case of error, set a fallback display
                const iframe = e.currentTarget as HTMLIFrameElement;
                iframe.srcdoc = `<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#999;">
                  <p>Unable to load Grafana widget. Please try again later.</p>
                </div>`;
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Render child sensor summary using summary data if available */}
      {hasChildrenSensors && (
        <Card>
          <CardHeader>
            <CardTitle>{level.name} Sensor Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Normal</TableHead>
                  <TableHead className="text-right">Warnings</TableHead>
                  <TableHead className="text-right">Critical</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData?.levels
                  ? // Use the summary data from API
                    summaryData.levels.map((childSummary) => (
                      <TableRow
                        key={childSummary.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${childSummary.id}`}
                            className="block w-full"
                          >
                            {childSummary.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${childSummary.id}`}
                            className="block w-full"
                          >
                            {childSummary.active}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${childSummary.id}`}
                            className="block w-full"
                          >
                            {childSummary.normal}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${childSummary.id}`}
                            className="flex w-full items-center justify-end gap-1.5"
                          >
                            {childSummary.warnings > 0 ? (
                              <>
                                <span className="text-warning font-medium">
                                  {childSummary.warnings}
                                </span>
                                <TriangleAlert className="text-warning h-4 w-4" />
                              </>
                            ) : (
                              "-"
                            )}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${childSummary.id}`}
                            className="flex w-full items-center justify-end gap-1.5"
                          >
                            {childSummary.critical > 0 ? (
                              <>
                                <span className="font-medium text-destructive">
                                  {childSummary.critical}
                                </span>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              </>
                            ) : (
                              "-"
                            )}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  : // Fall back to the old method
                    sensorsWithChildren.map((child) => (
                      <TableRow
                        key={child.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${child.id}`}
                            className="block w-full"
                          >
                            {child.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right" colSpan={3}>
                          <Link
                            href={`/levels?pid=${level.id}&cid=${child.id}`}
                            className="block w-full"
                          >
                            {child.summaryInfo.active +
                              child.summaryInfo.inactive}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/levels?pid=${level.id}&cid=${child.id}`}
                            className="flex w-full items-center justify-end gap-1.5"
                          >
                            {child.summaryInfo.warnings > 0 ? (
                              <>
                                <span className="font-medium text-destructive">
                                  {child.summaryInfo.warnings}
                                </span>
                                <TriangleAlert className="h-4 w-4 text-destructive" />
                              </>
                            ) : (
                              "-"
                            )}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Render readings from sensor children with warnings */}
      {hasWarningSensors && (
        <Card>
          <CardHeader>
            <CardTitle>Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Location</TableHead>
                    <TableHead className="w-[80px] text-center">
                      Status
                    </TableHead>
                    <TableHead className="w-[120px] text-right">
                      Temperature
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData?.alerts
                    ? // Use alerts from summary data
                      summaryData.alerts.flatMap((alert) =>
                        alert.sensors.map((sensor, idx) => {
                          const isCritical = sensor.severity === "critical";
                          const isWarning = sensor.severity === "warning";

                          return (
                            <TableRow
                              key={`${alert.level_id}-${idx}`}
                              // className="cursor-pointer hover:bg-muted/50"
                              // onClick={(e) =>
                              //   handleSensorClick(e, alert.level_id)
                              // }
                            >
                              <TableCell className="w-[200px]">
                                <div className="flex w-full items-center gap-2">
                                  <span className="truncate font-medium">
                                    {alert.level_name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="w-[80px] text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center">
                                      {isCritical ? (
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                      ) : isWarning ? (
                                        <TriangleAlert className="text-warning h-5 w-5" />
                                      ) : null}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      {isCritical ? "Critical" : "Warning"}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                              <TableCell className="w-[120px] text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Thermometer className="h-4 w-4 opacity-70" />
                                  <span
                                    className={
                                      isCritical
                                        ? "font-semibold text-destructive"
                                        : isWarning
                                          ? "text-warning font-semibold"
                                          : ""
                                    }
                                  >
                                    {sensor.value}°C
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }),
                      )
                    : // Fall back to the old method
                      sensorChildren.map((sensor) => {
                        const maxTemp =
                          Array.isArray(sensor.sensor_data) &&
                          sensor.sensor_data.length > 0
                            ? typeof sensor.sensor_data[0]?.sensor_value ===
                              "number"
                              ? sensor.sensor_data[0].sensor_value
                              : typeof sensor.sensor_data[0]?.sensor_value ===
                                  "string"
                                ? parseFloat(
                                    sensor.sensor_data[0].sensor_value,
                                  ) || 0
                                : 0
                            : 0;
                        const isCritical = sensor.level_summary?.critical
                          ? sensor.level_summary.critical > 0
                          : isCriticalWarning(maxTemp);

                        return (
                          <TableRow
                            key={sensor.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={(e) => handleSensorClick(e, sensor.id)}
                          >
                            <TableCell className="w-[200px]">
                              <div className="flex w-full items-center gap-2">
                                <span className="truncate font-medium">
                                  {sensor.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="w-[80px] text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center">
                                    {isCritical ? (
                                      <AlertCircle className="h-5 w-5 text-destructive" />
                                    ) : (
                                      <TriangleAlert className="text-warning h-5 w-5" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    {isCritical ? "Critical" : "Warning"}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="w-[120px] text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Thermometer className="h-4 w-4 opacity-70" />
                                <span
                                  className={
                                    isCritical
                                      ? "font-semibold text-destructive"
                                      : "text-warning font-semibold"
                                  }
                                >
                                  {maxTemp.toFixed(1)}°C
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
