"use client";

import { InfoIcon, Layers } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

interface ParentResourceInfoProps {
  parentId?: string | null;
  parentResource?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  isLoading?: boolean;
  resourceType?: "level" | "sensor";
  relationshipLabel?: string;
}

export function ParentResourceInfo({
  parentId,
  parentResource,
  isLoading = false,
  resourceType = "level",
  relationshipLabel = "This item is a child of the above parent.",
}: ParentResourceInfoProps) {
  if (!parentId) return null;

  return (
    <div className="rounded-md bg-muted p-4">
      <div className="mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Parent {resourceType === "level" ? "Level" : "Resource"}
        </p>
        {isLoading && <Skeleton className="h-4 w-24" />}
      </div>

      {parentResource ? (
        <>
          <p className="mb-1 text-base font-medium">{parentResource.name}</p>
          {parentResource.description && (
            <p className="mb-1 text-xs text-muted-foreground">
              {parentResource.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1">
            <p className="text-xs text-muted-foreground">{parentId}</p>
          </div>
        </>
      ) : !isLoading ? (
        <>
          <p className="text-xs text-muted-foreground">ID: {parentId}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Unable to load parent{" "}
            {resourceType === "level" ? "level" : "resource"} details
          </p>
        </>
      ) : null}

      <div className="mt-4 flex items-center gap-1">
        <InfoIcon className="h-3 w-3 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{relationshipLabel}</p>
      </div>
    </div>
  );
}
