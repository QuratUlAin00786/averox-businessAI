import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Clock,
  AlertCircle,
  InfoIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Define the types for our insights data structure
export interface BusinessInsight {
  id: number;
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  suggestedAction: string;
  entityId?: number;
  entityType?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export function BusinessInsights() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch business insights from the AI assistant API
  const { data: insights, isLoading, error, refetch } = useQuery<BusinessInsight[]>({
    queryKey: ['/api/ai-assistant/business-insights'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Function to apply filters based on active tab
  const getFilteredInsights = () => {
    if (!insights || !Array.isArray(insights)) return [];
    
    switch (activeTab) {
      case "high":
        return insights.filter((insight: BusinessInsight) => insight.priority === "high");
      case "medium":
        return insights.filter((insight: BusinessInsight) => insight.priority === "medium");
      case "low":
        return insights.filter((insight: BusinessInsight) => insight.priority === "low");
      case "leads":
        return insights.filter((insight: BusinessInsight) => insight.entityType === "lead");
      case "opportunities":
        return insights.filter((insight: BusinessInsight) => insight.entityType === "opportunity");
      case "accounts":
        return insights.filter((insight: BusinessInsight) => insight.entityType === "account");
      default:
        return insights;
    }
  };
  
  // Handle navigation to an entity
  const handleNavigateToEntity = (insight: BusinessInsight) => {
    if (insight.entityType && insight.entityId) {
      navigate(`/${insight.entityType}s/${insight.entityId}`);
    }
  };
  
  // If loading, show a skeleton UI
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div className="space-y-1">
                <h3 className="font-medium leading-none">Business Insights</h3>
                <p className="text-xs text-muted-foreground">AI-generated recommendations</p>
              </div>
            </div>
            <div className="animate-pulse h-7 w-24 bg-muted rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2 p-4 border rounded-md">
                <div className="h-5 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-2/3 bg-muted rounded"></div>
                <div className="h-8 w-1/3 bg-muted rounded mt-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="space-y-1">
                <h3 className="font-medium leading-none">Error Loading Insights</h3>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              There was an error loading AI insights. This might be due to connectivity issues or service unavailability.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredInsights = getFilteredInsights();
  
  // If we have no insights after filtering, show empty state
  if (filteredInsights.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div className="space-y-1">
                <h3 className="font-medium leading-none">Business Insights</h3>
                <p className="text-xs text-muted-foreground">AI-generated recommendations</p>
              </div>
            </div>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 h-7 w-auto">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="high" className="text-xs">High Priority</TabsTrigger>
                <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <InfoIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No insights available for this filter. Try selecting a different category or check back later.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setActiveTab("all")}>
              Show All Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render the actual insights
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <h3 className="font-medium leading-none">Business Insights</h3>
              <p className="text-xs text-muted-foreground">AI-generated recommendations</p>
            </div>
          </div>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 h-7 w-auto">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="high" className="text-xs">High Priority</TabsTrigger>
              <TabsTrigger value="leads" className="text-xs">Leads</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredInsights.map((insight: BusinessInsight) => (
            <Card key={insight.id} className={`border-l-4 ${
              insight.priority === 'high' 
                ? 'border-l-destructive' 
                : insight.priority === 'medium'
                  ? 'border-l-warning'
                  : 'border-l-primary'
            }`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={
                        insight.priority === 'high' 
                          ? 'destructive' 
                          : insight.priority === 'medium'
                            ? 'default'
                            : 'outline'
                      }>
                        {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      {insight.timestamp ? new Date(insight.timestamp).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {insight.entityType && insight.entityId ? (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleNavigateToEntity(insight)}
                    >
                      {insight.suggestedAction}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {insight.suggestedAction}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="link" size="sm" className="mx-auto" onClick={() => refetch()}>
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Generate New Insights
        </Button>
      </CardFooter>
    </Card>
  );
}