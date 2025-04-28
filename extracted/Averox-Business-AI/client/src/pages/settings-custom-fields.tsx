import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ListFilter, Save, Pencil, RotateCw, Database, Table, Layers } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table as UITable, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define types
interface CustomField {
  id: number;
  name: string;
  label: string;
  type: "Text" | "Number" | "Date" | "Boolean" | "Dropdown" | "MultiSelect" | "Email" | "Phone" | "URL" | "TextArea" | "Currency";
  entityType: string;
  options?: any;
  isRequired: boolean;
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
  showInList: boolean;
  showInDetail: boolean;
  showInForm: boolean;
  validationRules?: any;
}

interface CustomFieldGroup {
  id: number;
  name: string;
  entityType: string;
  label: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

interface CustomFieldGroupMapping {
  id: number;
  fieldId: number;
  groupId: number;
  sortOrder: number;
}

// Form schemas
const fieldFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  label: z.string().min(2, {
    message: "Label must be at least 2 characters.",
  }),
  type: z.enum(["Text", "Number", "Date", "Boolean", "Dropdown", "MultiSelect", "Email", "Phone", "URL", "TextArea", "Currency"]),
  entityType: z.enum(["contact", "account", "lead", "opportunity", "task"]),
  options: z.string().optional(),
  isRequired: z.boolean().default(false),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  showInList: z.boolean().default(false),
  showInDetail: z.boolean().default(true),
  showInForm: z.boolean().default(true),
});

const groupFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  label: z.string().min(2, {
    message: "Label must be at least 2 characters.",
  }),
  entityType: z.enum(["contact", "account", "lead", "opportunity", "task"]),
  description: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

const mappingFormSchema = z.object({
  fieldId: z.coerce.number(),
  groupId: z.coerce.number(),
  sortOrder: z.coerce.number().default(0),
});

