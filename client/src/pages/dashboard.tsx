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
  Zap
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: getDashboardData,
    staleTime: 60000, // 1 minute
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
                console.log("Navigating to dashboard settings...");
                setLocation("/settings/dashboard");
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Today's Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">$48,700</div>
                    <div className="text-sm flex items-center text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      12% from yesterday
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>New Leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">38</div>
                    <div className="text-sm flex items-center text-green-600">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      4% from last week
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Conversion Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">28%</div>
                    <div className="text-sm flex items-center text-red-600">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      1.5% from last month
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardDescription>Active Deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">17</div>
                    <div className="text-sm text-muted-foreground">
                      Value: $246,300
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                </div>
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
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Client Kickoff Meeting</div>
                          <div className="text-xs text-muted-foreground">10:00 AM</div>
                        </div>
                        <div className="text-sm text-muted-foreground">Meeting with Acme Corp. to discuss new project requirements</div>
                        <div className="text-xs text-blue-600">3 people attending</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Sales Team Sync</div>
                          <div className="text-xs text-muted-foreground">2:30 PM</div>
                        </div>
                        <div className="text-sm text-muted-foreground">Weekly sales team meeting to review pipeline and targets</div>
                        <div className="text-xs text-blue-600">5 people attending</div>
                      </div>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border rounded-full flex items-center justify-center">
                        <div className="h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Prepare sales presentation</div>
                          <Badge variant="outline" className="text-xs">High</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">For Enterprise Software Implementation project</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border rounded-full flex items-center justify-center">
                        <div className="h-2.5 w-2.5 bg-amber-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Follow up with Global Tech</div>
                          <Badge variant="outline" className="text-xs">Medium</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">Regarding proposal feedback and next steps</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Sales Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center">
                  <div className="text-center p-8 border border-dashed rounded-lg w-full max-w-md mx-auto">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Pipeline Status</h3>
                    <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-lg font-semibold">5</div>
                        <div className="text-xs text-muted-foreground">Lead Generation</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">8</div>
                        <div className="text-xs text-muted-foreground">Qualification</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">4</div>
                        <div className="text-xs text-muted-foreground">Proposal</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/opportunities")}>
                      View All Opportunities
                    </Button>
                  </div>
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">Active Email Campaign</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Running</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded">
                          <div className="font-medium">1,245</div>
                          <div className="text-muted-foreground">Delivered</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <div className="font-medium">38%</div>
                          <div className="text-muted-foreground">Open Rate</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                          <div className="font-medium">12%</div>
                          <div className="text-muted-foreground">Click Rate</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">Lead Nurturing Workflow</h3>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Active</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-slate-50 p-3 rounded">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">142 leads in pipeline</div>
                          <div className="text-xs text-muted-foreground">Next action: Follow-up email (Tomorrow)</div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">Oracle CRM Migration</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress: 3,450 / 5,200 records</span>
                          <span>66%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '66%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">Odoo CRM Migration</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complete</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Records Migrated: 1,245</span>
                          <span>100%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://randomuser.me/api/portraits/women/11.jpg" alt="Jane Cooper" />
                        <AvatarFallback>JC</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            Jane Cooper
                          </div>
                          <div className="text-xs text-muted-foreground">
                            25 min ago
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          Created new opportunity
                          <span className="text-muted-foreground"> - Enterprise SaaS Solution</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex Rodriguez" />
                        <AvatarFallback>AR</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            Alex Rodriguez
                          </div>
                          <div className="text-xs text-muted-foreground">
                            2 hours ago
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          Converted lead
                          <span className="text-muted-foreground"> - ACME Corp</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Key Performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Win Rate</span>
                        <span className="font-semibold">68%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Lead Response Time</span>
                        <span className="font-semibold">1.3 hrs</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Proposal Acceptance</span>
                        <span className="font-semibold">42%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
