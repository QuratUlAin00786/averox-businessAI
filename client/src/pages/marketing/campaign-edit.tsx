import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Calendar, Users, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

export default function CampaignEdit() {
  const [, params] = useRoute("/marketing/campaigns/:id");
  const [, setLocation] = useLocation();
  const campaignId = params?.id;

  // Sample campaign data - in real app this would come from API
  const [campaign, setCampaign] = useState({
    id: campaignId,
    name: "Spring Product Launch",
    description: "Comprehensive campaign to launch our new spring product line with targeted email sequences and social media engagement.",
    type: "email",
    status: "active",
    subject: "Discover Our Exciting Spring Collection",
    fromName: "Averox Team",
    fromEmail: "marketing@averox.com",
    audience: "spring-interested",
    scheduledDate: "2025-04-18",
    sent: 4829,
    opened: 2187,
    clicked: 815,
    openRate: "45.3%",
    clickRate: "16.9%",
    lastSent: "Apr 18, 2025"
  });

  const handleSave = () => {
    // In real app, this would save to API
    console.log("Saving campaign:", campaign);
    setLocation("/marketing");
  };

  const handleCancel = () => {
    setLocation("/marketing");
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Campaign</h1>
            <p className="text-muted-foreground">
              Campaign ID: {campaignId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Basic information about your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={campaign.name}
                  onChange={(e) => setCampaign({...campaign, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={campaign.description}
                  onChange={(e) => setCampaign({...campaign, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select value={campaign.type} onValueChange={(value) => setCampaign({...campaign, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="sms">SMS Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={campaign.status} onValueChange={(value) => setCampaign({...campaign, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email-specific settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={campaign.fromName}
                    onChange={(e) => setCampaign({...campaign, fromName: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={campaign.fromEmail}
                    onChange={(e) => setCampaign({...campaign, fromEmail: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={campaign.audience} onValueChange={(value) => setCampaign({...campaign, audience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="spring-interested">Spring Product Interested</SelectItem>
                    <SelectItem value="high-value">High Value Customers</SelectItem>
                    <SelectItem value="new-subscribers">New Subscribers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Campaign Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge 
                  className={
                    campaign.status === 'active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : campaign.status === 'scheduled'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {campaign.status === 'active' 
                    ? 'Active' 
                    : campaign.status === 'scheduled'
                    ? 'Scheduled'
                    : 'Draft'
                  }
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sent</span>
                <span className="text-sm font-medium">{campaign.lastSent}</span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{campaign.sent.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{campaign.opened.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Opened</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">{campaign.openRate}</div>
                  <div className="text-xs text-gray-500">Open Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">{campaign.clickRate}</div>
                  <div className="text-xs text-gray-500">Click Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Send
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Preview Audience
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}