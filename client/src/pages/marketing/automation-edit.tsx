import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Play, Pause, Settings, Users, Mail, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AutomationEdit() {
  const [, params] = useRoute("/marketing/automations/:id");
  const [, setLocation] = useLocation();
  const automationId = params?.id;

  // Sample automation data - in real app this would come from API
  const [automation, setAutomation] = useState({
    id: automationId,
    name: "New Customer Onboarding",
    description: "Automated sequence to welcome and onboard new customers",
    status: "active",
    type: "drip",
    trigger: "contact_created",
    isActive: true,
    tags: ["onboarding", "welcome", "new-customer"],
    segments: ["New Customers", "Trial Users"]
  });

  // Automation steps
  const [steps, setSteps] = useState([
    {
      id: 1,
      type: "email",
      name: "Welcome Email",
      delay: 0,
      delayUnit: "minutes",
      subject: "Welcome to our platform!",
      template: "welcome-email",
      conditions: []
    },
    {
      id: 2,
      type: "wait",
      name: "Wait 3 Days",
      delay: 3,
      delayUnit: "days",
      conditions: []
    },
    {
      id: 3,
      type: "email",
      name: "Product Guide",
      delay: 0,
      delayUnit: "minutes",
      subject: "Get started with our features",
      template: "product-guide",
      conditions: []
    },
    {
      id: 4,
      type: "wait",
      name: "Wait 1 Week",
      delay: 1,
      delayUnit: "weeks",
      conditions: []
    },
    {
      id: 5,
      type: "email",
      name: "Feedback Survey",
      delay: 0,
      delayUnit: "minutes",
      subject: "How are you finding our platform?",
      template: "feedback-survey",
      conditions: []
    }
  ]);

  const handleSave = () => {
    console.log("Saving automation:", automation);
    // In real app, this would save to API
  };

  const handleStatusToggle = () => {
    setAutomation(prev => ({
      ...prev,
      isActive: !prev.isActive,
      status: prev.isActive ? "paused" : "active"
    }));
  };

  const addStep = () => {
    const newStep = {
      id: steps.length + 1,
      type: "email",
      name: "New Step",
      delay: 0,
      delayUnit: "minutes",
      subject: "",
      template: "",
      conditions: []
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: number) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "wait":
        return <Clock className="h-4 w-4" />;
      case "condition":
        return <Settings className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/marketing")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketing
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Automation</h1>
            <p className="text-muted-foreground">
              {automation.name} • Automation ID: {automationId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleStatusToggle}>
            {automation.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>
                Configure the basic properties of your automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Automation Name</Label>
                  <Input
                    id="name"
                    value={automation.name}
                    onChange={(e) => setAutomation(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Automation Type</Label>
                  <Select value={automation.type} onValueChange={(value) => setAutomation(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drip">Drip Campaign</SelectItem>
                      <SelectItem value="nurture">Lead Nurture</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="re-engagement">Re-engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={automation.description}
                  onChange={(e) => setAutomation(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Event</Label>
                <Select value={automation.trigger} onValueChange={(value) => setAutomation(prev => ({ ...prev, trigger: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact_created">Contact Created</SelectItem>
                    <SelectItem value="form_submitted">Form Submitted</SelectItem>
                    <SelectItem value="email_opened">Email Opened</SelectItem>
                    <SelectItem value="link_clicked">Link Clicked</SelectItem>
                    <SelectItem value="tag_added">Tag Added</SelectItem>
                    <SelectItem value="date_based">Date Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Automation Steps */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automation Steps</CardTitle>
                  <CardDescription>
                    Define the sequence of actions in your automation
                  </CardDescription>
                </div>
                <Button onClick={addStep} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStepIcon(step.type)}
                      <Badge variant="outline" className="capitalize">
                        {step.type}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{step.name}</div>
                      {step.type === "email" && step.subject && (
                        <div className="text-sm text-gray-500">Subject: {step.subject}</div>
                      )}
                      {step.type === "wait" && (
                        <div className="text-sm text-gray-500">
                          Wait {step.delay} {step.delayUnit}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      {steps.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeStep(step.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={automation.isActive}
                  onCheckedChange={handleStatusToggle}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Badge 
                  className={
                    automation.status === 'active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {automation.status === 'active' ? 'Active' : 'Paused'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Target Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {automation.segments.map((segment, index) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {segment}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Segment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {automation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {tag}
                  </Badge>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Enrolled</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">892</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">71.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue Generated</span>
                  <span className="font-medium">$45,600</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setLocation(`/marketing/automations/${automationId}/report`)}
              >
                View Detailed Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}