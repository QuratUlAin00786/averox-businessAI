import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SimpleButton } from "@/components/ui/simple-button";
import { useLanguage } from "@/hooks/use-language";
import { TooltipHelper } from "@/components/ui/tooltip-helper";
import { Check, Play, FileText, Video, Download, ArrowRight, BookOpen, Lightbulb } from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  format: "video" | "text" | "interactive";
  steps?: TrainingStep[];
  videoUrl?: string;
}

interface TrainingStep {
  id: string;
  title: string;
  content: string;
  image?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function TrainingHelpPage() {
  const { t, language, isRTL } = useLanguage();
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I add a new contact to the CRM?",
      answer: "Navigate to the Contacts section in the sidebar, click on the '+ Add Contact' button in the top right corner, fill in the contact details, and click Save."
    },
    {
      question: "How do I integrate my email with AVEROX CRM?",
      answer: "Go to Settings > API Keys & Integrations, click on the Email Integration tab, follow the setup wizard to connect your email provider (Gmail, Outlook, etc.), and authorize the connection."
    },
    {
      question: "How do I set up custom fields for leads?",
      answer: "Navigate to Settings > Customization, select the 'Leads' entity, click on 'Custom Fields', then click 'Add Field' to create a new field. You can specify field type, name, and other properties."
    },
    {
      question: "How do I export data from AVEROX CRM?",
      answer: "Go to the section you want to export data from (Contacts, Leads, etc.), click on the menu in the top-right corner, select 'Export', choose your preferred format (CSV, Excel), and click Export."
    },
    {
      question: "How do I set up user permissions?",
      answer: "Navigate to Settings > Permissions, select the user or team you want to modify permissions for, adjust the permission settings for each module, and click Save to apply the changes."
    }
  ];

  const trainingModules: TrainingModule[] = [
    {
      id: "dashboard-overview",
      title: "Dashboard Overview",
      description: "Learn about the main dashboard and how to navigate the AVEROX CRM interface",
      duration: "5 min",
      level: "beginner",
      format: "video",
      videoUrl: "https://example.com/videos/dashboard-overview.mp4",
    },
    {
      id: "lead-management",
      title: "Lead Management",
      description: "How to capture, qualify, and convert leads effectively",
      duration: "10 min",
      level: "beginner",
      format: "text",
      steps: [
        {
          id: "step1",
          title: "Accessing the Leads Section",
          content: "Click on the 'Leads' icon in the sidebar to access the leads management area. This will display a list of all your current leads."
        },
        {
          id: "step2",
          title: "Creating a New Lead",
          content: "Click the '+ Add Lead' button in the top right corner. Fill in the required information in the form that appears, including name, contact details, and source."
        },
        {
          id: "step3",
          title: "Qualifying a Lead",
          content: "Open a lead by clicking on their name. Update their status using the dropdown menu at the top of their profile. Add notes about your interactions and schedule follow-up tasks."
        },
        {
          id: "step4",
          title: "Converting a Lead",
          content: "When a lead is ready to be converted, click the 'Convert' button on their profile. Select which entities to create (Contact, Account, Opportunity) and complete the conversion process."
        }
      ]
    },
    {
      id: "communications",
      title: "Communications Center",
      description: "Master the unified communication center to manage all customer interactions",
      duration: "8 min",
      level: "intermediate",
      format: "interactive",
      steps: [
        {
          id: "step1",
          title: "Accessing the Communications Center",
          content: "Click on the 'Communication Center' icon in the sidebar to access all your communications in one place."
        },
        {
          id: "step2",
          title: "Filtering Communications",
          content: "Use the filters at the top of the screen to sort communications by channel (Email, WhatsApp, SMS, etc.), status, date range, or contact."
        },
        {
          id: "step3",
          title: "Sending New Messages",
          content: "Click the 'New Message' button, select the channel you want to use, choose your recipient(s), compose your message, and send."
        },
        {
          id: "step4",
          title: "Managing Templates",
          content: "Access the Templates section to create, edit, and manage message templates for quick and consistent communication."
        }
      ]
    },
    {
      id: "accounting-basics",
      title: "Accounting Basics",
      description: "Learn how to use the accounting features for invoicing and financial tracking",
      duration: "15 min",
      level: "intermediate",
      format: "video",
      videoUrl: "https://example.com/videos/accounting-basics.mp4",
    },
    {
      id: "inventory-management",
      title: "Inventory Management",
      description: "How to track products, manage stock levels, and handle orders",
      duration: "12 min",
      level: "advanced",
      format: "text",
      steps: [
        {
          id: "step1",
          title: "Accessing Inventory",
          content: "Navigate to the Inventory section from the sidebar to view your product catalog and current stock levels."
        },
        {
          id: "step2",
          title: "Adding New Products",
          content: "Click 'Add Product' to create a new inventory item. Fill in details including name, SKU, description, price, and initial quantity."
        },
        {
          id: "step3",
          title: "Managing Stock",
          content: "Update stock levels by selecting a product and clicking 'Adjust Inventory'. You can add or remove stock and provide a reason for the adjustment."
        },
        {
          id: "step4",
          title: "Setting Up Alerts",
          content: "Configure low stock alerts by editing a product and setting the 'Low Stock Threshold'. Notifications will be sent when inventory reaches this level."
        }
      ]
    },
    {
      id: "data-migration",
      title: "Data Migration Guide",
      description: "How to import your data from other CRM systems",
      duration: "10 min",
      level: "intermediate",
      format: "text",
      steps: [
        {
          id: "step1",
          title: "Accessing Data Migration Tool",
          content: "Navigate to Settings > Data Migration to access the migration wizard."
        },
        {
          id: "step2",
          title: "Selecting Source System",
          content: "Choose your previous CRM system from the dropdown menu (Zoho, Salesforce, MS Dynamics, HubSpot)."
        },
        {
          id: "step3",
          title: "Connecting to Source",
          content: "Enter your API credentials for the source system or upload exported data files."
        },
        {
          id: "step4",
          title: "Mapping Fields",
          content: "Review and adjust the automatic field mapping to ensure data is correctly transferred."
        },
        {
          id: "step5",
          title: "Running Migration",
          content: "Click 'Start Migration' and monitor the progress. Once complete, verify the imported data."
        }
      ]
    }
  ];

  const renderModuleCard = (module: TrainingModule) => {
    const isExpanded = expandedModuleId === module.id;
    const formatIcon = 
      module.format === "video" ? <Video className="w-4 h-4" /> :
      module.format === "interactive" ? <Lightbulb className="w-4 h-4" /> :
      <FileText className="w-4 h-4" />;
    
    const levelClass = 
      module.level === "beginner" ? "bg-green-100 text-green-800" :
      module.level === "intermediate" ? "bg-blue-100 text-blue-800" :
      "bg-purple-100 text-purple-800";
    
    return (
      <Card key={module.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {formatIcon}
              <span className={`text-xs px-2 py-1 rounded ${levelClass}`}>
                {module.level}
              </span>
              <span className="text-xs text-neutral-500">
                {module.duration}
              </span>
            </div>
            <SimpleButton
              variant="outline"
              size="sm"
              onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
              className="text-primary"
            >
              {isExpanded ? t.buttons.close : t.buttons.view}
            </SimpleButton>
          </div>
          <CardTitle className="text-lg">{module.title}</CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
            {module.format === "video" ? (
              <div className="bg-neutral-100 rounded-md p-6 flex flex-col items-center justify-center min-h-[200px] mb-4">
                <Video className="w-12 h-12 text-primary mb-4" />
                <p className="text-neutral-600 mb-4">{t.training.videoPlaceholder}</p>
                <SimpleButton variant="default" className="gap-2">
                  <Play className="w-4 h-4" />
                  {t.buttons.playVideo}
                </SimpleButton>
              </div>
            ) : module.steps ? (
              <div className="space-y-4">
                {module.steps.map((step, index) => (
                  <div key={step.id} className="p-4 border border-neutral-200 rounded-md">
                    <h4 className="font-medium flex items-center mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">{index + 1}</span>
                      {step.title}
                    </h4>
                    <p className="text-neutral-600 ml-8">{step.content}</p>
                  </div>
                ))}
                <div className="flex justify-end">
                  <a 
                    href={`#pdf-${module.id}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      // Open PDF in new tab (simulate download in real app)
                      window.open(`#${module.id}-pdf`, '_blank');
                      // Add alert showing PDF download started
                      alert("PDF download started. The file will open in a new tab.");
                    }}
                  >
                    <SimpleButton variant="outline" className="gap-2 mr-2">
                      <Download className="w-4 h-4" />
                      {t.buttons.downloadPdf}
                    </SimpleButton>
                  </a>
                  <a 
                    href={`#tutorial-${module.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Open full tutorial in new tab
                      window.open(`#full-tutorial-${module.id}`, '_blank');
                    }}
                  >
                    <SimpleButton variant="default" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      {t.buttons.fullTutorial}
                    </SimpleButton>
                  </a>
                </div>
              </div>
            ) : null}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t.navigation.training}</h1>
        <TooltipHelper 
          content="Access step-by-step guides, video tutorials, and resources to master AVEROX CRM"
          side="right" 
          className="ml-2"
          iconSize={20}
        />
      </div>
      
      <Tabs defaultValue="tutorials" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="tutorials">{t.training.tutorials}</TabsTrigger>
          <TabsTrigger value="videos">{t.training.videos}</TabsTrigger>
          <TabsTrigger value="faq">{t.training.faq}</TabsTrigger>
          <TabsTrigger value="resources">{t.training.resources}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutorials" className="space-y-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t.training.gettingStarted}</CardTitle>
              <CardDescription>{t.training.gettingStartedDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{t.training.quickSetup}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{t.training.quickSetupDesc}</p>
                  <SimpleButton variant="link" onClick={() => window.open('https://averox.com/docs/getting-started', '_blank')}>{t.buttons.learnMore} <ArrowRight className="ml-1 w-4 h-4" /></SimpleButton>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{t.training.videoTutorials}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{t.training.videoTutorialsDesc}</p>
                  <SimpleButton variant="link">{t.buttons.watchNow} <ArrowRight className="ml-1 w-4 h-4" /></SimpleButton>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{t.training.documentation}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{t.training.documentationDesc}</p>
                  <SimpleButton variant="link">{t.buttons.readDocs} <ArrowRight className="ml-1 w-4 h-4" /></SimpleButton>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-semibold mb-4">{t.training.trainingModules}</h2>
          <div className="space-y-4">
            {trainingModules.map(renderModuleCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingModules
              .filter(module => module.format === "video")
              .map(module => (
                <Card key={module.id} className="flex flex-col h-full">
                  <div className="bg-neutral-100 relative rounded-t-md aspect-video flex items-center justify-center">
                    <Video className="w-12 h-12 text-neutral-400" />
                    <div className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition-colors cursor-pointer group">
                      <div className="p-4 bg-primary text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{module.duration}</span>
                      <SimpleButton variant="link" className="text-primary p-0">
                        {t.buttons.watchNow}
                      </SimpleButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>{t.training.frequentlyAskedQuestions}</CardTitle>
              <CardDescription>{t.training.faqDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="mt-8 p-4 bg-primary/10 rounded-md">
                <h3 className="font-medium mb-2">{t.training.needMoreHelp}</h3>
                <p className="text-neutral-600 mb-4">{t.training.needMoreHelpDesc}</p>
                <div className="flex flex-wrap gap-3">
                  <SimpleButton variant="default">
                    {t.buttons.contactSupport}
                  </SimpleButton>
                  <SimpleButton variant="outline">
                    {t.buttons.viewAllFaqs}
                  </SimpleButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.training.downloadableResources}</CardTitle>
                <CardDescription>{t.training.resourcesDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="p-3 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-primary mr-3" />
                      <span>{t.training.userGuide}</span>
                    </div>
                    <SimpleButton variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      {t.buttons.download}
                    </SimpleButton>
                  </li>
                  <li className="p-3 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-primary mr-3" />
                      <span>{t.training.apiDocumentation}</span>
                    </div>
                    <SimpleButton variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      {t.buttons.download}
                    </SimpleButton>
                  </li>
                  <li className="p-3 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-primary mr-3" />
                      <span>{t.training.accountingSetupGuide}</span>
                    </div>
                    <SimpleButton variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      {t.buttons.download}
                    </SimpleButton>
                  </li>
                  <li className="p-3 border border-neutral-200 rounded-md hover:border-primary hover:bg-primary/5 transition-colors flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-primary mr-3" />
                      <span>{t.training.migrationChecklist}</span>
                    </div>
                    <SimpleButton variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      {t.buttons.download}
                    </SimpleButton>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t.training.webinarsAndEvents}</CardTitle>
                <CardDescription>{t.training.webinarsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{t.training.upcomingWebinarTitle}</h3>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {t.training.upcomingLabel}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {t.training.upcomingWebinarDesc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        {t.training.upcomingWebinarDate}
                      </span>
                      <SimpleButton variant="default" size="sm">
                        {t.buttons.register}
                      </SimpleButton>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-neutral-200 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{t.training.recordedWebinarTitle}</h3>
                      <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded">
                        {t.training.recordedLabel}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">
                      {t.training.recordedWebinarDesc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        {t.training.recordedWebinarDate}
                      </span>
                      <SimpleButton variant="outline" size="sm">
                        <Play className="w-3.5 h-3.5 mr-1" />
                        {t.buttons.watch}
                      </SimpleButton>
                    </div>
                  </div>
                  
                  <SimpleButton variant="link" className="w-full justify-center">
                    {t.buttons.viewAllWebinars} <ArrowRight className="ml-1 w-4 h-4" />
                  </SimpleButton>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}