import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building2, Users, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const signupSchema = z.object({
  tenant: z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
    subdomain: z.string()
      .min(3, "Subdomain must be at least 3 characters")
      .max(63, "Subdomain must be less than 63 characters")
      .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens")
      .refine(val => !val.startsWith('-') && !val.endsWith('-'), "Subdomain cannot start or end with hyphen"),
  }),
  admin: z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  })
});

type SignupFormData = z.infer<typeof signupSchema>;

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 users",
      "1,000 contacts",
      "Basic analytics",
      "Email support",
      "5GB storage"
    ],
    highlighted: false
  },
  {
    name: "Professional",
    price: "$99",
    period: "per month",
    description: "Advanced features for growing businesses",
    features: [
      "Up to 25 users",
      "10,000 contacts",
      "Advanced analytics",
      "Priority support",
      "50GB storage",
      "API access",
      "Custom integrations"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "per month",
    description: "Full-scale solution for large organizations",
    features: [
      "Unlimited users",
      "Unlimited contacts",
      "Real-time analytics",
      "24/7 phone support",
      "500GB storage",
      "White-label options",
      "Advanced security",
      "Custom workflows"
    ],
    highlighted: false
  }
];

export default function TenantSignup() {
  const [step, setStep] = useState(1);
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      tenant: { name: "", subdomain: "" },
      admin: { firstName: "", lastName: "", email: "", password: "" }
    }
  });

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) return;
    
    setSubdomainChecking(true);
    try {
      const response = await apiRequest("GET", `/api/tenants/check-subdomain/${subdomain}`);
      const data = await response.json();
      setSubdomainAvailable(data.available);
    } catch (error) {
      console.error("Subdomain check failed:", error);
    } finally {
      setSubdomainChecking(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/tenants/register", data);
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Welcome to Averox!",
          description: `Your organization ${data.tenant.name} has been created successfully.`,
        });
        
        // Redirect to tenant subdomain
        window.location.href = `https://${data.tenant.subdomain}.${window.location.host}/dashboard`;
      } else {
        const error = await response.json();
        toast({
          title: "Registration Failed",
          description: error.message || "Unable to create your organization",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your 14-Day Free Trial
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of businesses using Averox to manage their customer relationships and grow their revenue.
          </p>
        </div>

        {step === 1 && (
          <>
            {/* Pricing Plans */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.highlighted ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Multi-Tenant Architecture</h3>
                <p className="text-sm text-gray-600">Complete data isolation for enterprise security</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Team Management</h3>
                <p className="text-sm text-gray-600">Invite users with role-based permissions</p>
              </div>
              <div className="text-center">
                <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">API Integration</h3>
                <p className="text-sm text-gray-600">Connect with 6,000+ apps via Zapier</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Enterprise Security</h3>
                <p className="text-sm text-gray-600">AES-256 encryption and SOC 2 compliance</p>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={() => setStep(2)} size="lg" className="px-8 py-3 text-lg">
                Start Free Trial
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create Your Organization</CardTitle>
              <CardDescription>
                Set up your organization and admin account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tenant.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenant.subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose Your Subdomain</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input
                              placeholder="acme"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                checkSubdomainAvailability(e.target.value);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-500 self-center">
                              .averox.com
                            </span>
                          </div>
                        </FormControl>
                        {subdomainChecking && (
                          <p className="text-sm text-gray-500">Checking availability...</p>
                        )}
                        {subdomainAvailable === true && (
                          <p className="text-sm text-green-600">✓ Subdomain is available</p>
                        )}
                        {subdomainAvailable === false && (
                          <p className="text-sm text-red-600">✗ Subdomain is not available</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="admin.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="admin.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="admin.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admin.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-xs text-gray-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || subdomainAvailable === false}
                  >
                    {isSubmitting ? "Creating Organization..." : "Create Organization"}
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setStep(1)}
                  >
                    Back to Plans
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}