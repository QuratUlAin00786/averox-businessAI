import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, ChevronDown, ChevronUp, BrainCog, BarChart3, Users, Clock, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface BusinessInsight {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction: string;
  entityId?: number;
  entityType?: string;
  metadata?: Record<string, any>;
}

const typeIcons = {
  lead_followup: <Users className="h-5 w-5" />,
  opportunity_stale: <BarChart3 className="h-5 w-5" />,
  invoice_overdue: <FileText className="h-5 w-5" />,
  event_preparation: <Clock className="h-5 w-5" />,
  contact_engagement: <Users className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const InsightCard = ({ insight }: { insight: BusinessInsight }) => {
  const [expanded, setExpanded] = useState(false);
  
  const icon = typeIcons[insight.type as keyof typeof typeIcons] || <BrainCog className="h-5 w-5" />;
  const priorityColor = priorityColors[insight.priority];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-full", 
              insight.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' : 
              insight.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/20' : 
              'bg-blue-100 dark:bg-blue-900/20'
            )}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
              <CardDescription className="mt-1">
                {insight.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardDescription>
            </div>
          </div>
          <Badge className={cn("ml-2", priorityColor)}>
            {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <h4 className="font-medium text-sm">Suggested Action</h4>
            <p className="text-sm mt-1">{insight.suggestedAction}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Show More
            </>
          )}
        </Button>
        
        {insight.entityId && insight.entityType && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const entityType = insight.entityType!.toLowerCase();
              window.location.href = `/${entityType}s/${insight.entityId}`;
            }}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const LoadingInsightCard = () => (
  <Card className="mb-4">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-8 w-24" />
    </CardFooter>
  </Card>
);

export const BusinessInsights = () => {
  const { toast } = useToast();
  
  const {
    data: insights,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<BusinessInsight[]>({
    queryKey: ['/api/ai/business-insights'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing insights",
      description: "Generating new business intelligence..."
    });
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <LoadingInsightCard />
          <LoadingInsightCard />
          <LoadingInsightCard />
        </>
      );
    }
    
    if (isError) {
      return (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Unable to load insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {error instanceof Error 
                ? error.message 
                : "There was an error loading your business insights. Please try again later."}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleRefresh}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    if (!insights || insights.length === 0) {
      return (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>No Insights Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We don't have any business insights to show right now. Check back later or refresh to generate new insights.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleRefresh}>
              Generate Insights
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return insights.map((insight, index) => (
      <InsightCard key={index} insight={insight} />
    ));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCog className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Business Insights</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Insights'
          )}
        </Button>
      </div>
      
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};