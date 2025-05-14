"use client";

import { useRouter } from "next/navigation";
import {
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import Link from "next/link";
import { ArrowLeft, Edit, Loader2, Plus, X } from "lucide-react";
import {
  useCreateRole,
  AVAILABLE_ACTIONS,
  NODE_LEVEL_ACTIONS,
  type RoleAction,
} from "~/hooks/use-roles";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters" }),
  actions: z
    .array(z.string())
    .min(1, { message: "Select at least one action" }),
  hasRootAccess: z.boolean().default(false),
  smsEnabled: z.boolean().default(false),
  emailEnabled: z.boolean().default(false),
  msTeamsEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Node-specific permissions schema
interface NodePermission {
  nodeId: string;
  actions: string[];
}

export default function NewRolePage() {
  const router = useRouter();
  const createRoleMutation = useCreateRole();
  const [nodePermissions, setNodePermissions] = useState<NodePermission[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>("");
  const [currentNodeActions, setCurrentNodeActions] = useState<string[]>([]);
  const [showNodeForm, setShowNodeForm] = useState<boolean>(false);
  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      actions: [],
      hasRootAccess: false,
      smsEnabled: false,
      emailEnabled: false,
      msTeamsEnabled: false,
    },
  });

  const handleAddNodePermission = () => {
    if (currentNodeId && currentNodeActions.length > 0) {
      if (editingNodeIndex !== null) {
        // Update existing permission
        const updatedPermissions = [...nodePermissions];
        updatedPermissions[editingNodeIndex] = {
          nodeId: currentNodeId,
          actions: currentNodeActions,
        };
        setNodePermissions(updatedPermissions);
        setEditingNodeIndex(null);
      } else {
        // Add new permission
        setNodePermissions([
          ...nodePermissions,
          {
            nodeId: currentNodeId,
            actions: currentNodeActions,
          },
        ]);
      }
      setCurrentNodeId("");
      setCurrentNodeActions([]);
      setShowNodeForm(false);
    }
  };

  const handleEditNodePermission = (index: number) => {
    // We can safely use non-null assertion here because the edit button
    // only appears for existing items in the array
    const permission = nodePermissions[index]!;
    setCurrentNodeId(permission.nodeId);
    setCurrentNodeActions(permission.actions);
    setEditingNodeIndex(index);
    setShowNodeForm(true);
  };

  const handleRemoveNodePermission = (index: number) => {
    const updatedPermissions = [...nodePermissions];
    updatedPermissions.splice(index, 1);
    setNodePermissions(updatedPermissions);
  };

  const handleNodeActionToggle = (action: string) => {
    setCurrentNodeActions((prevActions) =>
      prevActions.includes(action)
        ? prevActions.filter((a) => a !== action)
        : [...prevActions, action],
    );
  };

  const onSubmit = async (values: FormValues) => {
    // Prepare global role actions
    const roleActions: RoleAction[] = [
      {
        actions: values.actions,
        node_id: null,
      },
    ];

    // Add node-specific permissions
    nodePermissions.forEach((nodePermission) => {
      roleActions.push({
        actions: nodePermission.actions,
        node_id: nodePermission.nodeId,
      });
    });

    const roleData = {
      name: values.name,
      description: values.description,
      role_actions: roleActions,
      full_node_access: nodePermissions.length === 0,
      accessible_nodes: nodePermissions.map((np) => np.nodeId),
    };

    console.log("roleData", roleData);

    createRoleMutation.mutate(roleData, {
      onSuccess: () => {
        router.push("/roles");
      },
    });
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/roles">Roles</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add New Role</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-6 flex items-center">
          <Link href="/roles">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Role</h1>
        </div>

        <div className="mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>
                Create a new role with permissions
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
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Admin" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for the role
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
                            placeholder="Describe the role's purpose and permissions"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description of the role&apos;s responsibilities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Global Permissions</FormLabel>
                    <FormDescription className="mb-4">
                      Select the actions this role can perform globally (across
                      all levels)
                    </FormDescription>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {AVAILABLE_ACTIONS.map((action) => (
                        <FormField
                          key={action}
                          control={form.control}
                          name="actions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(action)}
                                  onCheckedChange={(checked) => {
                                    const updatedActions = checked
                                      ? [...field.value, action]
                                      : field.value?.filter(
                                          (a) => a !== action,
                                        );
                                    field.onChange(updatedActions);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {action.replace(/_/g, " ")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage>
                      {form.formState.errors.actions?.message}
                    </FormMessage>
                  </div>

                  {/* Node-specific permissions section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Level Permissions</FormLabel>
                        <FormDescription>
                          Define permissions for specific levels. These will
                          overwrite global permissions for the specified levels.
                        </FormDescription>
                      </div>
                      {!showNodeForm && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNodeForm(true)}
                          className="flex items-center"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Level Permission
                        </Button>
                      )}
                    </div>

                    {/* Display existing node permissions */}
                    {nodePermissions.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {nodePermissions.map((permission, index) => (
                          editingNodeIndex !== index && (
                            <div
                              key={index}
                              className="relative rounded-md border p-4"
                            >
                              <div className="absolute right-2 top-2 flex space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditNodePermission(index)}
                                        disabled={editingNodeIndex !== null}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit level permission</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveNodePermission(index)
                                        }
                                        disabled={editingNodeIndex !== null}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove level permission</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="font-medium">
                                Level Id: {permission.nodeId}
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                <span className="font-medium">Permissions:</span>{" "}
                                {permission.actions
                                  .map((action) => action.replace(/_/g, " "))
                                  .join(", ")}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {/* Node permission form */}
                    {showNodeForm && (
                      <div className="mt-4 rounded-md border p-4">
                        <h4 className="mb-3 font-medium">
                          {editingNodeIndex !== null
                            ? "Edit Level Permission"
                            : "Add Level Permission"}
                        </h4>

                        <FormField
                          name="levelId"
                          render={() => (
                            <FormItem>
                              <FormLabel>Level Id</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Level Id"
                                  value={currentNodeId}
                                  onChange={(e) =>
                                    setCurrentNodeId(e.target.value)
                                  }
                                />
                              </FormControl>
                              <FormDescription>
                                A descriptive name for the role
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="my-4">
                          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {NODE_LEVEL_ACTIONS.map((action) => (
                              <div
                                key={action}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`node-action-${action}`}
                                  checked={currentNodeActions.includes(action)}
                                  onCheckedChange={() =>
                                    handleNodeActionToggle(action)
                                  }
                                />
                                <label
                                  htmlFor={`node-action-${action}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {action.replace(/_/g, " ")}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowNodeForm(false);
                              setCurrentNodeId("");
                              setCurrentNodeActions([]);
                              setEditingNodeIndex(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleAddNodePermission}
                            disabled={
                              !currentNodeId || currentNodeActions.length === 0
                            }
                          >
                            {editingNodeIndex !== null ? "Update" : "Add"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <FormLabel>Special Permissions</FormLabel>
                    <FormDescription className="mb-4">
                      Additional permissions and notification settings
                    </FormDescription>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <FormField
                        control={form.control}
                        name="hasRootAccess"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                Root Access
                              </FormLabel>
                              <FormDescription>
                                Grant full admin privileges
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                SMS Notifications
                              </FormLabel>
                              <FormDescription>
                                Allow SMS notifications
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emailEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                Email Notifications
                              </FormLabel>
                              <FormDescription>
                                Allow email notifications
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="msTeamsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                MS Teams Notifications
                              </FormLabel>
                              <FormDescription>
                                Allow MS Teams notifications
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="w-auto"
                      disabled={createRoleMutation.isPending}
                    >
                      {createRoleMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Role"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
