import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Eye, MousePointer, 
  Mail, Share2, Heart, MessageCircle, Download, Calendar
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EngagementAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/marketing/engagement-analytics'],
  });

  const { data: campaigns } = useQuery({
    queryKey: ['/api/marketing/campaigns'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sample data for demonstration - would come from real API
  const engagementData = analytics || {
    overview: {
      totalEngagements: 15420,
      engagementRate: 4.2,
      averageTimeSpent: "2m 34s",
      topPerformingContent: "Product Launch Email",
      weeklyGrowth: 8.3
    },
    weeklyTrend: [
      { week: 'Week 1', engagements: 2800, clicks: 420, shares: 89 },
      { week: 'Week 2', engagements: 3200, clicks: 485, shares: 102 },
      { week: 'Week 3', engagements: 2950, clicks: 445, shares: 95 },
      { week: 'Week 4', engagements: 3470, clicks: 520, shares: 118 },
      { week: 'Week 5', engagements: 3000, clicks: 465, shares: 98 }
    ],
    channelBreakdown: [
      { name: 'Email', value: 45, color: '#0088FE' },
      { name: 'Social Media', value: 30, color: '#00C49F' },
      { name: 'Website', value: 15, color: '#FFBB28' },
      { name: 'Mobile App', value: 10, color: '#FF8042' }
    ],
    contentPerformance: [
      { type: 'Product Updates', engagements: 4200, clicks: 630, ctr: 15.0 },
      { type: 'Educational Content', engagements: 3800, clicks: 570, ctr: 15.0 },
      { type: 'Promotional Offers', engagements: 3200, clicks: 480, ctr: 15.0 },
      { type: 'Company News', engagements: 2400, clicks: 360, ctr: 15.0 },
      { type: 'Industry Insights', engagements: 1820, clicks: 273, ctr: 15.0 }
    ],
    audienceSegments: [
      { segment: 'Enterprise Customers', engagement: 85, size: 1200 },
      { segment: 'SMB Customers', engagement: 72, size: 3400 },
      { segment: 'Prospects', engagement: 45, size: 8900 },
      { segment: 'Partners', engagement: 68, size: 450 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze audience engagement across all channels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.totalEngagements.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +{engagementData.overview.weeklyGrowth}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.engagementRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +0.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.overview.averageTimeSpent}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +12s from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Content</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{engagementData.overview.topPerformingContent}</div>
            <div className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">Most Engaged</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Engagement Trends</TabsTrigger>
          <TabsTrigger value="channels">Channel Breakdown</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Engagement Trends</CardTitle>
              <CardDescription>
                Track engagement patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={engagementData.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="engagements" 
                    stackId="1"
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stackId="2"
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="shares" 
                    stackId="3"
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Channel</CardTitle>
                <CardDescription>
                  Distribution of engagements across channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData.channelBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {engagementData.channelBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>
                  Detailed metrics by channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.channelBreakdown.map((channel, index) => (
                    <div key={channel.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{channel.value}%</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(engagementData.overview.totalEngagements * channel.value / 100).toLocaleString()} engagements
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Engagement metrics by content type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={engagementData.contentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engagements" fill="#8884d8" />
                  <Bar dataKey="clicks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Segment Performance</CardTitle>
              <CardDescription>
                Engagement rates by audience segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementData.audienceSegments.map((segment) => (
                  <div key={segment.segment} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{segment.segment}</span>
                      <div className="text-right">
                        <div className="font-medium">{segment.engagement}%</div>
                        <div className="text-xs text-muted-foreground">
                          {segment.size.toLocaleString()} users
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${segment.engagement}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}