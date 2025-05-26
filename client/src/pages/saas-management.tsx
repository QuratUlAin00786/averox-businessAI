import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Server, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Crown,
  Activity,
  Database,
  Shield
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  billing_email: string;
  max_users: number;
  storage_limit: number;
  api_calls_limit: number;
  trial_ends_at: string | null;
  created_at: string;
  admin_name: string;
  admin_email: string;
  current_plan: string;
  monthly_revenue: number;
  user_count: number;
  storage_used: number;
  api_calls_used: number;
}

interface SaaSStats {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  total_revenue: number;
  total_users: number;
  avg_revenue_per_tenant: number;
  churn_rate: number;
  growth_rate: number;
}

interface SubscriptionPackage {
  id: number;
  name: string;
  description: string;
  price: string;
  features: string[];
  maxUsers: number;
  maxContacts: number;
  maxStorage: number;
  isActive: boolean;
}

export default function SaaSManagement() {
  const { toast } = useToast();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch SaaS statistics
  const { data: saasStats } = useQuery<SaaSStats>({
    queryKey: ['/api/saas/stats'],
  });

  // Fetch all tenants
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['/api/saas/tenants'],
  });

  // Fetch subscription packages for integration
  const { data: subscriptionPackages = [] } = useQuery<SubscriptionPackage[]>({
    queryKey: ['/api/subscription-packages'],
  });

  // Create new tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: any) => {
      const response = await apiRequest('POST', '/api/saas/tenants', tenantData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saas/tenants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saas/stats'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "New tenant organization created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tenant organization",
        variant: "destructive",
      });
    },
  });

  // Update tenant status mutation
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/saas/tenants/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saas/tenants'] });
      toast({
        title: "Success",
        description: "Tenant status updated successfully",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trial: "secondary",
      suspended: "destructive",
      inactive: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SaaS Platform Management</h1>
          <p className="text-muted-foreground">
            Manage your multi-tenant SaaS platform, tenants, and subscriptions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Tenant Organization</DialogTitle>
            </DialogHeader>
            <CreateTenantForm 
              subscriptionPackages={subscriptionPackages}
              onSubmit={(data) => createTenantMutation.mutate(data)}
              isLoading={createTenantMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* SaaS Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{saasStats?.total_tenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{saasStats?.growth_rate || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(saasStats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(saasStats?.avg_revenue_per_tenant || 0)} per tenant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{saasStats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Uptime this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants">Tenant Organizations</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tenant.subdomain}.yourdomain.com
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tenant.admin_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tenant.admin_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tenant.current_plan}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>
                        {tenant.user_count} / {tenant.max_users}
                      </TableCell>
                      <TableCell>{formatCurrency(tenant.monthly_revenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTenant(tenant)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTenantMutation.mutate({ 
                              id: tenant.id, 
                              status: tenant.status === 'active' ? 'suspended' : 'active' 
                            })}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {subscriptionPackages.map((pkg) => (
                  <Card key={pkg.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {pkg.name}
                        {pkg.name === 'Enterprise' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <div className="text-2xl font-bold">
                        ${pkg.price}/month
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pkg.description}
                      </p>
                      <ul className="space-y-2 text-sm">
                        {pkg.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                        <div>Max Users: {pkg.maxUsers}</div>
                        <div>Storage: {pkg.maxStorage}GB</div>
                        <div>Contacts: {pkg.maxContacts}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Active Tenants</span>
                    <span className="font-bold">{saasStats?.active_tenants || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trial Tenants</span>
                    <span className="font-bold">{saasStats?.trial_tenants || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Churn Rate</span>
                    <span className="font-bold text-red-600">
                      {saasStats?.churn_rate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Database className="mr-2 h-4 w-4" />
                      Total Storage Used
                    </span>
                    <span className="font-bold">
                      {formatBytes(tenants.reduce((acc, t) => acc + (t.storage_used || 0), 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Server className="mr-2 h-4 w-4" />
                      API Calls This Month
                    </span>
                    <span className="font-bold">
                      {tenants.reduce((acc, t) => acc + (t.api_calls_used || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Security Status
                    </span>
                    <Badge variant="default">Secured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Default Trial Period (days)</Label>
                    <Input type="number" defaultValue="14" />
                  </div>
                  <div>
                    <Label>Maximum Tenants</Label>
                    <Input type="number" defaultValue="1000" />
                  </div>
                  <div>
                    <Label>Default Storage Limit (GB)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div>
                    <Label>Default API Calls Limit</Label>
                    <Input type="number" defaultValue="10000" />
                  </div>
                </div>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tenant Detail Dialog */}
      {selectedTenant && (
        <TenantDetailDialog
          tenant={selectedTenant}
          open={!!selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      )}
    </div>
  );
}

// Create Tenant Form Component
function CreateTenantForm({ 
  subscriptionPackages, 
  onSubmit, 
  isLoading 
}: { 
  subscriptionPackages: SubscriptionPackage[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    billing_email: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    plan_id: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
            placeholder="acme"
            required
          />
        </div>
        <div>
          <Label htmlFor="billing_email">Billing Email</Label>
          <Input
            id="billing_email"
            type="email"
            value={formData.billing_email}
            onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="admin_first_name">Admin First Name</Label>
            <Input
              id="admin_first_name"
              value={formData.admin_first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_first_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="admin_last_name">Admin Last Name</Label>
            <Input
              id="admin_last_name"
              value={formData.admin_last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, admin_last_name: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="admin_email">Admin Email</Label>
          <Input
            id="admin_email"
            type="email"
            value={formData.admin_email}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="plan_id">Subscription Plan</Label>
          <Select value={formData.plan_id} onValueChange={(value) => setFormData(prev => ({ ...prev, plan_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {subscriptionPackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id.toString()}>
                  {pkg.name} - ${pkg.price}/month
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Tenant"}
      </Button>
    </form>
  );
}

// Tenant Detail Dialog Component
function TenantDetailDialog({ tenant, open, onClose }: { tenant: Tenant; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tenant.name} - Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Subdomain</Label>
              <div className="font-medium">{tenant.subdomain}.yourdomain.com</div>
            </div>
            <div>
              <Label>Status</Label>
              <div>{tenant.status.toUpperCase()}</div>
            </div>
            <div>
              <Label>Current Plan</Label>
              <div>{tenant.current_plan}</div>
            </div>
            <div>
              <Label>Monthly Revenue</Label>
              <div className="font-medium text-green-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(tenant.monthly_revenue)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Usage Statistics</Label>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="bg-muted p-3 rounded">
                <div className="text-sm text-muted-foreground">Users</div>
                <div className="font-bold">{tenant.user_count} / {tenant.max_users}</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="text-sm text-muted-foreground">Storage</div>
                <div className="font-bold">{tenant.storage_used || 0}GB / {tenant.storage_limit}GB</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="text-sm text-muted-foreground">API Calls</div>
                <div className="font-bold">{(tenant.api_calls_used || 0).toLocaleString()} / {tenant.api_calls_limit.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}