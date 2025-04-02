import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, FileBarChart, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, ArrowUpRight, Lightbulb
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { PageHeader } from "@/components/ui/page-header";

// Sample data for charts
const opportunityData = [
  { name: 'Jan', deals: 12, value: 45000 },
  { name: 'Feb', deals: 19, value: 52000 },
  { name: 'Mar', deals: 15, value: 48000 },
  { name: 'Apr', deals: 21, value: 61000 },
  { name: 'May', deals: 18, value: 54000 },
  { name: 'Jun', deals: 24, value: 69000 },
  { name: 'Jul', deals: 16, value: 47000 },
  { name: 'Aug', deals: 22, value: 63000 },
  { name: 'Sep', deals: 28, value: 75000 },
  { name: 'Oct', deals: 25, value: 72000 },
  { name: 'Nov', deals: 30, value: 83000 },
  { name: 'Dec', deals: 23, value: 67000 },
];

const leadSourceData = [
  { name: 'Website', value: 35 },
  { name: 'Referral', value: 25 },
  { name: 'Social Media', value: 20 },
  { name: 'Email Campaign', value: 15 },
  { name: 'Event', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const salesStageData = [
  { name: 'Lead Generation', value: 35 },
  { name: 'Qualification', value: 25 },
  { name: 'Proposal', value: 20 },
  { name: 'Negotiation', value: 15 },
  { name: 'Closing', value: 5 },
];

const leadTrendData = [
  { name: 'Week 1', newLeads: 40, converted: 10 },
  { name: 'Week 2', newLeads: 45, converted: 12 },
  { name: 'Week 3', newLeads: 38, converted: 8 },
  { name: 'Week 4', newLeads: 50, converted: 15 },
];

export default function Reports() {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");

  // Simulate AI insight generation
  const generateInsight = async () => {
    setIsGeneratingInsight(true);
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAiInsight("Based on your data, there's a 23% growth in lead conversion rate over the past quarter, primarily driven by website and referral sources. The sales team is most effective at closing deals in the technology sector, with an average close time of 18 days compared to 24 days in other sectors. Consider allocating more resources to referral programs and technology sector outreach for optimal growth.");
    setIsGeneratingInsight(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Reports"
        description="Analyze your business performance with comprehensive reports"
        actions={
          <div className="flex gap-2">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="last-90">Last 90 days</SelectItem>
                <SelectItem value="year-to-date">Year to date</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* AI Insights Card */}
      <Card className="border-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">AI-Powered Insights</CardTitle>
            <CardDescription>
              Get intelligent analysis of your CRM data
            </CardDescription>
          </div>
          <Button 
            onClick={generateInsight} 
            disabled={isGeneratingInsight}
            variant="default" 
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {isGeneratingInsight ? "Analyzing..." : "Generate Insight"}
          </Button>
        </CardHeader>
        <CardContent>
          {aiInsight ? (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <div className="flex items-center mb-2">
                <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">AI Analysis</h3>
              </div>
              <p className="text-blue-900">{aiInsight}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mb-4 text-gray-300" />
              <p>Click "Generate Insight" to get AI-powered analysis of your data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">
            <BarChart3 className="h-4 w-4 mr-2" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="leads">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="conversion">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Conversion
          </TabsTrigger>
          <TabsTrigger value="performance">
            <FileBarChart className="h-4 w-4 mr-2" />
            Team Performance
          </TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={opportunityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="value" name="Revenue" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Count</CardTitle>
                <CardDescription>Number of deals per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={opportunityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="deals" name="Deals" stroke="#00C49F" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Pipeline Stages</CardTitle>
                <CardDescription>Current deals by stage</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesStageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {salesStageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution of leads by source</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Trends</CardTitle>
                <CardDescription>New vs converted leads over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={leadTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="newLeads" name="New Leads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="converted" name="Converted" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
              <CardDescription>Lead to opportunity conversion analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="newLeads" name="New Leads" fill="#8884d8" />
                      <Bar dataKey="converted" name="Converted" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Conversion Rate</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">23.7%</span>
                      <span className="text-sm text-green-600 flex items-center">
                        <ArrowUpRight className="h-4 w-4" />
                        2.1%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">vs previous period</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Average Time to Convert</h3>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">18 days</span>
                      <span className="text-sm text-green-600 flex items-center">
                        <ArrowUpRight className="h-4 w-4" />
                        Improved by 2 days
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Best Performing Channel</h3>
                    <div className="mt-1">
                      <span className="text-xl font-bold">Referrals</span>
                      <p className="text-sm text-gray-500">32.5% conversion rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Sales performance by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'John Smith', deals: 42, revenue: 126000 },
                      { name: 'Emma Johnson', deals: 38, revenue: 114000 },
                      { name: 'Michael Brown', deals: 31, revenue: 93000 },
                      { name: 'Sophia Davis', deals: 28, revenue: 84000 },
                      { name: 'William Wilson', deals: 25, revenue: 75000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'Deals']} />
                    <Legend />
                    <Bar dataKey="deals" name="Deals Closed" fill="#8884d8" />
                    <Bar dataKey="revenue" name="Revenue Generated" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
