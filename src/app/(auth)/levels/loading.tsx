"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { SidebarInset, SidebarTrigger } from "~/components/ui/sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable"

function LevelCardSkeleton() {
  return (
    <Card className="bg-black">
      <CardHeader className="flex flex-row items-center pb-2">
        <Skeleton className="h-6 w-[60px]" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" /> {/* Wifi icon */}
            <Skeleton className="h-5 w-[40px]" /> {/* 102 */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" /> {/* X icon */}
            <Skeleton className="h-5 w-[30px]" /> {/* 11 */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" /> {/* Checkmark icon */}
            <Skeleton className="h-5 w-[40px]" /> {/* 113 */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[200px]" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export default function Loading() {
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel className="min-w-[450px]">
            <ResizablePanelGroup direction="horizontal">
              {/* First Tab - Top Levels */}
              <ResizablePanel className="px-6">
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold">Top Levels</h2>
                  <LevelCardSkeleton />
                  <LevelCardSkeleton />
                  <LevelCardSkeleton />
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Second Tab - Child Levels */}
              <ResizablePanel className="px-6">
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold">Child Levels</h2>
                  <LevelCardSkeleton />
                  <LevelCardSkeleton />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Third Tab - Summary */}
          <ResizablePanel className="px-6 min-w-[500px]">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Summary</h2>
              <SummarySkeleton />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SidebarInset>
  )
} 
