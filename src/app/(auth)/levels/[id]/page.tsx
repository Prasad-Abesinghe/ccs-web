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
import { useState, useEffect } from "react";
import { BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Textarea } from "~/components/ui/textarea";
import { useLevel, useLevels, useUpdateLevel } from "~/hooks/use-levels";
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

export default function EditLevelPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission check
  const { hasPermission, isLoadingUser } = usePermissions();
  const canEditLevel = hasPermission("NODE_UPDATE");

  // Level data hooks
  const { level, isLoading: isLoadingLevel } = useLevel(levelId) as { 
    level: Node | undefined; 
    isLoading: boolean; 
  };
  const { updateLevel, isPending } = useUpdateLevel();
  
  // Get refetch function from levels hook for updating cache
  const { refetch: refetchLevels } = useLevels();
  
  // Fetch parent level details if level has a parent_id
  const { level: parentLevel, isLoading: isLoadingParent } = useLevel(level?.parent_id) as { 
    level: Node | undefined; 
    isLoading: boolean; 
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: level?.parent_id,
    },
  });

  // Update form when level data is loaded
  useEffect(() => {
    if (level) {
      form.reset({
        name: level.name,
        description: level.description,
        parent_id: level.parent_id,
      });
    }
  }, [level, form]);

  // Function to save level data
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!levelId) return;

    setIsSubmitting(true);
    try {
      updateLevel(
        {
          levelId,
          levelData: values,
        },
        {
          onSuccess: () => {
            // Refetch levels to ensure the cache is updated
            void refetchLevels().then(() => {
              // Navigate back to levels with the edited level selected
              if (values.parent_id) {
                router.push(`/levels?pid=${values.parent_id}&cid=${levelId}`);
              } else {
                router.push(`/levels?pid=${levelId}`);
              }
            }).catch(error => {
              console.error("Error refetching levels data:", error);
              console.warn("Navigation will proceed with potentially stale data");
              
              if (values.parent_id) {
                router.push(`/levels?pid=${values.parent_id}&cid=${levelId}`);
              } else {
                router.push(`/levels?pid=${levelId}`);
              }
            });
          },
          onSettled: () => {
            setIsSubmitting(false);
          }
        }
      );
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingUser || isLoadingLevel) {
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
                  <BreadcrumbPage>Edit Level</BreadcrumbPage>
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
              {isLoadingUser ? "Checking permissions..." : "Loading level data..."}
            </p>
          </div>
        </div>
      </SidebarInset>
    );
  }

  // Permission check
  if (!canEditLevel) {
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
                  <BreadcrumbPage>Edit Level</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <Unauthorized />
      </SidebarInset>
    );
  }

  // Level not found
  if (!isLoadingLevel && !level) {
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
                  <BreadcrumbPage>Edit Level</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex h-full items-center justify-center">
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border p-8">
            <h3 className="text-xl font-medium">Level Not Found</h3>
            <p className="text-sm text-muted-foreground">
              The level you are trying to edit could not be found.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/levels")}
            >
              Go Back to Levels
            </Button>
          </div>
        </div>
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
                {level ? (
                  <BreadcrumbLink href={`/levels?pid=${level.id}`}>
                    {level.name}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Level</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-6 flex items-center">
          <Link href={level?.parent_id ? `/levels?pid=${level.parent_id}&cid=${level.id}` : `/levels?pid=${level?.id ?? ''}`}>
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Level</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Level Configuration</CardTitle>
            <CardDescription>
              Update the level details
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

                {level?.parent_id && (
                  <ParentResourceInfo 
                    parentId={level.parent_id}
                    parentResource={parentLevel}
                    isLoading={isLoadingParent}
                    resourceType="level"
                    relationshipLabel="This level is a child of the above parent level."
                  />
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || isPending}>
                    {isSubmitting || isPending ? "Saving..." : "Save Changes"}
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
