import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Zap, TrendingUp, Users, PieChart, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { generateInsights, Insight } from "@/lib/openai";

interface AIInsightsProps {
  className?: string;
}

export function AIInsights({ className }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { settings } = useSystemSettings();
  
  // Get dashboard stats to analyze
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Determine which type of insights to display based on settings
  const determineInsightType = () => {
    const preferences = settings?.dashboardPreferences?.aiInsightTypes || [];
    if (preferences.length === 0) return 'all';
    
    // Just pick the first one for simplicity - in a real app you might rotate these
    return preferences[0];
  };
  
  useEffect(() => {
    async function loadInsights() {
      if (!statsData || isStatsLoading) return;
      
      setLoading(true);
      try {
        const insightType = determineInsightType();
        const newInsights = await generateInsights(statsData, insightType);
        setInsights(newInsights);
      } catch (error) {
        console.error("Failed to load AI insights:", error);
        toast({
          title: "Couldn't load AI insights",
          description: "There was a problem getting AI-powered insights. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadInsights();
  }, [statsData, isStatsLoading, settings?.dashboardPreferences?.aiInsightTypes, toast]);
  
  // Get the appropriate icon for each insight category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'prediction':
        return <PieChart className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };
  
  // Get color based on importance
  const getImportanceColor = (importance: string): string => {
    switch (importance.toLowerCase()) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };
  
  const renderInsight = (insight: Insight, index: number) => {
    return (
      <div key={index} className="flex flex-col space-y-2 p-4 border rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(insight.category)}
            <h3 className="font-medium">{insight.title}</h3>
          </div>
          <Badge className={getImportanceColor(insight.importance)}>
            {insight.importance}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
      </div>
    );
  };
  
  const renderLoadingState = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={i} className="flex flex-col space-y-2 p-4 border rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
    ));
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Smart recommendations based on your business data
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setLoading(true);
              generateInsights(statsData, determineInsightType())
                .then(newInsights => {
                  setInsights(newInsights);
                  toast({
                    title: "Insights refreshed",
                    description: "Latest AI analysis of your business data",
                  });
                })
                .catch(error => {
                  console.error("Failed to refresh insights:", error);
                  toast({
                    title: "Refresh failed",
                    description: "Couldn't get new insights right now",
                    variant: "destructive",
                  });
                })
                .finally(() => setLoading(false));
            }}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="space-y-3">
          {loading || isStatsLoading ? renderLoadingState() : 
            insights.length > 0 ? 
              insights.map(renderInsight) : 
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">No insights available</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't generate insights with the current data.
                  Try refreshing or adding more data.
                </p>
              </div>
          }
        </div>
      </CardContent>
    </Card>
  );
}