import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Mail,
  ChevronLeft,
  Image,
  Link2,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Clock,
  Calendar,
  CircleCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateCampaignPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<number>(1);
  const [campaignType, setCampaignType] = useState<string>("email");
  const [editorContent, setEditorContent] = useState<string>("");

  const proceedToStep = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleCancel = () => {
    // Navigate back to marketing page
    setLocation("/marketing");
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Create New Campaign</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar - Progress */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Setup</CardTitle>
              <CardDescription>Complete all steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    1
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 1 ? "text-primary" : "text-slate-700"}`}>Campaign Details</div>
                    <div className="text-xs text-slate-500">Name, type, and settings</div>
                  </div>
                  {step > 1 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    2
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 2 ? "text-primary" : "text-slate-700"}`}>Content Creation</div>
                    <div className="text-xs text-slate-500">Design your message</div>
                  </div>
                  {step > 2 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    3
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 3 ? "text-primary" : "text-slate-700"}`}>Recipients</div>
                    <div className="text-xs text-slate-500">Choose your audience</div>
                  </div>
                  {step > 3 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    4
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${step >= 4 ? "text-primary" : "text-slate-700"}`}>Review & Schedule</div>
                    <div className="text-xs text-slate-500">Final checks and timing</div>
                  </div>
                  {step > 4 && <CircleCheck className="h-5 w-5 text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-12 md:col-span-9">
          <Card>
            {/* Step 1: Campaign Details */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>Define the basics of your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input id="campaign-name" placeholder="E.g., Spring Sale Announcement" />
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Type</Label>
                    <RadioGroup value={campaignType} onValueChange={setCampaignType} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`border rounded-lg p-4 cursor-pointer ${campaignType === "email" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="email" id="email" className="sr-only" />
                        <Label htmlFor="email" className="flex flex-col items-center cursor-pointer gap-2">
                          <Mail className="h-8 w-8 text-primary" />
                          <span className="font-medium">Email Campaign</span>
                          <span className="text-xs text-center text-slate-500">Standard email to your audience</span>
                        </Label>
                      </div>

                      <div className={`border rounded-lg p-4 cursor-pointer ${campaignType === "automated" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="automated" id="automated" className="sr-only" />
                        <Label htmlFor="automated" className="flex flex-col items-center cursor-pointer gap-2">
                          <Clock className="h-8 w-8 text-primary" />
                          <span className="font-medium">Automated Sequence</span>
                          <span className="text-xs text-center text-slate-500">Multi-step automated workflow</span>
                        </Label>
                      </div>

                      <div className={`border rounded-lg p-4 cursor-pointer ${campaignType === "ab" ? "border-primary bg-primary/5" : ""}`}>
                        <RadioGroupItem value="ab" id="ab" className="sr-only" />
                        <Label htmlFor="ab" className="flex flex-col items-center cursor-pointer gap-2">
                          <Image className="h-8 w-8 text-primary" />
                          <span className="font-medium">A/B Test</span>
                          <span className="text-xs text-center text-slate-500">Test different versions</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Campaign Description (optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter a brief description of this campaign's purpose" 
                      className="min-h-24" 
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => proceedToStep(2)}>
                      Continue to Content
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Content Creation */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Content Creation</CardTitle>
                  <CardDescription>Design the content for your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject Line</Label>
                    <Input id="subject" placeholder="Enter an attention-grabbing subject line" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preview">Preview Text</Label>
                    <Input 
                      id="preview" 
                      placeholder="Brief text that appears after the subject line in most email clients" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Tabs defaultValue="design" className="w-full">
                      <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="design">Visual Design</TabsTrigger>
                        <TabsTrigger value="code">HTML Code</TabsTrigger>
                      </TabsList>

                      <TabsContent value="design" className="space-y-2">
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-4 p-2 border-b">
                            <Button variant="outline" size="icon">
                              <Bold className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Italic className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Link2 className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button variant="outline" size="icon">
                              <List className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <ListOrdered className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button variant="outline" size="icon">
                              <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <AlignRight className="h-4 w-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <Button variant="outline" size="icon">
                              <Image className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="min-h-96 border rounded-md p-4">
                            <Textarea 
                              className="min-h-80 border-none resize-none"
                              placeholder="Start typing your email content here..."
                              value={editorContent}
                              onChange={(e) => setEditorContent(e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="code">
                        <Textarea 
                          className="min-h-96 font-mono"
                          placeholder="<!DOCTYPE html><html><head><title>My Email</title></head><body><h1>My Email Content</h1></body></html>"
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => proceedToStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => proceedToStep(3)}>
                      Continue to Recipients
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Recipients */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Select Recipients</CardTitle>
                  <CardDescription>Choose who will receive your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Audience Selection</Label>
                    <RadioGroup defaultValue="all-contacts" className="space-y-4">
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="all-contacts" id="all-contacts" />
                        <Label htmlFor="all-contacts" className="flex-1 cursor-pointer">
                          <div className="font-medium">All Contacts</div>
                          <div className="text-sm text-slate-500">5,421 recipients</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="list" id="list" />
                        <Label htmlFor="list" className="flex-1 cursor-pointer">
                          <div className="font-medium">Specific List</div>
                          <div className="text-sm text-slate-500">Select one or more contact lists</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="segment" id="segment" />
                        <Label htmlFor="segment" className="flex-1 cursor-pointer">
                          <div className="font-medium">Segment</div>
                          <div className="text-sm text-slate-500">Define criteria to target specific contacts</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Available Lists</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-60">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-1" className="rounded" />
                            <Label htmlFor="list-1" className="flex-1 cursor-pointer">
                              <div className="font-medium">Newsletter Subscribers</div>
                              <div className="text-xs text-slate-500">3,842 contacts</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-2" className="rounded" />
                            <Label htmlFor="list-2" className="flex-1 cursor-pointer">
                              <div className="font-medium">Product Updates</div>
                              <div className="text-xs text-slate-500">2,156 contacts</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-3" className="rounded" />
                            <Label htmlFor="list-3" className="flex-1 cursor-pointer">
                              <div className="font-medium">Recent Customers</div>
                              <div className="text-xs text-slate-500">1,893 contacts</div>
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="list-4" className="rounded" />
                            <Label htmlFor="list-4" className="flex-1 cursor-pointer">
                              <div className="font-medium">Enterprise Clients</div>
                              <div className="text-xs text-slate-500">127 contacts</div>
                            </Label>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => proceedToStep(2)}>
                      Back
                    </Button>
                    <Button onClick={() => proceedToStep(4)}>
                      Continue to Review
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Review & Schedule */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Review & Schedule</CardTitle>
                  <CardDescription>Review your campaign and set the delivery schedule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Campaign Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-slate-500">Campaign Name</div>
                            <div className="font-medium">Spring Sale Announcement</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-500">Campaign Type</div>
                            <div className="font-medium">Email Campaign</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-500">Recipients</div>
                            <div className="font-medium">3,842 contacts</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-slate-500">Subject Line</div>
                            <div className="font-medium">Spring Sale: 25% Off Everything</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label>Delivery Schedule</Label>
                    <RadioGroup defaultValue="send-now" className="space-y-4">
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="send-now" id="send-now" />
                        <Label htmlFor="send-now" className="flex-1 cursor-pointer">
                          <div className="font-medium">Send Immediately</div>
                          <div className="text-sm text-slate-500">Your campaign will be sent as soon as you click "Launch Campaign"</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <RadioGroupItem value="schedule" id="schedule" />
                        <Label htmlFor="schedule" className="flex-1 cursor-pointer flex-grow">
                          <div className="font-medium">Schedule for Later</div>
                          <div className="text-sm text-slate-500 mb-2">Select a date and time to send your campaign</div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-5 w-5 text-slate-500" />
                              <Input type="date" className="max-w-[180px]" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-slate-500" />
                              <Input type="time" className="max-w-[180px]" />
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => proceedToStep(3)}>
                      Back
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline">Save as Draft</Button>
                      <Button onClick={() => setLocation("/marketing")}>Launch Campaign</Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}