import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Check, ChevronRight, Lock, ArrowRight, Building, Users, Key, Settings, Shield, Database, Layers, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Available industries for company setup
const INDUSTRIES = [
  { id: "technology", label: "Technology" },
  { id: "healthcare", label: "Healthcare" },
  { id: "finance", label: "Finance & Banking" },
  { id: "education", label: "Education" },
  { id: "retail", label: "Retail" },
  { id: "manufacturing", label: "Manufacturing" },
  { id: "consulting", label: "Consulting" },
  { id: "media", label: "Media & Entertainment" },
  { id: "realestate", label: "Real Estate" },
  { id: "construction", label: "Construction" },
  { id: "other", label: "Other" }
];

// Available company sizes
const COMPANY_SIZES = [
  { id: "1-10", label: "1-10 employees" },
  { id: "11-50", label: "11-50 employees" },
  { id: "51-200", label: "51-200 employees" },
  { id: "201-500", label: "201-500 employees" },
  { id: "501-1000", label: "501-1000 employees" },
  { id: "1001+", label: "1001+ employees" }
];

// Available timezones
const TIMEZONES = [
  { id: "utc-8", label: "Pacific Time (UTC-8)" },
  { id: "utc-7", label: "Mountain Time (UTC-7)" },
  { id: "utc-6", label: "Central Time (UTC-6)" },
  { id: "utc-5", label: "Eastern Time (UTC-5)" },
  { id: "utc-4", label: "Atlantic Time (UTC-4)" },
  { id: "utc", label: "UTC" },
  { id: "utc+1", label: "Central European Time (UTC+1)" },
  { id: "utc+2", label: "Eastern European Time (UTC+2)" },
  { id: "utc+3", label: "Moscow Time (UTC+3)" },
  { id: "utc+5.5", label: "Indian Standard Time (UTC+5:30)" },
  { id: "utc+8", label: "China Standard Time (UTC+8)" },
  { id: "utc+9", label: "Japan Standard Time (UTC+9)" },
  { id: "utc+10", label: "Australian Eastern Time (UTC+10)" },
  { id: "utc+12", label: "New Zealand Time (UTC+12)" }
];

const LOCAL_STORAGE_KEY = "setup_wizard_progress";

