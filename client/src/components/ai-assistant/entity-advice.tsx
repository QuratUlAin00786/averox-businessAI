import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Loader2, SquareAsterisk, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface EntityAdviceProps {
  entityType: 'lead' | 'opportunity' | 'contact' | 'task' | 'event';
  entityId: number;
}

export const EntityAdvice = ({ entityType, entityId }: EntityAdviceProps) => {
  const { toast } = useToast();
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<{ advice: string }>({
    queryKey: [`/api/ai/entity-advice/${entityType}/${entityId}`],
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing advice",
      description: "Generating new personalized advice..."
    });
  };
  
  if (isLoading) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Advice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>Unable to load advice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            {error instanceof Error 
              ? error.message 
              : "There was an error generating personalized advice. Please try again later."}
          </p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI Advice</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={handleRefresh}
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh Advice</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative py-2 px-3 bg-background rounded-md">
          <SquareAsterisk className="absolute -top-1 -left-1 h-4 w-4 text-primary opacity-60" />
          <SquareAsterisk className="absolute -bottom-1 -right-1 h-4 w-4 text-primary opacity-60" />
          <p className="text-sm italic relative">
            {data?.advice || "No advice available for this entity."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};