"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "~/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { BreadcrumbItem } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";

import React from "react";

// Form schema
const formSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationDescription: z.string().min(1, "Description is required"),
  parentNode: z.string().min(1, "Parent node is required"),
});

// Dummy data
const organizationLevels = ["Level 01", "Level 02", "Level 03"];

const UpdateLevelpage = () => {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = React.useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      organizationDescription: "",
      parentNode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    toast({
      title: "Organization Level Added Successfully",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <div className="mx-auto w-full">
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Organization Structure</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Update Level</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="mx-auto w-1/2">
          <Form {...form}>
            <FormField
              control={form.control}
              name="parentNode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select a level to update</FormLabel>
                  <Command>
                    <CommandInput
                      placeholder="Type organization structure name..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandGroup>
                        {searchValue && (
                          <>
                            {searchValue.toLowerCase().startsWith("") ? (
                              <>
                                <CommandItem>
                                  Level 01 - Main Office
                                </CommandItem>
                                <CommandItem>
                                  Level 02 - Branch Office
                                </CommandItem>
                                <CommandItem>Level 03 - Department</CommandItem>
                              </>
                            ) : (
                              <CommandItem>Not found</CommandItem>
                            )}
                          </>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <FormMessage />
                </FormItem>
              )}
            />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Add name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Add description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentNode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Node</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-muted-foreground">
                          <SelectValue placeholder="Select parent node" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center gap-16">
                <Button variant="outline" className="w-24">
                  Cancel
                </Button>
                <Button variant="outline" className="w-24">
                  Update
                </Button>
                <Button variant="outline" className="w-24">
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SidebarInset>
    </div>
  );
};

export default UpdateLevelpage;