export default function SetupWizard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data for each step
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    industry: "",
    size: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phoneNumber: "",
    timezone: "utc-5"
  });
  
  const [apiKeys, setApiKeys] = useState({
    openAiKey: "",
    stripeKey: "",
    stripePublicKey: "",
    sendgridKey: ""
  });
  
  const [features, setFeatures] = useState({
    leadManagement: true,
    contactManagement: true,
    opportunityTracking: true,
    accountManagement: true,
    taskManagement: true,
    calendarEvents: true,
    invoicing: true,
    reporting: true,
    marketingAutomation: true,
    aiAssistant: true,
    eCommerce: false,
    supportTickets: false
  });
  
  const [userSettings, setUserSettings] = useState({
    createDemoData: true,
    enableOnboarding: true,
    dataPrivacy: "company", // 'company', 'private', 'shared'
    defaultDateFormat: "mm/dd/yyyy"
  });
  
  const [integrations, setIntegrations] = useState({
    microsoftOutlook: false,
    googleWorkspace: false,
    slack: false,
    zoom: false,
    zapier: false,
    webhooks: false
  });
  
  // Define the setup steps
  const steps = [
    { id: "company", title: "Company Information", icon: Building },
    { id: "api-keys", title: "API Keys", icon: Key },
    { id: "features", title: "Features Configuration", icon: Layers },
    { id: "users", title: "User Settings", icon: Users },
    { id: "integrations", title: "Integrations", icon: Globe }
  ];
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  // Load progress from local storage on initial render
  useEffect(() => {
    const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { step, data } = JSON.parse(savedProgress);
        setCurrentStep(step);
        if (data.companyInfo) setCompanyInfo(data.companyInfo);
        if (data.apiKeys) setApiKeys(data.apiKeys);
        if (data.features) setFeatures(data.features);
        if (data.userSettings) setUserSettings(data.userSettings);
        if (data.integrations) setIntegrations(data.integrations);
      } catch (error) {
        console.error("Error parsing saved setup progress:", error);
      }
    }
  }, []);
  
  // Save progress to local storage when data changes
  useEffect(() => {
    const data = {
      companyInfo,
      apiKeys,
      features,
      userSettings,
      integrations
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ step: currentStep, data }));
  }, [currentStep, companyInfo, apiKeys, features, userSettings, integrations]);
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit the final configuration
      handleSubmitSetup();
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle form submission for the entire setup
  const handleSubmitSetup = async () => {
    setIsSubmitting(true);
    
    try {
      const setupData = {
        companyInfo,
        apiKeys,
        features,
        userSettings,
        integrations
      };
      
      // Submit setup data to API
      const response = await apiRequest("POST", "/api/setup/initialize", setupData);
      
      if (response.ok) {
        const result = await response.json();
        setSetupComplete(true);
        
        // Clear saved progress
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        
        toast({
          title: "Setup Complete",
          description: "Your Averox Business AI has been successfully configured.",
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          setLocation("/");
        }, 3000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Setup failed. Please try again.");
      }
    } catch (error) {
      toast({
        title: "Setup Error",
        description: error.message || "There was an error during setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle toggle for features and integrations
  const handleToggle = (section, key) => {
    if (section === "features") {
      setFeatures({
        ...features,
        [key]: !features[key]
      });
    } else if (section === "integrations") {
      setIntegrations({
        ...integrations,
        [key]: !integrations[key]
      });
    }
  };
  
  // Step validation
  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Company Information
        return companyInfo.name && companyInfo.industry && companyInfo.size && companyInfo.timezone;
      case 1: // API Keys
        return apiKeys.openAiKey && apiKeys.stripeKey && apiKeys.stripePublicKey; // Only require essential keys
      case 2: // Features
        return Object.values(features).some(value => value === true); // At least one feature should be enabled
      case 3: // User Settings
        return true; // No required fields
      case 4: // Integrations
        return true; // Optional step
      default:
        return false;
    }
  };
  
  // If setup is complete, show success message
  if (setupComplete) {
    return (
      <div className="container max-w-6xl py-16 mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="mx-auto rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-center mt-4 text-2xl">Setup Complete!</CardTitle>
            <CardDescription className="text-center text-base">
              Your Averox Business AI system has been successfully configured and is ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-600 mb-6">You will be redirected to the dashboard in a few seconds...</p>
            <Button onClick={() => setLocation("/")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-10 mx-auto">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold">Averox Business AI Setup Wizard</CardTitle>
          <CardDescription className="text-lg">
            Complete the following steps to set up your Averox Business AI system.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-0">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm text-muted-foreground">
              <span>Setup Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* Steps navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <Button 
                    key={step.id}
                    variant={currentStep === index ? "default" : "outline"}
                    className={`flex items-center ${index < currentStep ? "bg-primary/10 border-primary/30" : ""}`}
                    disabled={index > currentStep}
                    onClick={() => index <= currentStep && setCurrentStep(index)}
                  >
                    {index < currentStep ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <StepIcon className="mr-2 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="inline sm:hidden">{index + 1}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Step content */}
          <div className="mb-6">
            {/* Step 1: Company Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Company Information
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Enter your company details to personalize your Averox Business AI experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name<span className="text-red-500">*</span></Label>
                      <Input 
                        id="companyName" 
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        placeholder="Acme Inc."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="industry">Industry<span className="text-red-500">*</span></Label>
                      <Select 
                        value={companyInfo.industry} 
                        onValueChange={(value) => setCompanyInfo({...companyInfo, industry: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map(industry => (
                            <SelectItem key={industry.id} value={industry.id}>{industry.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="size">Company Size<span className="text-red-500">*</span></Label>
                      <Select 
                        value={companyInfo.size} 
                        onValueChange={(value) => setCompanyInfo({...companyInfo, size: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map(size => (
                            <SelectItem key={size.id} value={size.id}>{size.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Company Website</Label>
                      <Input 
                        id="website" 
                        value={companyInfo.website}
                        onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                        placeholder="https://example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input 
                        id="phoneNumber" 
                        value={companyInfo.phoneNumber}
                        onChange={(e) => setCompanyInfo({...companyInfo, phoneNumber: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={companyInfo.address}
                        onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                        placeholder="123 Business Ave"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={companyInfo.city}
                          onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                          placeholder="New York"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input 
                          id="state" 
                          value={companyInfo.state}
                          onChange={(e) => setCompanyInfo({...companyInfo, state: e.target.value})}
                          placeholder="NY"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input 
                          id="country" 
                          value={companyInfo.country}
                          onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
                          placeholder="United States"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input 
                          id="postalCode" 
                          value={companyInfo.postalCode}
                          onChange={(e) => setCompanyInfo({...companyInfo, postalCode: e.target.value})}
                          placeholder="10001"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="timezone">Company Timezone<span className="text-red-500">*</span></Label>
                  <Select 
                    value={companyInfo.timezone} 
                    onValueChange={(value) => setCompanyInfo({...companyInfo, timezone: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(timezone => (
                        <SelectItem key={timezone.id} value={timezone.id}>{timezone.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {/* Step 2: API Keys */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    API Keys Configuration
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Configure external service API keys to enable full functionality.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">OpenAI API Key <span className="text-red-500">*</span></CardTitle>
                      <CardDescription>
                        Required for AI assistant, business insights, and advanced recommendations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="openai-key">OpenAI API Key</Label>
                        <div className="flex space-x-2">
                          <Input 
                            id="openai-key"
                            type="password"
                            value={apiKeys.openAiKey}
                            onChange={(e) => setApiKeys({...apiKeys, openAiKey: e.target.value})}
                            placeholder="sk-..."
                            className="font-mono"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenAI dashboard</a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Stripe API Keys <span className="text-red-500">*</span></CardTitle>
                      <CardDescription>
                        Required for payment processing, invoicing, and subscription management.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
                        <Input 
                          id="stripe-secret-key"
                          type="password"
                          value={apiKeys.stripeKey}
                          onChange={(e) => setApiKeys({...apiKeys, stripeKey: e.target.value})}
                          placeholder="sk_..."
                          className="font-mono"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stripe-public-key">Stripe Public Key</Label>
                        <Input 
                          id="stripe-public-key"
                          value={apiKeys.stripePublicKey}
                          onChange={(e) => setApiKeys({...apiKeys, stripePublicKey: e.target.value})}
                          placeholder="pk_..."
                          className="font-mono"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get your API keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe dashboard</a>
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">SendGrid API Key (Optional)</CardTitle>
                      <CardDescription>
                        Used for email notifications and marketing campaigns.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
                        <Input 
                          id="sendgrid-key"
                          type="password"
                          value={apiKeys.sendgridKey}
                          onChange={(e) => setApiKeys({...apiKeys, sendgridKey: e.target.value})}
                          placeholder="SG..."
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Get your API key from <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">SendGrid dashboard</a>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Step 3: Features Configuration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Layers className="mr-2 h-5 w-5" />
                    Features Configuration
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Enable or disable features to customize your Averox Business AI experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Core Features</CardTitle>
                      <CardDescription>
                        Essential modules for your business operations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="lead-management">Lead Management</Label>
                            <p className="text-sm text-muted-foreground">Track and manage potential customers</p>
                          </div>
                          <Switch 
                            id="lead-management"
                            checked={features.leadManagement}
                            onCheckedChange={() => handleToggle("features", "leadManagement")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="contact-management">Contact Management</Label>
                            <p className="text-sm text-muted-foreground">Organize and manage your contacts</p>
                          </div>
                          <Switch 
                            id="contact-management"
                            checked={features.contactManagement}
                            onCheckedChange={() => handleToggle("features", "contactManagement")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="opportunity-tracking">Opportunity Tracking</Label>
                            <p className="text-sm text-muted-foreground">Manage sales opportunities and pipeline</p>
                          </div>
                          <Switch 
                            id="opportunity-tracking"
                            checked={features.opportunityTracking}
                            onCheckedChange={() => handleToggle("features", "opportunityTracking")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="account-management">Account Management</Label>
                            <p className="text-sm text-muted-foreground">Track business accounts and relationships</p>
                          </div>
                          <Switch 
                            id="account-management"
                            checked={features.accountManagement}
                            onCheckedChange={() => handleToggle("features", "accountManagement")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="task-management">Task Management</Label>
                            <p className="text-sm text-muted-foreground">Create and assign tasks to team members</p>
                          </div>
                          <Switch 
                            id="task-management"
                            checked={features.taskManagement}
                            onCheckedChange={() => handleToggle("features", "taskManagement")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="calendar-events">Calendar & Events</Label>
                            <p className="text-sm text-muted-foreground">Schedule and manage meetings and events</p>
                          </div>
                          <Switch 
                            id="calendar-events"
                            checked={features.calendarEvents}
                            onCheckedChange={() => handleToggle("features", "calendarEvents")}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Advanced Features</CardTitle>
                      <CardDescription>
                        Specialized capabilities for growing businesses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="invoicing">Invoicing & Payments</Label>
                            <p className="text-sm text-muted-foreground">Create and manage invoices and payments</p>
                          </div>
                          <Switch 
                            id="invoicing"
                            checked={features.invoicing}
                            onCheckedChange={() => handleToggle("features", "invoicing")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="reporting">Reporting & Analytics</Label>
                            <p className="text-sm text-muted-foreground">Generate insights from your business data</p>
                          </div>
                          <Switch 
                            id="reporting"
                            checked={features.reporting}
                            onCheckedChange={() => handleToggle("features", "reporting")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="marketing-automation">Marketing Automation</Label>
                            <p className="text-sm text-muted-foreground">Automate marketing campaigns and workflows</p>
                          </div>
                          <Switch 
                            id="marketing-automation"
                            checked={features.marketingAutomation}
                            onCheckedChange={() => handleToggle("features", "marketingAutomation")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="ai-assistant">AI Assistant</Label>
                            <p className="text-sm text-muted-foreground">Get AI-powered insights and recommendations</p>
                          </div>
                          <Switch 
                            id="ai-assistant"
                            checked={features.aiAssistant}
                            onCheckedChange={() => handleToggle("features", "aiAssistant")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="ecommerce">E-Commerce Integration</Label>
                            <p className="text-sm text-muted-foreground">Connect and manage online stores</p>
                          </div>
                          <Switch 
                            id="ecommerce"
                            checked={features.eCommerce}
                            onCheckedChange={() => handleToggle("features", "eCommerce")}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="support-tickets">Support Tickets</Label>
                            <p className="text-sm text-muted-foreground">Manage customer support requests</p>
                          </div>
                          <Switch 
                            id="support-tickets"
                            checked={features.supportTickets}
                            onCheckedChange={() => handleToggle("features", "supportTickets")}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Step 4: User Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    User Settings
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Configure user-related settings for your organization.
                  </p>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">User Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="create-demo-data">Create Demo Data</Label>
                          <p className="text-sm text-muted-foreground">
                            Create sample data to help you get started with the system
                          </p>
                        </div>
                        <Switch 
                          id="create-demo-data"
                          checked={userSettings.createDemoData}
                          onCheckedChange={() => setUserSettings({
                            ...userSettings,
                            createDemoData: !userSettings.createDemoData
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable-onboarding">Enable Onboarding Guide</Label>
                          <p className="text-sm text-muted-foreground">
                            Show interactive tutorials for new users
                          </p>
                        </div>
                        <Switch 
                          id="enable-onboarding"
                          checked={userSettings.enableOnboarding}
                          onCheckedChange={() => setUserSettings({
                            ...userSettings,
                            enableOnboarding: !userSettings.enableOnboarding
                          })}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <Label>Default Date Format</Label>
                        <RadioGroup 
                          value={userSettings.defaultDateFormat}
                          onValueChange={(value) => setUserSettings({
                            ...userSettings,
                            defaultDateFormat: value
                          })}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mm/dd/yyyy" id="format-us" />
                            <Label htmlFor="format-us" className="font-normal">MM/DD/YYYY (US format)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dd/mm/yyyy" id="format-eu" />
                            <Label htmlFor="format-eu" className="font-normal">DD/MM/YYYY (European format)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yyyy-mm-dd" id="format-iso" />
                            <Label htmlFor="format-iso" className="font-normal">YYYY-MM-DD (ISO format)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <Label>Data Privacy Settings</Label>
                        <RadioGroup 
                          value={userSettings.dataPrivacy}
                          onValueChange={(value) => setUserSettings({
                            ...userSettings,
                            dataPrivacy: value
                          })}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="privacy-company" />
                            <Label htmlFor="privacy-company" className="font-normal">Company-wide data access (all users can see all records)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="privacy-private" />
                            <Label htmlFor="privacy-private" className="font-normal">Private data (users can only see their own records)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="shared" id="privacy-shared" />
                            <Label htmlFor="privacy-shared" className="font-normal">Shared data (users can see their team's records)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Step 5: Integrations */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Integrations
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Connect with other tools and services to enhance your workflow.
                  </p>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Available Integrations</CardTitle>
                    <CardDescription>
                      Enable the integrations you want to use with your Averox Business AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ms-outlook">Microsoft Outlook</Label>
                          <p className="text-sm text-muted-foreground">
                            Sync emails, calendar events, and contacts
                          </p>
                        </div>
                        <Switch 
                          id="ms-outlook"
                          checked={integrations.microsoftOutlook}
                          onCheckedChange={() => handleToggle("integrations", "microsoftOutlook")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="google-workspace">Google Workspace</Label>
                          <p className="text-sm text-muted-foreground">
                            Connect Gmail, Google Calendar, and Google Contacts
                          </p>
                        </div>
                        <Switch 
                          id="google-workspace"
                          checked={integrations.googleWorkspace}
                          onCheckedChange={() => handleToggle("integrations", "googleWorkspace")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="slack">Slack</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications and updates in Slack
                          </p>
                        </div>
                        <Switch 
                          id="slack"
                          checked={integrations.slack}
                          onCheckedChange={() => handleToggle("integrations", "slack")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="zoom">Zoom</Label>
                          <p className="text-sm text-muted-foreground">
                            Schedule and join meetings directly from the system
                          </p>
                        </div>
                        <Switch 
                          id="zoom"
                          checked={integrations.zoom}
                          onCheckedChange={() => handleToggle("integrations", "zoom")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="zapier">Zapier</Label>
                          <p className="text-sm text-muted-foreground">
                            Connect with thousands of apps through Zapier
                          </p>
                        </div>
                        <Switch 
                          id="zapier"
                          checked={integrations.zapier}
                          onCheckedChange={() => handleToggle("integrations", "zapier")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="webhooks">Webhooks</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable webhook notifications for custom integrations
                          </p>
                        </div>
                        <Switch 
                          id="webhooks"
                          checked={integrations.webhooks}
                          onCheckedChange={() => handleToggle("integrations", "webhooks")}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Note: You can configure detailed integration settings after completing the setup wizard.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-6">
          <Button 
            variant="ghost" 
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleNextStep}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Complete Setup
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}