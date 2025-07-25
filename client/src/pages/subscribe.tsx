import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Check, CreditCard, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import PayPalButton from '@/components/PayPalButton';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscribeProps {
  planId?: number;
}

interface Plan {
  id: number;
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: 1,
    name: "Starter",
    price: "29",
    interval: "month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 users",
      "500 contacts",
      "Basic CRM features",
      "Email integration",
      "Mobile app access",
      "Basic reporting",
      "24/7 chat support"
    ]
  },
  {
    id: 2,
    name: "Professional",
    price: "59",
    interval: "month",
    description: "Advanced features for growing businesses",
    highlighted: true,
    features: [
      "Up to 25 users",
      "5,000 contacts",
      "Advanced AI features",
      "Marketing automation",
      "Sales forecasting",
      "Custom workflows",
      "API access",
      "Phone support"
    ]
  },
  {
    id: 3,
    name: "Enterprise",
    price: "99",
    interval: "month",
    description: "Complete solution with manufacturing",
    features: [
      "Unlimited users",
      "Unlimited contacts",
      "Full Manufacturing Suite",
      "Advanced AI & Analytics",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee"
    ]
  },
  {
    id: 4,
    name: "Ultimate",
    price: "199",
    interval: "month",
    description: "Ultimate Business AI with everything",
    features: [
      "Everything in Enterprise",
      "Multi-company management",
      "Advanced compliance tools",
      "Custom AI training",
      "On-premise deployment",
      "Implementation specialist",
      "Priority feature requests"
    ]
  }
];

