import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Mail, Users, TrendingUp, Eye, MousePointer, Calendar, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function CampaignReport() {
  const [, params] = useRoute("/marketing/campaigns/:id/report");
  const [, setLocation] = useLocation();
  const campaignId = params?.id;

  // Sample campaign data - in real app this would come from API
  const campaign = {
    id: campaignId,
    name: "Spring Product Launch",
    type: "email",
    status: "active",
    sent: 4829,
    opened: 2187,
    clicked: 815,
    unsubscribed: 23,
    bounced: 156,
    lastSent: "Apr 18, 2025",
    openRate: 45.3,
    clickRate: 16.9,
    unsubscribeRate: 0.5,
    bounceRate: 3.2,
    subject: "Discover Our Exciting Spring Collection"
  };

  // Performance over time data
  const performanceData = [
    { date: "Week 1", opens: 1200, clicks: 480, sent: 1600 },
    { date: "Week 2", opens: 987, clicks: 335, sent: 1229 },
    { date: "Week 3", opens: 0, clicks: 0, sent: 0 },
    { date: "Week 4", opens: 0, clicks: 0, sent: 0 },
  ];

  // Device breakdown
  const deviceData = [
    { name: "Mobile", value: 58, color: "#3b82f6" },
    { name: "Desktop", value: 32, color: "#10b981" },
    { name: "Tablet", value: 10, color: "#f59e0b" }
  ];

  // Geographic data
  const geoData = [
    { location: "United States", opens: 1245, clicks: 432 },
    { location: "Canada", opens: 234, clicks: 89 },
    { location: "United Kingdom", opens: 198, clicks: 76 },
    { location: "Australia", opens: 156, clicks: 62 },
    { location: "Germany", opens: 123, clicks: 45 }
  ];

  const handleExport = () => {
    // In real app, this would export campaign data
    console.log("Exporting campaign report...");
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
            <h1 className="text-2xl font-bold tracking-tight">Campaign Report</h1>
            <p className="text-muted-foreground">
              {campaign.name} • Campaign ID: {campaignId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setLocation(`/marketing/campaigns/${campaignId}`)}>
            Edit Campaign
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last sent {campaign.lastSent}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.opened.toLocaleString()} opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.clicked.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.bounced} bounces
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>
              Opens and clicks by week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="opens" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>
              Opens by device type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
          <CardDescription>
            Campaign performance by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geoData.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-32 font-medium">{location.location}</div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{location.opens} opens</span>
                    <span>{location.clicks} clicks</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <Progress 
                      value={(location.opens / Math.max(...geoData.map(g => g.opens))) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="text-sm font-medium w-12 text-right">
                    {((location.clicks / location.opens) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subject Line</span>
              <span className="text-sm font-medium">{campaign.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Campaign Type</span>
              <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge 
                className={
                  campaign.status === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }
              >
                {campaign.status === 'active' ? 'Active' : 'Draft'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Sent</span>
              <span className="text-sm font-medium">{campaign.lastSent}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deliverability Rate</span>
              <span className="text-sm font-medium">{(100 - campaign.bounceRate).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Unsubscribe Rate</span>
              <span className="text-sm font-medium">{campaign.unsubscribeRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Click-to-Open Rate</span>
              <span className="text-sm font-medium">
                {((campaign.clickRate / campaign.openRate) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenue Generated</span>
              <span className="text-sm font-medium">$12,450</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}