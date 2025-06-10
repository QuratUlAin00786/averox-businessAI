import { useState } from "react";
import { useLocation } from "wouter";
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

export default function Marketing() {
  const [, setLocation] = useLocation();

  // Sample campaign data
  const campaigns = [
    {
      id: 1,
      name: "Spring Product Launch",
      type: "email",
      status: "active",
      sent: 4829,
      opened: 2187,
      clicked: 815,
      lastSent: "Apr 18, 2025",
      openRate: "45.3%",
      clickRate: "16.9%"
    },
    {
      id: 2,
      name: "Customer Feedback Survey",
      type: "email",
      status: "scheduled",
      sent: 0,
      opened: 0,
      clicked: 0,
      lastSent: "Scheduled for Apr 25, 2025",
      openRate: "0%",
      clickRate: "0%"
    },
    {
      id: 3,
      name: "Enterprise Solution Webinar",
      type: "email",
      status: "draft",
      sent: 0,
      opened: 0,
      clicked: 0,
      lastSent: "Not sent yet",
      openRate: "0%",
      clickRate: "0%"
    },
    {
      id: 4,
      name: "Weekly Newsletter",
      type: "email",
      status: "active",
      sent: 5217,
      opened: 3612,
      clicked: 1254,
      lastSent: "Apr 22, 2025",
      openRate: "69.2%",
      clickRate: "24.0%"
    }
  ];

  // Sample automations
  const automations = [
    {
      id: 1,
      name: "Lead Nurturing Sequence",
      status: "active",
      contacts: 187,
      steps: 5,
      conversionRate: "23%"
    },
    {
      id: 2,
      name: "Welcome Series",
      status: "active",
      contacts: 310,
      steps: 3,
      conversionRate: "19%"
    },
    {
      id: 3,
      name: "Re-engagement Campaign",
      status: "draft",
      contacts: 0,
      steps: 4,
      conversionRate: "0%"
    }
  ];

  // Stats
  const stats = {
    contactsTotal: 8427,
    contactsGrowth: "+12%",
    emailsSent: 37542,
    emailsOpened: 22525,
    averageOpenRate: "60%",
    averageClickRate: "18%",
    engagementScore: 74,
    engagementChange: "+5%"
  };
  
  // Chart data (simplified for illustration)
  const chartData = [
    { name: "Jan", value: 22 },
    { name: "Feb", value: 28 },
    { name: "Mar", value: 25 },
    { name: "Apr", value: 35 }
  ];
  
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">Manage campaigns, automations, and track performance</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline" onClick={() => setLocation("/marketing/automations")}>
            <Zap className="h-4 w-4 mr-2" />
            Automations
          </Button>
          <Button onClick={() => setLocation("/marketing/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>
      
      {/* Marketing Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Audience</CardTitle>
            <CardDescription>Total contacts and growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats.contactsTotal.toLocaleString()}</div>
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                {stats.contactsGrowth}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Active</div>
                <div className="font-medium mt-0.5">6,142</div>
              </div>
              <div>
                <div className="text-muted-foreground">New (30d)</div>
                <div className="font-medium mt-0.5">912</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" className="w-full text-xs" onClick={() => setLocation("/contacts")}>
              <Users className="h-3.5 w-3.5 mr-1" />
              View All Contacts
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Email Performance</CardTitle>
            <CardDescription>Open and click rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <div>Average Open Rate</div>
                  <div className="font-medium">{stats.averageOpenRate}</div>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <div>Average Click Rate</div>
                  <div className="font-medium">{stats.averageClickRate}</div>
                </div>
                <Progress value={18} className="h-2" />
              </div>
              <div className="pt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Emails Sent</div>
                  <div className="font-medium mt-0.5">{stats.emailsSent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Emails Opened</div>
                  <div className="font-medium mt-0.5">{stats.emailsOpened.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" className="w-full text-xs" onClick={() => setLocation("/marketing/reports")}>
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              View Performance Reports
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Engagement Score</CardTitle>
            <CardDescription>Overall audience engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-8 border-primary" style={{ 
                  clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
                  transform: `rotate(${270 + (stats.engagementScore / 100 * 360 * 0.75)}deg)`
                }}></div>
                <div className="text-2xl font-bold">{stats.engagementScore}</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <ArrowUp className="h-3 w-3 mr-1" />
                {stats.engagementChange} from last month
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost" className="w-full text-xs" onClick={() => setLocation("/marketing/engagement")}>
              <PieChart className="h-3.5 w-3.5 mr-1" />
              Engagement Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Input placeholder="Search..." className="w-[200px]" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600 w-[35%]">Campaign</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600 w-[12%]">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600 w-[12%]">Sent</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600 w-[23%]">Performance</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600 w-[18%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Campaign Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 text-sm">{campaign.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            Last activity: {campaign.lastSent}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <Badge 
                        variant="outline"
                        className={
                          campaign.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : campaign.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {campaign.status === 'active' 
                          ? 'Active' 
                          : campaign.status === 'scheduled'
                          ? 'Scheduled'
                          : 'Draft'
                        }
                      </Badge>
                    </td>
                    
                    {/* Sent */}
                    <td className="py-4 px-4 text-center">
                      <div className="font-semibold text-gray-900 text-sm">{campaign.sent.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">recipients</div>
                    </td>
                    
                    {/* Performance */}
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Open Rate:</span>
                          <span className="font-medium text-gray-900">{campaign.openRate}</span>
                        </div>
                        <Progress value={parseInt(campaign.openRate) || 0} className="h-1" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Click Rate:</span>
                          <span className="font-medium text-gray-900">{campaign.clickRate}</span>
                        </div>
                        <Progress value={parseInt(campaign.clickRate) || 0} className="h-1" />
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="outline" size="sm" className="text-xs px-2" onClick={() => setLocation(`/marketing/campaigns/${campaign.id}`)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs px-2" onClick={() => setLocation(`/marketing/campaigns/${campaign.id}/report`)}>
                          View Report
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        {/* Automations Tab */}
        <TabsContent value="automations" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{automation.name}</CardTitle>
                    <Badge 
                      className={automation.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {automation.status === 'active' ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-slate-500">Steps</div>
                        <div className="font-medium">{automation.steps}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Contacts</div>
                        <div className="font-medium">{automation.contacts}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Conversion</div>
                        <div className="font-medium">{automation.conversionRate}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mail className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>Welcome Email</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5 text-slate-600" />
                        </div>
                        <div>Wait 3 Days</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mail className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>Follow-up Email</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setLocation(`/marketing/automations/${automation.id}`)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setLocation(`/marketing/automations/${automation.id}/report`)}>View Report</Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Create new card */}
            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Create Workflow</h3>
              <p className="text-sm text-slate-500 text-center mb-4">Set up automated marketing workflows</p>
              <Button onClick={() => setLocation("/marketing/automations/new")}>
                New Workflow
              </Button>
            </Card>
          </div>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="overflow-hidden">
              <div className="h-40 bg-slate-100 flex items-center justify-center">
                <div className="w-full max-w-xs mx-auto bg-white p-4 rounded shadow-sm">
                  <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded mb-1 w-full"></div>
                  <div className="h-3 bg-slate-200 rounded mb-3 w-5/6"></div>
                  <div className="h-8 bg-primary rounded w-1/3"></div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Welcome Email</CardTitle>
                <CardDescription>New user onboarding</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                Introduce your product and guide new users on getting started.
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button className="w-full" onClick={() => setLocation("/marketing/create?template=welcome")}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-40 bg-slate-100 flex items-center justify-center">
                <div className="w-full max-w-xs mx-auto bg-white p-4 rounded shadow-sm">
                  <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded mb-1 w-full"></div>
                  <div className="h-3 bg-slate-200 rounded mb-3 w-5/6"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-20 bg-slate-200 rounded"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Newsletter</CardTitle>
                <CardDescription>Regular updates</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                Share news, updates, and valuable content with your audience.
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button className="w-full" onClick={() => setLocation("/marketing/create?template=newsletter")}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-40 bg-slate-100 flex items-center justify-center">
                <div className="w-full max-w-xs mx-auto bg-white p-4 rounded shadow-sm">
                  <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded mb-2 w-full"></div>
                  <div className="h-16 bg-slate-200 rounded mb-3"></div>
                  <div className="h-6 bg-primary rounded w-1/2"></div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Product Announcement</CardTitle>
                <CardDescription>Launch updates</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                Announce new products, features, or services to your audience.
              </CardContent>
              <CardFooter className="border-t pt-3">
                <Button className="w-full" onClick={() => setLocation("/marketing/create?template=product-announcement")}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => setLocation("/marketing/templates")}>
              View All Templates
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => setLocation("/marketing/create")}>
            <Mail className="h-6 w-6" />
            <span>Create Email</span>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => setLocation("/marketing/automations/new")}>
            <Zap className="h-6 w-6" />
            <span>Create Automation</span>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => setLocation("/marketing/schedule")}>
            <Calendar className="h-6 w-6" />
            <span>Calendar View</span>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex flex-col gap-2" onClick={() => setLocation("/marketing/import")}>
            <HardDriveDownload className="h-6 w-6" />
            <span>Import Contacts</span>
          </Button>
        </div>
      </div>
    </div>
  );
}