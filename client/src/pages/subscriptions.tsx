import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/layout";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { SubscriptionPackage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Default user ID for demo
const DEMO_USER_ID = 1;

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: packages, isLoading } = useQuery({
    queryKey: ['/api/subscription-packages'],
    select: (data: SubscriptionPackage[]) => 
      // Sort by display order
      [...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  });
  
  const handleSubscribe = async (packageId: number) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/create-subscription', {
        userId: DEMO_USER_ID,
        packageId
      });
      
      const data = await response.json();
      
      // Redirect to a checkout page with the client secret
      if (data.clientSecret) {
        // For demo purposes we'll just show a success message
        toast({
          title: "Subscription created successfully",
          description: "You've been subscribed to the selected package!",
        });
      } else {
        throw new Error("No client secret returned");
      }
    } catch (error) {
      toast({
        title: "Error creating subscription",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
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
    <Layout>
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
                      {getFeatures(pkg).map((feature, index) => (
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
    </Layout>
  );
}