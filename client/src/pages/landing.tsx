import { useState } from "react";
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
  Smartphone
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("overview");

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
        "Lead Management & Scoring",
        "Contact & Account Management", 
        "Opportunity Pipeline",
        "Sales Forecasting",
        "Activity Tracking",
        "Email Integration"
      ]
    },
    {
      category: "Manufacturing (SAP-Level)",
      icon: <Factory className="h-6 w-6" />,
      items: [
        "Materials Management (MM)",
        "Bill of Materials (BOM)",
        "Warehouse Management",
        "Vendor Management",
        "MRP Planning",
        "Quality Control"
      ]
    },
    {
      category: "Business AI",
      icon: <Brain className="h-6 w-6" />,
      items: [
        "Predictive Analytics",
        "Lead Scoring AI",
        "Revenue Forecasting",
        "Customer Insights",
        "Automated Workflows",
        "Smart Recommendations"
      ]
    },
    {
      category: "Communications",
      icon: <MessageSquare className="h-6 w-6" />,
      items: [
        "Voice/Telephony Integration",
        "SMS & WhatsApp",
        "Email Automation",
        "Social Media Management",
        "Live Chat",
        "Video Conferencing"
      ]
    },
    {
      category: "Security & Compliance",
      icon: <Shield className="h-6 w-6" />,
      items: [
        "AES-256 Encryption", 
        "GDPR Compliance",
        "Role-Based Access",
        "Audit Trails",
        "Data Backup",
        "SOC2 Ready"
      ]
    },
    {
      category: "Integrations",
      icon: <Globe className="h-6 w-6" />,
      items: [
        "One-Click Migration",
        "API Integrations",
        "Stripe Payments",
        "Social Platforms",
        "Email Services",
        "Custom Connectors"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-2">
                <Download className="mr-2 h-5 w-5" />
                One-Click Migration
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

      {/* AI Capabilities */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why We Call It <span className="text-blue-600">Business AI</span>
            </h2>
            <p className="text-xl text-gray-600">Advanced AI that actually works for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Predictive Analytics</h3>
              <p className="text-sm text-gray-600">AI predicts customer behavior and sales outcomes</p>
            </Card>
            <Card className="text-center p-6">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Lead Scoring</h3>
              <p className="text-sm text-gray-600">Automatically scores and prioritizes your best leads</p>
            </Card>
            <Card className="text-center p-6">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Revenue Forecasting</h3>
              <p className="text-sm text-gray-600">AI-powered revenue predictions with 95% accuracy</p>
            </Card>
            <Card className="text-center p-6">
              <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Workflow Automation</h3>
              <p className="text-sm text-gray-600">AI automates repetitive tasks and processes</p>
            </Card>
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
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Download className="mr-2 h-5 w-5" />
              Start Migration Now
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of companies that switched to Averox Business AI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg">
              Start Free Trial - No Credit Card
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg">
              Book Demo Call
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-gray-400">
            <span>✓ 30-day free trial</span>
            <span>✓ Free migration</span>
            <span>✓ 24/7 support</span>
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