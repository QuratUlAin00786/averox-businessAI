import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft, 
  Plus, 
  X, 
  ChevronDown, 
  Save, 
  Users, 
  Filter, 
  RefreshCw,
  Play,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SegmentBuilder() {
  const [, setLocation] = useLocation();
  const [conditions, setConditions] = useState<{
    field: string;
    operator: string;
    value: string;
    logic?: 'and' | 'or';
  }[]>([
    { field: 'email', operator: 'contains', value: '@gmail.com' },
    { field: 'lastActive', operator: 'greater_than', value: '30' },
    { field: 'tags', operator: 'includes', value: 'newsletter', logic: 'and' }
  ]);

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [segmentName, setSegmentName] = useState("New Audience Segment");
  const [segmentDescription, setSegmentDescription] = useState("Target specific users based on their behavior and attributes");
  const [matchType, setMatchType] = useState<'all' | 'any'>('all');
  const [previewCount, setPreviewCount] = useState(2438);

  const [savedSegments] = useState([
    {
      id: "1",
      name: "Active Gmail Users",
      description: "Users with Gmail addresses who've been active in the last 30 days",
      count: 2438,
      lastUpdated: "Apr 22, 2025"
    },
    {
      id: "2",
      name: "Newsletter Subscribers",
      description: "All users who are subscribed to the newsletter",
      count: 3826,
      lastUpdated: "Apr 20, 2025"
    },
    {
      id: "3",
      name: "Inactive Customers",
      description: "Customers who haven't engaged in over 90 days",
      count: 1254,
      lastUpdated: "Apr 15, 2025"
    }
  ]);

  const addCondition = () => {
    setConditions([...conditions, { field: 'email', operator: 'contains', value: '' }]);
  };

  const removeCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);

    // Simulate audience count updating
    setPreviewCount(Math.floor(Math.random() * 3000) + 1000);
  };

  const toggleLogic = (index: number) => {
    const newConditions = [...conditions];
    newConditions[index] = { 
      ...newConditions[index], 
      logic: newConditions[index].logic === 'and' ? 'or' : 'and' 
    };
    setConditions(newConditions);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation("/marketing")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Audience Segmentation</h1>
            <p className="text-muted-foreground">Create targeted audience segments for your campaigns</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/marketing/segments")}>
            Cancel
          </Button>
          <Button onClick={() => setLocation("/marketing/segments")}>
            <Save className="h-4 w-4 mr-2" />
            Save Segment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar with saved segments */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Saved Segments</CardTitle>
              <CardDescription>Load existing segments</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ScrollArea className="h-[400px]">
                <div className="px-4 space-y-2">
                  {savedSegments.map((segment) => (
                    <div 
                      key={segment.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedSegment === segment.id ? 'bg-primary/10 border-primary' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedSegment(segment.id)}
                    >
                      <div className="font-medium">{segment.name}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{segment.description}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {segment.count.toLocaleString()}
                        </Badge>
                        <span className="text-xs text-slate-500">Updated: {segment.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="flex justify-center pt-4">
              <Button variant="ghost" className="w-full" onClick={() => {
                setSelectedSegment(null);
                setSegmentName("New Audience Segment");
                setSegmentDescription("Target specific users based on their behavior and attributes");
                setConditions([{ field: 'email', operator: 'contains', value: '' }]);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Segment
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main segment builder */}
        <div className="col-span-12 md:col-span-9">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <Input 
                    value={segmentName} 
                    onChange={(e) => setSegmentName(e.target.value)} 
                    className="text-lg font-medium border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Input 
                    value={segmentDescription} 
                    onChange={(e) => setSegmentDescription(e.target.value)} 
                    className="text-slate-500 text-sm border-none p-0 h-auto mt-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  {previewCount.toLocaleString()} contacts
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="builder">
                <TabsList className="mb-4">
                  <TabsTrigger value="builder">Segment Builder</TabsTrigger>
                  <TabsTrigger value="preview">Preview Results</TabsTrigger>
                  <TabsTrigger value="details">Segment Details</TabsTrigger>
                </TabsList>

                <TabsContent value="builder">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md bg-slate-50">
                      <div className="flex items-center mb-4">
                        <span className="mr-2 font-medium">Match</span>
                        <RadioGroup 
                          value={matchType} 
                          onValueChange={(value) => setMatchType(value as 'all' | 'any')}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="match-all" />
                            <Label htmlFor="match-all">All conditions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="any" id="match-any" />
                            <Label htmlFor="match-any">Any condition</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-3">
                        {conditions.map((condition, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {index > 0 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="px-2 h-8 text-xs font-medium" 
                                onClick={() => toggleLogic(index)}
                              >
                                {condition.logic || 'and'}
                              </Button>
                            )}
                            <div className="flex-1 grid grid-cols-12 gap-2 items-center p-2 bg-white border rounded-md">
                              <div className="col-span-3">
                                <Select 
                                  value={condition.field}
                                  onValueChange={(value) => updateCondition(index, 'field', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="tags">Tags</SelectItem>
                                    <SelectItem value="lastActive">Last Active</SelectItem>
                                    <SelectItem value="location">Location</SelectItem>
                                    <SelectItem value="device">Device</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-3">
                                <Select 
                                  value={condition.operator}
                                  onValueChange={(value) => updateCondition(index, 'operator', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="contains">contains</SelectItem>
                                    <SelectItem value="not_contains">doesn't contain</SelectItem>
                                    <SelectItem value="equals">equals</SelectItem>
                                    <SelectItem value="not_equals">doesn't equal</SelectItem>
                                    <SelectItem value="greater_than">greater than</SelectItem>
                                    <SelectItem value="less_than">less than</SelectItem>
                                    <SelectItem value="includes">includes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-5">
                                <Input 
                                  value={condition.value}
                                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                  placeholder="Enter value"
                                />
                              </div>
                              <div className="col-span-1 flex justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeCondition(index)}
                                  disabled={conditions.length === 1}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="ghost" className="mt-3" onClick={addCondition}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="advanced">
                        <AccordionTrigger className="text-sm font-medium">Advanced Options</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4 rounded-md border">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Segment Update Frequency</Label>
                                <Select defaultValue="realtime">
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="realtime">Real-time</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="manual">Manual only</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Contact Activity Timeframe</Label>
                                <Select defaultValue="all_time">
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all_time">All time</SelectItem>
                                    <SelectItem value="last_30">Last 30 days</SelectItem>
                                    <SelectItem value="last_90">Last 90 days</SelectItem>
                                    <SelectItem value="this_year">This year</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Tag Contacts in this Segment</Label>
                              <Select defaultValue="none">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Don't tag contacts</SelectItem>
                                  <SelectItem value="segment_name">Tag with segment name</SelectItem>
                                  <SelectItem value="custom">Custom tag</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                Include inactive contacts
                              </Label>
                              <Label className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                Include unsubscribed contacts
                              </Label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Contact Preview</h3>
                        <p className="text-sm text-slate-500">Showing contacts that match your segment criteria</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Refresh Preview
                      </Button>
                    </div>

                    <div className="border rounded-md">
                      <div className="bg-slate-50 p-3 text-sm border-b grid grid-cols-12 font-medium">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Last Active</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-2">Tags</div>
                      </div>
                      
                      {/* Sample preview data */}
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-3 text-sm border-b last:border-b-0 grid grid-cols-12 hover:bg-slate-50">
                          <div className="col-span-3 font-medium">John Smith {i}</div>
                          <div className="col-span-3">john.smith{i}@gmail.com</div>
                          <div className="col-span-2">{i * 2} days ago</div>
                          <div className="col-span-2">New York, USA</div>
                          <div className="col-span-2 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">newsletter</Badge>
                            {i % 2 === 0 && <Badge variant="outline" className="text-xs">customer</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-500">
                        Showing 5 of {previewCount.toLocaleString()} contacts
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="segment-name">Segment Name</Label>
                        <Input 
                          id="segment-name"
                          value={segmentName} 
                          onChange={(e) => setSegmentName(e.target.value)} 
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="segment-owner">Segment Owner</Label>
                        <Select defaultValue="current_user">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current_user">Current User</SelectItem>
                            <SelectItem value="marketing_team">Marketing Team</SelectItem>
                            <SelectItem value="sales_team">Sales Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="segment-description">Description</Label>
                      <Input 
                        id="segment-description"
                        value={segmentDescription} 
                        onChange={(e) => setSegmentDescription(e.target.value)} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Segment Type</Label>
                      <Select defaultValue="dynamic">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dynamic">Dynamic (auto-updating)</SelectItem>
                          <SelectItem value="static">Static (fixed list)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Sharing Settings</Label>
                      <RadioGroup defaultValue="team" className="mt-1 space-y-2">
                        <div className="flex items-start space-x-2 p-2 border rounded-md">
                          <RadioGroupItem value="private" id="sharing-private" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="sharing-private" className="font-medium">Private</Label>
                            <div className="text-sm text-slate-500">Only you can view and edit this segment</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 p-2 border rounded-md">
                          <RadioGroupItem value="team" id="sharing-team" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="sharing-team" className="font-medium">Team</Label>
                            <div className="text-sm text-slate-500">Your team can view and use this segment</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 p-2 border rounded-md">
                          <RadioGroupItem value="org" id="sharing-org" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="sharing-org" className="font-medium">Organization</Label>
                            <div className="text-sm text-slate-500">Everyone in your organization can view and use this segment</div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <Button variant="outline" onClick={() => setLocation("/marketing/segments")}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button variant="outline">
                  <PieChart className="h-4 w-4 mr-2" />
                  Analysis
                </Button>
                <Button onClick={() => setLocation("/marketing/segments")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Segment
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}