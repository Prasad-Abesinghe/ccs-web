"use client";

import { useRouter } from "next/navigation";
import { BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRoles } from "~/hooks/use-roles";
import { useCreateUser } from "~/hooks/use-create-user";
import { useEffect, useState } from "react";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role_id: z.string({ required_error: "You need to select a role" }),
  provider: z.enum(["azure", "credential"], { required_error: "Provider selection is required" }),
  password: z.string().optional(),
  is_ad_user: z.boolean().default(false)
}).refine((data) => {
  // If provider is credential, password is required
  if (data.provider === "credential") {
    return !!data.password && data.password.length >= 8;
  }
  return true;
}, {
  message: "Password is required for credential provider and must be at least 8 characters",
  path: ["password"],
});

type FormValues = z.infer<typeof formSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const createUserMutation = useCreateUser();
  const [showPasswordField, setShowPasswordField] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role_id: "",
      provider: "azure",
      password: "",
      is_ad_user: true
    }
  });

  // Watch for provider changes
  const provider = form.watch("provider");
  
  // Update is_ad_user and show password field based on provider selection
  useEffect(() => {
    if (provider === "azure") {
      form.setValue("is_ad_user", true);
      setShowPasswordField(false);
    } else {
      form.setValue("is_ad_user", false);
      setShowPasswordField(true);
    }
  }, [form, provider]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Create user data with required fields
      const userData: {
        name: string;
        email: string;
        role_id: string;
        is_ad_user: boolean;
        password?: string;
      } = {
        name: values.name,
        email: values.email,
        role_id: values.role_id,
        is_ad_user: values.provider === "azure"
      };
      
      // Add password only for local credentials
      if (values.provider === "credential" && values.password) {
        userData.password = values.password;
      }
  
      createUserMutation.mutate(userData, {
        onSuccess: () => {
          router.push('/users');
        }
      });
    } catch (error) {
      console.error("Error in form submission:", error);
    }
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
                  <Link href="/users">Users</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New User</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="flex items-center mb-6">
          <Link href="/users">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create New User</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="azure">Azure Active Directory</SelectItem>
                          <SelectItem value="credential">Local Credentials</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select how this user will authenticate with the system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {showPasswordField && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormDescription>
                          Initial password for the user (minimum 8 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingRoles ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading roles...</span>
                            </div>
                          ) : roles.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">
                              No roles available
                            </div>
                          ) : (
                            roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the appropriate role for this user
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending || isLoadingRoles}
                  >
                    {createUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create User"}
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
