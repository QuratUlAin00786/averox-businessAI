import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface SocialIntegration {
  id: number;
  userId: number;
  platform: string;
  accountId: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

interface IntegrationFormProps {
  integration: SocialIntegration | null;
  onSuccess: () => void;
}

const integrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  platform: z.string().min(1, "Platform is required"),
  accountId: z.string().min(1, "Account ID is required"),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.record(z.string(), z.any()).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  baseUrl: z.string().optional(),
  fromNumber: z.string().optional(),
  fromEmail: z.string().optional(),
  authType: z.string().optional(),
});

type FormValues = z.infer<typeof integrationSchema>;

export function IntegrationForm({ integration, onSuccess }: IntegrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultValues: FormValues = {
    name: integration?.name || "",
    platform: integration?.platform || "",
    accountId: integration?.accountId || "",
    accessToken: integration?.accessToken || "",
    refreshToken: integration?.refreshToken || "",
    tokenExpiry: integration?.tokenExpiry || "",
    isActive: integration?.isActive !== undefined ? integration.isActive : true,
    settings: integration?.settings || {},
    apiKey: integration?.settings?.apiKey || "",
    apiSecret: integration?.settings?.apiSecret || "",
    baseUrl: integration?.settings?.baseUrl || "",
    fromNumber: integration?.settings?.fromNumber || "",
    fromEmail: integration?.settings?.fromEmail || "",
    authType: integration?.settings?.authType || "oauth",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues,
  });

  const platformValue = form.watch("platform");

  // Create or update integration mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Construct settings object from form fields
      const settings: Record<string, any> = {
        ...(values.settings || {}),
      };
      
      // Add platform-specific settings
      if (values.apiKey) settings.apiKey = values.apiKey;
      if (values.apiSecret) settings.apiSecret = values.apiSecret;
      if (values.baseUrl) settings.baseUrl = values.baseUrl;
      if (values.fromNumber) settings.fromNumber = values.fromNumber;
      if (values.fromEmail) settings.fromEmail = values.fromEmail;
      if (values.authType) settings.authType = values.authType;

      const data = {
        name: values.name,
        platform: values.platform,
        accountId: values.accountId,
        accessToken: values.accessToken,
        refreshToken: values.refreshToken,
        tokenExpiry: values.tokenExpiry,
        isActive: values.isActive,
        settings,
      };

      let response;
      if (integration?.id) {
        // Update existing integration
        response = await apiRequest(
          "PATCH",
          `/api/social-integrations/${integration.id}`,
          data
        );
      } else {
        // Create new integration
        response = await apiRequest("POST", "/api/social-integrations", data);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save integration");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: integration ? "Integration updated" : "Integration created",
        description: integration
          ? "The integration has been updated successfully"
          : "The integration has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-integrations"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  // Get platform-specific fields
  const renderPlatformFields = () => {
    switch (platformValue) {
      case "Email":
        return (
          <>
            <FormField
              control={form.control}
              name="fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="noreply@yourcompany.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The email address messages will be sent from
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email service API key"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    API key for your email service provider (SendGrid, Mailgun, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "WhatsApp":
        return (
          <>
            <FormField
              control={form.control}
              name="fromNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    The WhatsApp Business number to send messages from
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="WhatsApp Business API key"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.service.com/v1" {...field} />
                  </FormControl>
                  <FormDescription>
                    The base URL for your WhatsApp Business API provider
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "Facebook":
      case "Messenger":
      case "Instagram":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Facebook App ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Secret</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Facebook App Secret"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select auth type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="oauth">OAuth</SelectItem>
                      <SelectItem value="token">Access Token</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Authentication method for Facebook API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "Twitter":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Twitter API Key" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Twitter API Secret"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "LinkedIn":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="LinkedIn Client ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="LinkedIn Client Secret"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "Other":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="API Key" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="API Secret"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.service.com/v1" {...field} />
                  </FormControl>
                  <FormDescription>The base URL for the API</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Integration Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Integration" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for this integration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Messenger">Messenger</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The communication platform for this integration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account ID</FormLabel>
                <FormControl>
                  <Input placeholder="account_123456" {...field} />
                </FormControl>
                <FormDescription>
                  Your account ID for this integration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Integration Status
                  </FormLabel>
                  <FormDescription>
                    Enable or disable this integration
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
        </div>

        <div className="space-y-6 rounded-lg border p-6">
          <h3 className="font-medium">Authentication Details</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Access token"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refreshToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Token (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Refresh token"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used to refresh the access token automatically
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tokenExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Expiry Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When the access token expires
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {platformValue && (
          <div className="space-y-6 rounded-lg border p-6">
            <h3 className="font-medium">
              {platformValue} Specific Configuration
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {renderPlatformFields()}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Save Integration
          </Button>
        </div>
      </form>
    </Form>
  );
}