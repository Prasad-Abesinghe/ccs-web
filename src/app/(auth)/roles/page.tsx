"use client";

import { useRouter } from "next/navigation";
import { SidebarInset } from "~/components/ui/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Edit, Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRoles } from "~/hooks/use-roles";
import { type Role } from "~/hooks/use-roles";
import { Loader2 } from "lucide-react";
import { PermissionGate } from "~/components/auth/permission-gate";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import Loading from "./loading";

export default function RolesPage() {
  const router = useRouter();
  const { hasPermission, canUpdateRoles, isLoadingUser } = usePermissions();
  const canViewRoles = hasPermission("ROLE ASSIGN");

  // Fetch roles
  const { roles, isLoading: isLoadingRoles, refetch } = useRoles();

  // Function to handle edit button click
  const handleEdit = (role: Role) => {
    if (canUpdateRoles) {
      router.push(`/roles/${role.id}`);
    }
  };

  // Format actions for display
  const formatActions = (role: Role) => {
    if (!role.role_actions || role.role_actions.length === 0) {
      return "None";
    }

    // Get all actions from all role_actions entries
    const allActions = role.role_actions.flatMap(ra => ra.actions);
    
    // Display the count and the first few actions
    if (allActions.length <= 2) {
      return allActions.join(", ");
    } else {
      return `${allActions.length} actions (${allActions.slice(0, 2).join(", ")}, ...)`;
    }
  };

  // Show loading state while permissions are being checked
  if (isLoadingUser) {
    return <Loading />;
  }

  // Render unauthorized component if user doesn't have permission
  if (!canViewRoles) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold tracking-tight">
              Roles
            </h1>
          </div>
        </header>
        <Unauthorized />
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold tracking-tight">
            Roles
          </h1>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Roles</h1>
            <p className="text-muted-foreground">
              Manage roles and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            
            <PermissionGate permissions="ROLE_CREATE">
              <Link href="/roles/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Role
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        {isLoadingRoles ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading roles...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Special Permissions</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No roles found
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{formatActions(role)}</TableCell>
                      <TableCell>
                        {role.has_root_access ? "Root Access" : ""}
                        {role.has_root_access && (role.sms_enabled || role.email_enabled || role.ms_teams_enabled) ? ", " : ""}
                        {role.sms_enabled ? "SMS" : ""}
                        {role.sms_enabled && (role.email_enabled || role.ms_teams_enabled) ? ", " : ""}
                        {role.email_enabled ? "Email" : ""}
                        {role.email_enabled && role.ms_teams_enabled ? ", " : ""}
                        {role.ms_teams_enabled ? "MS Teams" : ""}
                        {!role.has_root_access && !role.sms_enabled && !role.email_enabled && !role.ms_teams_enabled ? "None" : ""}
                      </TableCell>
                      <TableCell>
                        <PermissionGate permissions="ROLE_UPDATE">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(role)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Role</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </PermissionGate>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </SidebarInset>
  );
} 
