import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mail, 
  Users,
  PieChart, 
  Link as LinkIcon, 
  Clock, 
  ArrowUp, 
  BarChart3, 
  Plus, 
  Calendar, 
  HardDriveDownload, 
  Megaphone, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Real data interfaces
interface MarketingCampaign {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'social' | 'automation';
  status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  conversionCount: number;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
}

interface MarketingAutomation {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'draft';
  triggerType: 'lead_created' | 'contact_added' | 'opportunity_stage' | 'date_based';
  contactCount: number;
  steps: number;
  conversionRate: number;
  createdAt: string;
}

interface MarketingMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  conversionRate: number;
  recentActivity: Array<{
    action: string;
    target: string;
    timestamp: string;
  }>;
}

export default function Marketing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Dialog state
  const [isCreateAutomationOpen, setIsCreateAutomationOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [automationForm, setAutomationForm] = useState({
    name: '',
    triggerType: 'lead_created' as const,
    description: '',
    actions: [] as string[]
  });
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email' as const,
    description: '',
    recipientCount: 0
  });

  // Real API queries
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/marketing/campaigns'],
    queryFn: () => apiRequest('GET', '/api/marketing/campaigns'),
  });

  const { data: automationsData, isLoading: isLoadingAutomations } = useQuery({
    queryKey: ['/api/marketing/automations'],
    queryFn: () => apiRequest('GET', '/api/marketing/automations'),
  });

  // Ensure data is always an array
  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];
  const automations = Array.isArray(automationsData) ? automationsData : [];

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/marketing/metrics'],
    queryFn: () => apiRequest('GET', '/api/marketing/metrics'),
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: (campaignData: Partial<MarketingCampaign>) => 
      apiRequest('POST', '/api/marketing/campaigns', campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/metrics'] });
      setIsCreateCampaignOpen(false);
      setCampaignForm({
        name: '',
        type: 'email',
        description: '',
        recipientCount: 0
      });
      toast({
        title: "Campaign Created",
        description: "Your marketing campaign has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create campaign.",
        variant: "destructive",
      });
    }
  });

  const createAutomationMutation = useMutation({
    mutationFn: (automationData: Partial<MarketingAutomation>) => 
      apiRequest('POST', '/api/marketing/automations', automationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/automations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/metrics'] });
      setIsCreateAutomationOpen(false);
      setAutomationForm({
        name: '',
        triggerType: 'lead_created',
        description: '',
        actions: []
      });
      toast({
        title: "Automation Created",
        description: "Your marketing automation has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create automation.",
        variant: "destructive",
      });
    }
  });

  const handleCreateAutomation = () => {
    if (!automationForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an automation name.",
        variant: "destructive",
      });
      return;
    }

    createAutomationMutation.mutate({
      name: automationForm.name,
      triggerType: automationForm.triggerType,
      description: automationForm.description,
      status: 'draft',
      actions: automationForm.actions.length > 0 ? automationForm.actions : ['send_welcome_email'],
      executionCount: 0,
      createdAt: new Date().toISOString()
    });
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a campaign name.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate({
      name: campaignForm.name,
      type: campaignForm.type,
      status: 'draft',
      recipientCount: campaignForm.recipientCount,
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      conversionCount: 0,
      createdAt: new Date().toISOString()
    });
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to access marketing features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Center</h1>
          <p className="text-muted-foreground">
            Manage campaigns, automations, and track performance
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <HardDriveDownload className="mr-2 h-4 w-4" />
            Import Contacts
          </Button>
          <Button onClick={() => {/* Open campaign creation dialog */}}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Marketing Metrics Dashboard */}
      {isLoadingMetrics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : metrics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeCampaigns} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSent?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.averageOpenRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across campaigns
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.conversionRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Leads to customers
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No metrics available</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Marketing Campaigns</CardTitle>
                <CardDescription>
                  Manage your email, SMS, and social media campaigns
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateCampaignOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first marketing campaign to start engaging with your audience.
                  </p>
                  <Button onClick={() => setIsCreateCampaignOpen(true)}>
                    Create First Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: MarketingCampaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                            <span>{campaign.type}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sentCount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Opened</p>
                          <p className="font-medium">
                            {campaign.openedCount?.toLocaleString()} 
                            {campaign.sentCount > 0 && (
                              <span className="text-green-600 ml-1">
                                ({((campaign.openedCount / campaign.sentCount) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicked</p>
                          <p className="font-medium">
                            {campaign.clickedCount?.toLocaleString()}
                            {campaign.openedCount > 0 && (
                              <span className="text-blue-600 ml-1">
                                ({((campaign.clickedCount / campaign.openedCount) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Converted</p>
                          <p className="font-medium">
                            {campaign.conversionCount?.toLocaleString()}
                            {campaign.sentCount > 0 && (
                              <span className="text-purple-600 ml-1">
                                ({((campaign.conversionCount / campaign.sentCount) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Marketing Automations</CardTitle>
                <CardDescription>
                  Set up automated workflows to nurture leads and engage customers
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateAutomationOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Automation
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAutomations ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : automations.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Automations Set Up</h3>
                  <p className="text-muted-foreground mb-4">
                    Create automated workflows to nurture leads and improve conversions.
                  </p>
                  <Button onClick={() => setIsCreateAutomationOpen(true)}>
                    Create First Automation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {automations.map((automation: MarketingAutomation) => (
                    <div key={automation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{automation.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant={automation.status === 'active' ? 'default' : 'secondary'}>
                              {automation.status}
                            </Badge>
                            <span>{automation.steps} steps</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit Workflow
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Active Contacts</p>
                          <p className="font-medium">{automation.contactCount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium text-green-600">
                            {(automation.conversionRate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trigger</p>
                          <p className="font-medium capitalize">
                            {automation.triggerType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Create and manage reusable email templates for your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Template Library</h3>
                <p className="text-muted-foreground mb-4">
                  Email template management will be available soon.
                </p>
                <Button variant="outline">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Analytics</CardTitle>
              <CardDescription>
                Detailed performance metrics and insights for your marketing efforts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed analytics and reporting features will be available soon.
                </p>
                <Button variant="outline">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Automation Dialog */}
      <Dialog open={isCreateAutomationOpen} onOpenChange={setIsCreateAutomationOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
            <DialogDescription>
              Set up an automated workflow to nurture leads and engage customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="automation-name" className="text-right">
                Name
              </Label>
              <Input
                id="automation-name"
                value={automationForm.name}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Welcome Series"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trigger-type" className="text-right">
                Trigger
              </Label>
              <Select
                value={automationForm.triggerType}
                onValueChange={(value: any) => setAutomationForm(prev => ({ ...prev, triggerType: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_created">New Lead Created</SelectItem>
                  <SelectItem value="contact_added">Contact Added</SelectItem>
                  <SelectItem value="opportunity_stage">Opportunity Stage Change</SelectItem>
                  <SelectItem value="date_based">Date Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="automation-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="automation-description"
                value={automationForm.description}
                onChange={(e) => setAutomationForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Describe what this automation does..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateAutomationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateAutomation}
              disabled={createAutomationMutation.isPending}
            >
              {createAutomationMutation.isPending ? "Creating..." : "Create Automation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new marketing campaign to engage with your audience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campaign-name" className="text-right">
                Name
              </Label>
              <Input
                id="campaign-name"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Campaign name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campaign-type" className="text-right">
                Type
              </Label>
              <select
                id="campaign-type"
                value={campaignForm.type}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, type: e.target.value as 'email' | 'sms' | 'social' | 'automation' }))}
                className="col-span-3 h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="social">Social Media</option>
                <option value="automation">Automation</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campaign-description" className="text-right">
                Description
              </Label>
              <Input
                id="campaign-description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Campaign description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campaign-recipients" className="text-right">
                Recipients
              </Label>
              <Input
                id="campaign-recipients"
                type="number"
                value={campaignForm.recipientCount}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, recipientCount: parseInt(e.target.value) || 0 }))}
                className="col-span-3"
                placeholder="Number of recipients"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateCampaignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateCampaign}
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}