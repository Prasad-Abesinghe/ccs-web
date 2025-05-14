"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Thermometer, MoreVertical, Edit, Trash, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { api } from "~/lib/api";
import { useToast } from "./ui/use-toast";

export interface SensorData {
  sensor_id: string;
  sensor_type: string | null;
  sensor_value: string | null;
  widget_url: string;
}

interface SensorCardProps {
  sensor: SensorData;
  isActive?: boolean;
  onSelect: () => void;
  onDelete?: (sensorId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  refreshData?: () => void;
}

export function SensorCard({
  sensor,
  isActive,
  onSelect,
  onDelete,
  canEdit = false,
  canDelete = false,
  refreshData,
}: SensorCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/sensors/${sensor.sensor_id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!sensor.sensor_id) return;
    
    setIsDeleting(true);
    try {
      // Call API to delete the sensor
      await api.deleteSensor(sensor.sensor_id);
      
      toast({
        title: "Success",
        description: "Sensor deleted successfully",
      });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      
      // Call parent's onDelete callback if provided
      if (onDelete) {
        onDelete(sensor.sensor_id);
      }
      
      // Refresh data if refreshData callback is provided
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Error deleting sensor:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to delete sensor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={`cursor-pointer transition-colors ${isActive ? "bg-muted border-primary" : "hover:bg-muted/50"}`}
        onClick={onSelect}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-3 pb-0">
          <CardTitle className="text-sm font-medium">{sensor.sensor_id.substring(0, 20)}...</CardTitle>
          
          {/* Context Menu */}
          {(canEdit || canDelete) && (
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
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={handleDeleteClick}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{sensor.sensor_value ?? "N/A"}</span>
            </div>
            {sensor.sensor_type && (
              <div className="text-xs text-muted-foreground">Type: {sensor.sensor_type}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this sensor and cannot be undone.
              All associated data will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
