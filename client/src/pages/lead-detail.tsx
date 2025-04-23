import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  Edit,
  Trash,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Check,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAdvice } from "@/components/ai-assistant";
import { useToast } from "@/hooks/use-toast";

export default function LeadDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const leadId = parseInt(id);
  
  // Fetch lead data
  const { data: lead, isLoading } = useQuery({
    queryKey: [`/api/leads/${leadId}`],
    queryFn: async () => {
      // This would normally be a real API call, but for demonstration purposes,
      // we'll return mock data for the lead
      return {
        id: leadId,
        name: "Sarah Thompson",
        company: "Innovatech Solutions",
        email: "sarah.thompson@innovatech.example.com",
        phone: "(555) 123-4567",
        status: "Qualified",
        source: "Website",
        industry: "Software",
        createdAt: "2025-02-15T10:30:00.000Z",
        assignedTo: {
          id: 2,
          name: "Michael Johnson",
          avatar: null
        },
        lastActivity: "2025-04-21T14:45:00.000Z",
        lastActivityType: "Email",
        notes: "Had an initial discussion about their software needs. They're looking for a CRM solution with advanced reporting capabilities.",
        estimatedValue: 15000,
        activities: [
          {
            id: 101,
            type: "Email",
            subject: "Initial Contact",
            description: "Sent introduction email with product information",
            date: "2025-04-21T14:45:00.000Z"
          },
          {
            id: 102,
            type: "Call",
            subject: "Qualification Call",
            description: "Discussed requirements and confirmed interest",
            date: "2025-04-18T11:30:00.000Z"
          },
          {
            id: 103,
            type: "Meeting",
            subject: "Product Demo",
            description: "Scheduled product demonstration for next week",
            date: "2025-04-15T09:15:00.000Z"
          }
        ]
      };
    },
    staleTime: 60000, // 1 minute
  });
  
  const handleConvertLead = () => {
    toast({
      title: "Converting lead...",
      description: "The lead is being converted to an opportunity."
    });
    // This would normally send an API request to convert the lead
    setTimeout(() => {
      toast({
        title: "Lead Converted",
        description: "Successfully converted to an opportunity",
        variant: "success"
      });
      navigate("/opportunities");
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Lead Not Found</h2>
          <p className="text-muted-foreground mb-4">The lead you're looking for could not be found.</p>
          <Button onClick={() => navigate("/leads")}>
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <Badge variant={lead.status === "Qualified" ? "success" : "default"}>
            {lead.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="success"
            className="gap-2"
            onClick={handleConvertLead}
          >
            <Check className="h-4 w-4" />
            Convert
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Meeting
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive gap-2">
                <Trash className="h-4 w-4" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Tabs className="w-full" defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">{lead.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Industry</p>
                      <p className="text-sm text-muted-foreground">{lead.industry}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Source</p>
                      <p className="text-sm text-muted-foreground">{lead.source}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Estimated Value</p>
                      <p className="text-sm text-muted-foreground">
                        ${lead.estimatedValue.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm text-muted-foreground">{lead.assignedTo.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Last Activity</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.lastActivityType} ({formatDate(lead.lastActivity)})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lead.activities.map((activity) => (
                      <div key={activity.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{activity.subject}</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{activity.type}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Activities
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{lead.notes}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Add Note
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          {/* AI-powered entity advice */}
          <EntityAdvice entityType="lead" entityId={leadId} />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left"
                onClick={handleConvertLead}
              >
                <Check className="h-4 w-4 mr-2" />
                Convert to Opportunity
              </Button>
              <Button variant="outline" className="w-full justify-start text-left text-destructive">
                <X className="h-4 w-4 mr-2" />
                Disqualify Lead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}