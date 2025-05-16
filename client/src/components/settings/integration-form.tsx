import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  platform: z.enum([
    "Facebook", 
    "LinkedIn", 
    "Twitter", 
    "Instagram", 
    "WhatsApp", 
    "Email",
    "Messenger", 
    "Other"
  ]),
  accountId: z.string().min(1, "Account ID is required"),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional(),
  tokenExpiry: z.string().optional(),
  webhookUrl: z.string().optional(),
  webhookSecret: z.string().optional(),
  apiEndpoint: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  phoneNumber: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.record(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface IntegrationFormProps {
  integration?: any;
  onSuccess?: () => void;
}

export function IntegrationForm({ integration, onSuccess }: IntegrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Pre-fill form with existing integration data or use defaults
  const defaultValues: Partial<FormValues> = integration
    ? {
        ...integration,
        settings: integration.settings || {},
      }
    : {
        name: "",
        platform: "Email",
        accountId: "",
        accessToken: "",
        isActive: true,
        settings: {},
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/social-integrations", values);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create integration");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration created",
        description: "Your integration has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-integrations"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest(
        "PATCH",
        `/api/social-integrations/${integration.id}`,
        values
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update integration");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Integration updated",
        description: "Your integration has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-integrations"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update integration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    if (integration) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  // Get selected platform to show platform-specific fields
  const selectedPlatform = form.watch("platform");

  // Track mutation state
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Get platform-specific fields
  const renderPlatformFields = () => {
    switch (selectedPlatform) {
      case "Facebook":
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
                  <FormDescription>
                    Your Facebook App ID from the Developer Console
                  </FormDescription>
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
                    <Input placeholder="Facebook App Secret" type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Facebook App Secret from the Developer Console
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Webhook URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL where Facebook will send webhook events
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
                    <Input placeholder="Twitter API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Twitter API Key from the Developer Portal
                  </FormDescription>
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
                    <Input placeholder="Twitter API Secret" type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Twitter API Secret from the Developer Portal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.bearerToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bearer Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Twitter Bearer Token" type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Twitter Bearer Token for API access
                  </FormDescription>
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
                  <FormDescription>
                    Your LinkedIn Client ID from Developer Portal
                  </FormDescription>
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
                    <Input placeholder="LinkedIn Client Secret" type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your LinkedIn Client Secret from Developer Portal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.redirectUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redirect URI</FormLabel>
                  <FormControl>
                    <Input placeholder="Redirect URI" {...field} />
                  </FormControl>
                  <FormDescription>
                    The URI where LinkedIn redirects after authentication
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
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="WhatsApp Business API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your WhatsApp Business API Key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="WhatsApp Business Phone Number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your WhatsApp Business Phone Number with country code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.businessAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Account ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Business Account ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your WhatsApp Business Account ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "Messenger":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Access Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Messenger Page Access Token" type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Facebook Page Access Token with messaging permissions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.pageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Facebook Page ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Facebook Page ID for Messenger
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.verifyToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verify Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Webhook Verify Token" {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom token to verify webhook subscription
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "Email":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Email Service API Key" type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email service provider API key (SendGrid, Mailchimp, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="noreply@yourcompany.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email address used as the sender
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name to display as the sender
                  </FormDescription>
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
              name="apiEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Base URL of the service API
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
                    <Input placeholder="API Secret" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="settings.custom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Settings (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"key1": "value1", "key2": "value2"}'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional settings in JSON format
                  </FormDescription>
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
                  A friendly name to identify this integration
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
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Messenger">Messenger</SelectItem>
                    <SelectItem value="Other">Other (SMS, Phone, etc)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The social platform for this integration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account ID</FormLabel>
                <FormControl>
                  <Input placeholder="Account identifier" {...field} />
                </FormControl>
                <FormDescription>
                  Your account identifier on this platform
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
                  <FormLabel className="text-base">Active</FormLabel>
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

        {/* Platform-specific fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {renderPlatformFields()}
        </div>

        {/* Authorization tokens (common across most platforms) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="accessToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Token</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Access token for authentication" 
                    type="password"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  OAuth access token for this integration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="refreshToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refresh Token (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Refresh token" 
                    type="password"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  OAuth refresh token to renew access
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {integration ? "Update Integration" : "Create Integration"}
          </Button>
        </div>
      </form>
    </Form>
  );
}