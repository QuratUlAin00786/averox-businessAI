import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { SubscriptionPackage } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for success query param
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  
  // Show success message if redirected from successful payment
  useEffect(() => {
    if (success === 'true') {
      toast({
        title: "Subscription Activated",
        description: "Your subscription has been successfully activated! You now have access to all features.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, "/subscriptions");
    }
  }, [success, toast]);
  
  const { data: packages, isLoading } = useQuery({
    queryKey: ['/api/subscription-packages'],
    select: (data: SubscriptionPackage[]) => 
      // Sort by display order
      [...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  });
  
  const handleSubscribe = async (packageId: number) => {
    setIsSubmitting(true);
    setSelectedPackage(packages?.find(p => p.id === packageId) || null);
    
    try {
      // Navigate to subscribe page with package ID
      navigate(`/subscribe?packageId=${packageId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Get feature list as array
  const getFeatures = (pkg: SubscriptionPackage) => {
    if (!pkg.features) return [];
    
    if (typeof pkg.features === 'string') {
      try {
        return JSON.parse(pkg.features);
      } catch (e) {
        return [pkg.features];
      }
    }
    
    return pkg.features;
  };
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Select the subscription that best fits your business needs.
            All plans include core CRM features, with additional capabilities in higher tiers.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages?.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`flex flex-col h-full ${
                  pkg.name.includes('Pro') ? 'border-primary shadow-md' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{pkg.name}</CardTitle>
                    {pkg.name.includes('Pro') && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <p className="text-3xl font-bold">${pkg.price}</p>
                    <p className="text-muted-foreground">per {pkg.interval}</p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {getFeatures(pkg).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>Up to {pkg.maxUsers} user{pkg.maxUsers > 1 ? 's' : ''}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>{pkg.maxContacts.toLocaleString()} contacts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>{pkg.maxStorage}GB storage</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={pkg.name.includes('Pro') ? "default" : "outline"}
                    disabled={isSubmitting}
                    onClick={() => handleSubscribe(pkg.id)}
                  >
                    {isSubmitting && selectedPackage?.id === pkg.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    ) : null}
                    Select Plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}