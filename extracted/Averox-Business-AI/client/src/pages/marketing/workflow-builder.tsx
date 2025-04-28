import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft, 
  Plus, 
  X, 
  ChevronDown, 
  Save, 
  Users, 
  Mail, 
  Clock, 
  Check, 
  Database, 
  Webhook, 
  FileText, 
  MessageSquare, 
  Settings, 
  ChevronRight, 
  Trash2,
  Code,
  PlayCircle,
  PauseCircle,
  ArrowDown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for the workflow builder
type NodeType = 
  | 'trigger' 
  | 'email' 
  | 'delay' 
  | 'condition' 
  | 'action' 
  | 'webhook' 
  | 'goal'
  | 'split'
  | 'cta';

interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  config?: any;
  children?: string[];
  branches?: {
    condition: string;
    nodeId: string;
  }[];
}

export default function WorkflowBuilder() {
  const [, setLocation] = useLocation();
  const [activeNodeId, setActiveNodeId] = useState<string | null>("trigger1");
  const [nodes, setNodes] = useState<Record<string, WorkflowNode>>({
    "trigger1": {
      id: "trigger1",
      type: "trigger",
      name: "Workflow Start",
      description: "This workflow starts when contacts meet the enrollment criteria",
      config: {
        triggerType: "segment",
        segmentId: "1"
      },
      children: ["email1"]
    },
    "email1": {
      id: "email1",
      type: "email",
      name: "Welcome Email",
      description: "Send a welcome email to new subscribers",
      config: {
        subject: "Welcome to our newsletter!",
        emailTemplate: "welcome-template",
        delay: 0
      },
      children: ["delay1"]
    },
    "delay1": {
      id: "delay1",
      type: "delay",
      name: "Wait 3 Days",
      description: "Wait for 3 days before sending the next email",
      config: {
        delayType: "fixed",
        delayAmount: 3,
        delayUnit: "days"
      },
      children: ["condition1"]
    },
    "condition1": {
      id: "condition1",
      type: "condition",
      name: "Check Email Open",
      description: "Check if the welcome email was opened",
      config: {
        conditionType: "email_opened",
        emailId: "email1"
      },
      branches: [
        {
          condition: "Yes",
          nodeId: "email2"
        },
        {
          condition: "No",
          nodeId: "email3"
        }
      ]
    },
    "email2": {
      id: "email2",
      type: "email",
      name: "Product Recommendations",
      description: "Send personalized product recommendations",
      config: {
        subject: "Products we think you'll love",
        emailTemplate: "product-recommendations",
        delay: 0
      },
      children: ["goal1"]
    },
    "email3": {
      id: "email3",
      type: "email",
      name: "Re-engagement Email",
      description: "Try to re-engage with contacts who didn't open the welcome email",
      config: {
        subject: "Don't miss out! Special offer inside",
        emailTemplate: "re-engagement",
        delay: 0
      },
      children: ["goal1"]
    },
    "goal1": {
      id: "goal1",
      type: "goal",
      name: "Purchase Made",
      description: "Contact makes a purchase",
      config: {
        goalType: "purchase",
        minimumAmount: 0
      }
    }
  });
  
  const [workflowName, setWorkflowName] = useState("New Subscriber Onboarding");
  const [workflowDescription, setWorkflowDescription] = useState("Welcome and nurture new subscribers with targeted content");
  const [workflowStatus, setWorkflowStatus] = useState<"active" | "draft" | "paused">("draft");
  
  // Palette of available nodes to add
  const nodePalette = [
    { type: "email", name: "Send Email", icon: <Mail className="h-5 w-5" /> },
    { type: "delay", name: "Add Delay", icon: <Clock className="h-5 w-5" /> },
    { type: "condition", name: "Add Condition", icon: <Database className="h-5 w-5" /> },
    { type: "action", name: "Add Action", icon: <Check className="h-5 w-5" /> },
    { type: "webhook", name: "Call Webhook", icon: <Webhook className="h-5 w-5" /> },
    { type: "split", name: "Add Split", icon: <ChevronRight className="h-5 w-5" /> },
    { type: "cta", name: "Add CTA", icon: <MessageSquare className="h-5 w-5" /> },
    { type: "goal", name: "Set Goal", icon: <FileText className="h-5 w-5" /> },
  ];

  // Get active node
  const activeNode = activeNodeId ? nodes[activeNodeId] : null;

  // Generate a unique ID for new nodes
  const generateId = (type: NodeType) => {
    const existingIds = Object.keys(nodes).filter(id => id.startsWith(type));
    const nextNum = existingIds.length > 0 
      ? Math.max(...existingIds.map(id => parseInt(id.replace(type, '')))) + 1 
      : 1;
    return `${type}${nextNum}`;
  };

  // Add a new node
  const addNode = (type: NodeType, parentId: string) => {
    const newNodeId = generateId(type);
    const newNode: WorkflowNode = {
      id: newNodeId,
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      children: []
    };

    // Update parent node
    const updatedNodes = { ...nodes };
    
    if (updatedNodes[parentId].branches) {
      // For nodes with conditional branches
      const parentNode = { ...updatedNodes[parentId] };
      parentNode.branches = [...(parentNode.branches || []), {
        condition: "New Branch",
        nodeId: newNodeId
      }];
      updatedNodes[parentId] = parentNode;
    } else {
      // For nodes with simple children
      const parentNode = { ...updatedNodes[parentId] };
      parentNode.children = [...(parentNode.children || []), newNodeId];
      updatedNodes[parentId] = parentNode;
    }

    // Add new node to nodes
    updatedNodes[newNodeId] = newNode;
    setNodes(updatedNodes);
    setActiveNodeId(newNodeId);
  };

  // Delete a node
  const deleteNode = (nodeId: string) => {
    if (nodeId === "trigger1") return; // Can't delete the trigger node

    const updatedNodes = { ...nodes };
    
    // Remove the node from its parent
    Object.keys(updatedNodes).forEach(id => {
      const node = updatedNodes[id];
      
      // If the node has children, remove the node from the children array
      if (node.children && node.children.includes(nodeId)) {
        node.children = node.children.filter(childId => childId !== nodeId);
      }
      
      // If the node has branches, remove the node from the branches array
      if (node.branches) {
        node.branches = node.branches.filter(branch => branch.nodeId !== nodeId);
      }
    });
    
    // Delete the node
    delete updatedNodes[nodeId];
    
    setNodes(updatedNodes);
    setActiveNodeId("trigger1"); // Reset to trigger node
  };

  // Update node configuration
  const updateNodeConfig = (nodeId: string, config: any) => {
    const updatedNodes = { ...nodes };
    updatedNodes[nodeId] = {
      ...updatedNodes[nodeId],
      config: {
        ...updatedNodes[nodeId].config,
        ...config
      }
    };
    setNodes(updatedNodes);
  };

  // Update node name
  const updateNodeName = (nodeId: string, name: string) => {
    const updatedNodes = { ...nodes };
    updatedNodes[nodeId] = {
      ...updatedNodes[nodeId],
      name
    };
    setNodes(updatedNodes);
  };

  // Render configuration panel for the selected node
  const renderNodeConfig = () => {
    if (!activeNode) return null;

    const commonFields = (
      <div className="space-y-4">
        <div>
          <Label htmlFor="node-name">Step Name</Label>
          <Input
            id="node-name"
            value={activeNode.name}
            onChange={(e) => updateNodeName(activeNode.id, e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    );

    switch (activeNode.type) {
      case "trigger":
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <Label>Enrollment Trigger</Label>
              <Select 
                value={activeNode.config?.triggerType || "segment"} 
                onValueChange={(value) => updateNodeConfig(activeNode.id, { triggerType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="segment">Audience Segment</SelectItem>
                  <SelectItem value="form">Form Submission</SelectItem>
                  <SelectItem value="page_visit">Page Visit</SelectItem>
                  <SelectItem value="custom_event">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeNode.config?.triggerType === "segment" && (
              <div>
                <Label>Select Segment</Label>
                <Select 
                  value={activeNode.config?.segmentId || "1"} 
                  onValueChange={(value) => updateNodeConfig(activeNode.id, { segmentId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active Gmail Users</SelectItem>
                    <SelectItem value="2">Newsletter Subscribers</SelectItem>
                    <SelectItem value="3">Inactive Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Re-enrollment</span>
                <Switch 
                  checked={activeNode.config?.allowReEnrollment || false}
                  onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { allowReEnrollment: checked })}
                />
              </Label>
              <p className="text-sm text-slate-500">Allow contacts to enter this workflow multiple times</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Suppress from other workflows</span>
                <Switch 
                  checked={activeNode.config?.suppressFromOtherWorkflows || false}
                  onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { suppressFromOtherWorkflows: checked })}
                />
              </Label>
              <p className="text-sm text-slate-500">Prevent contacts in this workflow from entering other workflows</p>
            </div>
          </div>
        );
      
      case "email":
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                value={activeNode.config?.subject || ""}
                onChange={(e) => updateNodeConfig(activeNode.id, { subject: e.target.value })}
                className="mt-1"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <Label>Email Template</Label>
              <Select 
                value={activeNode.config?.emailTemplate || ""} 
                onValueChange={(value) => updateNodeConfig(activeNode.id, { emailTemplate: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome-template">Welcome Email</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="product-recommendations">Product Recommendations</SelectItem>
                  <SelectItem value="re-engagement">Re-engagement Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sending Options</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Send immediately</span>
                  <Switch 
                    checked={activeNode.config?.delay === 0}
                    onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { delay: checked ? 0 : 1 })}
                  />
                </div>
                
                {activeNode.config?.delay !== 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Delay by</span>
                    <Input 
                      type="number" 
                      className="w-20" 
                      value={activeNode.config?.delay || 1}
                      onChange={(e) => updateNodeConfig(activeNode.id, { delay: parseInt(e.target.value) })}
                    />
                    <Select 
                      value={activeNode.config?.delayUnit || "hours"} 
                      onValueChange={(value) => updateNodeConfig(activeNode.id, { delayUnit: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="block">Advanced Options</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Track opens</span>
                  <Switch 
                    checked={activeNode.config?.trackOpens || true}
                    onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { trackOpens: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Track clicks</span>
                  <Switch 
                    checked={activeNode.config?.trackClicks || true}
                    onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { trackClicks: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Personalize content</span>
                  <Switch 
                    checked={activeNode.config?.personalizeContent || true}
                    onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { personalizeContent: checked })}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              Edit Email Content
            </Button>
          </div>
        );
      
      case "delay":
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <Label>Delay Type</Label>
              <Select 
                value={activeNode.config?.delayType || "fixed"} 
                onValueChange={(value) => updateNodeConfig(activeNode.id, { delayType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Time</SelectItem>
                  <SelectItem value="specific_date">Specific Date</SelectItem>
                  <SelectItem value="property_date">Property-based Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeNode.config?.delayType === "fixed" && (
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  className="w-24" 
                  value={activeNode.config?.delayAmount || 1}
                  onChange={(e) => updateNodeConfig(activeNode.id, { delayAmount: parseInt(e.target.value) })}
                />
                <Select 
                  value={activeNode.config?.delayUnit || "days"} 
                  onValueChange={(value) => updateNodeConfig(activeNode.id, { delayUnit: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Business Hours Only</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Only proceed during business hours</span>
                <Switch 
                  checked={activeNode.config?.businessHoursOnly || false}
                  onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { businessHoursOnly: checked })}
                />
              </div>
              <p className="text-xs text-slate-500">Contacts will only proceed to the next step during your defined business hours</p>
            </div>
          </div>
        );
      
      case "condition":
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <Label>Condition Type</Label>
              <Select 
                value={activeNode.config?.conditionType || "email_opened"} 
                onValueChange={(value) => updateNodeConfig(activeNode.id, { conditionType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_opened">Email Opened</SelectItem>
                  <SelectItem value="email_clicked">Email Clicked</SelectItem>
                  <SelectItem value="contact_property">Contact Property</SelectItem>
                  <SelectItem value="form_submitted">Form Submitted</SelectItem>
                  <SelectItem value="page_visited">Page Visited</SelectItem>
                  <SelectItem value="custom_event">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(activeNode.config?.conditionType === "email_opened" || activeNode.config?.conditionType === "email_clicked") && (
              <div>
                <Label>Select Email</Label>
                <Select 
                  value={activeNode.config?.emailId || ""} 
                  onValueChange={(value) => updateNodeConfig(activeNode.id, { emailId: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an email" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(nodes)
                      .filter(node => node.type === "email")
                      .map(emailNode => (
                        <SelectItem key={emailNode.id} value={emailNode.id}>
                          {emailNode.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Branches</Label>
              <div className="space-y-2 mt-2">
                {(activeNode.branches || []).map((branch, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={branch.condition}
                      onChange={(e) => {
                        const newBranches = [...(activeNode.branches || [])];
                        newBranches[index].condition = e.target.value;
                        const updatedNodes = { ...nodes };
                        updatedNodes[activeNode.id].branches = newBranches;
                        setNodes(updatedNodes);
                      }}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const newBranches = [...(activeNode.branches || [])];
                        newBranches.splice(index, 1);
                        const updatedNodes = { ...nodes };
                        updatedNodes[activeNode.id].branches = newBranches;
                        setNodes(updatedNodes);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    const newBranches = [...(activeNode.branches || [])];
                    newBranches.push({ condition: "New Branch", nodeId: "" });
                    const updatedNodes = { ...nodes };
                    updatedNodes[activeNode.id].branches = newBranches;
                    setNodes(updatedNodes);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </div>
            </div>
          </div>
        );
      
      case "goal":
        return (
          <div className="space-y-4">
            {commonFields}
            <div>
              <Label>Goal Type</Label>
              <Select 
                value={activeNode.config?.goalType || "purchase"} 
                onValueChange={(value) => updateNodeConfig(activeNode.id, { goalType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase Made</SelectItem>
                  <SelectItem value="form_submission">Form Submission</SelectItem>
                  <SelectItem value="page_visit">Page Visit</SelectItem>
                  <SelectItem value="custom_event">Custom Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeNode.config?.goalType === "purchase" && (
              <div>
                <Label>Minimum Purchase Amount</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span>$</span>
                  <Input 
                    type="number" 
                    value={activeNode.config?.minimumAmount || 0}
                    onChange={(e) => updateNodeConfig(activeNode.id, { minimumAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Exit workflow when goal is achieved</span>
                <Switch 
                  checked={activeNode.config?.exitOnGoal || true}
                  onCheckedChange={(checked) => updateNodeConfig(activeNode.id, { exitOnGoal: checked })}
                />
              </Label>
              <p className="text-xs text-slate-500">Contacts will exit the workflow when they achieve this goal</p>
            </div>
          </div>
        );
      
      default:
        return commonFields;
    }
  };

  // Render a workflow node
  const renderNode = (nodeId: string, isRoot = false, indent = 0) => {
    const node = nodes[nodeId];
    if (!node) return null;

    const isActive = activeNodeId === nodeId;
    
    const getIconForType = (type: NodeType) => {
      switch (type) {
        case "trigger": return <Users className="h-5 w-5" />;
        case "email": return <Mail className="h-5 w-5" />;
        case "delay": return <Clock className="h-5 w-5" />;
        case "condition": return <Database className="h-5 w-5" />;
        case "action": return <Check className="h-5 w-5" />;
        case "webhook": return <Webhook className="h-5 w-5" />;
        case "goal": return <FileText className="h-5 w-5" />;
        case "split": return <ChevronRight className="h-5 w-5" />;
        case "cta": return <MessageSquare className="h-5 w-5" />;
        default: return <Settings className="h-5 w-5" />;
      }
    };

    return (
      <div key={nodeId} className="relative">
        {/* Vertical line connecting nodes */}
        {!isRoot && (
          <div className="absolute top-0 bottom-0 left-6 border-l-2 border-dashed border-slate-200 -translate-x-1/2 z-0" />
        )}
        
        {/* Current node */}
        <div className={`relative z-10 mb-2 flex items-center ${isRoot ? 'ml-0' : `ml-${indent * 4}`}`}>
          {/* Horizontal line connecting to parent */}
          {!isRoot && indent > 0 && (
            <div className="absolute top-1/2 left-0 w-4 border-t-2 border-dashed border-slate-200 -translate-y-1/2" />
          )}

          <div 
            className={`
              group relative flex items-center gap-3 p-3 rounded-md border ${isActive ? 'bg-primary/5 border-primary' : 'bg-white hover:bg-slate-50'} 
              ${node.type === 'trigger' ? 'border-blue-300 bg-blue-50' : ''}
              ${node.type === 'goal' ? 'border-green-300 bg-green-50' : ''}
            `}
            onClick={() => setActiveNodeId(nodeId)}
          >
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${node.type === 'trigger' ? 'bg-blue-100 text-blue-600' : ''}
              ${node.type === 'email' ? 'bg-indigo-100 text-indigo-600' : ''}
              ${node.type === 'delay' ? 'bg-yellow-100 text-yellow-600' : ''}
              ${node.type === 'condition' ? 'bg-purple-100 text-purple-600' : ''}
              ${node.type === 'goal' ? 'bg-green-100 text-green-600' : ''}
              ${node.type === 'action' ? 'bg-slate-100 text-slate-600' : ''}
              ${node.type === 'webhook' ? 'bg-slate-100 text-slate-600' : ''}
            `}>
              {getIconForType(node.type)}
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <div className="font-medium">{node.name}</div>
              {node.description && (
                <div className="text-xs text-slate-500 line-clamp-1">{node.description}</div>
              )}
            </div>
            
            {!isRoot && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deleteNode(nodeId)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Add step button */}
        {node.type !== 'goal' && !node.branches && (
          <div className={`relative z-10 ml-6 mb-2 flex justify-center`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {nodePalette.map((paletteNode) => (
                  <DropdownMenuItem 
                    key={paletteNode.type}
                    onClick={() => addNode(paletteNode.type as NodeType, nodeId)}
                  >
                    {paletteNode.icon}
                    <span className="ml-2">{paletteNode.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {/* Child nodes */}
        {node.children && node.children.map(childId => (
          renderNode(childId, false, indent + 1)
        ))}
        
        {/* Branch nodes */}
        {node.branches && node.branches.map((branch, index) => (
          <div key={index} className="relative">
            <div className={`relative z-10 mb-2 ml-${(indent + 1) * 4} flex items-center`}>
              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 mb-2">
                {branch.condition}
              </Badge>
            </div>
            {branch.nodeId && renderNode(branch.nodeId, false, indent + 2)}
            {!branch.nodeId && (
              <div className={`relative z-10 ml-${(indent + 2) * 4} mb-4`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {nodePalette.map((paletteNode) => (
                      <DropdownMenuItem 
                        key={paletteNode.type}
                        onClick={() => {
                          const newNodeId = generateId(paletteNode.type as NodeType);
                          const newNode: WorkflowNode = {
                            id: newNodeId,
                            type: paletteNode.type as NodeType,
                            name: `New ${paletteNode.type.charAt(0).toUpperCase() + paletteNode.type.slice(1)}`,
                            children: []
                          };
                          
                          // Update branch to point to new node
                          const updatedBranches = [...node.branches!];
                          updatedBranches[index].nodeId = newNodeId;
                          
                          // Update nodes
                          const updatedNodes = { ...nodes };
                          updatedNodes[nodeId].branches = updatedBranches;
                          updatedNodes[newNodeId] = newNode;
                          
                          setNodes(updatedNodes);
                          setActiveNodeId(newNodeId);
                        }}
                      >
                        {paletteNode.icon}
                        <span className="ml-2">{paletteNode.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation("/marketing/automations")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{workflowName}</h1>
              <Badge 
                className={
                  workflowStatus === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : workflowStatus === 'paused'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }
              >
                {workflowStatus === 'active' 
                  ? 'Active' 
                  : workflowStatus === 'paused'
                  ? 'Paused'
                  : 'Draft'
                }
              </Badge>
            </div>
            <p className="text-muted-foreground">{workflowDescription}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {workflowStatus === 'active' ? (
            <Button variant="outline" onClick={() => setWorkflowStatus('paused')}>
              <PauseCircle className="h-4 w-4 mr-2" />
              Pause Workflow
            </Button>
          ) : (
            <Button onClick={() => setWorkflowStatus('active')}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Activate Workflow
            </Button>
          )}
          <Button onClick={() => setLocation("/marketing/automations")}>
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Workflow canvas */}
        <div className="col-span-12 md:col-span-8">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Workflow Canvas</CardTitle>
              <CardDescription>Build your automation workflow by adding steps</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-h-[600px] pt-6 pb-6">
                <div className="relative pl-6">
                  {renderNode("trigger1", true)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Configuration panel */}
        <div className="col-span-12 md:col-span-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Configure Step</CardTitle>
              <CardDescription>Customize the selected workflow step</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {activeNode ? (
                <div className="space-y-6">
                  {renderNodeConfig()}
                  
                  {activeNode.id !== 'trigger1' && (
                    <div className="pt-4 mt-4 border-t">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full"
                        onClick={() => deleteNode(activeNode.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete Step
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                  <Database className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Step Selected</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Click on a step in the workflow to edit its configuration
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Workflow Analytics</CardTitle>
              <CardDescription>Performance metrics for this workflow</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Active Contacts</div>
                  <div className="text-2xl font-bold">247</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Open Rate</div>
                    <div className="font-bold">48.2%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Click Rate</div>
                    <div className="font-bold">12.7%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Goal Conversion</div>
                    <div className="font-bold">7.3%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Completion Rate</div>
                    <div className="font-bold">64.1%</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => setLocation("/marketing/automations/reports")}>
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="fixed z-20 bottom-4 right-4">
        <Button className="group" onClick={() => alert("AI Assistant activated")}>
          <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
          AI Workflow Assistant
        </Button>
      </div>
    </div>
  );
}