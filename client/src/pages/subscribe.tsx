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
import PayPalButton from '@/components/PayPalButton';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Check if Stripe and Elements are ready
  useEffect(() => {
    if (stripe && elements) {
      setIsLoading(false);
      console.log('Stripe Elements are ready');
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== Stripe Payment Form Submit ===');
    console.log('Stripe available:', !!stripe);
    console.log('Elements available:', !!elements);
    
    if (!stripe || !elements) {
      console.error('Stripe or Elements not ready');
      toast({
        title: "Payment Error",
        description: "Payment form is not ready. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('Confirming payment with Stripe...');
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscriptions?success=true`,
        },
        redirect: 'if_required',
      });

      console.log('Stripe confirmation result:', { error, paymentIntent });

      if (error) {
        console.error('Stripe payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        
        // Confirm payment on backend
        try {
          console.log('Confirming payment on backend with ID:', paymentIntent.id);
          const confirmResponse = await apiRequest("POST", "/api/confirm-payment", {
            paymentIntentId: paymentIntent.id
          });
          
          console.log('Backend confirmation response status:', confirmResponse.status);
          
          if (confirmResponse.ok) {
            toast({
              title: "Payment Successful",
              description: "Your subscription has been activated!",
            });
            navigate('/subscriptions?success=true');
          } else {
            const errorData = await confirmResponse.json();
            console.error('Backend confirmation error:', errorData);
            throw new Error(errorData.error || 'Failed to confirm payment');
          }
        } catch (confirmError: any) {
          console.error('Payment confirmation error:', confirmError);
          toast({
            title: "Payment Confirmation Error",
            description: confirmError.message || "Payment succeeded but subscription activation failed. Please contact support.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error('Payment process error:', err);
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="min-h-[60px]">
        <PaymentElement 
          options={{
            layout: 'tabs',
            business: {
              name: 'Averox Business AI'
            }
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isSubmitting} 
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
};

const SubscribeForm = ({ packageId }: { packageId: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal' | 'google'>('stripe');
  const [location, navigate] = useLocation();

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

      {/* PayPal Payment */}
      {selectedPaymentMethod === 'paypal' && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">PayPal Payment</h4>
          <PayPalButton
            amount="99.00"
            currency="USD"
            intent="CAPTURE"
            onSuccess={() => {
              toast({
                title: "Payment Successful",
                description: "Your subscription has been activated!",
              });
              navigate('/subscriptions?success=true');
            }}
            onError={(error) => {
              toast({
                title: "Payment Failed",
                description: error,
                variant: "destructive",
              });
            }}
          />
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
        {selectedPaymentMethod === 'stripe' && (
          <Button 
            type="submit" 
            disabled={!stripe || !elements || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay with Card
          </Button>
        )}
        {selectedPaymentMethod === 'google' && (
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay with Google
          </Button>
        )}
      </div>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  
  // Debug state changes
  useEffect(() => {
    console.log('Client Secret state changed:', clientSecret);
  }, [clientSecret]);
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
    console.log('=== handleConfirmSubscription called ===');
    console.log('User ID:', user?.id);
    console.log('Package ID:', packageId);
    console.log('Package Details:', packageDetails);
    
    if (!user?.id || !packageId) {
      console.error('Missing user ID or package ID', { userId: user?.id, packageId });
      toast({
        title: "Error",
        description: "Missing user or package information. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get selected payment method from radio buttons
      const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement;
      const selectedPaymentMethod = selectedRadio?.value || 'stripe';
      
      console.log('Selected payment method:', selectedPaymentMethod);
      console.log('Creating subscription with data:', { packageId, paymentMethod: selectedPaymentMethod });
      
      // Create subscription with selected payment method
      const response = await apiRequest("POST", "/api/create-subscription", { 
        packageId: packageId,
        paymentMethod: selectedPaymentMethod
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error response:', errorData);
        throw new Error(errorData.error || "Failed to create subscription");
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      console.log('Client secret received:', data.clientSecret);
      console.log('Setting clientSecret state...');
      
      if (selectedPaymentMethod === 'stripe' && data.clientSecret) {
        // Set client secret to show payment form for Stripe
        console.log('Setting client secret for Stripe payment:', data.clientSecret);
        setClientSecret(data.clientSecret);
        console.log('Client secret state updated');
        toast({
          title: "Payment Setup Complete",
          description: "Please complete your payment below to activate your subscription.",
        });
      } else if (data.success) {
        // Direct subscription or PayPal/Google Pay success
        toast({
          title: "Subscription Activated",
          description: data.message || "Your subscription has been created successfully!",
        });
        navigate('/subscriptions?success=true');
      } else if (data.clientSecret) {
        // This handles the case where clientSecret is returned but selectedPaymentMethod might not be 'stripe'
        console.log('Received client secret, setting up payment form:', data.clientSecret);
        setClientSecret(data.clientSecret);
        toast({
          title: "Payment Setup Complete",
          description: "Please complete your payment below to activate your subscription.",
        });
      } else {
        console.error('Unexpected response format:', data);
        throw new Error(data.message || "Failed to create subscription");
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
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
  if (clientSecret && packageDetails) {
    // Show Stripe payment form when client secret is available
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
            <CardDescription>
              Enter your card details below to complete your subscription to {packageDetails.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <h3 className="font-medium">{packageDetails.name}</h3>
              <p className="text-sm text-muted-foreground">{packageDetails.description}</p>
            </div>
            
            {stripePromise && (
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  }
                }}
              >
                <StripePaymentForm />
              </Elements>
            )}
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