const CheckoutForm = ({ plan, onBack, clientSecret }: { plan: Plan; onBack: () => void; clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Add error boundary to prevent browser error popups
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      console.log('Caught error:', event.error);
      return true;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.log('Caught unhandled rejection:', event.reason);
      return true;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  // Listen for PayPal success events
  useEffect(() => {
    const handlePayPalSuccess = (event: CustomEvent) => {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated via PayPal.",
      });
    };

    window.addEventListener('paypal-success', handlePayPalSuccess as EventListener);
    
    return () => {
      window.removeEventListener('paypal-success', handlePayPalSuccess as EventListener);
    };
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if already processing
    if (isLoading) {
      return;
    }

    if (!stripe || !elements) {
      toast({
        title: "Payment System Loading",
        description: "Please wait for the payment system to load completely.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCardError(null);
    
    try {
      console.log('Starting payment with client secret:', clientSecret?.substring(0, 20) + '...');
      
      // Validate client secret
      if (!clientSecret) {
        throw new Error('Payment not properly initialized. Please try again.');
      }
      
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Payment form not ready. Please refresh the page.');
      }

      // Validate card element is ready
      try {
        // Attempt to create payment method to validate card
        const { error: methodError } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });
        
        if (methodError) {
          throw new Error(methodError.message || 'Please check your card information.');
        }
      } catch (validationError: any) {
        throw new Error(validationError.message || 'Please complete all card information fields.');
      }
      
      // Confirm payment using CardElement
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      console.log('Payment result:', { 
        error: error ? { type: error.type, message: error.message } : null,
        paymentIntent: paymentIntent ? { id: paymentIntent.id, status: paymentIntent.status } : null
      });

      if (error) {
        console.error('Payment failed:', error);
        setCardError(error.message || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: error.message || "Payment could not be processed.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        });
        
        setTimeout(() => {
          setLocation('/?subscription=success');
        }, 1500);
      } else {
        console.log('Payment status:', paymentIntent?.status);
        toast({
          title: "Payment Processing",
          description: `Payment status: ${paymentIntent?.status || 'processing'}`,
        });
      }
      
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error?.message || "An unexpected error occurred. Please try again.";
      setCardError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plan Selection
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">Secure checkout powered by Stripe and PayPal</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{plan.name} Plan</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                {plan.highlighted && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Included Features:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${plan.price}/{plan.interval}</span>
              </div>

              <div className="text-xs text-gray-500">
                <Shield className="inline h-3 w-3 mr-1" />
                Secure payment • Cancel anytime • 30-day money-back guarantee
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              <CreditCard className="inline mr-2 h-5 w-5" />
              Payment Method
            </h2>

            <div className="space-y-6">
              {/* Stripe Payment Form */}
              <div>
                <h3 className="font-medium mb-3">Credit or Debit Card</h3>
                
                {/* Test Card Information */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Test Card Information</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div><strong>Card Number:</strong> 4242 4242 4242 4242</div>
                    <div><strong>Expiry:</strong> Any future date (e.g., 12/34)</div>
                    <div><strong>CVC:</strong> Any 3 digits (e.g., 123)</div>
                    <div><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className={`p-3 border rounded-lg bg-white ${cardError ? 'border-red-500' : 'border-gray-300'}`}>
                    <CardElement 
                      onChange={handleCardChange}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  {cardError && (
                    <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200">
                      {cardError}
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={!stripe || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay $${plan.price}/${plan.interval}`
                    )}
                  </Button>
                </form>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or pay with</span>
                </div>
              </div>

              {/* PayPal Payment */}
              <div key={`paypal-section-${Date.now()}`}>
                <h3 className="font-medium mb-3">PayPal</h3>
                <PayPalButton
                  key={`paypal-${plan.id}-${Date.now()}`}
                  amount={plan.price}
                  currency="USD"
                  intent="CAPTURE"
                />
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>• Your subscription will automatically renew each {plan.interval}</p>
              <p>• You can cancel or change your plan anytime from your account settings</p>
              <p>• All payments are secured with 256-bit SSL encryption</p>
            </div>
          </Card>
        </div>

        {/* Security Badges */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center space-x-6 text-gray-400">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-1" />
              <span className="text-xs">SSL Secured</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-1" />
              <span className="text-xs">PCI Compliant</span>
            </div>
            <div className="text-xs">30-Day Money Back Guarantee</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Subscribe({ planId: propPlanId }: SubscribeProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute('/subscribe/:id');

  const initializePayment = async (plan: Plan) => {
    if (isInitializing || clientSecret) {
      return; // Prevent duplicate initialization
    }
    
    setIsInitializing(true);
    try {
      // Validate plan data
      if (!plan || !plan.price || !plan.id) {
        throw new Error('Invalid plan selected');
      }

      const amount = parseFloat(plan.price);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid plan amount');
      }

      console.log('Initializing payment for plan:', { id: plan.id, name: plan.name, amount });

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          planId: plan.id,
          planName: plan.name
        }),
      });
      
      if (!response.ok) {
        let errorMessage = `Payment setup failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Payment intent response:', { hasClientSecret: !!data.clientSecret });
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowCheckout(true);
        console.log('Payment initialization successful');
      } else {
        throw new Error('No client secret received from payment processor');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to initialize payment. Please try again.';
      
      toast({
        title: "Payment Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Auto-redirect to dashboard if user wants to go back
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('redirect') === 'dashboard') {
      setLocation('/');
      return;
    }
  }, [setLocation]);

  useEffect(() => {
    // Get planId from URL params or props
    const planId = params?.id ? parseInt(params.id) : propPlanId || 1;
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      setLocation('/landing');
      return;
    }
    setSelectedPlan(plan);
  }, [params?.id, propPlanId, setLocation]);

  if (!selectedPlan) {
    return <div>Loading...</div>;
  }

  if (showCheckout && clientSecret && selectedPlan) {
    return (
      <Elements 
        stripe={stripePromise}
        key={clientSecret}
      >
        <CheckoutForm 
          plan={selectedPlan} 
          onBack={() => setShowCheckout(false)}
          clientSecret={clientSecret}
        />
      </Elements>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/landing')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            You've Selected the {selectedPlan.name} Plan
          </h1>
          <p className="text-gray-600">
            Perfect choice! Let's get you set up with your new subscription.
          </p>
        </div>

        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              ${selectedPlan.price}
              <span className="text-lg font-normal text-gray-600">/{selectedPlan.interval}</span>
            </div>
            <p className="text-gray-600">{selectedPlan.description}</p>
            {selectedPlan.highlighted && (
              <Badge className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Most Popular Choice
              </Badge>
            )}
          </div>

          <div className="space-y-3 mb-8">
            {selectedPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <Button
            onClick={() => initializePayment(selectedPlan)}
            disabled={isInitializing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 text-lg"
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up payment...
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>

          <div className="mt-4 text-xs text-gray-500">
            <Shield className="inline h-3 w-3 mr-1" />
            Secure checkout • Cancel anytime • 30-day money-back guarantee
          </div>
        </Card>
      </div>
    </div>
  );
}