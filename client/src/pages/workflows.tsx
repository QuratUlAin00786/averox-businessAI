import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowRight, Plus, PlayCircle, PauseCircle, Clock, CheckCircle, AlertCircle, 
  RotateCcw, Settings, Edit2, Trash2, Copy, Zap, Workflow, Mail, Bell, Calendar,
  MessageSquare, RefreshCcw, User
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const workflowTemplates = [
  {
    id: 1,
    name: "Lead Nurturing Sequence",
    description: "Automatically nurture new leads with a series of personalized emails",
    category: "Sales",
    triggers: ["New Lead Created"],
    steps: 5,
    popular: true
  },
  {
    id: 2,
    name: "Deal Follow-up Reminders",
    description: "Create tasks and reminders when deals reach specific stages",
    category: "Sales",
    triggers: ["Deal Stage Changed"],
    steps: 3,
    popular: false
  },
  {
    id: 3,
    name: "Customer Onboarding",
    description: "Guide new customers through your onboarding process",
    category: "Customer Success",
    triggers: ["Deal Won"],
    steps: 7,
    popular: true
  },
  {
    id: 4,
    name: "Meeting Follow-up",
    description: "Send follow-up emails and create tasks after calendar events",
    category: "Productivity",
    triggers: ["Event Completed"],
    steps: 2,
    popular: false
  },
  {
    id: 5,
    name: "Lead Routing",
    description: "Automatically assign and route new leads to appropriate team members",
    category: "Sales",
    triggers: ["New Lead Created"],
    steps: 4,
    popular: false
  },
  {
    id: 6,
    name: "Customer Check-in",
    description: "Regular scheduled check-ins with customers based on status",
    category: "Customer Success",
    triggers: ["Time Trigger"],
    steps: 3,
    popular: false
  }
];

const activeWorkflows = [
  {
    id: 101,
    name: "VIP Lead Nurturing",
    description: "Special nurturing flow for high-value leads",
    status: "active",
    lastRun: "2 hours ago",
    runs: 28,
    created: "Mar 15, 2023"
  },
  {
    id: 102,
    name: "Enterprise Deal Alerting",
    description: "Alert manager and create task when enterprise deals advance stages",
    status: "active",
    lastRun: "Yesterday",
    runs: 12,
    created: "Apr 1, 2023"
  },
  {
    id: 103,
    name: "Weekly Pipeline Report",
    description: "Generate and email weekly pipeline report to leadership",
    status: "active",
    lastRun: "3 days ago",
    runs: 45,
    created: "Jan 10, 2023"
  },
  {
    id: 104,
    name: "Meeting Scheduler",
    description: "Automatically suggest meeting times based on customer interactions",
    status: "paused",
    lastRun: "1 month ago",
    runs: 8,
    created: "Feb 22, 2023"
  }
];

const workflowRuns = [
  {
    id: 1001,
    workflowName: "VIP Lead Nurturing",
    status: "completed",
    trigger: "New lead: Acme Corp",
    startTime: "Apr 2, 2023 10:32 AM",
    duration: "45 seconds",
    steps: [
      { name: "Check lead score", status: "completed" },
      { name: "Send welcome email", status: "completed" },
      { name: "Create follow-up task", status: "completed" },
      { name: "Notify sales rep", status: "completed" }
    ]
  },
  {
    id: 1002,
    workflowName: "Enterprise Deal Alerting",
    status: "failed",
    trigger: "Deal moved to Proposal",
    startTime: "Apr 1, 2023 3:15 PM",
    duration: "12 seconds",
    steps: [
      { name: "Verify deal amount", status: "completed" },
      { name: "Create deal review task", status: "completed" },
      { name: "Send Slack notification", status: "failed" }
    ]
  },
  {
    id: 1003,
    workflowName: "Weekly Pipeline Report",
    status: "running",
    trigger: "Scheduled (Weekly)",
    startTime: "Apr 2, 2023 8:00 AM",
    duration: "Running",
    steps: [
      { name: "Generate report", status: "completed" },
      { name: "Format PDF", status: "running" },
      { name: "Send email", status: "pending" }
    ]
  },
  {
    id: 1004,
    workflowName: "VIP Lead Nurturing",
    status: "completed",
    trigger: "New lead: Global Tech",
    startTime: "Mar 30, 2023 2:20 PM",
    duration: "50 seconds",
    steps: [
      { name: "Check lead score", status: "completed" },
      { name: "Send welcome email", status: "completed" },
      { name: "Create follow-up task", status: "completed" },
      { name: "Notify sales rep", status: "completed" }
    ]
  }
];

