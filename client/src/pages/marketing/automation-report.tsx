import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, TrendingUp, Clock, Zap, Download, Play, Pause } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AutomationReport() {
  const [, params] = useRoute("/marketing/automations/:id/report");
  const [, setLocation] = useLocation();
  const automationId = params?.id;

  // Sample automation data
  const automation = {
    id: automationId,
    name: "New Customer Onboarding",
    status: "active",
    type: "drip",
    enrolled: 1247,
    completed: 892,
    active: 355,
    avgCompletionTime: "5.2 days",
    conversionRate: 71.5,
    revenue: 45600,
    lastUpdated: "2 hours ago"
  };

  // Performance over time
  const performanceData = [
    { date: "Jan", enrolled: 120, completed: 85, revenue: 4200 },
    { date: "Feb", enrolled: 135, completed: 98, revenue: 4900 },
    { date: "Mar", enrolled: 142, completed: 102, revenue: 5100 },
    { date: "Apr", enrolled: 158, completed: 115, revenue: 5750 },
    { date: "May", enrolled: 167, completed: 121, revenue: 6050 },
    { date: "Jun", enrolled: 175, completed: 128, revenue: 6400 }
  ];

  // Step-by-step breakdown
  const stepData = [
    { step: "Welcome Email", sent: 1247, opened: 996, clicked: 523, completed: 1247 },
    { step: "Product Guide", sent: 1195, opened: 917, clicked: 445, completed: 1089 },
    { step: "Tutorial Video", sent: 1089, opened: 812, clicked: 387, completed: 987 },
    { step: "Feedback Survey", sent: 987, opened: 734, clicked: 298, completed: 892 },
    { step: "Special Offer", sent: 892, opened: 645, clicked: 312, completed: 892 }
  ];

  const handleExport = () => {
    console.log("Exporting automation report...");
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
            <h1 className="text-2xl font-bold tracking-tight">Automation Report</h1>
            <p className="text-muted-foreground">
              {automation.name} • Automation ID: {automationId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setLocation(`/marketing/automations/${automationId}`)}>
            Edit Automation
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automation.enrolled.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {automation.active} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automation.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {automation.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automation.avgCompletionTime}</div>
            <p className="text-xs text-muted-foreground">
              From start to finish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${automation.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last updated {automation.lastUpdated}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Monthly enrollment and completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="enrolled" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              Monthly revenue generated by automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Step-by-Step Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Analysis</CardTitle>
          <CardDescription>
            Performance breakdown for each automation step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stepData.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Step {index + 1}: {step.step}</h4>
                  <Badge variant="outline">
                    {((step.completed / step.sent) * 100).toFixed(1)}% completion
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Sent</div>
                    <div className="font-medium">{step.sent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Opened</div>
                    <div className="font-medium">{step.opened.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Clicked</div>
                    <div className="font-medium">{step.clicked.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Completed</div>
                    <div className="font-medium">{step.completed.toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Open Rate: {((step.opened / step.sent) * 100).toFixed(1)}%</span>
                    <span>Click Rate: {((step.clicked / step.opened) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(step.completed / step.sent) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Automation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Automation Type</span>
              <Badge variant="outline" className="capitalize">{automation.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
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
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Steps</span>
              <span className="text-sm font-medium">{stepData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">{automation.lastUpdated}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Open Rate</span>
              <span className="text-sm font-medium">
                {(stepData.reduce((acc, step) => acc + (step.opened / step.sent), 0) / stepData.length * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Click Rate</span>
              <span className="text-sm font-medium">
                {(stepData.reduce((acc, step) => acc + (step.clicked / step.opened), 0) / stepData.length * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Drop-off Rate</span>
              <span className="text-sm font-medium">
                {(((stepData[0].sent - stepData[stepData.length - 1].completed) / stepData[0].sent) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenue per Contact</span>
              <span className="text-sm font-medium">
                ${(automation.revenue / automation.completed).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}