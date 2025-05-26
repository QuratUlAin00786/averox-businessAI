import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Plus, 
  ExternalLink, 
  Activity, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Download
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ZapierTrigger {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  sampleData: any;
}

interface ZapierAction {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    required: boolean;
  }>;
}

interface ZapierActivity {
  id: number;
  event: string;
  source: string;
  status: string;
  timestamp: string;
  data: any;
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch Zapier configuration data
  const { data: triggers = [], isLoading: triggersLoading } = useQuery({
    queryKey: ["/api/zapier/triggers"],
    select: (data: any) => data?.triggers || []
  });

  const { data: actions = [], isLoading: actionsLoading } = useQuery({
    queryKey: ["/api/zapier/actions"],
    select: (data: any) => data?.actions || []
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["/api/zapier/activity"],
    select: (data: any) => data?.activity || []
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/zapier/test"),
    onSuccess: () => {
      toast({
        title: "Connection Test Successful",
        description: "Zapier integration is working correctly!",
      });
    },
    onError: () => {
      toast({
        title: "Connection Test Failed",
        description: "Please check your Zapier configuration.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "delivered": return "bg-green-100 text-green-800";
      case "failed":
      case "error": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "failed":
      case "error": return <AlertCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect with 6,000+ apps through Zapier automation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
          >
            <Zap className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button asChild>
            <a 
              href="https://zapier.com/apps/averox-crm/integrations" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Zapier
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Triggers</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{triggers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ways to send data to other apps
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Actions</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ways to receive data from other apps
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activity.length}</div>
                <p className="text-xs text-muted-foreground">
                  Events in the last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Getting Started with Zapier
              </CardTitle>
              <CardDescription>
                Follow these steps to connect your CRM with thousands of other applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Create Zapier Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Sign up for a free Zapier account if you don't have one
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Find Averox CRM</h4>
                      <p className="text-sm text-muted-foreground">
                        Search for "Averox CRM" in the Zapier app directory
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Connect Your Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Use your CRM login credentials to authenticate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Create Your First Zap</h4>
                      <p className="text-sm text-muted-foreground">
                        Build automated workflows between apps
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Triggers</CardTitle>
              <CardDescription>
                These events can send data from your CRM to other applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {triggersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {triggers.map((trigger: ZapierTrigger) => (
                    <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{trigger.name}</h4>
                        <p className="text-sm text-muted-foreground">{trigger.description}</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {trigger.endpoint}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Send className="w-3 h-3 mr-1" />
                          Outbound
                        </Badge>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Setup
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
              <CardDescription>
                These actions can receive data from other applications into your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {actions.map((action: ZapierAction) => (
                    <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{action.name}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {action.fields.slice(0, 3).map((field) => (
                            <Badge key={field.key} variant="outline" className="text-xs">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Badge>
                          ))}
                          {action.fields.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{action.fields.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <Download className="w-3 h-3 mr-1" />
                          Inbound
                        </Badge>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Setup
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent webhook deliveries and integration events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here once you start using Zapier integrations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item: ZapierActivity) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </div>
                        <div>
                          <p className="font-medium">{item.event}</p>
                          <p className="text-sm text-muted-foreground">from {item.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}