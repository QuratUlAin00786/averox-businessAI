import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { SubscriptionPackage } from '@shared/schema';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log("Stripe Key:", import.meta.env.VITE_STRIPE_PUBLIC_KEY);
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
  const [, navigate] = useLocation();
  const { toast } = useToast();
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
      
      // Create PaymentIntent as soon as the page loads
      apiRequest("POST", "/api/create-subscription", { packageId: pkgId })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to create subscription");
          }
          return res.json();
        })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Could not initialize payment",
            variant: "destructive",
          });
          navigate('/subscriptions');
        });
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

  if (!clientSecret) {
    return (
      <div className="container max-w-xl py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="container max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Complete Your Subscription</span>
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