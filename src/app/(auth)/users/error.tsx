"use client";

import Link from "next/link";
import { SidebarInset } from "~/components/ui/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Clock, HomeIcon } from "lucide-react";

export default function UsersComingSoon() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="container mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Clock className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Coming Soon</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The User Management module is currently under development. Check back soon for new features!
        </p>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/levels">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </SidebarInset>
  );
}
