import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Users, 
  Building2, 
  Zap, 
  Shield, 
  Globe, 
  Brain, 
  Factory,
  Download,
  Target,
  TrendingUp,
  Clock,
  Database,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Cog,
  Smartphone,
  LogIn
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation('/auth');
  };

  const handleStartTrial = () => {
    setLocation('/setup');
  };

  const handleBookDemo = () => {
    // In a real implementation, this would open a calendar booking widget
    window.open('mailto:sales@averox.com?subject=Demo Request&body=I would like to schedule a demo of Averox Business AI', '_blank');
  };

  const handleContactSales = () => {
    window.open('mailto:sales@averox.com?subject=Sales Inquiry&body=I am interested in Averox Business AI and would like to speak with someone about pricing and features.', '_blank');
  };

  const competitors = [
    {
      name: "Salesforce",
      logo: "SF",
      price: "$150/user/month",
      setup: "6+ months",
      ai: "Limited",
      manufacturing: "❌",
      encryption: "Basic"
    },
    {
      name: "HubSpot",
      logo: "HS", 
      price: "$120/user/month",
      setup: "3-4 months",
      ai: "Basic",
      manufacturing: "❌",
      encryption: "Standard"
    },
    {
      name: "MS Dynamics",
      logo: "MS",
      price: "$200/user/month", 
      setup: "8+ months",
      ai: "Limited",
      manufacturing: "Partial",
      encryption: "Standard"
    },
    {
      name: "Zoho",
      logo: "ZO",
      price: "$80/user/month",
      setup: "4-5 months", 
      ai: "Basic",
      manufacturing: "❌",
      encryption: "Basic"
    },
    {
      name: "SAP",
      logo: "SAP",
      price: "$300+/user/month",
      setup: "12+ months",
      ai: "Limited",
      manufacturing: "✓",
      encryption: "Enterprise"
    },
    {
      name: "Averox Business AI",
      logo: "AV",
      price: "$29-99/user/month",
      setup: "1 day",
      ai: "Advanced AI",
      manufacturing: "✓ Superior",
      encryption: "AES-256",
      highlight: true
    }
  ];

  const features = [
    {
      category: "CRM Core",
      icon: <Users className="h-6 w-6" />,
      items: [
        "Lead Management & AI Scoring",
        "Contact & Account Management", 
        "Opportunity Pipeline with AI",
        "Sales Forecasting & Predictions",
        "Activity Tracking & Analytics",
        "Multi-channel Email Integration"
      ]
    },
    {
      category: "Manufacturing (SAP-Level)",
      icon: <Factory className="h-6 w-6" />,
      items: [
        "Advanced Materials Management",
        "Multi-level Bill of Materials",
        "Bin-level Warehouse Management",
        "Vendor Performance Analytics",
        "AI-powered MRP Planning",
        "Real-time Quality Control"
      ]
    },
    {
      category: "Advanced AI Engine",
      icon: <Brain className="h-6 w-6" />,
      items: [
        "24/7 AI Business Assistant",
        "Predictive Customer Analytics",
        "Intelligent Lead Scoring",
        "Revenue Forecasting AI",
        "Automated Workflow Intelligence",
        "Smart Business Recommendations"
      ]
    },
    {
      category: "Omnichannel Communications",
      icon: <MessageSquare className="h-6 w-6" />,
      items: [
        "Click-to-Call Telephony",
        "WhatsApp Business Integration",
        "SMS Marketing Automation",
        "Social Media Management",
        "Live Chat with AI Bot",
        "Video Calls & Screen Sharing"
      ]
    },
    {
      category: "Marketing Automation",
      icon: <Zap className="h-6 w-6" />,
      items: [
        "Email Campaign Automation",
        "Social Media Scheduling",
        "Lead Nurturing Sequences",
        "Customer Journey Mapping",
        "A/B Testing & Analytics",
        "Multi-channel Attribution"
      ]
    },
    {
      category: "Support & Service",
      icon: <Phone className="h-6 w-6" />,
      items: [
        "AI-powered Support Tickets",
        "Knowledge Base Management",
        "Customer Portal",
        "SLA Management",
        "Live Chat Support",
        "Community Forums"
      ]
    },
    {
      category: "Security & Compliance",
      icon: <Shield className="h-6 w-6" />,
      items: [
        "Military-grade AES-256 Encryption", 
        "GDPR & CCPA Compliance",
        "Enterprise SSO & 2FA",
        "Comprehensive Audit Trails",
        "Automated Data Backup",
        "SOC2 Type II Certified"
      ]
    },
    {
      category: "Integrations & Migration",
      icon: <Globe className="h-6 w-6" />,
      items: [
        "One-Click Platform Migration",
        "REST API & Webhooks",
        "Stripe & PayPal Payments",
        "Zapier & Make.com",
        "Custom App Marketplace",
        "White-label Solutions"
      ]
    }
  ];

  const migrationSources = [
    { name: "HubSpot", supported: true, time: "2 hours" },
    { name: "Salesforce", supported: true, time: "4 hours" },
    { name: "Pipedrive", supported: true, time: "1 hour" },
    { name: "Zoho CRM", supported: true, time: "3 hours" },
    { name: "MS Dynamics", supported: true, time: "6 hours" },
    { name: "Custom CSV", supported: true, time: "30 mins" }
  ];

  const subscriptionPlans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 users",
        "500 contacts",
        "Basic CRM features",
        "Email integration",
        "Mobile app access",
        "Basic reporting",
        "24/7 chat support"
      ],
      highlighted: false,
      trialDays: 7
    },
    {
      name: "Professional",
      price: "59",
      period: "month",
      description: "Advanced features for growing businesses",
      features: [
        "Up to 25 users",
        "5,000 contacts",
        "Advanced AI features",
        "Marketing automation",
        "Sales forecasting",
        "Custom workflows",
        "API access",
        "Phone support"
      ],
      highlighted: true,
      trialDays: 7,
      mostPopular: true
    },
    {
      name: "Enterprise",
      price: "99",
      period: "month",
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
      ],
      highlighted: false,
      trialDays: 7
    },
    {
      name: "Enterprise Plus",
      price: "199",
      period: "month",
      description: "Ultimate Business AI with everything",
      features: [
        "Everything in Enterprise",
        "Multi-company management",
        "Advanced compliance tools",
        "Custom AI training",
        "On-premise deployment",
        "24/7 phone support",
        "Implementation specialist",
        "Priority feature requests"
      ],
      highlighted: false,
      trialDays: 14
    }
  ];

  const aiCapabilities = [
    {
      title: "AI Business Assistant",
      description: "Your 24/7 virtual business consultant that learns your company and provides intelligent insights",
      icon: <Brain className="h-8 w-8" />,
      features: ["Natural language queries", "Business insights", "Task automation", "Performance analysis"]
    },
    {
      title: "Predictive Analytics Engine",
      description: "Advanced machine learning that predicts customer behavior, sales outcomes, and market trends",
      icon: <TrendingUp className="h-8 w-8" />,
      features: ["Customer churn prediction", "Sales forecasting", "Market analysis", "Risk assessment"]
    },
    {
      title: "Intelligent Automation",
      description: "Smart workflows that adapt and optimize themselves based on your business patterns",
      icon: <Zap className="h-8 w-8" />,
      features: ["Smart routing", "Auto-prioritization", "Dynamic scheduling", "Adaptive processes"]
    },
    {
      title: "Conversational AI Bot",
      description: "Advanced chatbot that handles customer inquiries, qualifies leads, and books appointments",
      icon: <MessageSquare className="h-8 w-8" />,
      features: ["Natural conversations", "Lead qualification", "Appointment booking", "Multi-language support"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Navigation */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Averox Business AI</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#comparison" className="text-gray-600 hover:text-blue-600 transition-colors">vs Competitors</a>
              <a href="#migration" className="text-gray-600 hover:text-blue-600 transition-colors">Migration</a>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-600 hover:text-blue-600"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button 
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              🚀 Now Available - Revolutionary Business AI
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Averox Business AI
              </span>
              <br />
              <span className="text-3xl md:text-5xl">Beats Every Competitor</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              The only CRM that combines <strong>advanced AI</strong>, <strong>SAP-level manufacturing</strong>, 
              and <strong>enterprise security</strong> at a fraction of the cost. 
              <span className="text-blue-600 font-semibold">Setup in 1 day, not 6 months.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleBookDemo}
                className="px-8 py-3 text-lg border-2"
              >
                <Download className="mr-2 h-5 w-5" />
                Book Demo Call
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>1-Day Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Averox Destroys the Competition
            </h2>
            <p className="text-xl text-gray-600">See how we stack up against industry leaders</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left font-semibold">Platform</th>
                  <th className="p-4 text-center font-semibold">Price/User/Month</th>
                  <th className="p-4 text-center font-semibold">Setup Time</th>
                  <th className="p-4 text-center font-semibold">AI Capabilities</th>
                  <th className="p-4 text-center font-semibold">Manufacturing</th>
                  <th className="p-4 text-center font-semibold">Encryption</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, index) => (
                  <tr 
                    key={competitor.name}
                    className={`border-t ${competitor.highlight ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                          competitor.highlight ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-400'
                        }`}>
                          {competitor.logo}
                        </div>
                        <span className="font-medium">{competitor.name}</span>
                        {competitor.highlight && <Badge className="bg-green-100 text-green-800">Recommended</Badge>}
                      </div>
                    </td>
                    <td className="p-4 text-center">{competitor.price}</td>
                    <td className="p-4 text-center">{competitor.setup}</td>
                    <td className="p-4 text-center">{competitor.ai}</td>
                    <td className="p-4 text-center">{competitor.manufacturing}</td>
                    <td className="p-4 text-center">{competitor.encryption}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
              Switch to Averox Today - Save 70%
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Business Solution
            </h2>
            <p className="text-xl text-gray-600">Everything you need from CRM to Manufacturing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced AI Capabilities */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why We Call It <span className="text-blue-600">Business AI</span>
            </h2>
            <p className="text-xl text-gray-600">The most advanced AI engine built specifically for business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {aiCapabilities.map((capability, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg text-blue-600">
                    {capability.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{capability.title}</h3>
                    <p className="text-gray-600 mb-4">{capability.description}</p>
                    <ul className="grid grid-cols-2 gap-2">
                      {capability.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">🤖 Meet Your AI Business Assistant</h3>
            <p className="text-lg text-gray-600 mb-6">
              "Hello! I'm your AI assistant. I can analyze your sales data, predict customer behavior, 
              automate your workflows, and answer complex business questions in natural language. 
              Try asking me: 'What are my top 5 opportunities this month?' or 'Predict next quarter's revenue.'"
            </p>
            <Button 
              onClick={handleStartTrial}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat with AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Business AI Plan
            </h2>
            <p className="text-xl text-gray-600">Start with 7-day free trial • No credit card required • Cancel anytime</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan, index) => (
              <Card key={index} className={`relative p-6 ${plan.highlighted ? 'border-2 border-blue-500 shadow-xl scale-105' : ''}`}>
                {plan.mostPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    {plan.trialDays}-day free trial
                  </Badge>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleStartTrial}
                  className={`w-full ${plan.highlighted 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                    : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  Start {plan.trialDays}-Day Trial
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need a custom solution for your enterprise?</p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleContactSales}
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact Sales for Custom Pricing
            </Button>
          </div>
        </div>
      </div>

      {/* Migration Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One-Click Migration from Any Platform
            </h2>
            <p className="text-xl opacity-90">Don't start from scratch. We'll move your data instantly.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {migrationSources.map((source, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-center p-4">
                <h3 className="font-semibold mb-2">{source.name}</h3>
                <Badge className="bg-green-500 text-white">
                  {source.time}
                </Badge>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleStartTrial}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Download className="mr-2 h-5 w-5" />
              Start Migration Now
            </Button>
          </div>
        </div>
      </div>

      {/* Additional Features Showcase */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Business Solution
            </h2>
            <p className="text-xl text-gray-600">Everything your business needs in one powerful platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-xl transition-shadow border-2 hover:border-blue-200">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Voice & Telephony</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Click-to-call functionality
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Call recording & transcription
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  IVR system with AI routing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Conference calling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SMS integration
                </li>
              </ul>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-shadow border-2 hover:border-green-200">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Omnichannel Messaging</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  WhatsApp Business API
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Facebook Messenger
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  LinkedIn messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Twitter DMs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Instagram direct
                </li>
              </ul>
            </Card>

            <Card className="p-6 text-center hover:shadow-xl transition-shadow border-2 hover:border-purple-200">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Support & Service</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI-powered support tickets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Knowledge base management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Customer portal
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SLA management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Live chat with AI bot
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Login / Get Started Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies who've already made the switch to Averox Business AI
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-8">
            {/* New Customer */}
            <Card className="p-6 text-center bg-white text-gray-900">
              <h3 className="text-xl font-bold mb-3 text-blue-600">New to Averox?</h3>
              <p className="text-gray-600 mb-4">Start your 7-day free trial now</p>
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-3">
                <Users className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <p className="text-xs text-gray-500">No credit card required • Setup in minutes</p>
            </Card>

            {/* Existing Customer */}
            <Card className="p-6 text-center bg-white text-gray-900">
              <h3 className="text-xl font-bold mb-3 text-green-600">Already a Customer?</h3>
              <p className="text-gray-600 mb-4">Sign in to your dashboard</p>
              <Button size="lg" variant="outline" className="w-full mb-3" onClick={() => window.location.href = '/auth'}>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Dashboard
              </Button>
              <p className="text-xs text-gray-500">Access your Business AI platform</p>
            </Card>
          </div>

          <div className="border-t border-white/20 pt-8">
            <p className="mb-4 opacity-90">Want to see it in action first?</p>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 mr-4">
              <Calendar className="mr-2 h-5 w-5" />
              Book Live Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat with Sales
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-gray-200 mt-8">
            <span>✓ 7-day free trial</span>
            <span>✓ Free migration assistance</span>
            <span>✓ 24/7 expert support</span>
            <span>✓ No setup fees</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AV</span>
              </div>
              <span className="font-bold text-xl">Averox Business AI</span>
            </div>
            <div className="flex gap-6 text-gray-600">
              <a href="#" className="hover:text-blue-600">Privacy</a>
              <a href="#" className="hover:text-blue-600">Terms</a>
              <a href="#" className="hover:text-blue-600">Support</a>
              <a href="#" className="hover:text-blue-600">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2025 Averox Business AI. All rights reserved. Built with enterprise-grade security.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}