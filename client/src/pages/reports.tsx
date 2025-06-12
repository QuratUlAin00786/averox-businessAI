import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  LineChart as LineChartIcon, ArrowUpRight, Lightbulb, ArrowLeft
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PageHeader } from "@/components/ui/page-header";
import { generateAnalysis } from "@/lib/openai";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const [, setLocation] = useLocation();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("last-30");
  
  // Handle time range change
  const handleTimeRangeChange = (newValue: string) => {
    console.log(`Time range changing from ${selectedTimeRange} to ${newValue}`);
    setSelectedTimeRange(newValue);
    
    // Force clear all cache and refetch everything
    queryClient.clear();
    
    // Specifically invalidate each report type to ensure refetch
    queryClient.invalidateQueries();
    
    // Log the change for debugging
    console.log(`Time range changed to ${newValue}, invalidated all queries`);
  };

  interface SalesReport {
    monthlyData: Array<{
      name: string;
      deals: number;
      value: number;
    }>;
    pipelineStages: Array<{
      name: string;
      value: number;
      percentage?: number;
      color?: string;
    }>;
  }
  
  interface LeadsReport {
    sourceData: Array<{
      name: string;
      value: number;
    }>;
    trendData: Array<{
      name: string;
      newLeads: number;
      converted: number;
    }>;
  }
  
  interface ConversionReport {
    conversionRate: number;
    previousRate: number;
    avgTimeToConvert: number;
    previousTime: number;
    bestChannel: {
      name: string;
      rate: number;
    };
    weeklyData: Array<{
      name: string;
      newLeads: number;
      converted: number;
    }>;
  }
  
  interface TeamReport {
    teamMembers: Array<{
      name: string;
      deals: number;
      revenue: number;
      conversion: number;
    }>;
  }

  // Fetch sales report data with selected time range
  const { data: salesReport, isLoading: isSalesLoading } = useQuery<SalesReport, Error>({
    queryKey: [`/api/reports/sales?timeRange=${selectedTimeRange}`],
    enabled: true
  });

  // Fetch leads report data with selected time range
  const { data: leadsReport, isLoading: isLeadsLoading } = useQuery<LeadsReport, Error>({
    queryKey: [`/api/reports/leads?timeRange=${selectedTimeRange}`],
    enabled: true
  });
  
  // Fetch conversion report data with selected time range
  const { data: conversionReport, isLoading: isConversionLoading } = useQuery<ConversionReport, Error>({
    queryKey: [`/api/reports/conversion?timeRange=${selectedTimeRange}`],
    enabled: true
  });
  
  // Fetch team performance report data with selected time range
  const { data: teamReport, isLoading: isTeamLoading } = useQuery<TeamReport, Error>({
    queryKey: [`/api/reports/performance?timeRange=${selectedTimeRange}`],
    enabled: true
  });

  // Generate AI insights
  const generateInsight = async () => {
    setIsGeneratingInsight(true);
    try {
      // Import the generateInsights function
      const { generateInsights } = await import('@/lib/openai');
      
      // Prepare the report data for analysis
      const reportData = {
        salesReport, 
        leadsReport, 
        conversionReport, 
        teamReport,
        timeRange: selectedTimeRange
      };
      
      // Generate insights using the correct function
      const insights = await generateInsights(reportData, "reports");
      
      // Format insights for display
      if (insights && insights.length > 0) {
        const formattedInsights = insights.map(insight => 
          `**${insight.title}**: ${insight.description}`
        ).join('\n\n');
        setAiInsight(formattedInsights);
      } else {
        setAiInsight("AI analysis complete. Based on your current data, continue monitoring your metrics and check back when you have more data points for deeper insights.");
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setAiInsight("Unable to generate insights at this time. Please try again later.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <PageHeader
        title="Reports"
        description="Analyze your business performance with comprehensive reports"
        actions={
          <div className="flex gap-2">
            <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
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
            <Button 
              variant="outline"
              onClick={() => {
                try {
                  // Check which tab is active to determine what data to export
                  const activeTab = document.querySelector("[data-state='active'][role='tab']")?.getAttribute("data-value") || "sales";
                  
                  let csvRows = [];
                  let filename = "averox_crm_";
                  
                  // Add header with export information
                  csvRows.push(["AVEROX CRM Export"]);
                  csvRows.push([`Report Type: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`]);
                  csvRows.push([`Time Range: ${selectedTimeRange}`]);
                  csvRows.push([`Export Date: ${new Date().toISOString().split('T')[0]}`]);
                  csvRows.push([]);
                  
                  switch(activeTab) {
                    case "sales":
                      if (!salesReport) {
                        window.alert("No sales data available to export");
                        return;
                      }
                      
                      filename += "sales_report_";
                      
                      // Monthly revenue data
                      csvRows.push(["Monthly Revenue"]);
                      csvRows.push(["Month", "Deals", "Revenue"]);
                      salesReport.monthlyData.forEach(month => {
                        csvRows.push([
                          month.name,
                          month.deals,
                          month.value
                        ]);
                      });
                      
                      // Pipeline stages
                      csvRows.push([]);
                      csvRows.push(["Pipeline Stages"]);
                      csvRows.push(["Stage", "Value"]);
                      salesReport.pipelineStages.forEach(stage => {
                        csvRows.push([
                          stage.name,
                          stage.value
                        ]);
                      });
                      break;
                      
                    case "leads":
                      if (!leadsReport) {
                        window.alert("No leads data available to export");
                        return;
                      }
                      
                      filename += "leads_report_";
                      
                      // Lead sources
                      csvRows.push(["Lead Sources"]);
                      csvRows.push(["Source", "Number of Leads"]);
                      leadsReport.sourceData.forEach(source => {
                        csvRows.push([
                          source.name,
                          source.value
                        ]);
                      });
                      
                      // Lead trends
                      csvRows.push([]);
                      csvRows.push(["Lead Trends"]);
                      csvRows.push(["Period", "New Leads", "Converted"]);
                      leadsReport.trendData.forEach(period => {
                        csvRows.push([
                          period.name,
                          period.newLeads,
                          period.converted
                        ]);
                      });
                      break;
                      
                    case "conversion":
                      if (!conversionReport) {
                        window.alert("No conversion data available to export");
                        return;
                      }
                      
                      filename += "conversion_report_";
                      
                      // Conversion summary
                      csvRows.push(["Conversion Summary"]);
                      csvRows.push(["Metric", "Value"]);
                      csvRows.push(["Current Conversion Rate", `${conversionReport.conversionRate || 0}%`]);
                      csvRows.push(["Previous Conversion Rate", `${conversionReport.previousRate || 0}%`]);
                      csvRows.push(["Average Time to Convert (days)", conversionReport.avgTimeToConvert || 0]);
                      csvRows.push(["Previous Average Time (days)", conversionReport.previousTime || 0]);
                      csvRows.push(["Best Performing Channel", conversionReport.bestChannel.name]);
                      csvRows.push(["Best Channel Conversion Rate", `${conversionReport.bestChannel.rate}%`]);
                      
                      // Weekly conversion data
                      csvRows.push([]);
                      csvRows.push(["Weekly Conversion Data"]);
                      csvRows.push(["Week", "New Leads", "Converted"]);
                      conversionReport.weeklyData.forEach(week => {
                        csvRows.push([
                          week.name,
                          week.newLeads,
                          week.converted
                        ]);
                      });
                      break;
                      
                    case "performance":
                      if (!teamReport) {
                        window.alert("No team performance data available to export");
                        return;
                      }
                      
                      filename += "team_performance_";
                      
                      // Team performance
                      csvRows.push(["Team Performance"]);
                      csvRows.push(["Team Member", "Deals", "Revenue", "Conversion Rate"]);
                      
                      // Check if teamMembers array exists before iterating
                      if (teamReport.teamMembers && Array.isArray(teamReport.teamMembers)) {
                        teamReport.teamMembers.forEach(member => {
                          // Make sure all values exist and handle potential nulls
                          csvRows.push([
                            member.name || 'Unknown',
                            member.deals || 0,
                            member.revenue || 0,
                            `${member.conversion || 0}%`
                          ]);
                        });
                      } else {
                        // Add fallback row to prevent empty CSV
                        csvRows.push(["No team members data available", "", "", ""]);
                      }
                      break;
                  }
                  
                  // Convert to CSV content
                  const csvContent = csvRows.map(row => 
                    row.map(cell => 
                      typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
                    ).join(',')
                  ).join('\n');
                  
                  // Create and trigger download
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `${filename}${new Date().toISOString().split('T')[0]}.csv`);
                  
                  // Append link, trigger download, then clean up
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  console.log("Export completed successfully");
                } catch (error) {
                  console.error("Export failed:", error);
                  window.alert("Failed to export report data. Please try again.");
                }
              }}
            >
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
                  {isSalesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesReport?.monthlyData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Bar dataKey="value" name="Revenue" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
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
                  {isSalesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesReport?.monthlyData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="deals" name="Deals" stroke="#00C49F" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
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
                  {isSalesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesReport?.pipelineStages || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {(salesReport?.pipelineStages || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
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
                  {isLeadsLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadsReport?.sourceData || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {(leadsReport?.sourceData || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
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
                  {isLeadsLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={leadsReport?.trendData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="newLeads" name="New Leads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                        <Area type="monotone" dataKey="converted" name="Converted" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
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
                  {isConversionLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionReport?.weeklyData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newLeads" name="New Leads" fill="#8884d8" />
                        <Bar dataKey="converted" name="Converted" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="space-y-6">
                  {isConversionLoading ? (
                    <>
                      <Skeleton className="h-16 w-3/4" />
                      <Skeleton className="h-16 w-3/4" />
                      <Skeleton className="h-16 w-3/4" />
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Conversion Rate</h3>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold">{conversionReport?.conversionRate || 0}%</span>
                          <span className={`text-sm ${(conversionReport?.conversionRate || 0) > (conversionReport?.previousRate || 0) ? 'text-green-600' : 'text-red-500'} flex items-center`}>
                            <ArrowUpRight className="h-4 w-4" />
                            {Math.abs((conversionReport?.conversionRate || 0) - (conversionReport?.previousRate || 0)).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">vs previous period</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Average Time to Convert</h3>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold">{conversionReport?.avgTimeToConvert || 0} days</span>
                          <span className={`text-sm ${(conversionReport?.previousTime || 0) > (conversionReport?.avgTimeToConvert || 0) ? 'text-green-600' : 'text-red-500'} flex items-center`}>
                            <ArrowUpRight className="h-4 w-4" />
                            Improved by {Math.abs((conversionReport?.avgTimeToConvert || 0) - (conversionReport?.previousTime || 0))} days
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-gray-500">Best Performing Channel</h3>
                        <div className="mt-1">
                          <span className="text-xl font-bold">{conversionReport?.bestChannel?.name}</span>
                          <p className="text-sm text-gray-500">{conversionReport?.bestChannel?.rate}% conversion rate</p>
                        </div>
                      </div>
                    </>
                  )}
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
                {isTeamLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-[350px] w-full" />
                  </div>
                ) : !teamReport || !teamReport.teamMembers || teamReport.teamMembers.length === 0 ? (
                  <div className="h-full flex items-center justify-center flex-col">
                    <p>No team performance data available for selected time range.</p>
                    <p className="text-xs text-gray-500 mt-2">Selected time range: {selectedTimeRange}</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 text-xs text-gray-500">
                      Time range: {selectedTimeRange} | 
                      Members: {teamReport.teamMembers.length} |
                      Data timestamp: {new Date().toISOString()}
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart
                        layout="vertical"
                        data={teamReport.teamMembers}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'revenue') return [`$${value}`, 'Revenue']
                          if (name === 'deals') return [value, 'Deals']
                          if (name === 'conversion') return [`${value}%`, 'Conversion Rate']
                          return [value, name]
                        }} />
                        <Legend />
                        <Bar dataKey="deals" name="Deals Closed" fill="#8884d8" />
                        <Bar dataKey="revenue" name="Revenue Generated" fill="#82ca9d" />
                        <Bar dataKey="conversion" name="Conversion Rate (%)" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
