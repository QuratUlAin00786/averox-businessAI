import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Mail,
  BarChart,
  Calendar,
  Settings,
  Users,
  Zap,
  Clock,
  Plus,
  MessageSquare,
  Pencil,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarketingPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("campaigns");

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Marketing Automation</h1>
          <p className="text-slate-500 mt-1">Create and manage your marketing campaigns and automations</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/marketing/analytics")}>
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setLocation("/marketing/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 md:w-[600px]">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">New Product Launch</CardTitle>
                <CardDescription>Email campaign</CardDescription>
                <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Recipients</div>
                    <div className="font-medium">1,245</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Open Rate</div>
                    <div className="font-medium">38%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Click Rate</div>
                    <div className="font-medium">12%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Unsubscribes</div>
                    <div className="font-medium">3</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="outline" size="sm">
                  View Report
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Monthly Newsletter</CardTitle>
                <CardDescription>Email campaign</CardDescription>
                <Badge className="absolute top-3 right-3 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Scheduled
                </Badge>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Recipients</div>
                    <div className="font-medium">3,842</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Scheduled For</div>
                    <div className="font-medium">Apr 25, 8:00 AM</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Status</div>
                    <div className="font-medium">Ready</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Created By</div>
                    <div className="font-medium">Alex R.</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Create New Campaign</h3>
              <p className="text-sm text-slate-500 text-center mb-4">Start a new email campaign or automation</p>
              <Button onClick={() => setLocation("/marketing/create")}>
                Get Started
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Lead Nurturing</CardTitle>
                <CardDescription>Multi-step workflow</CardDescription>
                <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Welcome Email</div>
                      <div className="text-xs text-slate-500">Sent immediately</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Wait 3 Days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Follow-up Email</div>
                      <div className="text-xs text-slate-500">If not opened</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Abandoned Cart</CardTitle>
                <CardDescription>Recovery workflow</CardDescription>
                <Badge className="absolute top-3 right-3 bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Reminder Email</div>
                      <div className="text-xs text-slate-500">After 4 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Wait 24 Hours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Discount Offer</div>
                      <div className="text-xs text-slate-500">10% off</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Create New Automation</h3>
              <p className="text-sm text-slate-500 text-center mb-4">Set up automated workflows and sequences</p>
              <Button onClick={() => setLocation("/marketing/automations/new")}>
                Create Workflow
              </Button>
            </Card>
          </div>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-0">
                <div className="h-36 rounded-md bg-slate-100 mb-3 flex items-center justify-center">
                  <Mail className="h-12 w-12 text-slate-400" />
                </div>
                <CardTitle className="text-md">Welcome Email</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Use
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <div className="h-36 rounded-md bg-slate-100 mb-3 flex items-center justify-center">
                  <Mail className="h-12 w-12 text-slate-400" />
                </div>
                <CardTitle className="text-md">Product Announcement</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Use
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <div className="h-36 rounded-md bg-slate-100 mb-3 flex items-center justify-center">
                  <Mail className="h-12 w-12 text-slate-400" />
                </div>
                <CardTitle className="text-md">Newsletter</CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between pt-3">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Use
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-dashed flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Create Template</h3>
              <p className="text-sm text-slate-500 text-center mb-4">Design a new email template</p>
              <Button onClick={() => setLocation("/marketing/templates/new")}>
                Create Template
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* Placeholders for other tabs */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Lists</CardTitle>
              <CardDescription>Manage your subscriber lists and segments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div>
                    <div className="font-medium">All Contacts</div>
                    <div className="text-sm text-slate-500">5,421 subscribers</div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div>
                    <div className="font-medium">Newsletter Subscribers</div>
                    <div className="text-sm text-slate-500">3,842 subscribers</div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div>
                    <div className="font-medium">Product Updates</div>
                    <div className="text-sm text-slate-500">2,156 subscribers</div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setLocation("/marketing/subscribers/import")}>
                <Download className="h-4 w-4 mr-2" /> Import Subscribers
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Connect with other platforms and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.288 21h-20.576c-.945 0-1.712-.767-1.712-1.712v-13.576c0-.945.767-1.712 1.712-1.712h20.576c.945 0 1.712.767 1.712 1.712v13.576c0 .945-.767 1.712-1.712 1.712zm-10.288-6.086l-9.342-6.483-.02 11.569h18.684v-11.569l-9.322 6.483zm8.869-9.914h-17.789l8.92 6.229s6.252-4.406 8.869-6.229z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">SMTP Service</div>
                      <div className="text-sm text-slate-500">Connect to an email sending service</div>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-teal-100 rounded-md flex items-center justify-center mr-4">
                      <MessageSquare className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium">SMS Provider</div>
                      <div className="text-sm text-slate-500">Send SMS messages to your contacts</div>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-purple-100 rounded-md flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 9.333l5.333 2.662-5.333 2.672v-5.334zm14-4.333v14c0 2.761-2.238 5-5 5h-14c-2.761 0-5-2.239-5-5v-14c0-2.761 2.239-5 5-5h14c2.762 0 5 2.239 5 5zm-4 7c-.02-4.123-.323-5.7-2.923-5.877-2.403-.164-7.754-.163-10.153 0-2.598.177-2.904 1.747-2.924 5.877.02 4.123.323 5.7 2.923 5.877 2.399.163 7.75.164 10.153 0 2.598-.177 2.904-1.747 2.924-5.877z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">Social Media</div>
                      <div className="text-sm text-slate-500">Integrate with social platforms</div>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}