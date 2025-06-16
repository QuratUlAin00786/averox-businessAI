import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionPackage } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ packageId }: { packageId: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscriptions?success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
      // Success case will be handled by the return_url redirect
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/subscriptions')}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!stripe || isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Subscribe Now
        </Button>
      </div>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [packageId, setPackageId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const packageIdParam = params.get('packageId');

  // Fetch package details
  const { data: packageDetails, isLoading: packageLoading } = useQuery({
    queryKey: ['/api/subscription-packages', packageIdParam],
    queryFn: async () => {
      if (!packageIdParam) return null;
      
      const response = await fetch(`/api/subscription-packages/${packageIdParam}`);
      if (!response.ok) {
        throw new Error('Package not found');
      }
      return response.json();
    },
    enabled: !!packageIdParam,
  });

  useEffect(() => {
    if (packageIdParam) {
      const pkgId = parseInt(packageIdParam, 10);
      
      if (isNaN(pkgId)) {
        toast({
          title: "Invalid Package",
          description: "The selected package is invalid",
          variant: "destructive",
        });
        navigate('/subscriptions');
        return;
      }
      
      setPackageId(pkgId);
      
      // Wait for user to be loaded before creating subscription
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe to a package",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }
      
      // Don't auto-create subscription, just load package details for confirmation
      // Package details will be fetched via the query below
    } else {
      toast({
        title: "No Package Selected",
        description: "Please select a subscription package first",
      });
      navigate('/subscriptions');
    }
  }, [packageIdParam, toast, navigate]);

  if (packageLoading || !packageDetails) {
    return (
      <div className="container max-w-xl py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const handleConfirmSubscription = async () => {
    if (!user?.id || !packageId) return;
    
    setIsProcessing(true);
    
    try {
      const response = await apiRequest("POST", "/api/create-subscription", { 
        packageId: packageId, 
        userId: user.id 
      });
      
      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Subscription Activated",
          description: "Your subscription has been created successfully!",
        });
        navigate('/subscriptions?success=true');
      } else if (data.clientSecret) {
        // Stripe payment required - show Stripe elements
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.message || "Failed to create subscription");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not create subscription",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show Stripe payment form if clientSecret is available
  if (clientSecret) {
    return (
      <div className="container max-w-xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Complete Your Payment</span>
              <div className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
                ${packageDetails.price}/{packageDetails.interval}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <h3 className="font-medium">{packageDetails.name}</h3>
              <p className="text-sm text-muted-foreground">{packageDetails.description}</p>
            </div>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm packageId={packageId as number} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show subscription confirmation
  return (
    <div className="container max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Confirm Your Subscription</span>
            <div className="text-sm font-normal bg-primary/10 text-primary px-3 py-1 rounded-full">
              ${packageDetails.price}/{packageDetails.interval}
            </div>
          </CardTitle>
          <CardDescription>
            Review your subscription details and confirm to activate your plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">{packageDetails.name}</h3>
            <p className="text-muted-foreground mb-4">{packageDetails.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Users:</span>
                <span className="ml-2">{packageDetails.maxUsers} users</span>
              </div>
              <div>
                <span className="font-medium">Contacts:</span>
                <span className="ml-2">{packageDetails.maxContacts.toLocaleString()} contacts</span>
              </div>
              <div>
                <span className="font-medium">Storage:</span>
                <span className="ml-2">{packageDetails.maxStorage} GB</span>
              </div>
              <div>
                <span className="font-medium">Billing:</span>
                <span className="ml-2">Monthly</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-blue-800 mb-1">Payment Information</div>
                  <div className="text-blue-700">
                    {packageDetails.stripePriceId ? 
                      "Payment will be processed securely through Stripe. You'll be redirected to complete payment after confirmation." :
                      "Direct Subscription - No Credit Card Required. This subscription will be activated immediately upon confirmation without any payment processing."
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {packageDetails.features && (
            <div>
              <h4 className="font-medium mb-3">Features Included:</h4>
              <ul className="space-y-2">
                {(Array.isArray(packageDetails.features) ? packageDetails.features : JSON.parse(packageDetails.features)).map((feature: string, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/subscriptions')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSubscription}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Confirm Subscription'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}