export default function Workflows() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [isWorkflowDetailOpen, setIsWorkflowDetailOpen] = useState(false);

  const openWorkflowDetail = (id: number) => {
    setSelectedWorkflow(id);
    setIsWorkflowDetailOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCcw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTriggerIcon = (triggerName: string) => {
    if (triggerName.includes("lead")) return <User className="h-4 w-4 text-blue-500" />;
    if (triggerName.includes("deal")) return <Zap className="h-4 w-4 text-purple-500" />;
    if (triggerName.includes("email")) return <Mail className="h-4 w-4 text-green-500" />;
    if (triggerName.includes("Scheduled")) return <Calendar className="h-4 w-4 text-orange-500" />;
    return <Bell className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Workflows"
        description="Automate your processes and save time with workflows"
        actions={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Workflow
          </Button>
        }
      />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Active Workflows
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Run History
          </TabsTrigger>
        </TabsList>
        
        {/* Active Workflows Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="bg-white rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px]">Last Run</TableHead>
                  <TableHead className="w-[80px]">Total Runs</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell>{workflow.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {workflow.status === "active" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                            <PauseCircle className="h-3 w-3 mr-1" />
                            Paused
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{workflow.lastRun}</TableCell>
                    <TableCell>{workflow.runs}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openWorkflowDetail(workflow.id)}>
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Settings</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {workflow.status === "active" ? (
                          <Button variant="ghost" size="icon">
                            <PauseCircle className="h-4 w-4" />
                            <span className="sr-only">Pause</span>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon">
                            <PlayCircle className="h-4 w-4" />
                            <span className="sr-only">Resume</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className={template.popular ? "border-blue-200" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.popular && (
                      <Badge variant="secondary">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="bg-gray-50">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      {template.steps} steps
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Triggers on: </span>
                    {template.triggers.join(", ")}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm">Preview</Button>
                  <Button className="flex items-center gap-1">
                    Use Template
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Run History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="bg-white rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflowRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.workflowName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTriggerIcon(run.trigger)}
                        <span>{run.trigger}</span>
                      </div>
                    </TableCell>
                    <TableCell>{run.startTime}</TableCell>
                    <TableCell>{run.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(run.status)}
                        <span className={`capitalize ${
                          run.status === "completed" ? "text-green-600" :
                          run.status === "failed" ? "text-red-600" :
                          run.status === "running" ? "text-blue-600" : ""
                        }`}>
                          {run.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Steps
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Workflow Steps Accordion */}
          <div className="bg-white rounded-md overflow-hidden border">
            <div className="p-4 border-b">
              <h3 className="font-medium">Recent Run Details</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {workflowRuns.slice(0, 2).map((run) => (
                <AccordionItem value={`run-${run.id}`} key={run.id}>
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(run.status)}
                      <span className="font-medium">{run.workflowName}</span>
                      <Badge variant="outline" className="ml-2">
                        {run.trigger}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4">
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">Started:</span> {run.startTime}
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span> {run.duration}
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span> <span className="capitalize">{run.status}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Workflow Steps</h4>
                        <ul className="space-y-3">
                          {run.steps.map((step, i) => (
                            <li key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
                              <div className="flex-shrink-0">
                                {getStatusIcon(step.status)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{step.name}</p>
                              </div>
                              <div>
                                <Badge variant="outline" className={
                                  step.status === "completed" ? "bg-green-50 text-green-700" :
                                  step.status === "failed" ? "bg-red-50 text-red-700" :
                                  step.status === "running" ? "bg-blue-50 text-blue-700" :
                                  "bg-gray-50 text-gray-700"
                                }>
                                  {step.status}
                                </Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {run.status === "failed" && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-red-800 text-sm">
                          <p className="font-medium">Error: Failed to connect to Slack API</p>
                          <p className="mt-1">Check your Slack integration settings and ensure the API token is valid.</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end gap-2">
                        {run.status === "failed" && (
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <RotateCcw className="h-3 w-3" />
                            Retry
                          </Button>
                        )}
                        <Button variant="outline" size="sm">View Full Log</Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>

      {/* Workflow Builder Teaser */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Create powerful automated processes with our drag-and-drop workflow builder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Workflow Designer</h3>
                  <Button variant="outline" size="sm">Preview Mode</Button>
                </div>
                <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-blue-200 rounded-md">
                  <div className="text-center text-blue-500">
                    <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Visual workflow builder coming soon!</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Build Advanced Workflows</h3>
                <p className="text-gray-600">Create custom workflows with conditional logic, delays, actions, and integrations.</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Drag-and-drop interface</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Multiple trigger options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Conditional branching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Third-party integrations</span>
                </li>
              </ul>
              <Button className="mt-4">Open Workflow Builder</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}