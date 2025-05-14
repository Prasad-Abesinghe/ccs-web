"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LevelCard } from "~/components/level-card";
import { LevelSummary } from "~/components/level-summary";
import { type Level, findLevelById, type SensorData } from "~/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { ResizableHandle } from "~/components/ui/resizable";
import { ResizablePanel } from "~/components/ui/resizable";
import { ResizablePanelGroup } from "~/components/ui/resizable";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import Loading, { SummarySkeleton } from "./loading";
import { useLevels, useLevelSummary, useDeleteLevel } from "~/hooks/use-levels";
import { SensorCard } from "~/components/sensor-card";
import { SensorSummary } from "~/components/sensor-summary";
import { Button } from "~/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "~/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export function LevelsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("pid");
  const childId = searchParams.get("cid");
  const sensorId = searchParams.get("sid");

  // Add state for level to delete and delete hook
  const [levelToDelete, setLevelToDelete] = useState<string | null>(null);
  const { deleteLevel, isPending: isDeleting } = useDeleteLevel();

  const { hasPermission, isLoadingUser } = usePermissions();
  const canViewLevels = hasPermission("NODE_VIEW");
  const canCreateLevels = hasPermission("NODE_CREATE");
  const canEditLevels = hasPermission("NODE_UPDATE");
  const canDeleteLevels = hasPermission("NODE_DELETE");

  // Get levels data using React Query hook
  const { levels = [], isLoading: isLoadingLevels, refetch: refetchLevels } = useLevels();

  // Find the parent level by ID or default to first level
  const findParentLevel = (): Level | null => {
    if (parentId) {
      const found = findLevelById(levels, parentId);
      return found;
    }
    return levels.length > 0 ? (levels[0] ?? null) : null;
  };

  // Find the child level by ID if a parent is selected
  const findChildLevel = (parent: Level | null): Level | null => {
    if (!parent) return null;
    if (childId) {
      const found = findLevelById([parent], childId);
      return found;
    }
    return null;
  };

  // Initialize with proper nullability checks
  const initialParentLevel = findParentLevel();
  const initialChildLevel = findChildLevel(initialParentLevel);

  // Define all state and hooks at the top level
  const [parentLevel, setParentLevel] = useState<Level | null>(
    initialParentLevel,
  );
  const [childLevel, setChildLevel] = useState<Level | null>(initialChildLevel);
  const [summaryLevel, setSummaryLevel] = useState<Level | null>(
    childLevel ?? parentLevel,
  );
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  // Fetch level summary for the selected level
  const summaryId = summaryLevel?.id ?? "";
  const { summary, isLoading: isLoadingSummary } = useLevelSummary(summaryId);

  // Build breadcrumb path based on current selections
  const getBreadcrumbPath = () => {
    const breadcrumbs: Level[] = [];

    // Find the current context - either we're looking at a top-level item or a nested level
    const isTopLevelContext = levels.some(
      (level) => level.id === parentLevel?.id,
    );

    if (isTopLevelContext) {
      // We're at the top level of the hierarchy
      if (parentLevel) {
        breadcrumbs.push(parentLevel);
        if (childLevel) {
          breadcrumbs.push(childLevel);
        }
      }
    } else {
      // We're at a nested level, so find the parent chain
      if (parentLevel) {
        // First, find if there's a top-level parent
        const topParent = levels.find((level) => {
          return findLevelById([level], parentLevel.id) !== null;
        });

        if (topParent) {
          breadcrumbs.push(topParent);
        }

        breadcrumbs.push(parentLevel);

        if (childLevel) {
          breadcrumbs.push(childLevel);
        }
      }
    }

    return breadcrumbs;
  };

  // Update URL when selections change
  const updateUrl = (
    newParentId?: string,
    newChildId?: string,
    newSensorId?: string,
  ) => {
    const params = new URLSearchParams();

    if (newParentId) {
      params.set("pid", newParentId);
    }

    if (newChildId) {
      params.set("cid", newChildId);
    }

    if (newSensorId) {
      params.set("sid", newSensorId);
    }

    const queryString = params.toString();
    const url = queryString ? `/levels?${queryString}` : "/levels";
    router.push(url);
  };

  // Handle parent level selection
  const handleParentSelect = (level: Level) => {
    setParentLevel(level);
    setChildLevel(null); // Reset child selection
    setSelectedSensor(null); // Reset sensor selection
    setSummaryLevel(level);
    updateUrl(level.id);
  };

  // Handle child level selection
  const handleChildSelect = (level: Level) => {
    setChildLevel(level);
    setSelectedSensor(null); // Reset sensor selection
    setSummaryLevel(level);
    updateUrl(parentLevel?.id, level.id);
  };

  // Handle sensor selection
  const handleSensorSelect = (sensor: SensorData) => {
    setSelectedSensor(sensor);
    updateUrl(parentLevel?.id, childLevel?.id, sensor.sensor_id);
  };

  // Handle "View More" navigation for second panel level cards
  const handleViewMore = (level: Level) => {
    // Move the clicked level to become the new parent level
    // Its children will become the new child level options
    setParentLevel(level);
    setChildLevel(null);
    setSelectedSensor(null);
    setSummaryLevel(level);

    // Update URL and force a re-render of the panel hierarchy
    updateUrl(level.id);

    // Force getFirstPanelLevels to re-evaluate with the new parent
    setTimeout(() => {
      // This helps React recognize the state has changed
      setParentLevel((prevState) => {
        if (prevState) {
          return { ...prevState };
        }
        return prevState;
      });
    }, 10);
  };

  // Handle "View Sensors" button click
  const handleViewSensors = (level: Level) => {
    // Select the level with sensors in the first panel
    setParentLevel(level);
    setChildLevel(null);
    setSelectedSensor(null);
    setSummaryLevel(level);

    // Update URL
    updateUrl(level.id);
  };

  // Find selected sensor data
  useEffect(() => {
    if (sensorId && (parentLevel?.sensor_data ?? childLevel?.sensor_data)) {
      const sensorData = childLevel?.sensor_data ?? parentLevel?.sensor_data;
      if (sensorData) {
        const foundSensor = sensorData.find((s) => s.sensor_id === sensorId);
        if (foundSensor) {
          setSelectedSensor(foundSensor);
        }
      }
    }
  }, [sensorId, parentLevel, childLevel]);

  // Initialize useEffect hooks here, before any conditional returns
  // Update selected levels when URL params change
  useEffect(() => {
    const newParentLevel = findParentLevel();

    if (newParentLevel?.id !== parentLevel?.id) {
      setParentLevel(newParentLevel);

      // If parent changed, reset child selection
      if (childId) {
        const newChildLevel = findChildLevel(newParentLevel);
        setChildLevel(newChildLevel);
        setSummaryLevel(newChildLevel ?? newParentLevel);
      } else {
        setChildLevel(null);
        setSummaryLevel(newParentLevel);
      }

      // Reset sensor selection
      setSelectedSensor(null);

      // Force a re-evaluation of the panel hierarchy
      setTimeout(() => {
        // This helps React recognize the state has changed
        setParentLevel((prevState) => {
          if (prevState) {
            return { ...prevState };
          }
          return prevState;
        });
      }, 10);
    } else if (childId && parentLevel) {
      // Only update child if parent is the same
      const newChildLevel = findChildLevel(parentLevel);

      if (newChildLevel?.id !== childLevel?.id) {
        setChildLevel(newChildLevel);
        setSummaryLevel(newChildLevel ?? parentLevel);
        setSelectedSensor(null);
      }
    } else if (!childId && childLevel) {
      // Clear child selection if cid param is removed
      setChildLevel(null);
      setSummaryLevel(parentLevel);
      setSelectedSensor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, childId, levels]);

  // Scroll to selected cards when they change
  useEffect(() => {
    // Scroll to selected parent card after a short delay to ensure rendering is complete
    if (parentLevel) {
      setTimeout(() => {
        const activeParentCard = document.querySelector(
          ".first-panel .bg-muted.border-primary",
        );
        if (activeParentCard) {
          activeParentCard.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 100);
    }

    // Scroll to selected child card
    if (childLevel) {
      setTimeout(() => {
        const activeChildCard = document.querySelector(
          ".second-panel .bg-muted.border-primary",
        );
        if (activeChildCard) {
          activeChildCard.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 100);
    }
  }, [parentLevel, childLevel]);

  // Initial selection effect
  useEffect(() => {
    // If we don't have a parent ID in URL but have levels, select the first one
    if (!parentId && levels.length > 0 && !parentLevel) {
      const firstLevel = levels[0];
      if (firstLevel) {
        // Instead of triggering a state update which could cause re-renders,
        // directly update the URL which will then update the state through the other effect
        updateUrl(firstLevel.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels, parentId, parentLevel]);

  // Handle delete level action
  const handleDeleteLevel = (levelId: string) => {
    setLevelToDelete(levelId);
  };

  // Confirm and execute delete
  const confirmDelete = () => {
    if (levelToDelete) {
      // Execute the deletion
      deleteLevel(levelToDelete, {
        onSuccess: () => {
          // Force a complete page refresh to ensure clean state
          window.location.reload();
        }
      });
      
      setLevelToDelete(null);
    }
  };

  // Show loading state while permissions are being checked or levels are loading
  if (isLoadingUser || isLoadingLevels) {
    return <Loading />;
  }

  // Render unauthorized component if user doesn't have permission
  if (!canViewLevels) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Levels</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Unauthorized />
      </SidebarInset>
    );
  }

  // Continue with the rest of the component...

  // Determine which levels to show in first panel
  const getFirstPanelLevels = (): Level[] => {
    // Check if the current parent level is a top-level item
    const isDirectTopLevel = levels.some(
      (level) => level.id === parentLevel?.id,
    );

    if (isDirectTopLevel) {
      // If we're at a top level, show all top level items
      return levels;
    } else if (parentLevel) {
      // We're at a sub-level, need to find its parent to show siblings

      // First check if it's a direct child of a top-level item
      const topLevelParent = levels.find((level) =>
        level.children?.some((child) => child.id === parentLevel.id),
      );

      if (topLevelParent) {
        // It's a direct child of a top-level item, show its siblings
        return topLevelParent.children ?? [];
      }

      // It might be a deeper nested item, recursively search for parent
      const findParentRecursive = (
        levels: Level[],
        targetId: string,
      ): Level | null => {
        for (const level of levels) {
          if (level.children) {
            // Check if any direct children match the target
            const directChild = level.children.find(
              (child) => child.id === targetId,
            );
            if (directChild) {
              return level;
            }

            // Recursively search in children
            const nestedParent = findParentRecursive(level.children, targetId);
            if (nestedParent) {
              return nestedParent;
            }
          }
        }
        return null;
      };

      const parent = findParentRecursive(levels, parentLevel.id);
      if (parent?.children) {
        return parent.children;
      }
    }

    // Fallback to top-level items
    return levels;
  };

  // Continue with the rest of the component rendering...

  const breadcrumbs = getBreadcrumbPath();
  const firstPanelLevels = getFirstPanelLevels();
  const showTopLevelTitle = levels.some(
    (level) => level.id === parentLevel?.id,
  );

  // Find the actual parent of the current level for display in panel title
  const findActualParent = (): Level | null => {
    if (parentLevel) {
      // Check if it's a direct child of a top-level item
      const topLevelParent = levels.find((level) =>
        level.children.some((child) => child.id === parentLevel.id),
      );

      if (topLevelParent) {
        return topLevelParent;
      } else {
        // It's deeper in the hierarchy, need to recursively search
        const findParentRecursive = (
          levels: Level[],
          targetId: string,
        ): Level | null => {
          for (const level of levels) {
            // Check if any direct child matches the target
            const directChild = level.children.find(
              (child) => child.id === targetId,
            );
            if (directChild) {
              return level;
            }

            // Recursively check children
            const foundInChildren = findParentRecursive(
              level.children,
              targetId,
            );
            if (foundInChildren) {
              return foundInChildren;
            }
          }
          return null;
        };

        return findParentRecursive(levels, parentLevel.id);
      }
    }
    return null;
  };

  const actualParent = findActualParent();

  // Replace showSensorsInSecondPanel with more flexible flags
  const hasSensors = 
    parentLevel?.has_sensor && 
    parentLevel?.sensor_data && 
    parentLevel.sensor_data.length > 0;
  
  const hasChildren = 
    parentLevel?.children && 
    parentLevel.children.length > 0;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/levels">Levels</BreadcrumbLink>
              </BreadcrumbItem>

              {breadcrumbs.map((level, index) => (
                <React.Fragment key={level.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{level.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={`/levels?pid=${level.id}`}>
                        {level.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}

              {selectedSensor && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      Sensor: {selectedSensor.sensor_id.substring(0, 8)}...
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100vh-5rem)] flex-1"
        >
          <ResizablePanel className="min-w-[450px]">
            <ResizablePanelGroup direction="horizontal">
              {/* First Panel - Parent Levels */}
              <ResizablePanel className="first-panel flex flex-col px-6">
                <h2 className="sticky top-0 z-10 flex items-center justify-between bg-background py-4">
                  <span className="text-lg font-semibold">
                    {showTopLevelTitle
                      ? "Top Levels"
                      : `${actualParent?.name ?? "Parent"} Sub Levels`}
                  </span>
                </h2>
                <div className="scrollbar-hide h-full max-h-[calc(100vh-7rem)] flex-1 overflow-y-auto pr-2">
                  <div className="flex flex-col gap-4">
                    {firstPanelLevels.map((level) => (
                      <LevelCard
                        key={level.id}
                        level={level}
                        isActive={parentLevel?.id === level.id}
                        isParentCard={true}
                        onSelect={() => handleParentSelect(level)}
                        onViewSensors={() => handleViewSensors(level)}
                        onEdit={(levelId) => router.push(`/levels/${levelId}`)}
                        onDelete={(levelId) => handleDeleteLevel(levelId)}
                        onAddSubLevel={(parentId) => router.push(`/levels/new?parent_id=${parentId}`)}
                        onAddSensor={(parentId) => router.push(`/sensors/new?parent_id=${parentId}`)}
                        canEdit={canEditLevels}
                        canDelete={canDeleteLevels}
                        canCreate={canCreateLevels}
                      />
                    ))}
                    {firstPanelLevels.length === 0 && (
                      <p className="text-muted-foreground">No levels found</p>
                    )}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Second Panel - Child Levels and Sensors */}
              <ResizablePanel className="second-panel flex flex-col px-6">
                <h2 className="sticky top-0 z-10 flex items-center justify-between bg-background py-4">
                  <span className="text-lg font-semibold">
                    {parentLevel
                      ? hasChildren && hasSensors
                        ? `${parentLevel.name} Content`
                        : hasSensors
                          ? `${parentLevel.name} Sensors`
                          : `${parentLevel.name} Sub Levels`
                      : "Content"}
                  </span>
                  {parentLevel && canCreateLevels && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/levels/new?parent_id=${parentLevel.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Add new sub level</span>
                            <span aria-hidden="true">+</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add new sub level to <strong>{parentLevel.name}</strong></p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </h2>
                <div className="scrollbar-hide h-full max-h-[calc(100vh-7rem)] flex-1 overflow-y-auto pr-2">
                  <div className="flex flex-col gap-4">
                    {/* Show sub levels if available */}
                    {hasChildren && (
                      <>
                        {hasChildren && hasSensors && (
                          <h3 className="mb-2 font-medium text-muted-foreground">Sub Levels</h3>
                        )}
                        {parentLevel?.children.map((level) => (
                          <LevelCard
                            key={level.id}
                            level={level}
                            isActive={childLevel?.id === level.id}
                            onSelect={() => handleChildSelect(level)}
                            onViewMore={() => handleViewMore(level)}
                            onViewSensors={() => handleViewSensors(level)}
                            onEdit={(levelId) => router.push(`/levels/${levelId}`)}
                            onDelete={(levelId) => handleDeleteLevel(levelId)}
                            onAddSubLevel={(parentId) => router.push(`/levels/new?parent_id=${parentId}`)}
                            onAddSensor={(parentId) => router.push(`/sensors/new?parent_id=${parentId}`)}
                            canEdit={canEditLevels}
                            canDelete={canDeleteLevels}
                            canCreate={canCreateLevels}
                          />
                        ))}
                      </>
                    )}

                    {/* Show sensors if available */}
                    {hasSensors && (
                      <>
                        {hasChildren && hasSensors && (
                          <h3 className="mb-2 mt-6 font-medium text-muted-foreground">Sensors</h3>
                        )}
                        {parentLevel?.sensor_data?.map((sensor) => (
                          <SensorCard
                            key={sensor.sensor_id}
                            sensor={sensor}
                            isActive={selectedSensor?.sensor_id === sensor.sensor_id}
                            onSelect={() => handleSensorSelect(sensor)}
                            canEdit={hasPermission("SENSOR_UPDATE")}
                            canDelete={hasPermission("SENSOR_DELETE")}
                            refreshData={() => parentLevel && void refetchLevels()}
                          />
                        ))}
                      </>
                    )}

                    {/* Show message if no content is available */}
                    {!hasChildren && !hasSensors && parentLevel && (
                      <p className="text-muted-foreground">
                        No sub levels or sensors found
                      </p>
                    )}
                    
                    {!parentLevel && (
                      <p className="text-muted-foreground">
                        No level selected
                      </p>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Third Panel - Summary */}
          <ResizablePanel className="flex min-w-[500px] flex-col px-6">
            <h2 className="sticky top-0 z-10 bg-background py-4 text-lg font-semibold">
              Summary
            </h2>
            <div className="scrollbar-hide h-full max-h-[calc(100vh-7rem)] flex-1 overflow-y-auto pr-2">
              {isLoadingSummary ? (
                <div className="flex flex-col gap-4">
                  <SummarySkeleton />
                </div>
              ) : selectedSensor ? (
                <SensorSummary sensor={selectedSensor} />
              ) : summaryLevel ? (
                <LevelSummary level={summaryLevel} summaryData={summary} />
              ) : (
                <p className="text-muted-foreground">No level selected</p>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Add the confirmation dialog at the end of the component */}
      <AlertDialog 
        open={!!levelToDelete} 
        onOpenChange={(open) => !open && setLevelToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this level and cannot be undone.
              All child levels and associated sensors may also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
