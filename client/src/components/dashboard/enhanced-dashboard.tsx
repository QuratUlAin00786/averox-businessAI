import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Layers, 
  Users, 
  CreditCard, 
  Activity,
  CircleCheck,
  CircleAlert,
  PieChart,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Import custom components
import ActivityFeed from "./activity-feed";
import QuickActions from "./quick-actions";
import MigrationStats from "./migration-stats";
import { BusinessInsights } from "@/components/ai-assistant";

interface DashboardStat {
  label: string;
  value: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon: React.ElementType;
  link?: string;
}

export default function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Real database-driven dashboard data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/enhanced-dashboard'],
    retry: false,
  });

  // Use only real database data - no fallback fake data
  const dashboardData = data || {
    activities: [],
    migrations: []
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[150px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get real stats from existing dashboard API endpoints
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const overviewStats: DashboardStat[] = dashboardStats ? [
    {
      label: "New Leads",
      value: dashboardStats.newLeads?.toString() || "0",
      icon: Users,
    },
    {
      label: "Conversion Rate",
      value: dashboardStats.conversionRate || "0%",
      icon: Activity,
    },
    {
      label: "Revenue",
      value: dashboardStats.revenue || "$0",
      icon: CreditCard,
    },
    {
      label: "Active Deals",
      value: dashboardStats.activeDeals?.toString() || "0",
      icon: Layers,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="migrations">Data Migrations</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {overviewStats.map((stat, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardDescription>{stat.label}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          {stat.change && (
                            <div className={`text-sm flex items-center ${
                              stat.change.trend === 'up' 
                                ? 'text-green-600' 
                                : stat.change.trend === 'down' 
                                  ? 'text-red-600' 
                                  : 'text-gray-600'
                            }`}>
                              {stat.change.trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
                              {stat.change.trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
                              {stat.change.value}
                            </div>
                          )}
                        </div>
                        <div className="bg-primary/10 p-3 rounded-full">
                          <stat.icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Monthly Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center p-8 border border-dashed rounded-lg w-full max-w-md mx-auto">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Monthly Sales Chart</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sales performance across months with revenue trends.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
                      View Detailed Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Migration Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Recent Data Migrations</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("migrations")}>
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <MigrationStats migrations={data.migrations.slice(0, 2)} />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickActions />
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/activities")}>
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ActivityFeed activities={data.activities} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-assistant" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Business Assistant
                  </CardTitle>
                  <CardDescription>
                    Receive proactive insights and actionable advice to improve your business performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI assistant analyzes your CRM data to identify opportunities, potential issues, and priorities to help you focus on what matters most.
                  </p>
                </CardContent>
              </Card>
              
              <BusinessInsights />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="migrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <MigrationStats migrations={data.migrations} />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Migration Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-2.5">
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <PieChart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">New Migration</div>
                        <div className="text-xs text-muted-foreground">Import from external CRM</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-2.5">
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <CircleCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Validate Data</div>
                        <div className="text-xs text-muted-foreground">Check migration quality</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-2.5">
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <CircleAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Error Reports</div>
                        <div className="text-xs text-muted-foreground">View issues and fixes</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="proposals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Management</CardTitle>
              <CardDescription>Create, manage and track customer proposals</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center p-8 border border-dashed rounded-lg w-full max-w-md mx-auto">
                <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Proposals Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">Track proposal status, analytics, and team collaboration.</p>
                <Button onClick={() => navigate("/proposals")}>
                  Manage Proposals
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Hub</CardTitle>
              <CardDescription>Manage all customer communications in one place</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center p-8 border border-dashed rounded-lg w-full max-w-md mx-auto">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Communication Center</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage customer conversations across channels.</p>
                <Button onClick={() => navigate("/communications")}>
                  Open Communication Hub
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}