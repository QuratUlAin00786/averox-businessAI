import { useState } from "react";

// Define window.currentTemplate global property
declare global {
  interface Window {
    currentTemplate: any;
  }
}

// Template and workflow interfaces
interface WorkflowTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  triggers: string[];
  steps: number;
  popular?: boolean;
  trigger: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  actions?: any[];
  triggerType?: string;
  nodes?: any[];
  connections?: any[];
}

interface ActiveWorkflow {
  id: number;
  name: string;
  description: string;
  status: string;
  lastRun: string;
  runs: number;
  created: string;
  trigger: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  triggerType: string;
  nodes?: any[];
  connections?: any[];
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowRight, Plus, PlayCircle, PauseCircle, Clock, CheckCircle, AlertCircle, 
  RotateCcw, Settings, Edit2, Trash2, Copy, Zap, Workflow, Mail, Bell, Calendar,
  MessageSquare, RefreshCcw, User, FileText, Layout
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkflowEditor } from "@/components/workflows/workflow-editor";
import { VisualWorkflowEditor } from "@/components/workflows/visual-workflow-editor";
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

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 7,
    name: "Invoice Payment Reminder",
    description: "Send automated reminders for upcoming and overdue invoice payments",
    category: "Accounting",
    triggers: ["Invoice Created", "Payment Overdue"],
    steps: 4,
    popular: true,
    trigger: {
      id: "invoice_created",
      name: "Invoice Created or Updated",
      category: "Accounting",
      description: "Trigger when a new invoice is created or payment status changes"
    },
  },
  {
    id: 8,
    name: "Low Inventory Alert",
    description: "Monitor inventory levels and alert when products fall below threshold",
    category: "Inventory",
    triggers: ["Inventory Updated"],
    steps: 3,
    popular: true,
    trigger: {
      id: "inventory_threshold",
      name: "Inventory Below Threshold",
      category: "Inventory",
      description: "Trigger when product inventory falls below defined threshold"
    },
  },
  {
    id: 1,
    name: "Lead Nurturing Sequence",
    description: "Automatically nurture new leads with a series of personalized emails",
    category: "Sales",
    triggers: ["New Lead Created"],
    steps: 5,
    popular: true,
    trigger: {
      id: "new_lead",
      name: "New Lead Created",
      category: "Leads",
      description: "Trigger when a new lead is created in the system"
    },
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        triggerType: "new_lead",
        name: "New Lead Created",
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: "action_1",
        type: "action",
        actionType: "send_email",
        name: "Send Welcome Email",
        position: { x: 100, y: 250 },
        config: { template: "welcome", subject: "Welcome to Our Company", recipientType: "lead" }
      },
      {
        id: "action_2",
        type: "action",
        actionType: "wait",
        name: "Wait 2 Days",
        position: { x: 100, y: 400 },
        config: { days: 2, hours: 0 }
      },
      {
        id: "action_3",
        type: "action",
        actionType: "send_email",
        name: "Send Product Info",
        position: { x: 100, y: 550 },
        config: { template: "product_info", subject: "Our Products and Services", recipientType: "lead" }
      },
      {
        id: "action_4",
        type: "action",
        actionType: "wait",
        name: "Wait 3 Days",
        position: { x: 100, y: 700 },
        config: { days: 3, hours: 0 }
      },
      {
        id: "action_5",
        type: "action",
        actionType: "create_task",
        name: "Sales Follow-up Call",
        position: { x: 100, y: 850 },
        config: { assignTo: "owner", dueInDays: 1, priority: "High", title: "Follow up with lead" }
      }
    ],
    connections: [
      { id: "conn_1", source: "trigger_1", target: "action_1" },
      { id: "conn_2", source: "action_1", target: "action_2" },
      { id: "conn_3", source: "action_2", target: "action_3" },
      { id: "conn_4", source: "action_3", target: "action_4" },
      { id: "conn_5", source: "action_4", target: "action_5" }
    ],
    actions: [
      { id: "send_email", name: "Send Welcome Email", config: { template: "welcome" } },
      { id: "wait", name: "Wait 2 Days", config: { days: 2 } },
      { id: "send_email", name: "Send Product Info", config: { template: "product_info" } },
      { id: "wait", name: "Wait 3 Days", config: { days: 3 } },
      { id: "create_task", name: "Sales Follow-up Call", config: { assignTo: "owner" } }
    ],
    triggerType: "new_lead"
  },
  {
    id: 2,
    name: "Deal Follow-up Reminders",
    description: "Create tasks and reminders when deals reach specific stages",
    category: "Sales",
    triggers: ["Deal Stage Changed"],
    steps: 3,
    popular: false,
    trigger: {
      id: "deal_stage_change",
      name: "Deal Stage Changed",
      category: "Opportunities",
      description: "Trigger when a deal moves to a different stage"
    },
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        triggerType: "deal_stage_change",
        name: "Deal Stage Changed",
        position: { x: 100, y: 100 },
        config: { stage: "Negotiation" }
      },
      {
        id: "action_1",
        type: "action",
        actionType: "condition",
        name: "Check Deal Value",
        position: { x: 100, y: 250 },
        config: { condition: "amount > 10000", field: "amount", operator: ">", value: "10000" }
      },
      {
        id: "action_2",
        type: "action",
        actionType: "create_task",
        name: "Schedule Manager Review",
        position: { x: 100, y: 400 },
        config: { assignTo: "manager", dueInDays: 2, priority: "High", title: "Review high-value deal" }
      },
      {
        id: "action_3",
        type: "action",
        actionType: "send_notification",
        name: "Alert Sales Team",
        position: { x: 100, y: 550 },
        config: { channel: "sales", message: "High value deal requires attention", urgency: "Medium" }
      }
    ],
    connections: [
      { id: "conn_1", source: "trigger_1", target: "action_1" },
      { id: "conn_2", source: "action_1", target: "action_2" },
      { id: "conn_3", source: "action_2", target: "action_3" }
    ],
    actions: [
      { id: "condition", name: "Check Deal Value", config: { condition: "amount > 10000" } },
      { id: "create_task", name: "Schedule Manager Review", config: { assignTo: "manager" } },
      { id: "send_notification", name: "Alert Sales Team", config: { channel: "sales" } }
    ],
    triggerType: "deal_stage_change"
  },
  {
    id: 3,
    name: "Customer Onboarding",
    description: "Guide new customers through your onboarding process",
    category: "Customer Success",
    triggers: ["Deal Won"],
    steps: 7,
    popular: true,
    trigger: {
      id: "deal_closed",
      name: "Deal Closed (Won/Lost)",
      category: "Opportunities",
      description: "Trigger when a deal is marked as won or lost"
    },
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        triggerType: "deal_closed",
        name: "Deal Closed (Won)",
        position: { x: 100, y: 100 },
        config: { status: "won" }
      },
      {
        id: "action_1",
        type: "action",
        actionType: "send_email",
        name: "Welcome to Our Product",
        position: { x: 100, y: 250 },
        config: { template: "onboarding_welcome", subject: "Welcome Aboard!", recipientType: "contact" }
      },
      {
        id: "action_2",
        type: "action",
        actionType: "create_task",
        name: "Assign Customer Success Rep",
        position: { x: 100, y: 400 },
        config: { assignTo: "cs_team", dueInDays: 1, priority: "High", title: "Assign CS Rep to new customer" }
      },
      {
        id: "action_3",
        type: "action",
        actionType: "create_event",
        name: "Schedule Kickoff Call",
        position: { x: 100, y: 550 },
        config: { duration: 60, title: "Customer Kickoff Call", attendees: ["customer", "cs_rep", "account_manager"] }
      },
      {
        id: "action_4",
        type: "action",
        actionType: "wait",
        name: "Wait 1 Week",
        position: { x: 100, y: 700 },
        config: { days: 7, hours: 0 }
      },
      {
        id: "action_5",
        type: "action",
        actionType: "send_email",
        name: "Training Resources",
        position: { x: 100, y: 850 },
        config: { template: "training", subject: "Your Training Resources", recipientType: "contact" }
      },
      {
        id: "action_6",
        type: "action",
        actionType: "wait",
        name: "Wait 2 Weeks",
        position: { x: 100, y: 1000 },
        config: { days: 14, hours: 0 }
      },
      {
        id: "action_7",
        type: "action",
        actionType: "create_task",
        name: "Check-in Call",
        position: { x: 100, y: 1150 },
        config: { assignTo: "owner", dueInDays: 2, priority: "Medium", title: "Follow-up check-in call with customer" }
      }
    ],
    connections: [
      { id: "conn_1", source: "trigger_1", target: "action_1" },
      { id: "conn_2", source: "action_1", target: "action_2" },
      { id: "conn_3", source: "action_2", target: "action_3" },
      { id: "conn_4", source: "action_3", target: "action_4" },
      { id: "conn_5", source: "action_4", target: "action_5" },
      { id: "conn_6", source: "action_5", target: "action_6" },
      { id: "conn_7", source: "action_6", target: "action_7" }
    ],
    actions: [
      { id: "send_email", name: "Welcome to Our Product", config: { template: "onboarding_welcome" } },
      { id: "create_task", name: "Assign Customer Success Rep", config: { assignTo: "cs_team" } },
      { id: "create_event", name: "Schedule Kickoff Call", config: { duration: 60 } },
      { id: "wait", name: "Wait 1 Week", config: { days: 7 } },
      { id: "send_email", name: "Training Resources", config: { template: "training" } },
      { id: "wait", name: "Wait 2 Weeks", config: { days: 14 } },
      { id: "create_task", name: "Check-in Call", config: { assignTo: "owner" } }
    ],
    triggerType: "deal_closed"
  },
  {
    id: 4,
    name: "Meeting Follow-up",
    description: "Send follow-up emails and create tasks after calendar events",
    category: "Productivity",
    triggers: ["Event Completed"],
    steps: 2,
    popular: false,
    trigger: {
      id: "meeting_scheduled",
      name: "Meeting Scheduled",
      category: "Events",
      description: "Trigger when a new meeting is scheduled"
    },
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        triggerType: "meeting_scheduled",
        name: "Meeting Scheduled",
        position: { x: 100, y: 100 },
        config: { status: "completed" }
      },
      {
        id: "action_1",
        type: "action",
        actionType: "send_email",
        name: "Meeting Summary Email",
        position: { x: 100, y: 250 },
        config: { template: "meeting_summary", subject: "Meeting Summary", recipientType: "participants" }
      },
      {
        id: "action_2",
        type: "action",
        actionType: "create_task",
        name: "Follow-up Action Items",
        position: { x: 100, y: 400 },
        config: { assignTo: "participants", dueInDays: 3, priority: "Medium", title: "Action items from meeting" }
      }
    ],
    connections: [
      { id: "conn_1", source: "trigger_1", target: "action_1" },
      { id: "conn_2", source: "action_1", target: "action_2" }
    ],
    actions: [
      { id: "send_email", name: "Meeting Summary Email", config: { template: "meeting_summary" } },
      { id: "create_task", name: "Follow-up Action Items", config: { assignTo: "participants" } }
    ],
    triggerType: "meeting_scheduled"
  },
  {
    id: 5,
    name: "Lead Routing",
    description: "Automatically assign and route new leads to appropriate team members",
    category: "Sales",
    triggers: ["New Lead Created"],
    steps: 4,
    popular: false,
    trigger: {
      id: "new_lead",
      name: "New Lead Created",
      category: "Leads",
      description: "Trigger when a new lead is created in the system"
    },
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        triggerType: "new_lead",
        name: "New Lead Created",
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: "action_1",
        type: "action",
        actionType: "condition",
        name: "Check Lead Source",
        position: { x: 100, y: 250 },
        config: { condition: "source == 'website'", field: "source", operator: "==", value: "website" }
      },
      {
        id: "action_2",
        type: "action",
        actionType: "update_record",
        name: "Assign to Web Team",
        position: { x: 100, y: 400 },
        config: { field: "owner", value: "web_team", recordType: "lead" }
      },
      {
        id: "action_3",
        type: "action",
        actionType: "condition",
        name: "Check Industry",
        position: { x: 100, y: 550 },
        config: { condition: "industry == 'healthcare'", field: "industry", operator: "==", value: "healthcare" }
      },
      {
        id: "action_4",
        type: "action",
        actionType: "update_record",
        name: "Assign to Healthcare Specialist",
        position: { x: 100, y: 700 },
        config: { field: "owner", value: "healthcare_specialist", recordType: "lead" }
      }
    ],
    connections: [
      { id: "conn_1", source: "trigger_1", target: "action_1" },
      { id: "conn_2", source: "action_1", target: "action_2" },
      { id: "conn_3", source: "action_2", target: "action_3" },
      { id: "conn_4", source: "action_3", target: "action_4" }
    ],
    actions: [
      { id: "condition", name: "Check Lead Source", config: { condition: "source == 'website'" } },
      { id: "update_record", name: "Assign to Web Team", config: { field: "owner", value: "web_team" } },
      { id: "condition", name: "Check Industry", config: { condition: "industry == 'healthcare'" } },
      { id: "update_record", name: "Assign to Healthcare Specialist", config: { field: "owner", value: "healthcare_specialist" } }
    ],
    triggerType: "new_lead"
  },
  {
    id: 6,
    name: "Customer Check-in",
    description: "Regular scheduled check-ins with customers based on status",
    category: "Customer Success",
    triggers: ["Time Trigger"],
    steps: 3,
    popular: false,
    trigger: {
      id: "scheduled",
      name: "Scheduled (Time-Based)",
      category: "System",
      description: "Trigger based on a schedule (daily, weekly, monthly)"
    },
    nodes: [
      {
        id: "trigger_1",
        type: "trigger",
        triggerType: "scheduled",
        name: "Scheduled (Every Quarter)",
        position: { x: 100, y: 100 },
        config: { frequency: "quarterly", day: "1", time: "09:00" }
      },
      {
        id: "action_1",
        type: "action",
        actionType: "condition",
        name: "Check Account Status",
        position: { x: 100, y: 250 },
        config: { condition: "status == 'active'", field: "status", operator: "==", value: "active" }
      },
      {
        id: "action_2",
        type: "action",
        actionType: "create_task",
        name: "Quarterly Review",
        position: { x: 100, y: 400 },
        config: { assignTo: "account_manager", dueInDays: 14, priority: "Normal", title: "Quarterly customer review", recurring: true }
      },
      {
        id: "action_3",
        type: "action",
        actionType: "send_email",
        name: "Satisfaction Survey",
        position: { x: 100, y: 550 },
        config: { template: "satisfaction_survey", subject: "How Are We Doing?", recipientType: "customer" }
      }
    ],
    connections: [
      { id: "conn_1", source: "trigger_1", target: "action_1" },
      { id: "conn_2", source: "action_1", target: "action_2" },
      { id: "conn_3", source: "action_2", target: "action_3" }
    ],
    actions: [
      { id: "condition", name: "Check Account Status", config: { condition: "status == 'active'" } },
      { id: "create_task", name: "Quarterly Review", config: { assignTo: "account_manager", recurring: true } },
      { id: "send_email", name: "Satisfaction Survey", config: { template: "satisfaction_survey" } }
    ],
    triggerType: "scheduled"
  }
];

