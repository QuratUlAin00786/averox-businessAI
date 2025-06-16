import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

const CheckoutForm = ({ plan, onBack }: { plan: Plan; onBack: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?subscription=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated.",
        });
        setLocation('/dashboard?subscription=success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <PaymentElement />
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
              <div>
                <h3 className="font-medium mb-3">PayPal</h3>
                <PayPalButton
                  amount={plan.price}
                  currency="USD"
                  intent="subscription"
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute('/subscribe/:id');

  useEffect(() => {
    // Get planId from URL params or props
    const planId = params?.id ? parseInt(params.id) : propPlanId || 1;
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      setLocation('/landing');
      return;
    }
    setSelectedPlan(plan);
    
    // Automatically initialize payment for the selected plan
    initializePayment(plan);
  }, [params?.id, propPlanId, setLocation]);

  const initializePayment = async (plan: Plan) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(plan.price),
          planId: plan.id,
          planName: plan.name
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Payment setup failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowCheckout(true);
      } else {
        throw new Error('No client secret received');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!selectedPlan) {
    return <div>Loading...</div>;
  }

  if (showCheckout && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm 
          plan={selectedPlan} 
          onBack={() => setShowCheckout(false)}
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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg"
          >
            Continue to Payment
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