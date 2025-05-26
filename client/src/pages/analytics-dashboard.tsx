import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Target,
  Brain,
  ChevronRight
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsDashboard() {
  // Fetch real lead scores from database
  const { data: leadScores, isLoading: loadingLeads } = useQuery({
    queryKey: ['/api/analytics/lead-scores'],
  });

  // Fetch real churn predictions from database
  const { data: churnPredictions, isLoading: loadingChurn } = useQuery({
    queryKey: ['/api/analytics/churn-predictions'],
  });

  // Fetch real revenue forecast from database
  const { data: revenueForecast, isLoading: loadingForecast } = useQuery({
    queryKey: ['/api/analytics/revenue-forecast'],
  });

  if (loadingLeads || loadingChurn || loadingForecast) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topLeads = leadScores?.leadScores?.slice(0, 5) || [];
  const highRiskCustomers = churnPredictions?.churnPredictions?.filter(c => c.riskLevel === 'high') || [];
  const forecast = revenueForecast?.forecast || {};

  // Prepare chart data from real database results
  const leadScoreData = topLeads.map((lead, index) => ({
    name: `Lead ${lead.leadId}`,
    score: lead.score,
    confidence: lead.confidence
  }));

  const churnRiskData = [
    { 
      name: 'Low Risk', 
      value: churnPredictions?.churnPredictions?.filter(c => c.riskLevel === 'low').length || 0,
      color: '#10b981' 
    },
    { 
      name: 'Medium Risk', 
      value: churnPredictions?.churnPredictions?.filter(c => c.riskLevel === 'medium').length || 0,
      color: '#f59e0b' 
    },
    { 
      name: 'High Risk', 
      value: churnPredictions?.churnPredictions?.filter(c => c.riskLevel === 'high').length || 0,
      color: '#ef4444' 
    }
  ];

  const totalValueAtRisk = highRiskCustomers.reduce((sum, customer) => sum + customer.valueAtRisk, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground">AI-powered insights from your real business data</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Brain className="w-4 h-4 mr-1" />
          AI Engine Active
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Value Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topLeads.filter(l => l.score >= 80).length}</div>
            <p className="text-xs text-muted-foreground">
              Leads scoring 80+ points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              Customers at high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValueAtRisk.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From high-risk customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Confidence</CardTitle>
            {forecast.trends?.direction === 'up' ? 
              <TrendingUp className="h-4 w-4 text-green-600" /> : 
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.confidence || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Revenue prediction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Lead Scoring</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Lead Scores</CardTitle>
                <CardDescription>Real-time scoring from your database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={leadScoreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Recommendations</CardTitle>
                <CardDescription>AI-generated action items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLeads.slice(0, 3).map((lead) => (
                    <div key={lead.leadId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={lead.priority === 'high' ? 'destructive' : lead.priority === 'medium' ? 'default' : 'secondary'}>
                            {lead.priority}
                          </Badge>
                          <span className="font-medium">Lead #{lead.leadId}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.recommendation}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Score: {lead.score}</span>
                          <Progress value={lead.score} className="w-20" />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Distribution</CardTitle>
                <CardDescription>Customer risk levels from real data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={churnRiskData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {churnRiskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Risk Customers</CardTitle>
                <CardDescription>Immediate attention required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highRiskCustomers.slice(0, 3).map((customer) => (
                    <div key={customer.customerId} className="p-3 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{customer.customerName}</span>
                        <Badge variant="destructive">{customer.churnProbability}% risk</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Value at risk: ${customer.valueAtRisk.toLocaleString()}
                      </p>
                      <div className="text-xs space-y-1">
                        {customer.riskFactors.slice(0, 2).map((factor, index) => (
                          <div key={index} className="text-red-600">• {factor}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>AI predictions from actual opportunities data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">${forecast.predictedRevenue?.toLocaleString() || 0}</div>
                  <p className="text-sm text-muted-foreground">Predicted Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{forecast.confidence || 0}%</div>
                  <p className="text-sm text-muted-foreground">Confidence Level</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${forecast.trends?.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {forecast.trends?.direction === 'up' ? '+' : ''}{forecast.trends?.percentage?.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Growth Trend</p>
                </div>
              </div>

              {forecast.breakdown && (
                <div className="space-y-3">
                  <h4 className="font-medium">Revenue Breakdown by Stage</h4>
                  {forecast.breakdown.map((stage) => (
                    <div key={stage.category} className="flex items-center justify-between">
                      <span className="text-sm">{stage.category}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={stage.probability} className="w-20" />
                        <span className="text-sm font-medium">${stage.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}