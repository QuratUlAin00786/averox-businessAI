import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  KeyRound, 
  Plus, 
  RefreshCw, 
  DownloadCloud, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  BarChart, 
  Eye, 
  EyeOff,
  Mail,
  Phone
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Provider-specific additional field schemas
const sendGridFieldsSchema = z.object({
  fromEmail: z.string().email("Must be a valid email").optional(),
  fromName: z.string().min(1, "From name is required").optional(),
  replyToEmail: z.string().email("Must be a valid email").optional(),
});

const twilioFieldsSchema = z.object({
  accountSid: z.string().min(1, "Account SID is required").optional(),
  phoneNumber: z.string().min(1, "Phone number is required").optional(),
  messagingServiceSid: z.string().optional(),
});

const whatsappFieldsSchema = z.object({
  phoneNumber: z.string().min(1, "WhatsApp number is required").optional(),
  businessId: z.string().min(1, "Business ID is required").optional(),
  apiEndpoint: z.string().optional(),
});

// Address lookup provider schemas
const googlePlacesFieldsSchema = z.object({
  apiKey: z.string().min(1, "API Key is required").optional(),
  enabledRegions: z.string().optional(), // Comma-separated list of country codes
  restrictToCountry: z.string().optional(),
});

const loqateFieldsSchema = z.object({
  apiKey: z.string().min(1, "API Key is required").optional(),
  serviceUrl: z.string().optional(),
});

const smartyStreetsFieldsSchema = z.object({
  authId: z.string().min(1, "Auth ID is required").optional(),
  authToken: z.string().min(1, "Auth Token is required").optional(),
});

const postcodeApiFieldsSchema = z.object({
  apiKey: z.string().min(1, "API Key is required").optional(),
  serviceUrl: z.string().optional(),
});

// API key type matching the server schema
interface ApiKey {
  id: number;
  name: string;
  key: string;
  secret?: string | null;
  provider: string;
  ownerId: number;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  usageCount: number | null;
  lastUsed: Date | null;
  additionalFields?: {
    sendgrid?: {
      fromEmail?: string;
      fromName?: string;
      replyToEmail?: string;
    };
    twilio?: {
      accountSid?: string;
      phoneNumber?: string;
      messagingServiceSid?: string;
    };
    whatsapp?: {
      phoneNumber?: string;
      businessId?: string;
      apiEndpoint?: string;
    };
    googlePlaces?: {
      apiKey?: string;
      enabledRegions?: string;
      restrictToCountry?: string;
    };
    loqate?: {
      apiKey?: string;
      serviceUrl?: string;
    };
    smartyStreets?: {
      authId?: string;
      authToken?: string;
    };
    postcodeApi?: {
      apiKey?: string;
      serviceUrl?: string;
    };
    [key: string]: any;
  };
}

// Form schema for creating/editing API keys
const apiKeyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  provider: z.string().min(2, "Provider must be at least 2 characters"),
  key: z.string().min(5, "Key must be at least 5 characters"),
  secret: z.string().optional(),
  additionalFields: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

