import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, PlusCircle, Edit, Trash2, CheckCircle, XCircle, LineChart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ApiKey, InsertApiKey } from "@shared/schema";

// Additional schema for form validation
const apiKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  key: z.string().min(1, "API Key is required"),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
  ownerId: z.number().optional(), // Will be set from current user
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

// API key stats interface for the stats endpoint
interface ApiKeyStats {
  totalRequests: number;
  successRate: string;
  lastUsed: string | null;
  usageByDay?: {
    date: string;
    count: number;
  }[];
}

// Stats component for each API key
const ApiKeyStats = ({ apiKeyId }: { apiKeyId: number }) => {
  const { data, isLoading } = useQuery<ApiKeyStats>({
    queryKey: [`/api/settings/api-keys/${apiKeyId}/stats`],
  });

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">No statistics available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRequests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.successRate || "0%"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">
              {data.lastUsed ? new Date(data.lastUsed).toLocaleString() : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {data.usageByDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex items-center justify-center">
              <LineChart className="h-16 w-16 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Usage chart will appear here</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ApiKeysManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showStats, setShowStats] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Admin check
  const isAdmin = user?.role === "Admin";
  
  // API keys query
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/settings/api-keys"],
    enabled: isAdmin,
  });

  // Form for adding/editing API keys
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: "",
      provider: "",
      key: "",
      secret: "",
      isActive: true,
    },
  });

  // Reset form when editing key changes
  useEffect(() => {
    if (editingKey) {
      form.reset({
        name: editingKey.name,
        provider: editingKey.provider,
        key: editingKey.key,
        secret: editingKey.secret || "",
        isActive: editingKey.isActive || false,
      });
    } else {
      form.reset({
        name: "",
        provider: "",
        key: "",
        secret: "",
        isActive: true,
      });
    }
  }, [editingKey, form]);

  // Add API key mutation
  const addMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      const res = await apiRequest("POST", "/api/settings/api-keys", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key added",
        description: "The API key has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api-keys"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update API key mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; apiKey: ApiKeyFormValues }) => {
      const res = await apiRequest("PATCH", `/api/settings/api-keys/${data.id}`, data.apiKey);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key updated",
        description: "The API key has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api-keys"] });
      setIsDialogOpen(false);
      setEditingKey(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/settings/api-keys/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key deleted",
        description: "The API key has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api-keys"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (values: ApiKeyFormValues) => {
    if (editingKey) {
      updateMutation.mutate({ id: editingKey.id, apiKey: values });
    } else {
      addMutation.mutate(values);
    }
  };

  // If not admin, show message
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys Management</CardTitle>
          <CardDescription>
            You need administrator privileges to manage API keys.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">API Keys Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingKey(null);
                form.reset();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Edit API Key" : "Add New API Key"}</DialogTitle>
              <DialogDescription>
                {editingKey 
                  ? "Update the API key details below." 
                  : "Enter the details of the API key you want to add."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="OpenAI API" {...field} />
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
                      <FormLabel>Provider</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Secret (optional)</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingKey(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={addMutation.isPending || updateMutation.isPending}
                  >
                    {(addMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingKey ? "Update" : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage all API keys for external service integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {apiKey.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {apiKey.key.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {apiKey.isActive ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {apiKey.usageCount || 0} requests
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowStats(apiKey.id === showStats ? null : apiKey.id)}
                        >
                          <LineChart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingKey(apiKey);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this API key?")) {
                              deleteMutation.mutate(apiKey.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {showStats !== null && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/50 p-4">
                      <ApiKeyStats apiKeyId={showStats} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No API keys found. Add your first API key to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeysManagement;