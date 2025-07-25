import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { 
  Download,
  Plus,
  HelpCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Users,
  BarChart3,
  Clock,
  Activity,
  Layers,
  ChevronRight,
  Mail,
  MessageSquare,
  BarChart,
  LineChart,
  Zap,
  CheckCircle,
  Calendar
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SimpleButton } from "@/components/ui/simple-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { SimpleTour, TourHelpButton, useTour } from "@/components/ui/simple-tour";
import { dashboardTour } from "@/lib/simple-tour-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/lib/data";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { settings } = useSystemSettings();
  const { isTourOpen, setIsTourOpen, startTour, closeTour, completeTour, hasCompletedTour } = useTour('dashboard');

  // Function to get a greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.goodMorning;
    if (hour < 18) return t.dashboard.goodAfternoon;
    return t.dashboard.goodEvening;
  };

  useEffect(() => {
    // Format date based on language
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));
  }, [language]);

  // Fetch dashboard data from API endpoints
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: getDashboardData,
    staleTime: 60000, // 1 minute
    retry: 3,
  });

  return (
    <div className="py-6">
      {/* Simple Tour */}
      <SimpleTour
        steps={dashboardTour.steps}
        open={isTourOpen}
        onOpenChange={setIsTourOpen}
        onComplete={completeTour}
      />

      {/* Help button to start tour */}
      {!isTourOpen && (
        <TourHelpButton 
          onClick={startTour} 
          className="fixed bottom-4 right-4 z-50"
        />
      )}

      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate dashboard-header">
              {getGreeting()}{user?.firstName ? `, ${user.firstName}` : ''}
            </h2>
            <div className="flex flex-col mt-1 sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="flex items-center mt-2 text-sm text-neutral-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {t.dashboard.today}, <span>{currentDate}</span>
              </div>
              <div className="mt-2 flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                <svg className="flex-shrink-0 mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
                Database-Driven Dashboard: All metrics from live database
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row mt-4 gap-2 sm:gap-3 md:mt-0 md:ml-4">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              type="button"
              onClick={() => setLocation("/reports")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>View Reports</span>
            </Button>
            <Button 
              className="w-full sm:w-auto"
              type="button"
              onClick={() => {
                console.log("Navigating to dashboard settings at /settings/dashboard");
                try {
                  // Check if user is authenticated first using the auth hook
                  if (!user) {
                    console.log("User not authenticated, redirecting to login page first");
                    setLocation("/auth");
                    return;
                  }
                  
                  // Use Wouter's setLocation for client-side routing to maintain app state
                  setLocation("/settings/dashboard");
                } catch (error) {
                  console.error("Navigation error:", error);
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Customize Dashboard</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Business Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-2xl font-bold truncate">{data?.stats?.find(s => s.title === "Revenue")?.value || '$0'}</div>
                      <div className="text-sm flex items-center text-green-600 truncate">
                        <ArrowUp className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{data?.stats?.find(s => s.title === "Revenue")?.change.value || '0%'} {data?.stats?.find(s => s.title === "Revenue")?.change.text || ''}</span>
                      </div>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* New Leads Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>New Leads</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-8 w-14 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-2xl font-bold truncate">{data?.stats?.find(s => s.title === "New Leads")?.value || '0'}</div>
                      <div className="text-sm flex items-center text-green-600 truncate">
                        <ArrowUp className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{data?.stats?.find(s => s.title === "New Leads")?.change.value || '0%'} {data?.stats?.find(s => s.title === "New Leads")?.change.text || ''}</span>
                      </div>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Rate Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Conversion Rate</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-8 w-14 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-2xl font-bold truncate">{data?.stats?.find(s => s.title === "Conversion Rate")?.value || '0%'}</div>
                      <div className="text-sm flex items-center text-red-600 truncate">
                        <ArrowDown className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{data?.stats?.find(s => s.title === "Conversion Rate")?.change.value || '0%'} {data?.stats?.find(s => s.title === "Conversion Rate")?.change.text || ''}</span>
                      </div>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Open Deals Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Active Deals</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-8 w-14 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-2xl font-bold truncate">{data?.stats?.find(s => s.title === "Open Deals")?.value || '0'}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {data?.pipelineStages ? 
                          `Value: ${data.pipelineStages.reduce((total, stage) => total + parseInt(stage.value.replace(/[$,]/g, '') || '0'), 0).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}` : 
                          'No active deals'
                        }
                      </div>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Today's Schedule</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/calendar")}>
                    View Calendar <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-start gap-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : data?.todayEvents && data.todayEvents.length > 0 ? (
                    <div className="space-y-4">
                      <div className="mb-2 text-xs font-medium text-primary border-l-2 border-primary pl-2">
                        Data from Database: Events loaded from events table
                      </div>
                      {data.todayEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate pr-2">{event.title}</div>
                              <div className="text-xs text-muted-foreground flex-shrink-0">{event.time}</div>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">{event.description}</div>
                            {event.attendees && (
                              <div className="text-xs text-blue-600 truncate">{event.attendees} attending</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Events Today</h3>
                      <p className="text-sm text-muted-foreground">Schedule meetings and events to see them here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Tasks Due Today */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Tasks Due Today</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/tasks")}>
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5 rounded-full" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-40 mb-2" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : data?.dueTasks && data.dueTasks.length > 0 ? (
                    <div className="space-y-4">
                      <div className="mb-2 text-xs font-medium text-primary border-l-2 border-primary pl-2">
                        Data from Database: Tasks loaded from tasks table
                      </div>
                      {data.dueTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2">
                          <div className="h-5 w-5 border rounded-full flex items-center justify-center">
                            <div className={`h-2.5 w-2.5 ${
                              task.priority === 'High' ? 'bg-red-500' : 
                              task.priority === 'Medium' ? 'bg-amber-500' : 
                              'bg-blue-500'} rounded-full`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate pr-2">{task.title}</div>
                              <Badge variant="outline" className="text-xs flex-shrink-0">{task.priority}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">{task.description || 'No description'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Tasks Due Today</h3>
                      <p className="text-sm text-muted-foreground">All caught up!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Sales Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-full">
                      <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
                      <Skeleton className="h-6 w-32 mx-auto mb-4" />
                      <div className="mb-4 grid grid-cols-3 gap-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <Skeleton className="h-9 w-40 mx-auto" />
                    </div>
                  ) : data?.pipelineStages && data.pipelineStages.length > 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg w-full max-w-md mx-auto">
                      <div className="mb-2 text-xs font-medium text-primary">
                        Data from Database: Pipeline metrics from opportunities table
                      </div>
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Pipeline Status</h3>
                      <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                        {data.pipelineStages.slice(0, 3).map((stage, index) => (
                          <div key={index}>
                            <div className="text-lg font-semibold">{stage.percentage}%</div>
                            <div className="text-xs text-muted-foreground">{stage.name}</div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setLocation("/opportunities")}>
                        View All Opportunities
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg w-full max-w-md mx-auto">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Pipeline Data</h3>
                      <p className="text-sm text-muted-foreground mb-4">Add opportunities to see your sales pipeline</p>
                      <Button variant="outline" size="sm" onClick={() => setLocation("/opportunities/new")}>
                        Add Opportunity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Marketing Automation */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Marketing Automation</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/marketing")}>
                    Manage <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ) : data?.marketingCampaigns && data.marketingCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {data.marketingCampaigns.map((campaign, index) => (
                        <div key={campaign.id || index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm">{campaign.name}</h3>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  campaign.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                  campaign.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {campaign.status}
                              </Badge>
                            </div>
                          </div>
                          
                          {campaign.stats && (
                            <div className="space-y-3">
                              <div className="text-xs font-medium text-primary">Real Metrics from Database:</div>
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                {Object.entries(campaign.stats).map(([key, value]) => (
                                  <div key={key} className="bg-slate-50 p-2 rounded">
                                    <div className="font-medium">{value}</div>
                                    <div className="text-muted-foreground">{key}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {campaign.workflow && (
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded">
                              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Zap className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{campaign.workflow.count} leads in pipeline</div>
                                <div className="text-xs text-muted-foreground">{campaign.workflow.nextAction}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Mail className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Active Campaigns</h3>
                      <p className="text-sm text-muted-foreground mb-4">Create marketing campaigns to engage with your audience</p>
                      <Button variant="outline" size="sm" onClick={() => setLocation("/marketing/campaigns/new")}>
                        Create Campaign
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Migration Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Migration Status</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/settings")}>
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </div>
                    </div>
                  ) : data?.migrations && data.migrations.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-xs font-medium text-primary border-l-2 border-primary pl-2">
                        Data from Database: Migration statuses based on system_settings table
                      </div>
                      {data.migrations.map((migration, index) => (
                        <div key={migration.id || index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm">{migration.name}</h3>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  migration.status === 'Complete' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  migration.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  migration.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {migration.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{migration.progressText}</span>
                              <span>{migration.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  migration.status === 'Complete' ? 'bg-green-500' : 
                                  migration.status === 'In Progress' ? 'bg-blue-500' :
                                  migration.status === 'Failed' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }`} 
                                style={{ width: `${migration.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Active Migrations</h3>
                      <p className="text-sm text-muted-foreground mb-4">Data migration jobs will appear here</p>
                      <Button variant="outline" size="sm" onClick={() => setLocation("/settings/migrations")}>
                        Start Migration
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-2.5"
                      onClick={() => setLocation("/leads")}
                    >
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Manage Leads</div>
                        <div className="text-xs text-muted-foreground">View and create potential customers</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-2.5"
                      onClick={() => setLocation("/opportunities")}
                    >
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Opportunities</div>
                        <div className="text-xs text-muted-foreground">Manage sales opportunities</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-2.5"
                      onClick={() => setLocation("/reports")}
                    >
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <BarChart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">View Reports</div>
                        <div className="text-xs text-muted-foreground">Access sales and lead reports</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-2.5"
                      onClick={() => setLocation("/marketing")}
                    >
                      <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Marketing Hub</div>
                        <div className="text-xs text-muted-foreground">Create campaigns and automations</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-normal">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/activities")}>
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : data?.recentActivities && data.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentActivities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                            <AvatarFallback>{activity.user.initials}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">
                                {activity.user.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {activity.time}
                              </div>
                            </div>
                            
                            <div className="text-sm">
                              {activity.action}
                              {activity.detail && (
                                <span className="text-muted-foreground"> - {activity.detail}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Activity className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-1">No Recent Activity</h3>
                      <p className="text-sm text-muted-foreground">Activity will appear here as you use the system</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Key Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : data?.performanceMetrics ? (
                    <div className="space-y-4">
                      <div className="text-xs font-medium text-primary border-l-2 border-primary pl-2">
                        Data from Database: Metrics calculated from real leads, opportunities, and proposals
                      </div>
                      {data.performanceMetrics.map((metric) => (
                        <div key={metric.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{metric.name}</span>
                            <span className="font-semibold">{metric.value}</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${metric.color || 'bg-primary'} rounded-full`} 
                              style={{ width: `${metric.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Win Rate</span>
                          <span className="font-semibold">0%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Lead Response Time</span>
                          <span className="font-semibold">N/A</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Proposal Acceptance</span>
                          <span className="font-semibold">0%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
