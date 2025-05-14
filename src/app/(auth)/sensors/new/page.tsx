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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ParentResourceInfo } from "~/components/parent-resource-info";
import { useLevel } from "~/hooks/use-levels";
import { useCreateSensor, getSensorFields, SENSOR_TYPES } from "~/hooks/use-sensor";

// Sensor form schema with configuration field
const formSchema = z.object({
  node: z.string().min(1, "Parent level is required"),
  sensor_type: z.string({
    required_error: "Sensor type is required",
  }).nullable(),
  sub_type: z.string().nullable(),
  configuration: z.record(z.unknown()),
  thresholds: z.object({
    warning: z.number(),
    critical: z.number()
  })
});

type FormData = z.infer<typeof formSchema>;

export default function NewSensorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parent_id");
  
  // Fetch parent level details
  const { level: parentLevel, isLoading: isLoadingParent } = useLevel(parentId ?? null);
  
  const [selectedType, setSelectedType] = useState<string>("Temperature");
  const [selectedSubType, setSelectedSubType] = useState<string>("");
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  
  const createSensorMutation = useCreateSensor();

  // Initialize form with defaults
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      node: parentId ?? "",
      sensor_type: "Temperature",
      sub_type: null,
      configuration: {},
      thresholds: {
        warning: -18,
        critical: -15
      }
    },
  });
  
  // Update fields when type or subtype changes
  useEffect(() => {
    // Get the fields required for this sensor type/subtype
    const fields = getSensorFields(selectedType, selectedSubType);
    setRequiredFields(fields);
    
    // Initialize configuration object with empty values for all required fields
    const configObject: Record<string, string> = {};
    fields.forEach(field => {
      configObject[field] = "";
    });
    
    // Update form configuration field
    form.setValue("configuration", configObject);
  }, [selectedType, selectedSubType, form]);

  // Function to get available sub-types for selected sensor type
  const getSubTypes = () => {
    const sensorType = SENSOR_TYPES.find(type => 
      type.value === selectedType);
    return sensorType?.subTypes ?? [];
  };

  // Function to handle configuration field changes
  const handleConfigChange = (field: string, value: string) => {
    const currentConfig = form.getValues("configuration");
    form.setValue("configuration", {
      ...currentConfig,
      [field]: value
    });
  };

  // Submit handler
  const onSubmit = async (values: FormData) => {
    createSensorMutation.mutate(values, {
      onSuccess: () => {
        // Navigate back to levels page with the parent selected
        if (parentId) {
          router.push(`/levels?pid=${parentId}`);
        } else {
          router.push('/sensors');
        }
      }
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
                <BreadcrumbLink href="/levels">Levels</BreadcrumbLink>
              </BreadcrumbItem>
              {parentLevel && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/levels?pid=${parentId}`}>
                      {parentLevel.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>New Sensor</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4"
            onClick={() => parentId 
              ? router.push(`/levels?pid=${parentId}`) 
              : router.push('/sensors')
            }
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Sensor</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sensor Configuration</CardTitle>
            <CardDescription>
              Configure the sensor settings and connection parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Parent Level ID field - show as input if not provided in URL */}
                {parentId ? (
                  <input 
                    type="hidden" 
                    {...form.register("node")} 
                    value={parentId ?? ""} 
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="node"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Level ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter parent level ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          The ID of the level this sensor will be attached to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Sensor Type */}
                <FormField
                  control={form.control}
                  name="sensor_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sensor Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedType(value);
                          // Reset sub-type when type changes
                          form.setValue("sub_type", "");
                          setSelectedSubType("");
                        }}
                        defaultValue={field.value ?? undefined}
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sensor type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SENSOR_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sub-Type - only show for temperature sensors */}
                {selectedType === "Temperature" && (
                  <FormField
                    control={form.control}
                    name="sub_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedSubType(value);
                          }}
                          defaultValue={field.value ?? undefined}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a sub type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getSubTypes().map(subType => (
                              <SelectItem key={subType.value} value={subType.value}>
                                {subType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Dynamic fields based on type and sub-type */}
                {selectedType && requiredFields.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium leading-none">Configuration</h3>
                      
                      {/* Render configuration fields */}
                      {requiredFields.map(field => (
                        <div key={field} className="grid gap-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                          </label>
                          <Input 
                            placeholder={`Enter ${field.replace('_', ' ')}`} 
                            onChange={(e) => handleConfigChange(field, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Thresholds Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium leading-none">Thresholds</h3>
                      
                      {/* Warning Threshold */}
                      <FormField
                        control={form.control}
                        name="thresholds.warning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warning Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter warning threshold" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Critical Threshold */}
                      <FormField
                        control={form.control}
                        name="thresholds.critical"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Critical Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter critical threshold" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {/* Parent Level Info */}
                {parentId && (
                  <div className="mt-6">
                    <ParentResourceInfo
                      parentId={parentId}
                      parentResource={parentLevel ? {
                        id: parentLevel.id,
                        name: parentLevel.name,
                        description: parentLevel.description
                      } : null}
                      isLoading={isLoadingParent}
                      resourceType="level"
                      relationshipLabel="This sensor will be attached to this level."
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={createSensorMutation.isPending}
                  >
                    {createSensorMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Sensor"
                    )}
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
