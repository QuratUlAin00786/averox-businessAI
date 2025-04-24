import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Tag,
  Star,
  ExternalLink,
  FileText,
  MessageSquare,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EntityAdvice } from "@/components/ai-assistant";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LeadDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const leadId = parseInt(id);
  
  // Fetch lead data
  const { 
    data: lead, 
    isLoading: isLoadingLead, 
    error: leadError 
  } = useQuery({
    queryKey: [`/api/leads/${id}`],
    enabled: !isNaN(leadId),
  });
  
  // Fetch lead activities
  const { 
    data: activities, 
    isLoading: isLoadingActivities 
  } = useQuery({
    queryKey: [`/api/activities`, { relatedToType: "lead", relatedToId: leadId }],
    enabled: !isNaN(leadId),
  });
  
  // Mutation to update lead status
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lead Updated",
        description: "Lead status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/leads/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update lead status: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle back button
  const handleBack = () => {
    navigate("/leads");
  };
  
  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    updateLeadStatusMutation.mutate({ status: newStatus });
  };
  
  // If lead is loading, show loading state
  if (isLoadingLead) {
    return (
      <div className="container py-6 space-y-6 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded-md" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted rounded-md" />
                <div className="h-20 bg-muted rounded-md" />
                <div className="h-20 bg-muted rounded-md" />
                <div className="h-20 bg-muted rounded-md" />
              </div>
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-[300px] bg-muted rounded-md" />
          </div>
        </div>
      </div>
    );
  }
  
  // If there was an error fetching the lead
  if (leadError) {
    return (
      <div className="container py-6 space-y-6 max-w-screen-xl mx-auto">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Lead</CardTitle>
            <CardDescription>
              There was a problem loading this lead. The lead may have been deleted or you may not have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleBack}>
              Return to Leads List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "New":
        return "default";
      case "Qualified":
        return "success";
      case "Contacted":
        return "warning";
      case "Not Interested":
        return "destructive";
      case "Converted":
        return "purple";
      default:
        return "secondary";
    }
  };
  
  return (
    <div className="container py-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <Badge variant={getStatusVariant(lead?.status)}>
            {lead?.status || "Unknown Status"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Update Lead Status</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Current status: <Badge variant={getStatusVariant(lead?.status)}>{lead?.status}</Badge>
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={lead?.status === "New" ? "default" : "outline"} 
                    onClick={() => handleStatusChange("New")}
                  >
                    New
                  </Button>
                  <Button 
                    variant={lead?.status === "Qualified" ? "default" : "outline"} 
                    onClick={() => handleStatusChange("Qualified")}
                  >
                    Qualified
                  </Button>
                  <Button 
                    variant={lead?.status === "Contacted" ? "default" : "outline"} 
                    onClick={() => handleStatusChange("Contacted")}
                  >
                    Contacted
                  </Button>
                  <Button 
                    variant={lead?.status === "Not Interested" ? "default" : "outline"} 
                    onClick={() => handleStatusChange("Not Interested")}
                  >
                    Not Interested
                  </Button>
                  <Button 
                    variant={lead?.status === "Converted" ? "default" : "outline"} 
                    onClick={() => handleStatusChange("Converted")}
                  >
                    Converted
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Lead information grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{lead?.firstName} {lead?.lastName}</CardTitle>
                  <CardDescription>{lead?.company || "No Company"}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {lead?.budget && (
                    <Badge variant="outline" className="ml-2 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      ${lead.budget}
                    </Badge>
                  )}
                  {lead?.estimatedValue && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-emerald-50">
                      <Star className="h-3 w-3 text-emerald-500" />
                      ${lead.estimatedValue}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{lead?.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{lead?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{lead?.company || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Title</p>
                    <p className="text-sm text-muted-foreground">{lead?.title || "Not provided"}</p>
                  </div>
                </div>
                {lead?.source && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Source</p>
                      <p className="text-sm text-muted-foreground">{lead.source}</p>
                    </div>
                  </div>
                )}
                {lead?.location && (
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{lead.location}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {lead?.notes && (
                <div className="mt-6">
                  <Separator className="my-4" />
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lead Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(lead?.createdAt)} 
                        {lead?.createdAt && ` (${formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Modified</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(lead?.updatedAt)}
                        {lead?.updatedAt && ` (${formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-sm text-muted-foreground">{lead?.budget ? `$${lead.budget}` : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Estimated Value</p>
                      <p className="text-sm text-muted-foreground">{lead?.estimatedValue ? `$${lead.estimatedValue}` : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Owner</p>
                      <p className="text-sm text-muted-foreground">{lead?.owner || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Lead Source</p>
                      <p className="text-sm text-muted-foreground">{lead?.source || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {lead?.nextSteps || "No next steps defined for this lead."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="space-y-4">
              {isLoadingActivities ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="animate-pulse flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                            <div className="h-3 w-1/2 bg-muted rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full flex-none">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.detail}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(activity.createdAt)} 
                              {activity.createdAt && ` (${formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })})`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground text-sm">No activities found for this lead.</p>
                    <Button variant="outline" className="mt-4">Record an Activity</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="communications" className="space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground text-sm">No communication history found.</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Log Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Side panel - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* AI-powered advice panel */}
          <EntityAdvice entityType="lead" entityId={leadId} />
          
          {/* Timeline panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Timeline</CardTitle>
              <CardDescription>
                Recent activity for this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...(activities || [])].slice(0, 3).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Clock className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.createdAt && formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!activities || activities.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity found
                  </p>
                )}
              </div>
              
              {activities && activities.length > 3 && (
                <Button variant="link" className="mt-2 px-0" onClick={() => setActiveTab("activities")}>
                  View all activities
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Related items panel - could show opportunities, accounts, etc. */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Related Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No related items yet.
              </p>
              <Button variant="outline" className="w-full mt-4">
                Create Opportunity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}