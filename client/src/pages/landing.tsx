import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowRight, Star, Users, Building, Shield, Zap, TrendingUp, Factory, Brain, Globe } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const comparisonData = {
  features: [
    {
      category: "Core CRM Features",
      items: [
        { feature: "Contact Management", averox: "✓", salesforce: "✓", hubspot: "✓", dynamics: "✓", zoho: "✓" },
        { feature: "Lead Tracking", averox: "✓", salesforce: "✓", hubspot: "✓", dynamics: "✓", zoho: "✓" },
        { feature: "Opportunity Management", averox: "✓", salesforce: "✓", hubspot: "✓", dynamics: "✓", zoho: "✓" },
        { feature: "Task & Calendar Management", averox: "✓", salesforce: "✓", hubspot: "✓", dynamics: "✓", zoho: "✓" },
      ]
    },
    {
      category: "Advanced Features",
      items: [
        { feature: "AI-Powered Insights", averox: "✓ Built-in", salesforce: "$ Extra", hubspot: "$ Extra", dynamics: "$ Extra", zoho: "Limited" },
        { feature: "Advanced Manufacturing", averox: "✓ Full Suite", salesforce: "✗", hubspot: "✗", dynamics: "$ Separate", zoho: "✗" },
        { feature: "Enterprise Security (AES-256)", averox: "✓ Included", salesforce: "$ Shield Extra", hubspot: "$ Enterprise Only", dynamics: "$ Premium", zoho: "$ Enterprise" },
        { feature: "Multi-tenant Architecture", averox: "✓ Native", salesforce: "Limited", hubspot: "Limited", dynamics: "Limited", zoho: "Basic" },
        { feature: "Custom Workflows", averox: "✓ Unlimited", salesforce: "$ Professional+", hubspot: "$ Professional+", dynamics: "$ Professional+", zoho: "$ Professional+" },
        { feature: "API Access", averox: "✓ Full Access", salesforce: "$ API Calls", hubspot: "$ Rate Limited", dynamics: "$ Rate Limited", zoho: "$ Limited" },
      ]
    },
    {
      category: "Manufacturing & Operations",
      items: [
        { feature: "Materials Management (MRP)", averox: "✓ SAP-Level", salesforce: "✗", hubspot: "✗", dynamics: "$ Separate ERP", zoho: "$ Separate" },
        { feature: "Inventory Management", averox: "✓ Advanced", salesforce: "✗", hubspot: "✗", dynamics: "$ Extra", zoho: "Basic" },
        { feature: "Production Planning", averox: "✓ Full BOM", salesforce: "✗", hubspot: "✗", dynamics: "$ Manufacturing", zoho: "✗" },
        { feature: "Quality Control", averox: "✓ Complete", salesforce: "✗", hubspot: "✗", dynamics: "$ Extra", zoho: "✗" },
        { feature: "Warehouse Management", averox: "✓ Multi-location", salesforce: "✗", hubspot: "✗", dynamics: "$ WMS", zoho: "Basic" },
      ]
    },
    {
      category: "Integration & Migration",
      items: [
        { feature: "One-Click Migration", averox: "✓ From Any CRM", salesforce: "✗", hubspot: "Manual Only", dynamics: "$ Consulting", zoho: "Manual Only" },
        { feature: "Zapier Integration", averox: "✓ Native", salesforce: "✓", hubspot: "✓", dynamics: "✓", zoho: "✓" },
        { feature: "Custom Integrations", averox: "✓ Unlimited", salesforce: "$ Per Integration", hubspot: "$ Limited", dynamics: "$ Per Integration", zoho: "$ Limited" },
        { feature: "Data Export", averox: "✓ Always Free", salesforce: "$ Data Export", hubspot: "$ Restrictions", dynamics: "$ Premium", zoho: "$ Limited" },
      ]
    }
  ],
  pricing: {
    averox: { starter: "$29", professional: "$59", enterprise: "$99" },
    salesforce: { starter: "$25", professional: "$75", enterprise: "$150+" },
    hubspot: { starter: "$45", professional: "$800", enterprise: "$3,200+" },
    dynamics: { starter: "$65", professional: "$95", enterprise: "$135+" },
    zoho: { starter: "$14", professional: "$23", enterprise: "$40+" }
  }
};

