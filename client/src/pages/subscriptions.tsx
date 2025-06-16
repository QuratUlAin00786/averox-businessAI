import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, CheckCircle } from "lucide-react";
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

  // Fetch user's current subscriptions
  const { data: userSubscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/user-subscriptions'],
    enabled: !!user?.id,
  });

  // Get current active subscription
  const activeSubscription = userSubscriptions?.find((sub: any) => 
    sub.status === 'Active' && sub.userId === user?.id
  );

  // Get the package details for the active subscription
  const activePackage = activeSubscription ? 
    packages?.find(pkg => pkg.id === activeSubscription.packageId) : null;
  
  const handleSubscribe = async (packageId: number) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a package",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Check if user already has this subscription
    const existingSubscription = userSubscriptions?.find((sub: any) => 
      sub.packageId === packageId && sub.status === 'Active' && sub.userId === user.id
    );

    if (existingSubscription) {
      toast({
        title: "Already Subscribed",
        description: "You already have an active subscription to this plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSelectedPackage(packages?.find(p => p.id === packageId) || null);
    
    try {
      // Navigate to subscribe page with package ID for confirmation
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
          <h1 className="text-3xl font-bold mb-3">
            {activeSubscription ? 'Your Subscription' : 'Choose Your Plan'}
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {activeSubscription 
              ? 'Manage your current subscription and explore upgrade options.'
              : 'Select the subscription that best fits your business needs. All plans include core CRM features, with additional capabilities in higher tiers.'
            }
          </p>
        </div>

        {/* Current Subscription Status */}
        {activeSubscription && activePackage && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-800">Current Plan: {activePackage.name}</CardTitle>
                    <CardDescription className="text-green-600">
                      Active until {new Date(activeSubscription.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">${activePackage.price}</div>
                  <div className="text-sm text-green-600">per {activePackage.interval}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-800">Users</div>
                  <div className="text-green-600">{activePackage.maxUsers} users</div>
                </div>
                <div>
                  <div className="font-medium text-green-800">Contacts</div>
                  <div className="text-green-600">{activePackage.maxContacts.toLocaleString()} contacts</div>
                </div>
                <div>
                  <div className="font-medium text-green-800">Storage</div>
                  <div className="text-green-600">{activePackage.maxStorage} GB</div>
                </div>
                <div>
                  <div className="font-medium text-green-800">Status</div>
                  <div className="text-green-600 font-medium">{activeSubscription.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubscription && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3">Upgrade Your Plan</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Explore our other plans to get more features and capabilities for your business.
            </p>
          </div>
        )}
        
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