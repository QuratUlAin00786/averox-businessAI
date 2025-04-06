import { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Save, 
  Plus, 
  Trash2, 
  ArrowRight,
  MessageSquare,
  Mail,
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  FileBarChart,
  AlertTriangle,
  ClipboardList,
  PackageCheck,
  Bell,
  ClipboardCheck,
  Edit,
  CircleDot
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkflowTrigger {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface WorkflowAction {
  id: string;
  name: string;
  category: string;
  description: string;
  config?: any;
}

interface WorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  workflow?: any;
  isNew?: boolean;
  isTemplate?: boolean;
}

const TRIGGER_TYPES: WorkflowTrigger[] = [
  // Accounting triggers
  {
    id: "invoice_created",
    name: "Invoice Created or Updated",
    category: "Accounting",
    description: "Trigger when a new invoice is created or payment status changes"
  },
  {
    id: "invoice_due",
    name: "Invoice Due",
    category: "Accounting",
    description: "Trigger when an invoice reaches its due date"
  },
  {
    id: "invoice_overdue",
    name: "Invoice Overdue",
    category: "Accounting",
    description: "Trigger when an invoice becomes overdue by specified days"
  },
  {
    id: "payment_received",
    name: "Payment Received",
    category: "Accounting",
    description: "Trigger when a payment is received against an invoice"
  },
  
  // Inventory triggers
  {
    id: "inventory_threshold",
    name: "Inventory Below Threshold",
    category: "Inventory",
    description: "Trigger when product inventory falls below defined threshold"
  },
  {
    id: "product_added",
    name: "Product Added to Inventory",
    category: "Inventory",
    description: "Trigger when new products are added to inventory"
  },
  {
    id: "stock_updated",
    name: "Stock Levels Updated",
    category: "Inventory",
    description: "Trigger when inventory quantities are updated"
  },
  {
    id: "purchase_order_status",
    name: "Purchase Order Status Changed",
    category: "Inventory",
    description: "Trigger when purchase order status changes"
  },
  
  // Original CRM triggers
  {
    id: "new_lead",
    name: "New Lead Created",
    category: "Leads",
    description: "Trigger when a new lead is created in the system"
  },
  {
    id: "lead_stage_change",
    name: "Lead Stage Changed",
    category: "Leads", 
    description: "Trigger when a lead's stage is changed"
  },
  {
    id: "deal_stage_change",
    name: "Deal Stage Changed",
    category: "Opportunities",
    description: "Trigger when a deal moves to a different stage"
  },
  {
    id: "deal_closed",
    name: "Deal Closed (Won/Lost)",
    category: "Opportunities",
    description: "Trigger when a deal is marked as won or lost"
  },
  {
    id: "task_completed",
    name: "Task Completed",
    category: "Tasks",
    description: "Trigger when a task is marked as completed"
  },
  {
    id: "meeting_scheduled",
    name: "Meeting Scheduled",
    category: "Events",
    description: "Trigger when a new meeting is scheduled"
  },
  {
    id: "scheduled",
    name: "Scheduled (Time-based)",
    category: "System",
    description: "Trigger at specific times or intervals"
  }
];

const ACTION_TYPES: WorkflowAction[] = [
  // Accounting Actions
  {
    id: "send_invoice_reminder",
    name: "Send Invoice Reminder",
    category: "Accounting",
    description: "Send an automated reminder for invoice payment"
  },
  {
    id: "update_invoice_status",
    name: "Update Invoice Status",
    category: "Accounting",
    description: "Automatically update the status of an invoice"
  },
  {
    id: "generate_financial_report",
    name: "Generate Financial Report",
    category: "Accounting",
    description: "Generate a financial report based on specified parameters"
  },
  {
    id: "tag_delinquent_account",
    name: "Tag Delinquent Account",
    category: "Accounting",
    description: "Mark an account as delinquent after specified overdue period"
  },
  
  // Inventory Actions
  {
    id: "create_purchase_order",
    name: "Create Purchase Order",
    category: "Inventory",
    description: "Automatically generate a purchase order for low stock items"
  },
  {
    id: "update_stock_levels",
    name: "Update Stock Levels",
    category: "Inventory",
    description: "Update inventory quantity for specified products"
  },
  {
    id: "send_inventory_alert",
    name: "Send Inventory Alert",
    category: "Inventory",
    description: "Send alert to inventory manager about stock levels"
  },
  {
    id: "schedule_stocktake",
    name: "Schedule Stocktake",
    category: "Inventory",
    description: "Create a scheduled stocktake task for the inventory team"
  },
  
  // Communication Actions
  {
    id: "send_email",
    name: "Send Email",
    category: "Communication",
    description: "Send an automated email to contacts"
  },
  {
    id: "send_notification",
    name: "Send Notification",
    category: "Communication",
    description: "Send an in-app notification to users"
  },
  
  // Task & Event Actions
  {
    id: "create_task",
    name: "Create Task",
    category: "Tasks",
    description: "Create a task assigned to a team member"
  },
  {
    id: "create_event",
    name: "Create Calendar Event",
    category: "Events",
    description: "Schedule a calendar event"
  },
  
  // Data & Flow Actions
  {
    id: "update_record",
    name: "Update Record",
    category: "Data",
    description: "Update a field value on a record"
  },
  {
    id: "wait",
    name: "Wait/Delay",
    category: "Flow Control",
    description: "Wait for a specific time period before continuing"
  },
  {
    id: "condition",
    name: "Condition/Branch",
    category: "Flow Control",
    description: "Create a conditional branch in the workflow"
  }
];

export function WorkflowEditor({ isOpen, onClose, workflow, isNew = false, isTemplate = false }: WorkflowEditorProps) {
  const [currentTab, setCurrentTab] = useState("trigger");
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || "");
  const [selectedTrigger, setSelectedTrigger] = useState<string>(
    workflow?.triggerType || workflow?.trigger?.id || ""
  );
  
  // Debug
  console.log("WorkflowEditor rendering:", { isOpen, workflow, isNew, isTemplate });
  
  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name || "");
      setWorkflowDescription(workflow.description || "");
      setSelectedTrigger(workflow.triggerType || workflow.trigger?.id || "");
    }
  }, [workflow]);
  
  // Initialize actions - handle both regular workflow format and template format
  const initialActions = useMemo(() => {
    if (!workflow?.actions) return [];
    
    return workflow.actions.map((action: any) => {
      // If it's in template format with name and config
      if (action.name && action.id) {
        return {
          id: action.id,
          actionType: action.id,
          config: action.config || {},
          name: action.name
        };
      }
      // If it's already in the correct format
      return action;
    });
  }, [workflow]);
  
  const [actions, setActions] = useState<{id: string, actionType: string, config: any, name?: string}[]>(
    initialActions
  );
  const [saving, setSaving] = useState(false);

  const handleAddAction = () => {
    setActions([...actions, {
      id: `action_${Date.now()}`,
      actionType: "",
      config: {}
    }]);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };

  const handleActionTypeChange = (index: number, value: string) => {
    const newActions = [...actions];
    newActions[index].actionType = value;
    setActions(newActions);
  };

  const handleSaveWorkflow = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Saving workflow:", {
        name: workflowName,
        description: workflowDescription,
        trigger: TRIGGER_TYPES.find(t => t.id === selectedTrigger),
        actions
      });
      
      setSaving(false);
      onClose();
    }, 1000);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      // Accounting actions
      case "send_invoice_reminder":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "update_invoice_status":
        return <Check className="h-4 w-4 text-green-500" />;
      case "generate_financial_report":
        return <FileBarChart className="h-4 w-4 text-indigo-500" />;
      case "tag_delinquent_account":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      
      // Inventory actions
      case "create_purchase_order":
        return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case "update_stock_levels":
        return <PackageCheck className="h-4 w-4 text-green-500" />;
      case "send_inventory_alert":
        return <Bell className="h-4 w-4 text-red-500" />;
      case "schedule_stocktake":
        return <ClipboardCheck className="h-4 w-4 text-purple-500" />;
      
      // Communication actions
      case "send_email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "send_notification":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      
      // Task & Event actions
      case "create_task":
        return <Check className="h-4 w-4 text-green-500" />;
      case "create_event":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      
      // Data & Flow actions
      case "update_record":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "wait":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "condition":
        return <Zap className="h-4 w-4 text-orange-500" />;
      
      default:
        return <CircleDot className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {isNew ? "Create New Workflow" : `Edit Workflow: ${workflow?.name || ''}`}
            {isTemplate && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 ml-2">Template</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isNew 
              ? "Create an automated workflow to save time and ensure consistency"
              : isTemplate
                ? "Review this pre-configured workflow template before using it"
                : "Modify your existing workflow settings, triggers, and actions"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Workflow Name</Label>
                <Input 
                  id="name" 
                  value={workflowName} 
                  onChange={(e) => setWorkflowName(e.target.value)} 
                  placeholder="Enter workflow name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={workflowDescription} 
                  onChange={(e) => setWorkflowDescription(e.target.value)} 
                  placeholder="Describe what this workflow does"
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          {/* Workflow Builder Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trigger" className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Trigger
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-1">
                <ArrowRight className="h-4 w-4" />
                Actions
              </TabsTrigger>
            </TabsList>
            
            {/* Trigger Tab */}
            <TabsContent value="trigger" className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Select a trigger for this workflow</h3>
              
              <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((trigger) => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      <div className="flex items-center gap-2">
                        <span>{trigger.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {trigger.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTrigger && (
                <Card className="border-blue-100 bg-blue-50/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-blue-800">
                      {TRIGGER_TYPES.find(t => t.id === selectedTrigger)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 text-sm text-blue-700">
                    {TRIGGER_TYPES.find(t => t.id === selectedTrigger)?.description}
                  </CardContent>
                </Card>
              )}
              
              <div className="pt-2 text-right">
                <Button onClick={() => setCurrentTab("actions")}>
                  Continue to Actions
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Actions Tab */}
            <TabsContent value="actions" className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Define actions for this workflow</h3>
                
                <Button variant="outline" size="sm" onClick={handleAddAction}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Action
                </Button>
              </div>
              
              {actions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No actions added yet. Click "Add Action" to start building your workflow.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actions.map((action, index) => (
                    <Card key={action.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                              {index + 1}
                            </div>
                            <CardTitle className="text-base">
                              {action.name || 
                               (action.actionType ? 
                                ACTION_TYPES.find(a => a.id === action.actionType)?.name : 
                                "Select an action")
                              }
                            </CardTitle>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAction(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <Select 
                            value={action.actionType} 
                            onValueChange={(value) => handleActionTypeChange(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTION_TYPES.map((actionType) => (
                                <SelectItem key={actionType.id} value={actionType.id}>
                                  <div className="flex items-center gap-2">
                                    {getActionIcon(actionType.id)}
                                    <span>{actionType.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {action.actionType && (
                            <div className="bg-gray-50 p-3 rounded-md text-sm">
                              <p>{ACTION_TYPES.find(a => a.id === action.actionType)?.description}</p>
                              
                              {/* Display configuration UI based on action type */}
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                {/* Accounting action configurations */}
                                {action.actionType === 'send_invoice_reminder' && (
                                  <div className="space-y-3 mt-2">
                                    <div>
                                      <Label htmlFor={`${action.id}-daysOverdue`} className="text-xs">Days Overdue</Label>
                                      <Input 
                                        id={`${action.id}-daysOverdue`} 
                                        type="number"
                                        min="1"
                                        className="h-8 text-xs"
                                        value={action.config?.daysOverdue || "7"}
                                        onChange={(e) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            daysOverdue: e.target.value 
                                          };
                                          setActions(newActions);
                                        }}
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`${action.id}-reminderTemplate`} className="text-xs">Reminder Template</Label>
                                      <Select 
                                        value={action.config?.reminderTemplate || "first_reminder"}
                                        onValueChange={(value) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            reminderTemplate: value 
                                          };
                                          setActions(newActions);
                                        }}
                                      >
                                        <SelectTrigger id={`${action.id}-reminderTemplate`} className="h-8 text-xs">
                                          <SelectValue placeholder="Select template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="first_reminder">First Payment Reminder</SelectItem>
                                          <SelectItem value="second_reminder">Second Payment Reminder</SelectItem>
                                          <SelectItem value="final_reminder">Final Payment Notice</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                
                                {action.actionType === 'update_invoice_status' && (
                                  <div className="space-y-3 mt-2">
                                    <div>
                                      <Label htmlFor={`${action.id}-newStatus`} className="text-xs">New Status</Label>
                                      <Select 
                                        value={action.config?.newStatus || ""}
                                        onValueChange={(value) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            newStatus: value 
                                          };
                                          setActions(newActions);
                                        }}
                                      >
                                        <SelectTrigger id={`${action.id}-newStatus`} className="h-8 text-xs">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="draft">Draft</SelectItem>
                                          <SelectItem value="sent">Sent</SelectItem>
                                          <SelectItem value="overdue">Overdue</SelectItem>
                                          <SelectItem value="paid">Paid</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                          <SelectItem value="partially_paid">Partially Paid</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Inventory action configurations */}
                                {action.actionType === 'create_purchase_order' && (
                                  <div className="space-y-3 mt-2">
                                    <div>
                                      <Label htmlFor={`${action.id}-supplier`} className="text-xs">Supplier</Label>
                                      <Select 
                                        value={action.config?.supplier || ""}
                                        onValueChange={(value) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            supplier: value 
                                          };
                                          setActions(newActions);
                                        }}
                                      >
                                        <SelectTrigger id={`${action.id}-supplier`} className="h-8 text-xs">
                                          <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="auto">Auto-select from product</SelectItem>
                                          <SelectItem value="preferred">Preferred Supplier</SelectItem>
                                          <SelectItem value="lowest_price">Lowest Price Supplier</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`${action.id}-orderQuantity`} className="text-xs">Order Quantity</Label>
                                      <Select 
                                        value={action.config?.orderQuantity || ""}
                                        onValueChange={(value) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            orderQuantity: value 
                                          };
                                          setActions(newActions);
                                        }}
                                      >
                                        <SelectTrigger id={`${action.id}-orderQuantity`} className="h-8 text-xs">
                                          <SelectValue placeholder="Select quantity method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="restock_to_max">Restock to Maximum Level</SelectItem>
                                          <SelectItem value="fixed">Fixed Quantity</SelectItem>
                                          <SelectItem value="optimal">Calculate Optimal (based on history)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                                
                                {action.actionType === 'update_stock_levels' && (
                                  <div className="space-y-3 mt-2">
                                    <div>
                                      <Label htmlFor={`${action.id}-updateMethod`} className="text-xs">Update Method</Label>
                                      <Select 
                                        value={action.config?.updateMethod || ""}
                                        onValueChange={(value) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            updateMethod: value 
                                          };
                                          setActions(newActions);
                                        }}
                                      >
                                        <SelectTrigger id={`${action.id}-updateMethod`} className="h-8 text-xs">
                                          <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="increment">Increment Quantity</SelectItem>
                                          <SelectItem value="decrement">Decrement Quantity</SelectItem>
                                          <SelectItem value="set">Set to Specific Value</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor={`${action.id}-quantityValue`} className="text-xs">Quantity</Label>
                                      <Input 
                                        id={`${action.id}-quantityValue`} 
                                        type="number"
                                        min="0"
                                        className="h-8 text-xs"
                                        value={action.config?.quantityValue || "0"}
                                        onChange={(e) => {
                                          const newActions = [...actions];
                                          newActions[index].config = { 
                                            ...newActions[index].config, 
                                            quantityValue: e.target.value 
                                          };
                                          setActions(newActions);
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {/* Default configuration display for other action types or templates */}
                                {!['send_invoice_reminder', 'update_invoice_status', 'create_purchase_order', 'update_stock_levels'].includes(action.actionType) && 
                                  action.config && Object.keys(action.config).length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Configuration</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(action.config).map(([key, value]) => (
                                        <div key={key} className="text-xs bg-white p-2 rounded border">
                                          <span className="font-medium text-gray-700">{key}: </span>
                                          <span className="text-gray-900">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show placeholder text if no config is present */}
                                {(!action.config || Object.keys(action.config).length === 0) && 
                                 !['send_invoice_reminder', 'update_invoice_status', 'create_purchase_order', 'update_stock_levels'].includes(action.actionType) && (
                                  <p className="text-xs text-muted-foreground">
                                    Configuration options for this action would appear here
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      
                      {index < actions.length - 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
                          <div className="h-6 w-0.5 bg-gray-200"></div>
                          <div className="h-3 w-3 rounded-full bg-gray-200 absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch id="activate" />
            <Label htmlFor="activate">Activate workflow after saving</Label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSaveWorkflow} disabled={saving || !workflowName || !selectedTrigger}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}