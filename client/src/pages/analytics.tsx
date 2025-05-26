import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, AlertTriangle, Target, BarChart3, PieChart, LineChart } from "lucide-react";

export default function AnalyticsPage() {
  // Fetch real data from your database
  const { data: leads, isLoading: leadsLoading } = useQuery({ queryKey: ['/api/leads'] });
  const { data: contacts, isLoading: contactsLoading } = useQuery({ queryKey: ['/api/contacts'] });
  const { data: opportunities, isLoading: opportunitiesLoading } = useQuery({ queryKey: ['/api/opportunities'] });

  if (leadsLoading || contactsLoading || opportunitiesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate real metrics from your actual database data
  const totalLeads = Array.isArray(leads) ? leads.length : 0;
  const totalContacts = Array.isArray(contacts) ? contacts.length : 0;
  const totalOpportunities = Array.isArray(opportunities) ? opportunities.length : 0;

  // Calculate real revenue pipeline
  const totalRevenue = Array.isArray(opportunities) 
    ? opportunities.reduce((sum: number, opp: any) => {
        const amount = parseFloat(opp.amount || 0);
        return sum + amount;
      }, 0)
    : 0;

  // Real conversion rate calculation
  const conversionRate = totalLeads > 0 ? ((totalOpportunities / totalLeads) * 100).toFixed(1) : "0";

  // Recent activity analysis
  const recentLeads = Array.isArray(leads) 
    ? leads.filter((lead: any) => {
        const created = new Date(lead.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
      }).length
    : 0;

  // Pipeline analysis by stage
  const pipelineByStage = Array.isArray(opportunities) 
    ? opportunities.reduce((acc: any, opp: any) => {
        const stage = opp.stage || 'Unknown';
        const amount = parseFloat(opp.amount || 0);
        acc[stage] = (acc[stage] || 0) + amount;
        return acc;
      }, {})
    : {};

  // Lead sources analysis
  const leadSources = Array.isArray(leads)
    ? leads.reduce((acc: any, lead: any) => {
        const source = lead.source || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600">Real-time insights from your database</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              +{recentLeads} new this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Leads to opportunities
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalOpportunities} active opportunities
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Total database contacts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Lead Sources
            </CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(leadSources).map(([source, count]: [string, any]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${totalLeads > 0 ? (count / totalLeads) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(leadSources).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No lead source data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Pipeline by Stage
            </CardTitle>
            <CardDescription>Revenue distribution across sales stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(pipelineByStage).map(([stage, amount]: [string, any]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">${amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {Object.keys(pipelineByStage).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No pipeline data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Lead Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lead Activity</CardTitle>
            <CardDescription>Latest leads with status information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(leads) && leads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-sm text-muted-foreground">{lead.company || 'No company'}</p>
                  </div>
                  <Badge variant={lead.status === 'Converted' ? 'default' : 'secondary'}>
                    {lead.status || 'New'}
                  </Badge>
                </div>
              ))}
              {(!Array.isArray(leads) || leads.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No recent leads found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Opportunities</CardTitle>
            <CardDescription>Highest value prospects in your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(opportunities) && opportunities
                .sort((a: any, b: any) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0))
                .slice(0, 5)
                .map((opp: any) => (
                <div key={opp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{opp.name || 'Untitled Opportunity'}</p>
                    <p className="text-sm text-muted-foreground">{opp.stage || 'Unknown stage'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${parseFloat(opp.amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{opp.probability || 50}% likely</p>
                  </div>
                </div>
              ))}
              {(!Array.isArray(opportunities) || opportunities.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No opportunities found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            AI-Powered Business Insights
          </CardTitle>
          <CardDescription>Actionable recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
              <h4 className="font-medium text-blue-900 mb-2">Lead Generation Performance</h4>
              <p className="text-sm text-blue-700">
                You have {totalLeads} leads with a {conversionRate}% conversion rate. 
                {recentLeads > 0 ? ` ${recentLeads} new leads this week shows good momentum.` : ' Consider increasing lead generation activities.'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
              <h4 className="font-medium text-green-900 mb-2">Revenue Pipeline</h4>
              <p className="text-sm text-green-700">
                Total pipeline value is ${totalRevenue.toLocaleString()} across {totalOpportunities} opportunities.
                {totalRevenue > 100000 ? ' Strong pipeline showing healthy business growth.' : ' Focus on increasing deal sizes and volume.'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-l-purple-500">
              <h4 className="font-medium text-purple-900 mb-2">Database Health</h4>
              <p className="text-sm text-purple-700">
                You have {totalContacts} contacts in your database.
                {totalContacts > 50 ? ' Good contact base for relationship building.' : ' Consider expanding your contact network.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}