export default function SettingsCustomFields() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("fields");
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [editField, setEditField] = useState<CustomField | null>(null);
  const [editGroup, setEditGroup] = useState<CustomFieldGroup | null>(null);
  const [editMapping, setEditMapping] = useState<CustomFieldGroupMapping | null>(null);
  const [entityFilter, setEntityFilter] = useState<string>("all");

  // Queries
  const { data: fields = [], isLoading: isFieldsLoading, refetch: refetchFields } = useQuery({
    queryKey: ["/api/custom-fields"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/custom-fields");
      return await res.json();
    },
  });

  const { data: groups = [], isLoading: isGroupsLoading, refetch: refetchGroups } = useQuery({
    queryKey: ["/api/custom-field-groups"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/custom-field-groups");
      return await res.json();
    },
  });

  const { data: mappings = [], isLoading: isMappingsLoading, refetch: refetchMappings } = useQuery({
    queryKey: ["/api/custom-field-mappings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/custom-field-mappings");
      return await res.json();
    },
  });

  // Field form
  const fieldForm = useForm<z.infer<typeof fieldFormSchema>>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "Text",
      entityType: "contact",
      isRequired: false,
      sortOrder: 0,
      isActive: true,
      showInList: false,
      showInDetail: true,
      showInForm: true,
    },
  });

  // Group form
  const groupForm = useForm<z.infer<typeof groupFormSchema>>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      label: "",
      entityType: "contact",
      sortOrder: 0,
      isActive: true,
    },
  });

  // Mapping form
  const mappingForm = useForm<z.infer<typeof mappingFormSchema>>({
    resolver: zodResolver(mappingFormSchema),
    defaultValues: {
      fieldId: 0,
      groupId: 0,
      sortOrder: 0,
    },
  });

  // Mutations
  const createFieldMutation = useMutation({
    mutationFn: async (data: z.infer<typeof fieldFormSchema>) => {
      const response = await apiRequest("POST", "/api/custom-fields", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      setIsFieldDialogOpen(false);
      fieldForm.reset();
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create custom field: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof fieldFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/custom-fields/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      setIsFieldDialogOpen(false);
      fieldForm.reset();
      setEditField(null);
      toast({
        title: "Success",
        description: "Custom field updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update custom field: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/custom-fields/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete custom field: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof groupFormSchema>) => {
      const response = await apiRequest("POST", "/api/custom-field-groups", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-field-groups"] });
      setIsGroupDialogOpen(false);
      groupForm.reset();
      toast({
        title: "Success",
        description: "Custom field group created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create custom field group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof groupFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/custom-field-groups/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-field-groups"] });
      setIsGroupDialogOpen(false);
      groupForm.reset();
      setEditGroup(null);
      toast({
        title: "Success",
        description: "Custom field group updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update custom field group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/custom-field-groups/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-field-groups"] });
      toast({
        title: "Success",
        description: "Custom field group deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete custom field group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createMappingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof mappingFormSchema>) => {
      const response = await apiRequest("POST", "/api/custom-field-mappings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-field-mappings"] });
      setIsMappingDialogOpen(false);
      mappingForm.reset();
      toast({
        title: "Success",
        description: "Field added to group successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add field to group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/custom-field-mappings/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-field-mappings"] });
      toast({
        title: "Success",
        description: "Field removed from group successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove field from group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (editField) {
      fieldForm.reset({
        name: editField.name,
        label: editField.label,
        type: editField.type,
        entityType: editField.entityType,
        options: editField.options ? JSON.stringify(editField.options) : undefined,
        isRequired: editField.isRequired,
        defaultValue: editField.defaultValue,
        placeholder: editField.placeholder,
        description: editField.description,
        sortOrder: editField.sortOrder,
        isActive: editField.isActive,
        showInList: editField.showInList,
        showInDetail: editField.showInDetail,
        showInForm: editField.showInForm,
      });
    }
  }, [editField, fieldForm]);

  useEffect(() => {
    if (editGroup) {
      groupForm.reset({
        name: editGroup.name,
        label: editGroup.label,
        entityType: editGroup.entityType,
        description: editGroup.description,
        sortOrder: editGroup.sortOrder,
        isActive: editGroup.isActive,
      });
    }
  }, [editGroup, groupForm]);

  useEffect(() => {
    if (editMapping) {
      mappingForm.reset({
        fieldId: editMapping.fieldId,
        groupId: editMapping.groupId,
        sortOrder: editMapping.sortOrder,
      });
    }
  }, [editMapping, mappingForm]);

  // Handle form submissions
  const onFieldSubmit = (data: z.infer<typeof fieldFormSchema>) => {
    // Process options if provided
    if (data.options && (data.type === "Dropdown" || data.type === "MultiSelect")) {
      try {
        const options = JSON.parse(data.options);
        data.options = options;
      } catch (e) {
        toast({
          title: "Invalid options format",
          description: "Options must be a valid JSON array",
          variant: "destructive",
        });
        return;
      }
    }

    if (editField) {
      updateFieldMutation.mutate({ id: editField.id, data });
    } else {
      createFieldMutation.mutate(data);
    }
  };

  const onGroupSubmit = (data: z.infer<typeof groupFormSchema>) => {
    if (editGroup) {
      updateGroupMutation.mutate({ id: editGroup.id, data });
    } else {
      createGroupMutation.mutate(data);
    }
  };

  const onMappingSubmit = (data: z.infer<typeof mappingFormSchema>) => {
    createMappingMutation.mutate(data);
  };

  // Filter fields by entity type
  const filteredFields = entityFilter === "all" 
    ? fields 
    : fields.filter((field: CustomField) => field.entityType === entityFilter);

  // Helper to find field and group names for mappings
  const getFieldName = (id: number) => {
    const field = fields.find((f: CustomField) => f.id === id);
    return field ? field.label : "Unknown Field";
  };

  const getGroupName = (id: number) => {
    const group = groups.find((g: CustomFieldGroup) => g.id === id);
    return group ? group.name : "Unknown Group";
  };

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              Custom Fields Management
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Create and manage custom fields for your CRM data
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button variant="outline" onClick={() => refetchFields()} className="mr-2">
              <RotateCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => {
              fieldForm.reset();
              setEditField(null);
              setIsFieldDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Custom Field
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fields" className="flex items-center">
              <Table className="w-4 h-4 mr-2" />
              Fields
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="mappings" className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Custom Fields</CardTitle>
                  <div className="flex items-center">
                    <Select defaultValue="all" onValueChange={setEntityFilter}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by entity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entities</SelectItem>
                        <SelectItem value="contact">Contacts</SelectItem>
                        <SelectItem value="account">Accounts</SelectItem>
                        <SelectItem value="lead">Leads</SelectItem>
                        <SelectItem value="opportunity">Opportunities</SelectItem>
                        <SelectItem value="task">Tasks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  Define custom fields to collect additional information for your records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFieldsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <RotateCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredFields.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No custom fields found.</p>
                    <Button onClick={() => {
                      fieldForm.reset();
                      setEditField(null);
                      setIsFieldDialogOpen(true);
                    }} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first custom field
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Label</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Display</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFields.map((field: CustomField) => (
                          <TableRow key={field.id}>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>{field.name}</TableCell>
                            <TableCell>{field.type}</TableCell>
                            <TableCell className="capitalize">{field.entityType}</TableCell>
                            <TableCell>{field.isRequired ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              {[
                                field.showInList && "List",
                                field.showInDetail && "Detail",
                                field.showInForm && "Form"
                              ].filter(Boolean).join(", ")}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${field.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                {field.isActive ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditField(field);
                                  setIsFieldDialogOpen(true);
                                }}
                                disabled={field.isSystem}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteFieldMutation.mutate(field.id)}
                                disabled={field.isSystem}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </UITable>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Field Groups</CardTitle>
                  <Button onClick={() => {
                    groupForm.reset();
                    setEditGroup(null);
                    setIsGroupDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Group
                  </Button>
                </div>
                <CardDescription>
                  Organize your custom fields into groups for better form layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGroupsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <RotateCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : groups.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No field groups found.</p>
                    <Button onClick={() => {
                      groupForm.reset();
                      setEditGroup(null);
                      setIsGroupDialogOpen(true);
                    }} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first field group
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((group: CustomFieldGroup) => (
                          <TableRow key={group.id}>
                            <TableCell>{group.name}</TableCell>
                            <TableCell>{group.label}</TableCell>
                            <TableCell className="capitalize">{group.entityType}</TableCell>
                            <TableCell>{group.description || "-"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs rounded-full ${group.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                {group.isActive ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditGroup(group);
                                  setIsGroupDialogOpen(true);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteGroupMutation.mutate(group.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </UITable>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mappings" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Field Group Assignments</CardTitle>
                  <Button onClick={() => {
                    mappingForm.reset();
                    setEditMapping(null);
                    setIsMappingDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field to Group
                  </Button>
                </div>
                <CardDescription>
                  Assign custom fields to groups to organize your form layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isMappingsLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <RotateCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : mappings.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No field assignments found.</p>
                    <Button onClick={() => {
                      mappingForm.reset();
                      setEditMapping(null);
                      setIsMappingDialogOpen(true);
                    }} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Assign your first field to a group
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <UITable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Sort Order</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappings.map((mapping: CustomFieldGroupMapping) => (
                          <TableRow key={mapping.id}>
                            <TableCell>{getFieldName(mapping.fieldId)}</TableCell>
                            <TableCell>{getGroupName(mapping.groupId)}</TableCell>
                            <TableCell>{mapping.sortOrder}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMappingMutation.mutate(mapping.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </UITable>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editField ? "Edit Custom Field" : "Create Custom Field"}</DialogTitle>
            <DialogDescription>
              {editField 
                ? "Update the details of your custom field below." 
                : "Add a new custom field to collect additional information."}
            </DialogDescription>
          </DialogHeader>
          <Form {...fieldForm}>
            <form onSubmit={fieldForm.handleSubmit(onFieldSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fieldForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Phone" {...field} />
                      </FormControl>
                      <FormDescription>
                        The label shown to users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="contact_phone" {...field} />
                      </FormControl>
                      <FormDescription>
                        API name (no spaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fieldForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={editField && editField.isSystem}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Text">Text</SelectItem>
                          <SelectItem value="TextArea">Text Area</SelectItem>
                          <SelectItem value="Number">Number</SelectItem>
                          <SelectItem value="Date">Date</SelectItem>
                          <SelectItem value="Boolean">Checkbox</SelectItem>
                          <SelectItem value="Dropdown">Dropdown</SelectItem>
                          <SelectItem value="MultiSelect">Multi-Select</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="URL">URL</SelectItem>
                          <SelectItem value="Currency">Currency</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={editField && editField.isSystem}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(fieldForm.watch("type") === "Dropdown" || fieldForm.watch("type") === "MultiSelect") && (
                <FormField
                  control={fieldForm.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Options (JSON array)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='["Option 1", "Option 2", "Option 3"]' 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter options as a JSON array
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fieldForm.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Value</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="placeholder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placeholder</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={fieldForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Help Text</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Helpful description for this field
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fieldForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Required Field</FormLabel>
                        <FormDescription>
                          Field must have a value
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-4">
                <FormField
                  control={fieldForm.control}
                  name="showInList"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show in List</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="showInDetail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show in Detail</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="showInForm"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show in Form</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={fieldForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createFieldMutation.isPending || updateFieldMutation.isPending}>
                  {createFieldMutation.isPending || updateFieldMutation.isPending ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editField ? "Update Field" : "Create Field"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Field Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editGroup ? "Edit Field Group" : "Create Field Group"}</DialogTitle>
            <DialogDescription>
              {editGroup 
                ? "Update the details of your field group below." 
                : "Create a new group to organize your custom fields."}
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={groupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="contact_details" {...field} />
                      </FormControl>
                      <FormDescription>
                        Internal name (no spaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Details" {...field} />
                      </FormControl>
                      <FormDescription>
                        Displayed to users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={groupForm.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={groupForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Show this group in forms
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={createGroupMutation.isPending || updateGroupMutation.isPending}>
                  {createGroupMutation.isPending || updateGroupMutation.isPending ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editGroup ? "Update Group" : "Create Group"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Field Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Field to Group</DialogTitle>
            <DialogDescription>
              Select a field and a group to create an assignment
            </DialogDescription>
          </DialogHeader>
          <Form {...mappingForm}>
            <form onSubmit={mappingForm.handleSubmit(onMappingSubmit)} className="space-y-4">
              <FormField
                control={mappingForm.control}
                name="fieldId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fields.map((f: CustomField) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.label} ({f.entityType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mappingForm.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map((g: CustomFieldGroup) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name} ({g.entityType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mappingForm.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Determines the field order within the group
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={createMappingMutation.isPending}>
                  {createMappingMutation.isPending ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Assign Field
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}