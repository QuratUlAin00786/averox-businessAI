import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface EntityAdviceProps {
  entityType: string;
  entityId: number;
}

export function EntityAdvice({ entityType, entityId }: EntityAdviceProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch personalized advice from the AI assistant API
  const { 
    data: advice, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<string>({
    queryKey: [`/api/ai-assistant/entity-advice/${entityType}/${entityId}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle regenerating advice
  const handleRegenerateAdvice = async () => {
    setIsGenerating(true);
    try {
      await refetch();
      toast({
        title: "Advice Regenerated",
        description: "New personalized advice has been generated.",
      });
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate new advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // If loading, show a skeleton UI
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <h3 className="font-medium leading-none">AI Assistant Advice</h3>
              <p className="text-xs text-muted-foreground">
                Personalized recommendations for this {entityType}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded mt-2"></div>
            <div className="h-4 w-5/6 bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded"></div>
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
                <h3 className="font-medium leading-none">Error Loading Advice</h3>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-center text-muted-foreground text-sm mb-4">
              There was an error loading AI advice. This might be due to API limitations or service unavailability.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Format advice for display - split into paragraphs
  const formatAdvice = (adviceText: string | undefined | null) => {
    if (!adviceText) return [];
    return adviceText.split('\n').filter(para => para.trim().length > 0);
  };
  
  const formattedAdvice = formatAdvice(advice || "");
  
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="space-y-1">
              <h3 className="font-medium leading-none">AI Assistant Advice</h3>
              <p className="text-xs text-muted-foreground">
                Personalized recommendations for this {entityType}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px] pr-3">
          {formattedAdvice.length > 0 ? (
            <div className="space-y-3">
              {formattedAdvice.map((paragraph, index) => (
                <p key={index} className="text-sm">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No specific advice available for this {entityType} yet.
            </p>
          )}
        </ScrollArea>
        
        <div className="flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="default" 
              size="sm"
              className="w-full text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Apply Advice
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleRegenerateAdvice}
              disabled={isGenerating || isRefetching}
            >
              {isGenerating || isRefetching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}