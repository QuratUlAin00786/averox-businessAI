import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Users, 
  Shield, 
  Zap,
  Check,
  Star,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
  Crown,
  CreditCard,
  Wallet
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface SubscriptionPackage {
  id: number;
  name: string;
  description: string;
  price: string;
  features: string[];
  maxUsers: number;
  maxContacts: number;
  maxStorage: number;
  isActive: boolean;
}

export default function LandingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPackage | null>(null);
  const [signupStep, setSignupStep] = useState<'info' | 'payment' | 'complete'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // Fetch subscription packages
  const { data: subscriptionPackages = [] } = useQuery<SubscriptionPackage[]>({
    queryKey: ['/api/subscription-packages'],
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    subdomain: "",
    password: "",
    confirmPassword: ""
  });

  // Payment intent creation for Stripe
  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: parseFloat(selectedPlan?.price || '0'),
        planId: selectedPlan?.id,
        customerInfo: {
          ...signupData,
          planName: selectedPlan?.name
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setSignupStep('payment');
    },
    onError: () => {
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete registration after payment
  const completeRegistrationMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('POST', '/api/complete-tenant-registration', {
        paymentIntentId: paymentData.paymentIntentId,
        paymentMethod: paymentMethod,
        tenantData: signupData,
        planId: selectedPlan?.id
      });
      return response.json();
    },
    onSuccess: () => {
      setSignupStep('complete');
      toast({
        title: "Registration Complete!",
        description: "Your account has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Payment was successful but account creation failed. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (pkg: SubscriptionPackage) => {
    setSelectedPlan(pkg);
    setIsSignupOpen(true);
    setSignupStep('info');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    // Create payment intent and proceed to payment
    createPaymentIntentMutation.mutate();
  };

  // Stripe Payment Form Component
  const StripePaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleStripeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements || !clientSecret) {
        return;
      }

      setIsProcessing(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required'
      });

      setIsProcessing(false);

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === 'succeeded') {
        // Complete registration
        completeRegistrationMutation.mutate({
          paymentIntentId: paymentIntent.id
        });
      }
    };

    return (
      <form onSubmit={handleStripeSubmit} className="space-y-4">
        <PaymentElement />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe || isProcessing || completeRegistrationMutation.isPending}
        >
          {isProcessing ? "Processing..." : `Pay $${selectedPlan?.price}/month`}
        </Button>
      </form>
    );
  };

  // PayPal Payment Component
  const PayPalPaymentForm = () => {
    const handlePayPalPayment = () => {
      // For now, simulate PayPal payment completion
      toast({
        title: "PayPal Payment",
        description: "PayPal integration will redirect to PayPal for payment processing.",
      });
      
      // Simulate successful PayPal payment
      setTimeout(() => {
        completeRegistrationMutation.mutate({
          paymentIntentId: 'paypal_' + Date.now()
        });
      }, 2000);
    };

    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600">
          You will be redirected to PayPal to complete your payment.
        </p>
        <Button 
          onClick={handlePayPalPayment}
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={completeRegistrationMutation.isPending}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Pay with PayPal - ${selectedPlan?.price}/month
        </Button>
      </div>
    );
  };

  const features = [
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Customer Management",
      description: "Complete contact and account management with relationship tracking"
    },
    {
      icon: <Target className="h-6 w-6 text-green-500" />,
      title: "Sales Pipeline",
      description: "Visual sales pipeline with opportunity tracking and forecasting"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
      title: "Analytics & Reports",
      description: "Comprehensive analytics and customizable reporting dashboards"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-orange-500" />,
      title: "Communication Hub",
      description: "Integrated email, SMS, and call management with automation"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Workflow Automation",
      description: "Automate repetitive tasks and streamline your business processes"
    },
    {
      icon: <Shield className="h-6 w-6 text-red-500" />,
      title: "Enterprise Security",
      description: "Bank-grade security with AES-256 encryption and compliance"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Tech Innovations Ltd",
      text: "Averox transformed our sales process. We've seen a 40% increase in conversion rates since implementing the platform.",
      rating: 5
    },
    {
      name: "Michael Chen",
      company: "Global Solutions Inc",
      text: "The AI-powered insights have been game-changing for our business intelligence and decision making.",
      rating: 5
    },
    {
      name: "Emma Davis",
      company: "Digital Marketing Pro",
      text: "Best CRM we've ever used. The automation features save us hours every week.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered Business Platform
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Transform Your Business with Averox
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The complete AI-powered platform for customer relationship management, 
              sales automation, and business intelligence that grows with your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                onClick={() => {
                  const starterPlan = subscriptionPackages.find(p => p.name === 'Starter');
                  if (starterPlan) handlePlanSelect(starterPlan);
                }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6"
                onClick={() => setLocation('/auth')}
              >
                Sign In
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From customer management to advanced analytics, Averox provides all the tools 
              you need to scale your business efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs. Upgrade or downgrade anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative border-2 hover:shadow-xl transition-all duration-300 ${
                  pkg.name === 'Professional' ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                {pkg.name === 'Professional' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="mb-2">
                    {pkg.name === 'Enterprise' && <Crown className="h-8 w-8 text-yellow-500 mx-auto" />}
                    {pkg.name === 'Professional' && <Zap className="h-8 w-8 text-blue-500 mx-auto" />}
                    {pkg.name === 'Starter' && <Building2 className="h-8 w-8 text-green-500 mx-auto" />}
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ${pkg.price}
                    <span className="text-lg text-gray-500 font-normal">/month</span>
                  </div>
                  <p className="text-gray-600">{pkg.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Users:</span>
                      <span className="font-semibold">{pkg.maxUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contacts:</span>
                      <span className="font-semibold">{pkg.maxContacts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-semibold">{pkg.maxStorage}GB</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-6" 
                    variant={pkg.name === 'Professional' ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect(pkg)}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Thousands of Businesses
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about transforming their business with Averox.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of businesses already using Averox to boost their sales, 
            improve customer relationships, and drive growth.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
            onClick={() => {
              const professionalPlan = subscriptionPackages.find(p => p.name === 'Professional');
              if (professionalPlan) handlePlanSelect(professionalPlan);
            }}
          >
            Start Your Free Trial Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Averox Business AI</h3>
              <p className="text-gray-400">
                The complete AI-powered platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>CRM Features</li>
                <li>Sales Pipeline</li>
                <li>Analytics</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  support@averox.com
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  1-800-AVEROX
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  www.averox.com
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Averox Business AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Signup Dialog */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {signupStep === 'info' ? `Sign up for ${selectedPlan?.name}` : 
               signupStep === 'payment' ? 'Payment Details' : 'Welcome to Averox!'}
            </DialogTitle>
            <DialogDescription>
              {signupStep === 'info' ? 'Create your account to get started with your free trial' :
               signupStep === 'payment' ? 'Secure payment processing with Stripe' :
               'Your account has been created successfully!'}
            </DialogDescription>
          </DialogHeader>

          {signupStep === 'info' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={signupData.company}
                  onChange={(e) => setSignupData(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={signupData.subdomain}
                  onChange={(e) => setSignupData(prev => ({ ...prev, subdomain: e.target.value }))}
                  placeholder="yourcompany"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your URL will be: {signupData.subdomain}.averox.com
                </p>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createPaymentIntentMutation.isPending}>
                {createPaymentIntentMutation.isPending ? "Setting up..." : "Continue to Payment"}
              </Button>
            </form>
          )}

          {signupStep === 'payment' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">Selected Plan: {selectedPlan?.name}</h4>
                <p className="text-blue-700">${selectedPlan?.price}/month</p>
                <p className="text-sm text-blue-600 mt-2">
                  14-day free trial • Cancel anytime
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-center">Choose Payment Method</h4>
                <Tabs value={paymentMethod} onValueChange={(value: 'stripe' | 'paypal') => setPaymentMethod(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stripe" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="paypal" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      PayPal
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stripe" className="mt-6">
                    {clientSecret && (
                      <Elements 
                        stripe={stripePromise} 
                        options={{ 
                          clientSecret,
                          appearance: {
                            theme: 'stripe'
                          }
                        }}
                      >
                        <StripePaymentForm />
                      </Elements>
                    )}
                    {!clientSecret && (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-gray-600">Setting up secure payment...</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paypal" className="mt-6">
                    <PayPalPaymentForm />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="text-center text-xs text-gray-500">
                <p>🔒 Secure payment processing powered by Stripe and PayPal</p>
                <p>Your payment information is encrypted and never stored on our servers</p>
              </div>
            </div>
          )}

          {signupStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                Your account has been created successfully! You can now sign in and start using Averox.
              </p>
              <Button 
                className="w-full" 
                onClick={() => {
                  setIsSignupOpen(false);
                  setLocation('/auth');
                }}
              >
                Sign In to Your Account
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}