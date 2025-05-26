import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";

export default function AnalyticsSection() {
  // Simple analytics using existing endpoints
  const { data: leads } = useQuery({ queryKey: ['/api/leads'] });
  const { data: contacts } = useQuery({ queryKey: ['/api/contacts'] });
  const { data: opportunities } = useQuery({ queryKey: ['/api/opportunities'] });

  // Calculate basic insights from real data
  const totalLeads = Array.isArray(leads) ? leads.length : 0;
  const totalContacts = Array.isArray(contacts) ? contacts.length : 0;
  const totalOpportunities = Array.isArray(opportunities) ? opportunities.length : 0;

  // Calculate revenue pipeline from real opportunities
  const totalRevenue = Array.isArray(opportunities) 
    ? opportunities.reduce((sum: number, opp: any) => {
        const amount = parseFloat(opp.amount || 0);
        return sum + amount;
      }, 0)
    : 0;

  // Lead conversion rate
  const conversionRate = totalLeads > 0 ? ((totalOpportunities / totalLeads) * 100).toFixed(1) : "0";

  // Recent activity analysis
  const recentLeads = Array.isArray(leads) 
    ? leads.filter((lead: any) => {
        const created = new Date(lead.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
      }).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Business Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {recentLeads} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Leads to opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Total database
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Analysis</CardTitle>
            <CardDescription>Recent lead activity and scoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(leads) && leads.slice(0, 5).map((lead: any, index) => (
                <div key={lead.id || index} className="flex items-center justify-between">
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
                <p className="text-muted-foreground">No leads found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Opportunities</CardTitle>
            <CardDescription>High-value prospects and pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(opportunities) && opportunities
                .sort((a: any, b: any) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0))
                .slice(0, 5)
                .map((opp: any, index) => (
                <div key={opp.id || index} className="flex items-center justify-between">
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
                <p className="text-muted-foreground">No opportunities found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Business Insights
          </CardTitle>
          <CardDescription>Key findings from your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900">Lead Generation Performance</p>
              <p className="text-sm text-blue-700">
                You have {totalLeads} leads with a {conversionRate}% conversion rate. 
                {recentLeads > 0 ? ` ${recentLeads} new leads this week shows good momentum.` : ' Consider increasing lead generation activities.'}
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-900">Revenue Pipeline</p>
              <p className="text-sm text-green-700">
                Total pipeline value is ${totalRevenue.toLocaleString()} across {totalOpportunities} opportunities.
                {totalRevenue > 100000 ? ' Strong pipeline showing healthy business growth.' : ' Focus on increasing deal sizes and volume.'}
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900">Database Health</p>
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