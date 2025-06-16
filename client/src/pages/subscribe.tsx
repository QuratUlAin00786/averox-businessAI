import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Check, CreditCard } from 'lucide-react';
import { SiGoogle, SiPaypal } from 'react-icons/si';
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal' | 'google'>('stripe');
  const [location, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedPaymentMethod === 'stripe') {
        if (!stripe || !elements) {
          return;
        }

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
      } else if (selectedPaymentMethod === 'paypal') {
        // PayPal payment processing
        try {
          const response = await apiRequest("POST", "/api/create-subscription", {
            packageId,
            paymentMethod: 'paypal'
          });
          const data = await response.json();
          
          if (data.success) {
            toast({
              title: "Subscription Created",
              description: "Your subscription has been activated with PayPal!",
            });
            navigate('/subscriptions?success=true');
          } else {
            throw new Error(data.message || 'PayPal payment failed');
          }
        } catch (error: any) {
          toast({
            title: "PayPal Payment Failed",
            description: error.message || "Failed to process PayPal payment",
            variant: "destructive",
          });
        }
      } else if (selectedPaymentMethod === 'google') {
        // Google Pay processing
        try {
          const response = await apiRequest("POST", "/api/create-subscription", {
            packageId,
            paymentMethod: 'google-pay'
          });
          const data = await response.json();
          
          if (data.success) {
            toast({
              title: "Subscription Created",
              description: "Your subscription has been activated with Google Pay!",
            });
            navigate('/subscriptions?success=true');
          } else {
            throw new Error(data.message || 'Google Pay payment failed');
          }
        } catch (error: any) {
          toast({
            title: "Google Pay Payment Failed",
            description: error.message || "Failed to process Google Pay payment",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Pay securely with your credit or debit card'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <SiPaypal className="h-5 w-5 text-blue-600" />,
      description: 'Pay with your PayPal account'
    },
    {
      id: 'google',
      name: 'Google Pay',
      icon: <SiGoogle className="h-5 w-5 text-blue-500" />,
      description: 'Pay quickly with Google Pay'
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Select Payment Method</h4>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedPaymentMethod === method.id}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as any)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3 flex-1">
                {method.icon}
                <div>
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedPaymentMethod === method.id && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Stripe Payment Element */}
      {selectedPaymentMethod === 'stripe' && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Card Details</h4>
          <PaymentElement />
        </div>
      )}

      {/* PayPal Information */}
      {selectedPaymentMethod === 'paypal' && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <SiPaypal className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">PayPal Payment</span>
          </div>
          <p className="text-sm text-blue-700">
            You will be redirected to PayPal to complete your payment securely.
          </p>
        </div>
      )}

      {/* Google Pay Information */}
      {selectedPaymentMethod === 'google' && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <SiGoogle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Google Pay</span>
          </div>
          <p className="text-sm text-green-700">
            Pay quickly and securely using your Google Pay account.
          </p>
        </div>
      )}

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
        <Button 
          type="submit" 
          disabled={(!stripe && selectedPaymentMethod === 'stripe') || isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {selectedPaymentMethod === 'stripe' && 'Pay with Card'}
          {selectedPaymentMethod === 'paypal' && 'Pay with PayPal'}
          {selectedPaymentMethod === 'google' && 'Pay with Google'}
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
      // Get selected payment method from radio buttons
      const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement;
      const selectedPaymentMethod = selectedRadio?.value || 'stripe';
      
      // Create subscription with selected payment method
      const response = await apiRequest("POST", "/api/create-subscription", { 
        packageId: packageId,
        paymentMethod: selectedPaymentMethod
      });
      
      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }
      
      const data = await response.json();
      
      if (selectedPaymentMethod === 'stripe' && data.clientSecret) {
        // Set client secret to show payment form for Stripe
        setClientSecret(data.clientSecret);
        toast({
          title: "Payment Required",
          description: "Please complete your payment below to activate your subscription.",
        });
      } else if (data.success) {
        // Direct subscription or PayPal/Google Pay success
        toast({
          title: "Subscription Activated",
          description: data.message || "Your subscription has been created successfully!",
        });
        navigate('/subscriptions?success=true');
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

  // Show payment method selection first, then payment form if needed
  if (clientSecret && packageDetails.stripePriceId) {
    // Show Stripe payment form for packages with Stripe integration
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
                      "Payment will be processed securely through Stripe. Enter your payment details below to complete the subscription." :
                      "Direct Subscription - No Credit Card Required. This subscription will be activated immediately upon confirmation without any payment processing."
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Section - Always show for all packages */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Select Payment Method</h4>
            <div className="space-y-3">
              <div className="grid gap-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer bg-white hover:border-blue-300">
                  <input type="radio" name="paymentMethod" value="stripe" defaultChecked className="text-blue-600" />
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <div className="font-medium text-sm">Credit/Debit Card</div>
                    <div className="text-xs text-gray-500">Pay securely with your credit or debit card</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer bg-white hover:border-blue-300">
                  <input type="radio" name="paymentMethod" value="paypal" className="text-blue-600" />
                  <SiPaypal className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">PayPal</div>
                    <div className="text-xs text-gray-500">Pay with your PayPal account</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer bg-white hover:border-blue-300">
                  <input type="radio" name="paymentMethod" value="google" className="text-blue-600" />
                  <SiGoogle className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">Google Pay</div>
                    <div className="text-xs text-gray-500">Pay quickly with Google Pay</div>
                  </div>
                </label>
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
            {/* Always show subscription button - let backend handle payment method logic */}
            <Button 
              onClick={handleConfirmSubscription}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}