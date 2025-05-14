"use client";

import { SidebarInset } from "~/components/ui/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NewRoleLoading() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="flex items-center mb-6">
          <Link href="/roles">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="mx-auto">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col gap-2">
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-64 mb-6" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>
                
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-80" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-80" />
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
} 
