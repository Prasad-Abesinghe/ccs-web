import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function OrganizationLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-10 w-64 mb-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-4/5 mb-6" />
          
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
} 