export default function ApiKeysManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState<{[key: number]: boolean}>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingApiKey, setDeletingApiKey] = useState<ApiKey | null>(null);

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/settings/api-keys'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/settings/api-keys');
      const data = await response.json();
      return data as ApiKey[];
    }
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (values: ApiKeyFormValues) => {
      const response = await apiRequest('POST', '/api/settings/api-keys', values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/settings/api-keys']});
      toast({
        title: "API Key Created",
        description: "The API key has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create API Key",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update API key mutation
  const updateApiKeyMutation = useMutation({
    mutationFn: async (values: ApiKeyFormValues & { id: number }) => {
      const { id, ...data } = values;
      const response = await apiRequest('PATCH', `/api/settings/api-keys/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/settings/api-keys']});
      toast({
        title: "API Key Updated",
        description: "The API key has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingApiKey(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update API Key",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/settings/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['/api/settings/api-keys']});
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setDeletingApiKey(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete API Key",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Form for creating new API keys
  const createForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      provider: "",
      key: "",
      secret: "",
      isActive: true,
    },
  });

  // Form for editing API keys
  const editForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      provider: "",
      key: "",
      secret: "",
      isActive: true,
    },
  });

  // Function to handle opening the edit dialog
  const handleEditClick = (apiKey: ApiKey) => {
    setEditingApiKey(apiKey);
    editForm.reset({
      name: apiKey.name,
      provider: apiKey.provider,
      key: apiKey.key,
      secret: apiKey.secret || "",
      isActive: apiKey.isActive || false,
      additionalFields: apiKey.additionalFields || {},
    });
    setIsEditDialogOpen(true);
  };

  // Function to handle opening the delete dialog
  const handleDeleteClick = (apiKey: ApiKey) => {
    setDeletingApiKey(apiKey);
    setIsDeleteDialogOpen(true);
  };

  // Function to toggle showing/hiding API secrets
  const toggleShowSecret = (id: number) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Function to format the date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <KeyRound className="mr-2 h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for external service integrations
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-1">
                <Plus className="mr-2 h-4 w-4" /> Add API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Add a new API key for external service integration.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((data) => createApiKeyMutation.mutate(data))} className="space-y-6">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="OpenAI API Key" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for the API key
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset additional fields when changing provider
                            createForm.setValue('additionalFields', {});
                            
                            // Set appropriate defaults for provider-specific fields
                            if (value === "SendGrid") {
                              createForm.setValue('additionalFields', {
                                sendgrid: {
                                  fromEmail: "",
                                  fromName: "",
                                  replyToEmail: ""
                                }
                              });
                            } else if (value === "Twilio") {
                              createForm.setValue('additionalFields', {
                                twilio: {
                                  accountSid: "",
                                  phoneNumber: "",
                                  messagingServiceSid: ""
                                }
                              });
                            } else if (value === "WhatsApp") {
                              createForm.setValue('additionalFields', {
                                whatsapp: {
                                  phoneNumber: "",
                                  businessId: "",
                                  apiEndpoint: ""
                                }
                              });
                            } else if (value === "GooglePlaces") {
                              createForm.setValue('additionalFields', {
                                googlePlaces: {
                                  apiKey: "",
                                  enabledRegions: "GB,US",
                                  restrictToCountry: ""
                                }
                              });
                            } else if (value === "Loqate") {
                              createForm.setValue('additionalFields', {
                                loqate: {
                                  apiKey: "",
                                  serviceUrl: ""
                                }
                              });
                            } else if (value === "SmartyStreets") {
                              createForm.setValue('additionalFields', {
                                smartyStreets: {
                                  authId: "",
                                  authToken: ""
                                }
                              });
                            } else if (value === "PostcodeAPI") {
                              createForm.setValue('additionalFields', {
                                postcodeApi: {
                                  apiKey: "",
                                  serviceUrl: ""
                                }
                              });
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="OpenAI">OpenAI</SelectItem>
                            <SelectItem value="Stripe">Stripe</SelectItem>
                            <SelectItem value="SendGrid">SendGrid</SelectItem>
                            <SelectItem value="Twilio">Twilio</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            <SelectItem value="Google">Google</SelectItem>
                            <SelectItem value="AWS">AWS</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Messenger">Messenger</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            
                            {/* Address Lookup Providers */}
                            <SelectGroup>
                              <SelectLabel>Address Lookup Services</SelectLabel>
                              <SelectItem value="GooglePlaces">Google Places API</SelectItem>
                              <SelectItem value="Loqate">Loqate/PCA</SelectItem>
                              <SelectItem value="SmartyStreets">SmartyStreets</SelectItem>
                              <SelectItem value="PostcodeAPI">Postcode API</SelectItem>
                            </SelectGroup>
                            
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The service provider this key belongs to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="sk_test_1234567890abcdef" {...field} />
                        </FormControl>
                        <FormDescription>
                          The public key or identifier for the API
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret (Optional)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="API Secret" {...field} />
                        </FormControl>
                        <FormDescription>
                          Any secret associated with this API key (will be securely stored)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* SendGrid specific fields */}
                  {createForm.watch('provider') === 'SendGrid' && (
                    <div className="space-y-4">
                      <div className="mt-2 mb-3">
                        <h4 className="text-sm font-medium mb-2">SendGrid Configuration</h4>
                        <div className="text-sm text-muted-foreground">
                          Configure sender details for email communications
                        </div>
                      </div>
                      <FormField
                        control={createForm.control}
                        name="additionalFields.sendgrid.fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input placeholder="noreply@yourcompany.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address that will appear as the sender
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="additionalFields.sendgrid.fromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company Name" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name that will appear as the sender
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="additionalFields.sendgrid.replyToEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reply-To Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="support@yourcompany.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address for recipients to reply to
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Twilio specific fields */}
                  {createForm.watch('provider') === 'Twilio' && (
                    <div className="space-y-4">
                      <div className="mt-2 mb-3">
                        <h4 className="text-sm font-medium mb-2">Twilio Configuration</h4>
                        <div className="text-sm text-muted-foreground">
                          Configure Twilio for SMS and WhatsApp communications
                        </div>
                      </div>
                      <FormField
                        control={createForm.control}
                        name="additionalFields.twilio.accountSid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account SID</FormLabel>
                            <FormControl>
                              <Input placeholder="AC1234567890abcdef1234567890abcdef" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your Twilio Account SID (starts with AC)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="additionalFields.twilio.phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+12345678901" {...field} />
                            </FormControl>
                            <FormDescription>
                              Twilio phone number for sending messages (with country code)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="additionalFields.twilio.messagingServiceSid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Messaging Service SID (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="MG1234567890abcdef1234567890abcdef" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your Twilio Messaging Service SID (starts with MG)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* WhatsApp specific fields */}
                  {createForm.watch('provider') === 'WhatsApp' && (
                    <div className="space-y-4">
                      <div className="mt-2 mb-3">
                        <h4 className="text-sm font-medium mb-2">WhatsApp Configuration</h4>
                        <div className="text-sm text-muted-foreground">
                          Configure WhatsApp Business API integration details
                        </div>
                      </div>
                      <FormField
                        control={createForm.control}
                        name="additionalFields.whatsapp.phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+15551234567" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your registered WhatsApp Business phone number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="additionalFields.whatsapp.businessId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Account ID</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789012345" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your WhatsApp Business Account ID
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="additionalFields.whatsapp.apiEndpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Endpoint (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://graph.facebook.com/v14.0" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional: Custom API endpoint for WhatsApp Business API
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={createForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Enable or disable this API key
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createApiKeyMutation.isPending}>
                      {createApiKeyMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <KeyRound className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys</h3>
              <p className="text-muted-foreground">
                You haven't added any API keys yet. Click 'Add API Key' to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Secret</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize font-normal">
                          {apiKey.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <div className="max-w-[100px] truncate" title={apiKey.key}>
                          {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 4)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {apiKey.secret ? (
                          <div className="flex items-center text-xs font-mono space-x-1">
                            <div className="max-w-[100px] truncate">
                              {showSecrets[apiKey.id] 
                                ? apiKey.secret 
                                : '••••••••••••••••••••'}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0" 
                                    onClick={() => toggleShowSecret(apiKey.id)}
                                  >
                                    {showSecrets[apiKey.id] ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {showSecrets[apiKey.id] ? "Hide Secret" : "Show Secret"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {apiKey.isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                            <Check className="mr-1 h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                            <X className="mr-1 h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <BarChart className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {apiKey.usageCount || 0}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {apiKey.usageCount || 0} API calls made with this key
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {formatDate(apiKey.createdAt)}
                      </TableCell>
                      <TableCell>
                        {formatDate(apiKey.lastUsed)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(apiKey)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(apiKey)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit API Key Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update the API key details.
            </DialogDescription>
          </DialogHeader>
          {editingApiKey && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit((data) => 
                  updateApiKeyMutation.mutate({ ...data, id: editingApiKey.id })
                )} 
                className="space-y-6"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset additional fields when changing provider
                          editForm.setValue('additionalFields', {});
                          
                          // Set appropriate defaults for provider-specific fields
                          if (value === "SendGrid") {
                            editForm.setValue('additionalFields', {
                              sendgrid: {
                                fromEmail: editingApiKey?.additionalFields?.sendgrid?.fromEmail || "",
                                fromName: editingApiKey?.additionalFields?.sendgrid?.fromName || "",
                                replyToEmail: editingApiKey?.additionalFields?.sendgrid?.replyToEmail || ""
                              }
                            });
                          } else if (value === "Twilio") {
                            editForm.setValue('additionalFields', {
                              twilio: {
                                accountSid: editingApiKey?.additionalFields?.twilio?.accountSid || "",
                                phoneNumber: editingApiKey?.additionalFields?.twilio?.phoneNumber || "",
                                messagingServiceSid: editingApiKey?.additionalFields?.twilio?.messagingServiceSid || ""
                              }
                            });
                          } else if (value === "WhatsApp") {
                            editForm.setValue('additionalFields', {
                              whatsapp: {
                                phoneNumber: editingApiKey?.additionalFields?.whatsapp?.phoneNumber || "",
                                businessId: editingApiKey?.additionalFields?.whatsapp?.businessId || "",
                                apiEndpoint: editingApiKey?.additionalFields?.whatsapp?.apiEndpoint || ""
                              }
                            });
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OpenAI">OpenAI</SelectItem>
                          <SelectItem value="Stripe">Stripe</SelectItem>
                          <SelectItem value="SendGrid">SendGrid</SelectItem>
                          <SelectItem value="Twilio">Twilio</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Google">Google</SelectItem>
                          <SelectItem value="AWS">AWS</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Messenger">Messenger</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          
                          <SelectGroup>
                            <SelectLabel>Address Lookup Services</SelectLabel>
                            <SelectItem value="GooglePlaces">Google Places API</SelectItem>
                            <SelectItem value="Loqate">Loqate/PCA</SelectItem>
                            <SelectItem value="SmartyStreets">SmartyStreets</SelectItem>
                            <SelectItem value="PostcodeAPI">Postcode API</SelectItem>
                          </SelectGroup>
                          
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Secret (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to keep existing secret
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* SendGrid specific fields */}
                {editForm.watch('provider') === 'SendGrid' && (
                  <div className="space-y-4">
                    <div className="mt-2 mb-3">
                      <h4 className="text-sm font-medium mb-2">SendGrid Configuration</h4>
                      <div className="text-sm text-muted-foreground">
                        Configure sender details for email communications
                      </div>
                    </div>
                    <FormField
                      control={editForm.control}
                      name="additionalFields.sendgrid.fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input placeholder="noreply@yourcompany.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address that will appear as the sender
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="additionalFields.sendgrid.fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Name" {...field} />
                          </FormControl>
                          <FormDescription>
                            Name that will appear as the sender
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="additionalFields.sendgrid.replyToEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reply-To Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="support@yourcompany.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email address for recipients to reply to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Twilio specific fields */}
                {editForm.watch('provider') === 'Twilio' && (
                  <div className="space-y-4">
                    <div className="mt-2 mb-3">
                      <h4 className="text-sm font-medium mb-2">Twilio Configuration</h4>
                      <div className="text-sm text-muted-foreground">
                        Configure Twilio for SMS and WhatsApp communications
                      </div>
                    </div>
                    <FormField
                      control={editForm.control}
                      name="additionalFields.twilio.accountSid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account SID</FormLabel>
                          <FormControl>
                            <Input placeholder="AC1234567890abcdef1234567890abcdef" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your Twilio Account SID (starts with AC)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="additionalFields.twilio.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+12345678901" {...field} />
                          </FormControl>
                          <FormDescription>
                            Twilio phone number for sending messages (with country code)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="additionalFields.twilio.messagingServiceSid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Messaging Service SID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="MG1234567890abcdef1234567890abcdef" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your Twilio Messaging Service SID (starts with MG)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* WhatsApp specific fields */}
                {editForm.watch('provider') === 'WhatsApp' && (
                  <div className="space-y-4">
                    <div className="mt-2 mb-3">
                      <h4 className="text-sm font-medium mb-2">WhatsApp Configuration</h4>
                      <div className="text-sm text-muted-foreground">
                        Configure WhatsApp Business API integration details
                      </div>
                    </div>
                    <FormField
                      control={editForm.control}
                      name="additionalFields.whatsapp.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+15551234567" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your registered WhatsApp Business phone number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="additionalFields.whatsapp.businessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Account ID</FormLabel>
                          <FormControl>
                            <Input placeholder="123456789012345" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your WhatsApp Business Account ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="additionalFields.whatsapp.apiEndpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Endpoint (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://graph.facebook.com/v14.0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional: Custom API endpoint for WhatsApp Business API
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Enable or disable this API key
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={updateApiKeyMutation.isPending}>
                    {updateApiKeyMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete API Key Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingApiKey && (
            <>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">{deletingApiKey.name}</p>
                <p className="text-sm text-muted-foreground">Provider: {deletingApiKey.provider}</p>
                <p className="text-xs font-mono mt-2">
                  Key: {deletingApiKey.key.substring(0, 8)}...{deletingApiKey.key.substring(deletingApiKey.key.length - 4)}
                </p>
              </div>
              <DialogFooter className="flex space-x-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteApiKeyMutation.mutate(deletingApiKey.id)}
                  disabled={deleteApiKeyMutation.isPending}
                >
                  {deleteApiKeyMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* API Key Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BarChart className="mr-2 h-5 w-5" />
            API Key Usage Statistics
          </CardTitle>
          <CardDescription>
            Monitor the usage patterns of your API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <BarChart className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Usage Data</h3>
              <p className="text-muted-foreground">
                Start using API keys to see usage statistics here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{apiKeys.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {apiKeys.filter(k => k.isActive).length} active, {apiKeys.filter(k => !k.isActive).length} inactive
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {apiKeys.reduce((sum, key) => sum + (key.usageCount || 0), 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all API keys
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Most Used Provider</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {apiKeys.length > 0 ? (
                      <>
                        <div className="text-2xl font-bold">
                          {Object.entries(
                            apiKeys.reduce((acc, key) => {
                              const provider = key.provider;
                              acc[provider] = (acc[provider] || 0) + (key.usageCount || 0);
                              return acc;
                            }, {} as {[key: string]: number})
                          ).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on API call volume
                        </p>
                      </>
                    ) : (
                      <div className="text-2xl font-bold">None</div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Most Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {apiKeys.some(k => k.lastUsed) ? (
                      <>
                        <div className="text-2xl font-bold">
                          {formatDate(
                            apiKeys.reduce((latest, key) => {
                              if (!key.lastUsed) return latest;
                              if (!latest) return key.lastUsed;
                              return new Date(key.lastUsed) > new Date(latest) 
                                ? key.lastUsed 
                                : latest;
                            }, null as Date | null)
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last API key usage
                        </p>
                      </>
                    ) : (
                      <div className="text-2xl font-bold">Never</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Usage by Provider</h3>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>API Keys</TableHead>
                        <TableHead>Total Usage</TableHead>
                        <TableHead>Active Keys</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(
                        apiKeys.reduce((acc, key) => {
                          const provider = key.provider;
                          if (!acc[provider]) {
                            acc[provider] = {
                              count: 0,
                              usage: 0,
                              active: 0,
                            };
                          }
                          acc[provider].count++;
                          acc[provider].usage += key.usageCount || 0;
                          if (key.isActive) acc[provider].active++;
                          return acc;
                        }, {} as {[key: string]: {count: number, usage: number, active: number}})
                      ).sort((a, b) => b[1].usage - a[1].usage).map(([provider, stats]) => (
                        <TableRow key={provider}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="capitalize font-normal">
                              {provider}
                            </Badge>
                          </TableCell>
                          <TableCell>{stats.count}</TableCell>
                          <TableCell>{stats.usage}</TableCell>
                          <TableCell>{stats.active} of {stats.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}