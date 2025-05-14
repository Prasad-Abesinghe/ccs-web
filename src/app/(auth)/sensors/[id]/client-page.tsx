"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useState, useEffect } from "react";
import { BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbLink } from "~/components/ui/breadcrumb";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { SidebarInset } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Trash, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { ParentResourceInfo } from "~/components/parent-resource-info";
import { useSensor, useUpdateSensor, getSensorFields, SENSOR_TYPES } from "~/hooks/use-sensor";
import { useLevel } from "~/hooks/use-levels";

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

export default function EditSensorClientPage({ id }: { id: string }) {
  const router = useRouter();
  
  // Fetch sensor data
  const { sensor, isLoading: isLoadingSensor } = useSensor(id);
  
  // Fetch parent level
  const { level: parentLevel, isLoading: isLoadingParent } = useLevel(sensor?.node ?? null);
  
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSubType, setSelectedSubType] = useState<string>("");
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  
  // Update mutation
  const updateSensorMutation = useUpdateSensor();
  
  // Form hook
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      node: "",
      sensor_type: null,
      sub_type: null,
      configuration: {},
      thresholds: {
        warning: -18,
        critical: -15,
      },
    },
  });
  
  // Update form with sensor data when it loads
  useEffect(() => {
    if (sensor) {
      // Extract values
      const sensorType = sensor.sensor_type ?? "Temperature";
      const subType = sensor.sub_type;
      
      setSelectedType(sensorType);
      setSelectedSubType(subType ?? "");
      
      // Update form values
      form.reset({
        node: sensor.node,
        sensor_type: sensorType,
        sub_type: subType,
        configuration: sensor.configuration || {},
        thresholds: {
          warning: typeof sensor.thresholds.warning === 'number' 
            ? sensor.thresholds.warning 
            : parseFloat(sensor.thresholds.warning),
          critical: typeof sensor.thresholds.critical === 'number' 
            ? sensor.thresholds.critical 
            : parseFloat(sensor.thresholds.critical),
        }
      });
    }
  }, [sensor, form]);

  // Update fields when type or subtype changes
  useEffect(() => {
    if (selectedType) {
      // Get the fields required for this sensor type/subtype
      const fields = getSensorFields(selectedType, selectedSubType);
      setRequiredFields(fields);
      
      // Initialize missing configuration fields if needed
      const currentConfig = form.getValues("configuration") || {};
      const updatedConfig = { ...currentConfig };
      
      fields.forEach(field => {
        if (updatedConfig[field] === undefined) {
          updatedConfig[field] = "";
        }
      });
      
      // Update form configuration field if it changed
      if (JSON.stringify(currentConfig) !== JSON.stringify(updatedConfig)) {
        form.setValue("configuration", updatedConfig);
      }
    }
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

  // Update handler
  const onSubmit = async (values: FormData) => {
    updateSensorMutation.mutate({
      sensorId: id,
      sensorData: values
    }, {
      onSuccess: () => {
        router.push('/sensors');
      }
    });
  };

  // Handle delete
  const handleDelete = async () => {
    // Implement delete logic
  };

  // Loading state
  if (isLoadingSensor) {
    return (
      <SidebarInset>
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          <p>Loading sensor data...</p>
        </div>
      </SidebarInset>
    );
  }

  // If sensor not found
  if (!sensor) {
    return (
      <SidebarInset>
        <div className="flex h-screen w-full flex-col items-center justify-center">
          <h2 className="mb-4 text-xl font-bold">Sensor Not Found</h2>
          <p className="mb-4 text-muted-foreground">The requested sensor could not be found</p>
          <Button onClick={() => router.push('/sensors')}>
            Back to Sensors
          </Button>
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
                <BreadcrumbLink href="/sensors">Sensors</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Sensor</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-4"
              onClick={() => router.push('/sensors')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Sensor</h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Sensor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  sensor and remove the data from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sensor Configuration</CardTitle>
            <CardDescription>
              Update sensor settings and connection parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Parent Node ID field */}
                <FormField
                  control={form.control}
                  name="node"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Level ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parent level ID" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          form.setValue("sub_type", null);
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

                {/* Dynamic configuration fields */}
                {requiredFields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium leading-none">Configuration</h3>
                    
                    {/* Render configuration fields */}
                    {requiredFields.map(field => {
                      const currentConfig = form.getValues("configuration") ?? {};
                      const fieldValue = currentConfig[field];
                      
                      // Convert to simple string for display in a type-safe way
                      let displayValue = "";
                      
                      // Handle different types of values
                      if (fieldValue === null || fieldValue === undefined) {
                        displayValue = "";
                      } else if (typeof fieldValue === 'object') {
                        try {
                          // Use replacer function to handle circular references
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                          const jsonString = JSON.stringify(fieldValue, (key, value) => {
                            // Handle potential circular reference
                            if (typeof value === 'object' && value !== null) {
                              return '[object]';
                            }
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                            return value;
                          });
                          // Ensure we have a string, fallback to empty string if JSON.stringify returns null
                          displayValue = jsonString || "";
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (error) {
                          // If JSON stringify fails, provide a fallback value
                          displayValue = "[Complex Object]";
                        }
                      } else {
                        // For primitive types, use safe string conversion
                        // eslint-disable-next-line @typescript-eslint/no-base-to-string
                        displayValue = String(fieldValue);
                      }
                      
                      return (
                        <div key={field} className="grid gap-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                          </label>
                          <Input 
                            placeholder={`Enter ${field.replace('_', ' ')}`} 
                            value={displayValue}
                            onChange={(e) => handleConfigChange(field, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

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

                {/* Parent Level Info */}
                {parentLevel && (
                  <div className="mt-6">
                    <ParentResourceInfo
                      parentId={parentLevel.id}
                      parentResource={{
                        id: parentLevel.id,
                        name: parentLevel.name,
                        description: parentLevel.description
                      }}
                      isLoading={isLoadingParent}
                      resourceType="level"
                      relationshipLabel="This sensor is attached to this level."
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateSensorMutation.isPending}
                  >
                    {updateSensorMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
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
