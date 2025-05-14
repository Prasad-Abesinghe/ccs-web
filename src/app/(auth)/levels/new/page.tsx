"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Textarea } from "~/components/ui/textarea";
import { useCreateLevel, useLevel, useLevels } from "~/hooks/use-levels";
import { usePermissions } from "~/hooks/use-permissions";
import { Unauthorized } from "~/components/unauthorized";
import { ParentResourceInfo } from "~/components/parent-resource-info";
import { type Node } from "~/types/levels";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, "Level name is required"),
  description: z.string().min(1, "Description is required"),
  parent_id: z.string().optional(),
});

export default function NewLevelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parent_id");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission check
  const { hasPermission, isLoadingUser } = usePermissions();
  const canCreateLevel = hasPermission("NODE_CREATE");

  // Create level hook
  const { createLevel, isPending } = useCreateLevel();
  
  // Get refetch function from levels hook
  const { refetch: refetchLevels } = useLevels();
  
  // Fetch parent level details if parentId is available
  const { level: parentLevel, isLoading: isLoadingParent } = useLevel(parentId) as { 
    level: Node | undefined; 
    isLoading: boolean; 
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: parentId ?? undefined,
    },
  });

  // Function to save level data
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      createLevel(values, {
        onSuccess: (response) => {
          // Get the new level details
          const newLevelId = response.data.id;
          const parentId = response.data.parent_id;
          
          // Refetch levels to ensure the new level is in the cache
          // Use void to indicate we're intentionally ignoring the promise
          void refetchLevels().then(() => {
            // Navigate with the new level selected after refetch completes
            if (parentId) {
              router.push(`/levels?pid=${parentId}&cid=${newLevelId}`);
            } else {
              router.push(`/levels?pid=${newLevelId}`);
            }
          }).catch(error => {
            console.error("Error refetching levels data:", error);
            // Log additional context for debugging
            console.warn("Navigation will proceed with potentially stale data");
            // Navigate anyway even if refetch fails
            if (parentId) {
              router.push(`/levels?pid=${parentId}&cid=${newLevelId}`);
            } else {
              router.push(`/levels?pid=${newLevelId}`);
            }
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/levels">Levels</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Level</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex h-full items-center justify-center">
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border p-8">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <h3 className="text-xl font-medium">Loading...</h3>
            <p className="text-sm text-muted-foreground">
              Checking permissions...
            </p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  if (!canCreateLevel) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/levels">Levels</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>New Level</BreadcrumbPage>
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
                <BreadcrumbLink href="/levels">Levels</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Level</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-6 flex items-center">
          <Link href="/levels">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Level</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Level Configuration</CardTitle>
            <CardDescription>
              Configure the level settings and hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter level name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for the level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter level description" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Detailed description of the level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {parentId && (
                  <ParentResourceInfo 
                    parentId={parentId}
                    parentResource={parentLevel}
                    isLoading={isLoadingParent}
                    resourceType="level"
                    relationshipLabel="This level will be created as a child of the selected parent level."
                  />
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || isPending}>
                    {isSubmitting || isPending ? "Creating..." : "Add Level"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
} 
