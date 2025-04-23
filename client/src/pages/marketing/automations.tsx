import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Mail,
  ChevronLeft,
  Clock,
  MessageSquare,
  Zap,
  Plus,
  ArrowRight,
  Check,
  X,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Filter,
  Users,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MarketingAutomationsPage() {
  const [, setLocation] = useLocation();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Example automation workflows
  const automations = [
    {
      id: 1,
      name: "Lead Nurturing",
      description: "Multi-step email sequence for new leads",
      status: "active",
      steps: 5,
      contacts: 142,
      createdAt: "Apr 15, 2025",
      lastModified: "Apr 20, 2025",
      conversionRate: "18%"
    },
    {
      id: 2,
      name: "Abandoned Cart Recovery",
      description: "Remind customers about items left in cart",
      status: "active",
      steps: 3,
      contacts: 78,
      createdAt: "Apr 10, 2025",
      lastModified: "Apr 18, 2025",
      conversionRate: "12%"
    },
    {
      id: 3,
      name: "Post-Purchase Follow-up",
      description: "Thank customers and ask for feedback",
      status: "active",
      steps: 4,
      contacts: 215,
      createdAt: "Apr 5, 2025",
      lastModified: "Apr 12, 2025",
      conversionRate: "23%"
    },
    {
      id: 4,
      name: "Re-engagement Campaign",
      description: "Bring inactive customers back",
      status: "draft",
      steps: 3,
      contacts: 0,
      createdAt: "Apr 22, 2025",
      lastModified: "Apr 22, 2025",
      conversionRate: "N/A"
    }
  ].filter(automation => {
    if (filterStatus !== "all" && automation.status !== filterStatus) {
      return false;
    }
    
    if (searchQuery) {
      return automation.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             automation.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation("/marketing")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Marketing Automation</h1>
            <p className="text-slate-500 mt-1">Create and manage automated marketing workflows</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setLocation("/marketing/automations/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
          <div className="rounded-md border">
            <div className="bg-slate-50 p-4 border-b grid grid-cols-12 text-sm font-medium text-slate-500">
              <div className="col-span-6">Workflow</div>
              <div className="col-span-1 text-center">Steps</div>
              <div className="col-span-2 text-center">Contacts</div>
              <div className="col-span-2 text-center">Conversion Rate</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {automations.map((automation) => (
              <div key={automation.id} className="p-4 border-b last:border-0 grid grid-cols-12 items-center hover:bg-slate-50">
                <div className="col-span-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{automation.name}</div>
                      <div className="text-sm text-slate-500">{automation.description}</div>
                      <div className="flex items-center mt-1 gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${
                            automation.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : automation.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {automation.status === 'active' ? 'Active' : automation.status === 'draft' ? 'Draft' : 'Paused'}
                        </Badge>
                        <span className="text-xs text-slate-500">Last modified: {automation.lastModified}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1 text-center">{automation.steps}</div>
                <div className="col-span-2 text-center">{automation.contacts}</div>
                <div className="col-span-2 text-center">{automation.conversionRate}</div>
                <div className="col-span-1 flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setLocation(`/marketing/automations/${automation.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {automations.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Zap className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="mb-1">No workflows found</p>
                <p className="text-sm">Try adjusting your filters or create a new workflow</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Card View */}
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="relative pb-3">
                  <Badge 
                    className="absolute right-6 top-6"
                    variant="outline"
                    className={`${
                      automation.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : automation.status === 'draft'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {automation.status === 'active' ? 'Active' : automation.status === 'draft' ? 'Draft' : 'Paused'}
                  </Badge>
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                  <CardDescription>{automation.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <div className="text-slate-500">Steps</div>
                      <div className="font-medium">{automation.steps}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Active Contacts</div>
                      <div className="font-medium">{automation.contacts}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Conversion Rate</div>
                      <div className="font-medium">{automation.conversionRate}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Last Modified</div>
                      <div className="font-medium">{automation.lastModified}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setLocation(`/marketing/automations/${automation.id}`)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
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
      </Tabs>
      
      {/* Workflow Templates Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Workflow Templates</h2>
          <Button variant="ghost" className="text-sm">
            View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Lead Nurturing</CardTitle>
              <CardDescription>Nurture new leads with targeted content</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">Welcome Email</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <div className="text-sm">Wait 3 Days</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">Follow-up Email</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button size="sm" className="w-full" onClick={() => setLocation("/marketing/automations/new?template=lead-nurturing")}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Abandoned Cart Recovery</CardTitle>
              <CardDescription>Recover lost sales from abandoned carts</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">Initial Reminder</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <div className="text-sm">Wait 1 Day</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">Discount Offer</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button size="sm" className="w-full" onClick={() => setLocation("/marketing/automations/new?template=abandoned-cart")}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer Onboarding</CardTitle>
              <CardDescription>Guide new customers through onboarding</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">Welcome & Setup</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <div className="text-sm">Wait 2 Days</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 mx-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm">Tutorial Series</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button size="sm" className="w-full" onClick={() => setLocation("/marketing/automations/new?template=customer-onboarding")}>
                Use Template
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}