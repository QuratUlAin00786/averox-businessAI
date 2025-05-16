import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  RefreshCw,
  Check,
  X,
  Settings,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { IntegrationForm } from "@/components/settings/integration-form";
import { 
  FaWhatsapp, 
  FaFacebookMessenger, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaFacebook 
} from "react-icons/fa";

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

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SocialIntegration | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<number | null>(null);

  // Fetch social integrations
  const { data: integrations = [], isLoading, isError, refetch } = useQuery<SocialIntegration[]>({
    queryKey: ["/api/social-integrations"],
  });

  // Delete integration mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/social-integrations/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete integration");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Integration deleted",
        description: "The integration has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-integrations"] });
      setIsDeleteDialogOpen(false);
      setIntegrationToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/social-integrations/${id}/test`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Integration test failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Integration test successful",
        description: data.message || "The integration is working properly",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Integration test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/social-integrations/${id}/refresh-token`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to refresh token");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Token refreshed",
        description: "The integration token has been refreshed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-integrations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Token refresh failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle opening form dialog
  const handleAddIntegration = () => {
    setSelectedIntegration(null);
    setIsFormOpen(true);
  };

  // Handle editing an integration
  const handleEditIntegration = (integration: SocialIntegration) => {
    setSelectedIntegration(integration);
    setIsFormOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteClick = (id: number) => {
    setIntegrationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (integrationToDelete !== null) {
      deleteMutation.mutate(integrationToDelete);
    }
  };

  // Test integration
  const handleTestIntegration = (id: number) => {
    testIntegrationMutation.mutate(id);
  };

  // Refresh token
  const handleRefreshToken = (id: number) => {
    refreshTokenMutation.mutate(id);
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return <FaFacebook className="h-6 w-6 text-blue-600" />;
      case "Twitter":
        return <FaTwitter className="h-6 w-6 text-blue-400" />;
      case "LinkedIn":
        return <FaLinkedin className="h-6 w-6 text-blue-700" />;
      case "Instagram":
        return <FaInstagram className="h-6 w-6 text-pink-500" />;
      case "WhatsApp":
        return <FaWhatsapp className="h-6 w-6 text-green-500" />;
      case "Email":
        return <Mail className="h-6 w-6 text-gray-500" />;
      case "Messenger":
        return <FaFacebookMessenger className="h-6 w-6 text-blue-500" />;
      case "Other":
        return <Phone className="h-6 w-6 text-purple-500" />;
      default:
        return <MessageSquare className="h-6 w-6 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <div className="text-2xl font-bold">Failed to load integrations</div>
        <p className="text-muted-foreground">
          There was an error loading your communication integrations.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Integrations</h1>
          <p className="text-muted-foreground">
            Manage connections to communication platforms and services
          </p>
        </div>
        <Button onClick={handleAddIntegration}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No Integrations Yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Add integrations to enable communication channels like email, SMS, WhatsApp, 
              social media platforms, and more.
            </p>
            <Button onClick={handleAddIntegration}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={integration.isActive ? "default" : "outline"}
                    className={integration.isActive ? "bg-green-500" : ""}
                  >
                    {integration.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditIntegration(integration)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(integration.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getPlatformIcon(integration.platform)}
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription>
                      {integration.platform} • Added{" "}
                      {new Date(integration.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Account ID:</span>{" "}
                    {integration.accountId}
                  </div>
                  {integration.tokenExpiry && (
                    <div>
                      <span className="font-medium">Token Expires:</span>{" "}
                      {new Date(integration.tokenExpiry).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {integration.settings && (
                  <div className="mt-3 border-t pt-3">
                    <h4 className="mb-1 font-medium">Configuration</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {Object.entries(integration.settings)
                        .filter(([key]) => !key.includes("secret") && !key.includes("token") && !key.includes("key"))
                        .map(([key, value]) => (
                          <li key={key} className="truncate">
                            <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                            {typeof value === "string" && value}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/40 px-6 py-3">
                <div className="flex w-full justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleTestIntegration(integration.id)}
                    disabled={!integration.isActive || testIntegrationMutation.isPending}
                  >
                    {testIntegrationMutation.isPending ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-3 w-3" />
                    )}
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleRefreshToken(integration.id)}
                    disabled={
                      !integration.isActive ||
                      refreshTokenMutation.isPending ||
                      !integration.refreshToken
                    }
                  >
                    {refreshTokenMutation.isPending ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-3 w-3" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration ? "Edit Integration" : "Add Integration"}
            </DialogTitle>
            <DialogDescription>
              Configure your communication platform integration
            </DialogDescription>
          </DialogHeader>
          <IntegrationForm
            integration={selectedIntegration}
            onSuccess={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this integration? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}