export default function LandingPage() {
  const [signupStep, setSignupStep] = useState<'plans' | 'signup' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
  });

  const { toast } = useToast();

  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["/api/subscription-packages"],
    queryFn: async () => {
      const response = await fetch("/api/subscription-packages");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription packages");
      }
      return response.json();
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/create-payment-intent", data);
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Welcome to Averox. Setting up your workspace...",
      });
      setSignupStep('payment');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (pkg: SubscriptionPackage) => {
    setSelectedPlan(pkg);
    setSignupStep('signup');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    createPaymentIntentMutation.mutate({
      ...signupData,
      packageId: selectedPlan?.id,
      amount: parseFloat(selectedPlan?.price || "0"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">AVEROX</div>
              <Badge variant="secondary" className="text-xs">Enterprise Ready</Badge>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#comparison" className="text-gray-700 hover:text-blue-600">Compare</a>
              <a href="#migration" className="text-gray-700 hover:text-blue-600">Migration</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
              <Button onClick={() => setSignupStep('plans')}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-yellow-400 text-blue-900 px-6 py-3 rounded-full text-sm font-bold mb-6 animate-pulse">
              🚀 One-Click Migration from Salesforce, HubSpot, Dynamics & Zoho
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            The CRM That Actually
            <span className="block text-yellow-300">Beats Salesforce</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
            <strong>Advanced Manufacturing</strong>, <strong>AI Intelligence</strong>, <strong>Enterprise Security</strong>, and <strong>One-Click Migration</strong> — 
            Everything the big platforms charge thousands extra for, <span className="text-yellow-300 font-bold">included by default</span>.
          </p>
          
          <div className="flex flex-col lg:flex-row gap-6 justify-center mb-16">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-xl font-semibold">
              Start Free Trial → Migrate in 5 Minutes
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-6 text-xl">
              See Live Demo
            </Button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300">50%</div>
              <div className="text-sm opacity-90">Cost Savings vs Salesforce</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300">5 min</div>
              <div className="text-sm opacity-90">Complete Migration</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300">99.9%</div>
              <div className="text-sm opacity-90">Uptime SLA</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold text-yellow-300">24/7</div>
              <div className="text-sm opacity-90">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Averox */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Leading Companies Choose Averox Over Salesforce
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get enterprise-grade capabilities without the enterprise price tag
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Factory className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>SAP-Level Manufacturing</CardTitle>
                <CardDescription>
                  Complete manufacturing suite that rivals SAP at a fraction of the cost
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Advanced MRP & Production Planning</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Multi-location Warehouse Management</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Quality Control & Compliance</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Bill of Materials (BOM) Management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Built-in AI Intelligence</CardTitle>
                <CardDescription>
                  Advanced AI insights included free (Salesforce charges $150+ extra)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Predictive Lead Scoring</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Revenue Forecasting</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Automated Insights & Reports</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Customer Behavior Analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-green-500 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Military-grade AES-256 encryption with our proprietary CryptoSphere SDK
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />AES-256 Encryption (Built-in)</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />SOC 2 Type II Compliance</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Multi-tenant Isolation</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Role-based Access Control</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section id="comparison" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Detailed Feature Comparison
            </h2>
            <p className="text-xl text-gray-600">
              See exactly how Averox stacks up against the competition
            </p>
          </div>

          <Tabs defaultValue="core" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="core">Core CRM</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="space-y-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Core CRM Features</th>
                        <th className="text-center p-4 font-semibold text-blue-600">Averox</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Salesforce</th>
                        <th className="text-center p-4 font-semibold text-gray-600">HubSpot</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Dynamics 365</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Zoho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.features[0].items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-t hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{item.feature}</td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {item.averox}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {item.salesforce}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {item.hubspot}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {item.dynamics}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {item.zoho}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Advanced Features</th>
                        <th className="text-center p-4 font-semibold text-blue-600">Averox</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Salesforce</th>
                        <th className="text-center p-4 font-semibold text-gray-600">HubSpot</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Dynamics 365</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Zoho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.features[1].items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-t hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{item.feature}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.averox.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.averox}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.salesforce.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.salesforce.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.salesforce}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.hubspot.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.hubspot.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.hubspot}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.dynamics.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.dynamics.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.dynamics}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.zoho.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.zoho.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.zoho}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manufacturing" className="space-y-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Manufacturing & Operations</th>
                        <th className="text-center p-4 font-semibold text-blue-600">Averox</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Salesforce</th>
                        <th className="text-center p-4 font-semibold text-gray-600">HubSpot</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Dynamics 365</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Zoho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.features[2].items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-t hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{item.feature}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.averox.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.averox}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.salesforce.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.salesforce.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.salesforce}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.hubspot.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.hubspot.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.hubspot}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.dynamics.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.dynamics.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.dynamics}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.zoho.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.zoho.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.zoho}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Integration & Migration</th>
                        <th className="text-center p-4 font-semibold text-blue-600">Averox</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Salesforce</th>
                        <th className="text-center p-4 font-semibold text-gray-600">HubSpot</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Dynamics 365</th>
                        <th className="text-center p-4 font-semibold text-gray-600">Zoho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.features[3].items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-t hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{item.feature}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.averox.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.averox}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.salesforce.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.salesforce.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.salesforce}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.hubspot.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.hubspot.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.hubspot}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.dynamics.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.dynamics.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.dynamics}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.zoho.includes('✓') ? 'bg-green-100 text-green-800' : 
                              item.zoho.includes('$') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.zoho}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* One-Click Migration */}
      <section id="migration" className="py-20 px-6 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              One-Click Migration from Any CRM
            </h2>
            <p className="text-xl opacity-90">
              Switch to Averox in minutes, not months. Keep all your data, workflows, and team productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Seamless Data Migration</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 text-blue-900 font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Connect Your Current CRM</h4>
                    <p className="opacity-90 text-sm">Secure API connection to Salesforce, HubSpot, Dynamics, or Zoho</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 text-blue-900 font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Automated Data Transfer</h4>
                    <p className="opacity-90 text-sm">All contacts, deals, tasks, and custom fields migrate automatically</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 text-blue-900 font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Team Onboarding</h4>
                    <p className="opacity-90 text-sm">Your team starts working immediately with familiar workflows</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-white/10 rounded-lg">
                <h4 className="font-bold mb-2">Migration Guarantee</h4>
                <p className="text-sm opacity-90">100% data integrity or your money back. Plus, we'll handle the entire migration for you at no extra cost.</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-xl font-bold mb-6">Supported Platforms</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Salesforce", time: "5 minutes" },
                  { name: "HubSpot", time: "3 minutes" },
                  { name: "Dynamics 365", time: "7 minutes" },
                  { name: "Zoho CRM", time: "4 minutes" },
                  { name: "Pipedrive", time: "3 minutes" },
                  { name: "Any CRM", time: "Custom" }
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-3 bg-white/10 rounded">
                    <span className="font-medium">{platform.name}</span>
                    <span className="text-sm text-yellow-300">{platform.time}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-6 bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-semibold">
                Start Migration Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing That Beats Everyone
            </h2>
            <p className="text-xl text-gray-600">
              Get more features for less money. No hidden fees, no per-user API charges.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`relative overflow-hidden border-2 transition-all duration-300 ${
                pkg.name === 'Professional' ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200 hover:border-blue-300'
              }`}>
                {pkg.name === 'Professional' && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader className={pkg.name === 'Professional' ? 'pt-12' : ''}>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-gray-600 mb-6">
                    <div>Up to {pkg.maxUsers} users</div>
                    <div>Up to {pkg.maxContacts.toLocaleString()} contacts</div>
                    <div>{pkg.maxStorage}GB storage</div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={pkg.name === 'Professional' ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect(pkg)}
                  >
                    Choose {pkg.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Competitor Pricing Comparison */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-8">How We Compare on Price</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-4">Platform</th>
                    <th className="text-center p-4">Starter</th>
                    <th className="text-center p-4">Professional</th>
                    <th className="text-center p-4">Enterprise</th>
                    <th className="text-center p-4">Hidden Costs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-blue-50">
                    <td className="p-4 font-bold text-blue-600">Averox</td>
                    <td className="p-4 text-center font-bold">$29</td>
                    <td className="p-4 text-center font-bold">$59</td>
                    <td className="p-4 text-center font-bold">$99</td>
                    <td className="p-4 text-center text-green-600 font-bold">None</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Salesforce</td>
                    <td className="p-4 text-center">$25</td>
                    <td className="p-4 text-center">$75</td>
                    <td className="p-4 text-center">$150+</td>
                    <td className="p-4 text-center text-red-600">API calls, Einstein AI, Shield</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">HubSpot</td>
                    <td className="p-4 text-center">$45</td>
                    <td className="p-4 text-center">$800</td>
                    <td className="p-4 text-center">$3,200+</td>
                    <td className="p-4 text-center text-red-600">Contacts, API limits, Add-ons</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Dynamics 365</td>
                    <td className="p-4 text-center">$65</td>
                    <td className="p-4 text-center">$95</td>
                    <td className="p-4 text-center">$135+</td>
                    <td className="p-4 text-center text-red-600">Power Platform, Add-ons</td>
                  </tr>
                  <tr>
                    <td className="p-4">Zoho CRM</td>
                    <td className="p-4 text-center">$14</td>
                    <td className="p-4 text-center">$23</td>
                    <td className="p-4 text-center">$40+</td>
                    <td className="p-4 text-center text-red-600">Storage, Users, Features</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Modal */}
      {signupStep !== 'plans' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {signupStep === 'signup' ? 'Create Your Account' : 'Complete Payment'}
                </h3>
                <Button variant="ghost" onClick={() => setSignupStep('plans')}>
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {signupStep === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-4">
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
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={signupData.company}
                      onChange={(e) => setSignupData(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
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
                  </div>

                  <Tabs value={paymentMethod} onValueChange={(value: 'stripe' | 'paypal') => setPaymentMethod(value)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="stripe">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stripe" className="space-y-4 mt-6">
                      <div className="text-center text-gray-600">
                        Credit card payment processing would be integrated here
                      </div>
                    </TabsContent>

                    <TabsContent value="paypal" className="space-y-4 mt-6">
                      <div className="text-center text-gray-600">
                        PayPal payment processing would be integrated here
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">AVEROX</div>
              <p className="text-gray-400 text-sm">
                The enterprise CRM that actually beats Salesforce. Built for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Migration</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2025 Averox. All rights reserved. Built to beat Salesforce.
          </div>
        </div>
      </footer>
    </div>
  );
}