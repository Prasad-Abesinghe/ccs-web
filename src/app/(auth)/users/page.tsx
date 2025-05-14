"use client";

import { BreadcrumbList, BreadcrumbPage } from "~/components/ui/breadcrumb";
import { BreadcrumbItem } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Edit, Plus, RefreshCcw, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useUsers, type UserData } from "~/hooks/use-users";
import { PermissionGate } from "~/components/auth/permission-gate";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import Loading from "./loading";

export default function UsersPage() {
  const router = useRouter();
  const { users, isLoading: isLoadingUsers, refetch } = useUsers();
  const { hasPermission, canUpdateUsers, isLoadingUser } = usePermissions();
  const canViewUsers = hasPermission("USER_VIEW");

  const handleEdit = (user: UserData) => {
    if (canUpdateUsers) {
      router.push(`/users/${user.id}`);
    }
  };
  
  // Show loading state while permissions are being checked
  if (isLoadingUser) {
    return <Loading />;
  }

  // Render unauthorized component if user doesn't have permission
  if (!canViewUsers) {
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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            
            <PermissionGate permissions="USER_CREATE">
              <Link href="/users/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              {user.role.toLowerCase().includes('admin') ? (
                                <>
                                  <Shield className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm text-purple-500 font-medium">{user.role}</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm text-blue-500 font-medium">{user.role}</span>
                                </>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.role.toLowerCase().includes('admin') ? "Administrator with advanced permissions" : "Standard user account"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <PermissionGate permissions="USER_UPDATE">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit User</p>
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
      </div>
    </SidebarInset>
  );
}