const activeWorkflows: ActiveWorkflow[] = [
  {
    id: 107,
    name: "Automated Invoice Reminders",
    description: "Send payment reminders for upcoming and overdue invoices",
    status: "active",
    lastRun: "30 minutes ago",
    runs: 15,
    created: "Apr 1, 2025",
    trigger: {
      id: "invoice_created",
      name: "Invoice Created or Updated",
      category: "Accounting",
      description: "Trigger when a new invoice is created or payment status changes"
    },
    triggerType: "invoice_created"
  },
  {
    id: 108,
    name: "Low Stock Notification",
    description: "Alert inventory manager when stock levels are critical",
    status: "active",
    lastRun: "2 hours ago",
    runs: 8,
    created: "Apr 2, 2025",
    trigger: {
      id: "inventory_threshold",
      name: "Inventory Below Threshold",
      category: "Inventory",
      description: "Trigger when product inventory falls below defined threshold"
    },
    triggerType: "inventory_threshold"
  },
  {
    id: 101,
    name: "VIP Lead Nurturing",
    description: "Special nurturing flow for high-value leads",
    status: "active",
    lastRun: "2 hours ago",
    runs: 28,
    created: "Mar 15, 2023",
    trigger: {
      id: "new_lead",
      name: "New Lead Created",
      category: "Leads",
      description: "Trigger when a new lead is created in the system"
    },
    triggerType: "new_lead"
  },
  {
    id: 102,
    name: "Enterprise Deal Alerting",
    description: "Alert manager and create task when enterprise deals advance stages",
    status: "active",
    lastRun: "Yesterday",
    runs: 12,
    created: "Apr 1, 2023",
    trigger: {
      id: "deal_stage_change",
      name: "Deal Stage Changed",
      category: "Opportunities",
      description: "Trigger when a deal moves to a different stage"
    },
    triggerType: "deal_stage_change"
  },
  {
    id: 103,
    name: "Weekly Pipeline Report",
    description: "Generate and email weekly pipeline report to leadership",
    status: "active",
    lastRun: "3 days ago",
    runs: 45,
    created: "Jan 10, 2023",
    trigger: {
      id: "scheduled",
      name: "Scheduled (Time-Based)",
      category: "System",
      description: "Trigger based on a schedule (daily, weekly, monthly)"
    },
    triggerType: "scheduled"
  },
  {
    id: 104,
    name: "Meeting Scheduler",
    description: "Automatically suggest meeting times based on customer interactions",
    status: "paused",
    lastRun: "1 month ago",
    runs: 8,
    created: "Feb 22, 2023",
    trigger: {
      id: "meeting_scheduled",
      name: "Meeting Scheduled",
      category: "Events",
      description: "Trigger when a new meeting is scheduled"
    },
    triggerType: "meeting_scheduled"
  }
];

