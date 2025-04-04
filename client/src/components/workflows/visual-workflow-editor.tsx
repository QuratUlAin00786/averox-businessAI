import { useState, useRef, useEffect } from "react";
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
import { 
  Check, 
  Zap, 
  Save, 
  Plus, 
  Trash2, 
  Mail, 
  AlertCircle, 
  Calendar, 
  Clock,
  Loader2,
  MoveHorizontal,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  actionType?: string;
  triggerType?: string;
  conditionType?: string;
  name: string;
  position: { x: number; y: number };
  config?: any;
}

interface Connection {
  id: string;
  source: string;
  target: string;
}

interface WorkflowData {
  name: string;
  description: string;
  isActive: boolean;
  triggerType: string;
  triggerConfig: any;
  actions: Array<{
    id: string;
    name: string;
    config: any;
  }>;
}

interface VisualWorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  workflow?: any;
  isNew?: boolean;
  isTemplate?: boolean;
}

const TRIGGER_TYPES = [
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

const ACTION_TYPES = [
  {
    id: "send_email",
    name: "Send Email",
    category: "Communication",
    description: "Send an automated email to contacts"
  },
  {
    id: "create_task",
    name: "Create Task",
    category: "Tasks",
    description: "Create a task assigned to a team member"
  },
  {
    id: "update_record",
    name: "Update Record",
    category: "Data",
    description: "Update a field value on a record"
  },
  {
    id: "send_notification",
    name: "Send Notification",
    category: "Communication",
    description: "Send an in-app notification to users"
  },
  {
    id: "create_event",
    name: "Create Calendar Event",
    category: "Events",
    description: "Schedule a calendar event"
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

export function VisualWorkflowEditor({ isOpen, onClose, workflow, isNew = false, isTemplate = false }: VisualWorkflowEditorProps) {
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || "");
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Initialize workflow from props
  useEffect(() => {
    if (workflow && isOpen) {
      setWorkflowName(workflow.name || "");
      setWorkflowDescription(workflow.description || "");
      
      // Initialize nodes and connections
      const initialNodes: WorkflowNode[] = [];
      const initialConnections: Connection[] = [];
      
      // Add trigger node
      if (workflow.trigger || workflow.triggerType) {
        const triggerType = workflow.trigger?.id || workflow.triggerType;
        const triggerInfo = TRIGGER_TYPES.find(t => t.id === triggerType);
        
        if (triggerInfo) {
          initialNodes.push({
            id: 'trigger_1',
            type: 'trigger',
            triggerType: triggerType,
            name: triggerInfo.name,
            position: { x: 100, y: 100 },
            config: workflow.triggerConfig || {}
          });
        }
      } else if (isNew) {
        // Create a default trigger node for new workflows
        initialNodes.push({
          id: 'trigger_1',
          type: 'trigger',
          triggerType: '',
          name: 'Select a Trigger',
          position: { x: 100, y: 100 },
          config: {}
        });
      }
      
      // Add action nodes
      if (workflow.actions && workflow.actions.length > 0) {
        workflow.actions.forEach((action: any, index: number) => {
          const actionType = action.id || action.actionType;
          const actionInfo = ACTION_TYPES.find(a => a.id === actionType);
          
          if (actionInfo) {
            const nodeId = `action_${index + 1}`;
            initialNodes.push({
              id: nodeId,
              type: 'action',
              actionType: actionType,
              name: action.name || actionInfo.name,
              position: { x: 100, y: 250 + index * 150 },
              config: action.config || {}
            });
            
            // Connect to previous node
            if (index === 0) {
              // Connect to trigger
              initialConnections.push({
                id: `conn_trigger_1_${nodeId}`,
                source: 'trigger_1',
                target: nodeId
              });
            } else {
              // Connect to previous action
              initialConnections.push({
                id: `conn_action_${index}_${nodeId}`,
                source: `action_${index}`,
                target: nodeId
              });
            }
          }
        });
      }
      
      setNodes(initialNodes);
      setConnections(initialConnections);
    } else if (isNew && isOpen) {
      // Create a default trigger node for new workflows
      setNodes([{
        id: 'trigger_1',
        type: 'trigger',
        triggerType: '',
        name: 'Select a Trigger',
        position: { x: 100, y: 100 },
        config: {}
      }]);
      setConnections([]);
    }
  }, [workflow, isNew, isOpen]);

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setActiveDrag(nodeId);
    setIsDragging(true);
    
    // Calculate offset from the top-left corner of the node
    const nodeElement = document.getElementById(nodeId);
    if (nodeElement) {
      const nodeRect = nodeElement.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - nodeRect.left,
        y: e.clientY - nodeRect.top
      };
    }
  };

  const handleCanvasDrag = (e: React.MouseEvent) => {
    if (!isDragging || !activeDrag) return;
    e.preventDefault();
    
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left - dragOffsetRef.current.x;
      const y = e.clientY - canvasRect.top - dragOffsetRef.current.y;
      
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === activeDrag ? { ...node, position: { x, y } } : node
        )
      );
    }
  };

  const handleDragEnd = () => {
    setActiveDrag(null);
    setIsDragging(false);
  };

  const handleAddAction = (actionType: string) => {
    const actionInfo = ACTION_TYPES.find(a => a.id === actionType);
    if (!actionInfo) return;
    
    const newId = `action_${nodes.length + 1}`;
    const newNode: WorkflowNode = {
      id: newId,
      type: 'action',
      actionType,
      name: actionInfo.name,
      position: { 
        x: 100,
        y: Math.max(...nodes.map(n => n.position.y)) + 150
      },
      config: {}
    };
    
    setNodes(prev => [...prev, newNode]);
    
    // If there's a trigger node, connect it to the new action
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (triggerNode && nodes.length === 1) {
      setConnections(prev => [
        ...prev,
        {
          id: `conn_${triggerNode.id}_${newId}`,
          source: triggerNode.id,
          target: newId
        }
      ]);
    } 
    // Otherwise, connect to the last action node
    else if (nodes.length > 1) {
      const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
      const lastNode = sortedNodes[sortedNodes.length - 1];
      
      setConnections(prev => [
        ...prev,
        {
          id: `conn_${lastNode.id}_${newId}`,
          source: lastNode.id,
          target: newId
        }
      ]);
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    // Don't allow deleting the trigger node
    if (nodeId.startsWith('trigger_')) {
      toast({
        title: "Cannot delete trigger",
        description: "The trigger node is required for the workflow.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove the node
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    
    // Remove any connections to/from this node
    setConnections(prev => 
      prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId)
    );
    
    // If this was the selected node, clear selection
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
  };

  const handleCanvasClick = () => {
    setSelectedNode(null);
  };

  const updateNodeConfig = (nodeId: string, config: any) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { ...node, config: { ...node.config, ...config } } : node
      )
    );
  };

  const updateNodeName = (nodeId: string, name: string) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { ...node, name } : node
      )
    );
  };

  const updateTriggerType = (nodeId: string, triggerType: string) => {
    const triggerInfo = TRIGGER_TYPES.find(t => t.id === triggerType);
    if (!triggerInfo) return;
    
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { 
          ...node, 
          triggerType,
          name: triggerInfo.name
        } : node
      )
    );
  };

  const updateActionType = (nodeId: string, actionType: string) => {
    const actionInfo = ACTION_TYPES.find(a => a.id === actionType);
    if (!actionInfo) return;
    
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { 
          ...node, 
          actionType,
          name: actionInfo.name
        } : node
      )
    );
  };

  const handleSaveWorkflow = () => {
    if (!workflowName) {
      toast({
        title: "Workflow name required",
        description: "Please enter a name for your workflow.",
        variant: "destructive"
      });
      return;
    }
    
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode || !triggerNode.triggerType) {
      toast({
        title: "Trigger required",
        description: "Please select a trigger type for your workflow.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    // Convert our visual representation to the required format
    const workflowData: WorkflowData = {
      name: workflowName,
      description: workflowDescription,
      isActive: true,
      triggerType: triggerNode.triggerType,
      triggerConfig: triggerNode.config || {},
      actions: []
    };
    
    // Add actions in order (by following connections from the trigger)
    const actionNodes = nodes.filter(n => n.type === 'action');
    
    // Sort actions by their vertical position
    const sortedActions = [...actionNodes].sort((a, b) => {
      return a.position.y - b.position.y;
    });
    
    const actionsArray: any[] = [];
    
    sortedActions.forEach(node => {
      if (node.actionType) {
        actionsArray.push({
          id: node.actionType,
          name: node.name,
          config: node.config || {}
        });
      }
    });
    
    workflowData.actions = actionsArray;
    
    setTimeout(() => {
      console.log("Saving workflow:", workflowData);
      
      // Just simulate an API call completion
      setSaving(false);
      toast({
        title: "Workflow saved",
        description: "Your workflow has been saved successfully."
      });
      onClose();
    }, 1000);
  };

  const getActionIcon = (actionType?: string) => {
    if (!actionType) return null;
    
    switch (actionType) {
      case "send_email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "create_task":
        return <Check className="h-4 w-4 text-green-500" />;
      case "send_notification":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "create_event":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "wait":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "condition":
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const NodeEditor = () => {
    if (!selectedNode) return null;
    
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return null;
    
    if (node.type === 'trigger') {
      return (
        <Card className="absolute right-4 top-4 w-80 z-10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Configure Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="triggerType">Trigger Type</Label>
              <Select 
                value={node.triggerType || ""} 
                onValueChange={(value) => updateTriggerType(node.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
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
            </div>
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={node.name} 
                onChange={(e) => updateNodeName(node.id, e.target.value)} 
              />
            </div>
            
            {node.triggerType && (
              <div className="pt-2 text-sm text-muted-foreground">
                {TRIGGER_TYPES.find(t => t.id === node.triggerType)?.description}
              </div>
            )}
          </CardContent>
        </Card>
      );
    } else if (node.type === 'action') {
      return (
        <Card className="absolute right-4 top-4 w-80 z-10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Configure Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="actionType">Action Type</Label>
              <Select 
                value={node.actionType || ""} 
                onValueChange={(value) => updateActionType(node.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.id)}
                        <span>{action.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={node.name} 
                onChange={(e) => updateNodeName(node.id, e.target.value)} 
              />
            </div>
            
            {node.actionType && (
              <div className="pt-2 text-sm text-muted-foreground">
                {ACTION_TYPES.find(a => a.id === node.actionType)?.description}
              </div>
            )}
            
            {/* Simple configuration options based on action type */}
            {node.actionType === 'send_email' && (
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select 
                  value={node.config?.template || ""} 
                  onValueChange={(value) => updateNodeConfig(node.id, { template: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {node.actionType === 'wait' && (
              <div className="space-y-2">
                <Label htmlFor="days">Delay (days)</Label>
                <Input 
                  id="days" 
                  type="number"
                  min="1"
                  value={node.config?.days || "1"} 
                  onChange={(e) => updateNodeConfig(node.id, { days: e.target.value })} 
                />
              </div>
            )}
            
            {node.actionType === 'create_task' && (
              <div className="space-y-2">
                <Label htmlFor="assignTo">Assign To</Label>
                <Select 
                  value={node.config?.assignTo || ""} 
                  onValueChange={(value) => updateNodeConfig(node.id, { assignTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Record Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales_team">Sales Team</SelectItem>
                    <SelectItem value="cs_team">Customer Success</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="pt-2">
                  <Label htmlFor="taskName">Task Name</Label>
                  <Input 
                    id="taskName" 
                    value={node.config?.taskName || ""} 
                    onChange={(e) => updateNodeConfig(node.id, { taskName: e.target.value })} 
                    placeholder="Follow up with customer"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteNode(node.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return null;
  };

  const renderConnections = () => {
    return connections.map(connection => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return null;
      
      // Calculate connection line coordinates
      const sourceX = sourceNode.position.x + 120; // center of node width
      const sourceY = sourceNode.position.y + 40; // bottom of node
      const targetX = targetNode.position.x + 120; // center of node width
      const targetY = targetNode.position.y; // top of node
      
      // Draw straight line for simplicity
      const path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
      
      return (
        <svg
          key={connection.id}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5
          }}
        >
          <path
            d={path}
            stroke="#94a3b8"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <circle
            cx={targetX}
            cy={targetY}
            r="3"
            fill="#94a3b8"
          />
        </svg>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto pb-0">
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
        
        <div className="space-y-4 py-2">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
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
              <Input 
                id="description" 
                value={workflowDescription} 
                onChange={(e) => setWorkflowDescription(e.target.value)} 
                placeholder="Describe what this workflow does"
              />
            </div>
          </div>
          
          {/* Visual Editor Canvas */}
          <div className="relative border rounded-md bg-slate-50 h-[500px] overflow-auto">
            {/* Action Palette */}
            <div className="absolute left-4 top-4 w-60 z-10 bg-white rounded-md border shadow-sm">
              <div className="p-3 border-b">
                <h3 className="font-medium text-sm">Actions</h3>
                <p className="text-xs text-muted-foreground">Drag to add to workflow</p>
              </div>
              <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                {ACTION_TYPES.map(action => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => handleAddAction(action.id)}
                  >
                    {getActionIcon(action.id)}
                    <span className="ml-2">{action.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Node Editor Panel */}
            {selectedNode && <NodeEditor />}
            
            {/* Canvas for drag and drop */}
            <div 
              ref={canvasRef}
              className="relative h-full w-full"
              onMouseMove={handleCanvasDrag}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onClick={handleCanvasClick}
            >
              {/* Connection Lines */}
              {renderConnections()}
              
              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  id={node.id}
                  key={node.id}
                  className={`absolute rounded-md shadow-md p-3 w-60 cursor-move ${
                    node.type === 'trigger' 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-white border border-gray-200'
                  } ${selectedNode === node.id ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                    zIndex: 10
                  }}
                  onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                  onClick={(e) => handleNodeClick(node.id, e)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      node.type === 'trigger' ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {node.type === 'trigger' 
                        ? <Zap className="h-3 w-3" /> 
                        : getActionIcon(node.actionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{node.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {node.type === 'trigger' 
                          ? (node.triggerType 
                              ? TRIGGER_TYPES.find(t => t.id === node.triggerType)?.category 
                              : 'Select a trigger type')
                          : (node.actionType 
                              ? ACTION_TYPES.find(a => a.id === node.actionType)?.category 
                              : 'Select an action type')
                        }
                      </p>
                    </div>
                    <div className="flex-shrink-0 cursor-grab">
                      <MoveHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Action buttons for node */}
                  {node.type !== 'trigger' && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between mt-4 sticky bottom-0 bg-background px-4 py-3 border-t z-50">
          <div className="flex items-center gap-2">
            <Switch id="activate" />
            <Label htmlFor="activate">Activate workflow after saving</Label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSaveWorkflow} disabled={saving || !workflowName}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}