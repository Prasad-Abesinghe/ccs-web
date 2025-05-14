"use client";

import { useRouter } from "next/navigation";
import { type Level } from "~/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  TriangleAlert, 
  CircleCheck, 
  AlertCircle,
  Wifi,
  WifiOff,
  MoreVertical,
  Edit,
  Trash,
  // Plus and Thermometer are unused but kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Plus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Thermometer,
  Layers,
  Layers2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LevelCardProps {
  level: Level;
  isActive?: boolean;
  isParentCard?: boolean;
  onViewMore?: () => void;
  onViewSensors?: () => void;
  onSelect: () => void;
  onEdit?: (levelId: string) => void;
  onDelete?: (levelId: string) => void;
  onAddSubLevel?: (parentId: string) => void;
  onAddSensor?: (parentId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
}

export function LevelCard({
  level,
  isActive,
  onViewMore,
  onViewSensors,
  onSelect,
  onEdit,
  onDelete,
  onAddSubLevel,
  onAddSensor,
  canEdit = false,
  canDelete = false,
  canCreate = false,
}: LevelCardProps) {
  const router = useRouter();
  
  // Use level_summary directly from the level data
  const summary = level.level_summary ?? {
    active: 0,
    inactive: 0,
    normal: 0,
    warnings: 0,
    critical: 0
  };
  
  // Total number of sensors is the sum of active and inactive
  const totalSensors = summary.active + summary.inactive;

  // Check if the level has sensors but no children
  const hasSensorsNoChildren = level.has_sensor && 
                               level.sensor_data?.length && 
                               (!level.children || level.children.length === 0);

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewMore) {
      onViewMore();
    } else {
      // Default behavior if no callback provided
      router.push(`/levels?pid=${level.id}`);
    }
  };

  const handleViewSensors = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewSensors) {
      onViewSensors();
    } else {
      // Default behavior if no callback provided
      router.push(`/levels?pid=${level.id}`);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(level.id);
    } else {
      // Default behavior if no callback provided
      router.push(`/levels/${level.id}`);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(level.id);
    }
  };
  
  const handleAddSubLevel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSubLevel) {
      onAddSubLevel(level.id);
    } else {
      // Default behavior if no callback provided
      router.push(`/levels/new?parent_id=${level.id}`);
    }
  };

  const handleAddSensor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSensor) {
      onAddSensor(level.id);
    } else {
      // Default behavior if no callback provided
      router.push(`/sensors/new?parent_id=${level.id}`);
    }
  };

  // Handle double click to view more or sensors
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If level has children, go to view more
    if (level.children.length > 0) {
      handleViewMore(e);
    } 
    // Otherwise if it has sensors, go to view sensors
    else if (hasSensorsNoChildren) {
      handleViewSensors(e);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors ${isActive ? "bg-muted border-primary" : "hover:bg-muted/50"}`}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pl-4 pr-2 pt-2 pb-0">
        <CardTitle className="text-sm font-medium">{level.name}</CardTitle>
        <div className="flex items-center gap-2">
          {/* Context Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-stone-900">
              {/* View More option - only visible if level has children */}
              {level.children.length > 0 && (
                <DropdownMenuItem onClick={handleViewMore}>
                  <Layers className="mr-2 h-4 w-4" />
                  <span>View Sub Levels</span>
                </DropdownMenuItem>
              )}
              
              {/* View Sensors option - only visible if level has sensors but no children */}
              {hasSensorsNoChildren && (
                <DropdownMenuItem onClick={handleViewSensors}>
                  <Wifi className="mr-2 h-4 w-4" />
                  <span>View Sensors</span>
                </DropdownMenuItem>
              )}
              
              {/* Separator if we have view options and other actions */}
              {(level.children.length > 0 || hasSensorsNoChildren) && 
               (canEdit || canCreate || canDelete) && (
                <DropdownMenuSeparator />
              )}
              
              {canEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              )}
              
              {canCreate && (
                <DropdownMenuItem onClick={handleAddSubLevel}>
                  <Layers2 className="mr-2 h-4 w-4" />
                  <span>Add Sub Level</span>
                </DropdownMenuItem>
              )}
              
              {canCreate && (
                <DropdownMenuItem onClick={handleAddSensor}>
                  <Wifi className="mr-2 h-4 w-4" />
                  <span>Add Sensor</span>
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <>
                  {(canEdit || canCreate) && <DropdownMenuSeparator />}
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            {/* Active Sensors */}
            {summary.active > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{summary.active}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Active Sensors</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Inactive Sensors */}
            {summary.inactive > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{summary.inactive}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inactive Sensors</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Divider */}
            {totalSensors > 0 && (
              <div className="h-4 w-px bg-border"></div>
            )}

            {/* Normal Sensors */}
            {summary.normal > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <CircleCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold">{summary.normal}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Normal Sensors</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Warning Sensors */}
            {summary.warnings > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <TriangleAlert className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">{summary.warnings}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Warning Sensors</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Critical Sensors */}
            {summary.critical > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-semibold">{summary.critical}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Critical Sensors</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