const workflowRuns = [
  {
    id: 1007,
    workflowName: "Automated Invoice Reminders",
    status: "completed",
    trigger: "Invoice created: INV-2025-042",
    startTime: "Apr 5, 2025 11:15 AM",
    duration: "32 seconds",
    steps: [
      { name: "Check payment status", status: "completed" },
      { name: "Calculate due date", status: "completed" },
      { name: "Send payment reminder", status: "completed" },
      { name: "Record notification sent", status: "completed" }
    ]
  },
  {
    id: 1008,
    workflowName: "Low Stock Notification",
    status: "completed",
    trigger: "Product 'Widget XYZ' below threshold",
    startTime: "Apr 5, 2025 9:45 AM",
    duration: "28 seconds",
    steps: [
      { name: "Check inventory levels", status: "completed" },
      { name: "Generate inventory report", status: "completed" },
      { name: "Alert inventory manager", status: "completed" }
    ]
  },
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
  const [isVisualWorkflowDetailOpen, setIsVisualWorkflowDetailOpen] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  const [activeWorkflowsList, setActiveWorkflowsList] = useState(activeWorkflows);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedRunDetails, setExpandedRunDetails] = useState<number | null>(null);

  const openWorkflowDetail = (id: number, editorType: 'text' | 'visual' = 'text') => {
    // This function is used for both regular workflows and templates
    console.log("Opening workflow detail for ID:", id, "using editor type:", editorType);
    setSelectedWorkflow(id);
    if (editorType === 'text') {
      setIsWorkflowDetailOpen(true);
      setIsVisualWorkflowDetailOpen(false);
    } else {
      setIsVisualWorkflowDetailOpen(true);
      setIsWorkflowDetailOpen(false);
    }
  };
  
  const toggleWorkflowStatus = (id: number) => {
    setActiveWorkflowsList(prevList => 
      prevList.map(workflow => 
        workflow.id === id 
          ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' } 
          : workflow
      )
    );
  };
  
  const deleteWorkflow = (id: number) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setActiveWorkflowsList(prevList => 
        prevList.filter(workflow => workflow.id !== id)
      );
    }
  };
  
  // Filter templates based on selected category
  const filteredTemplates = selectedCategory === "all"
    ? workflowTemplates
    : workflowTemplates.filter(template => template.category === selectedCategory);

  const viewRunDetails = (id: number) => {
    setExpandedRunDetails(expandedRunDetails === id ? null : id);
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
    if (triggerName.includes("Invoice")) return <FileText className="h-4 w-4 text-emerald-500" />;
    if (triggerName.includes("inventory") || triggerName.includes("stock")) return <Layout className="h-4 w-4 text-cyan-500" />;
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
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowNewWorkflowModal(true)}
          >
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
                {activeWorkflowsList.map((workflow) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openWorkflowDetail(workflow.id, 'text')}>
                              <FileText className="h-4 w-4 mr-2" />
                              <span>Text Editor</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openWorkflowDetail(workflow.id, 'visual')}>
                              <Layout className="h-4 w-4 mr-2" />
                              <span>Visual Editor</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button variant="ghost" size="icon" onClick={() => openWorkflowDetail(workflow.id, 'text')}>
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Settings</span>
                        </Button>
                        
                        {workflow.status === "active" ? (
                          <Button variant="ghost" size="icon" onClick={() => toggleWorkflowStatus(workflow.id)}>
                            <PauseCircle className="h-4 w-4" />
                            <span className="sr-only">Pause</span>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => toggleWorkflowStatus(workflow.id)}>
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
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "Accounting", "Inventory", "Sales", "Customer Success", "Productivity"].map(category => (
              <Badge 
                key={category} 
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer ${selectedCategory === category ? "" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Categories" : category}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
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
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        console.log("Opening template preview (text editor):", template);
                        // Use the exact template object rather than searching by ID
                        setSelectedWorkflow(template.id);
                        // Store the full template data directly
                        window.currentTemplate = template; 
                        openWorkflowDetail(template.id, 'text');
                      }}
                    >
                      Text Editor
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log("Opening template preview (visual editor):", template);
                        console.log("Template has nodes:", !!template.nodes);
                        console.log("Template has connections:", !!template.connections);
                        if (template.nodes) console.log("Nodes count:", template.nodes.length);
                        if (template.connections) console.log("Connections count:", template.connections.length);
                        
                        // Use the exact template object rather than searching by ID
                        setSelectedWorkflow(template.id);
                        // Store the full template data directly
                        window.currentTemplate = template; 
                        openWorkflowDetail(template.id, 'visual');
                      }}
                    >
                      Visual Editor
                    </Button>
                  </div>
                  <Button 
                    className="flex items-center gap-1"
                    onClick={() => setShowNewWorkflowModal(true)}
                  >
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewRunDetails(run.id)}
                      >
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => alert(`Retrying workflow run: ${run.id}`)}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Retry
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`Viewing full log for run: ${run.id}`)}
                        >
                          View Full Log
                        </Button>
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
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setShowNewWorkflowModal(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Open Designer
                  </Button>
                </div>
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Trigger</h4>
                      <p className="text-xs text-gray-500">When something happens in your CRM</p>
                    </div>
                  </div>
                  
                  <div className="h-10 border-l-2 border-dashed border-gray-300 ml-5 pl-8"></div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Actions</h4>
                      <p className="text-xs text-gray-500">Then perform automated tasks</p>
                    </div>
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
                  <span>Step-by-step builder</span>
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
              <Button 
                className="mt-4"
                onClick={() => setShowNewWorkflowModal(true)}
              >
                Open Workflow Builder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Workflow Editor Modals */}
      {/* Text-based Workflow Editor (preserved from original) */}
      <WorkflowEditor
        isOpen={isWorkflowDetailOpen}
        onClose={() => setIsWorkflowDetailOpen(false)}
        workflow={selectedWorkflow !== null ? (
          selectedWorkflow <= 10 
            ? workflowTemplates.find(t => t.id === selectedWorkflow) 
            : activeWorkflowsList.find(w => w.id === selectedWorkflow)
        ) : null}
        isNew={false}
        isTemplate={!!selectedWorkflow && selectedWorkflow <= 10}
      />
      
      {/* Visual Workflow Detail Modal */}
      {isVisualWorkflowDetailOpen && selectedWorkflow !== null && (() => {
        // Debug wrapper to verify template data is passed correctly
        const templateData: WorkflowTemplate | ActiveWorkflow | null = selectedWorkflow !== null ? (
          selectedWorkflow <= 10 
            ? workflowTemplates.find(t => t.id === selectedWorkflow) 
            : activeWorkflowsList.find(w => w.id === selectedWorkflow)
        ) : null;
        
        console.log("DEBUG - Selected template data:", templateData);
        console.log("DEBUG - Has nodes property:", !!templateData?.nodes);
        console.log("DEBUG - Has connections property:", !!templateData?.connections);
        
        // Safe type checking for properties
        const hasNodes = 'nodes' in (templateData || {});
        const hasConnections = 'connections' in (templateData || {});
        
        if (hasNodes && templateData?.nodes) {
          console.log("DEBUG - Nodes length:", templateData.nodes.length);
          console.log("DEBUG - First node:", templateData.nodes[0]);
        }
        
        if (hasConnections && templateData?.connections) {
          console.log("DEBUG - Connections length:", templateData.connections.length);
          console.log("DEBUG - First connection:", templateData.connections[0]);
        }
        
        // Store the template data for direct access by visual editor
        window.currentTemplate = templateData;
        
        return (
          <VisualWorkflowEditor
            isOpen={true}
            onClose={() => setIsVisualWorkflowDetailOpen(false)}
            workflow={templateData}
            isNew={false}
            isTemplate={!!selectedWorkflow && selectedWorkflow <= 10}
          />
        );
      })()}
      
      {/* New Workflow Modal */}
      <VisualWorkflowEditor
        isOpen={showNewWorkflowModal}
        onClose={() => setShowNewWorkflowModal(false)}
        isNew={true}
        isTemplate={false}
      />
    </div>
  );
}