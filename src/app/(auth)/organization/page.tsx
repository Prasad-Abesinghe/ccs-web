"use client";

import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { getLevelsData, type LevelsData } from "~/app/actions";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { OrgDiagram } from "~/components/diagram/org-diagram";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import { useEffect, useState } from "react";

export default function OrganizationPage() {
  const [data, setData] = useState<LevelsData | null>(null);
  const { hasPermission } = usePermissions();
  const canViewOrganization = hasPermission("VIEW_ORGANIZATION");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLevelsData();
      setData(data);
    };
    void fetchData();
  }, []);

  if (!canViewOrganization) {
    <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Organization</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Unauthorized />
      </SidebarInset>
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
                <BreadcrumbPage>Organization</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Organization</h1>
            <p className="text-muted-foreground">
              Organization structure and sensor data
            </p>
          </div>
        </div>

        <div className="rounded-md border">
          <OrgDiagram levels={data?.levels ?? []} />
        </div>
      </div>
    </SidebarInset>
  );
}
