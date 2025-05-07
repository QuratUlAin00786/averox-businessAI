import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Save, PieChart, BarChart, LineChart, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardSettingsPage() {
  const { t, language } = useLanguage();
  const { settings, updateDashboardWidgets, updateDashboardChartType, updateDashboardTimeRange, saveSettings, isUpdating, isLoading } = useSystemSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings();
      toast({
        title: t('settings.saveSuccess'),
        description: t('settings.dashboardPreferencesSaved'),
      });
    } catch (error) {
      toast({
        title: t('settings.saveError'),
        description: t('settings.errorSavingPreferences'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard settings...</span>
      </div>
    );
  }
  
  // Add error state handling
  if (!settings) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard settings</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please try refreshing the page or check your authentication status.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{t('settings.dashboardPreferences')}</h2>
          <p className="text-muted-foreground">
            {t('settings.customizeDashboardExperience')}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isUpdating}>
          {(isSaving || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {t('common.save')}
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.widgetVisibility')}</CardTitle>
            <CardDescription>{t('dashboard.chooseWidgetsToDisplay')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-sales-pipeline">{t('dashboard.salesPipeline')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showSalesPipelineDesc')}</p>
              </div>
              <Switch 
                id="show-sales-pipeline" 
                checked={settings.dashboardPreferences.showSalesPipeline}
                onCheckedChange={(checked) => updateDashboardWidgets('showSalesPipeline', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-recent-activities">{t('dashboard.recentActivities')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showRecentActivitiesDesc')}</p>
              </div>
              <Switch 
                id="show-recent-activities" 
                checked={settings.dashboardPreferences.showRecentActivities}
                onCheckedChange={(checked) => updateDashboardWidgets('showRecentActivities', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-tasks">{t('dashboard.tasks')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showTasksDesc')}</p>
              </div>
              <Switch 
                id="show-tasks" 
                checked={settings.dashboardPreferences.showTasks}
                onCheckedChange={(checked) => updateDashboardWidgets('showTasks', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-events">{t('dashboard.events')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showEventsDesc')}</p>
              </div>
              <Switch 
                id="show-events" 
                checked={settings.dashboardPreferences.showEvents}
                onCheckedChange={(checked) => updateDashboardWidgets('showEvents', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Options */}
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Configure AI-powered personalized insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-ai-insights">Show AI Insights</Label>
                <p className="text-sm text-muted-foreground">Display AI-generated insights on your dashboard</p>
              </div>
              <Switch 
                id="show-ai-insights" 
                checked={settings.dashboardPreferences.showAIInsights}
                onCheckedChange={(checked) => updateDashboardWidgets('showAIInsights', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="ai-insights-count">Number of Insights</Label>
                <p className="text-sm text-muted-foreground">How many AI insights to display</p>
              </div>
              <Select
                value={settings.dashboardPreferences.aiInsightsCount.toString()}
                onValueChange={(value) => updateDashboardWidgets('aiInsightsCount', parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 insight</SelectItem>
                  <SelectItem value="2">2 insights</SelectItem>
                  <SelectItem value="3">3 insights</SelectItem>
                  <SelectItem value="4">4 insights</SelectItem>
                  <SelectItem value="5">5 insights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="ai-insight-types">Insight Types</Label>
                <p className="text-sm text-muted-foreground">What types of insights to generate</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="insight-leads" 
                    checked={settings.dashboardPreferences.aiInsightTypes.includes('leads')}
                    onCheckedChange={(checked) => {
                      const currentTypes = [...settings.dashboardPreferences.aiInsightTypes];
                      if (checked) {
                        if (!currentTypes.includes('leads')) {
                          currentTypes.push('leads');
                        }
                      } else {
                        const index = currentTypes.indexOf('leads');
                        if (index !== -1) {
                          currentTypes.splice(index, 1);
                        }
                      }
                      updateDashboardWidgets('aiInsightTypes', currentTypes);
                    }}
                  />
                  <Label htmlFor="insight-leads">Leads</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="insight-opportunities" 
                    checked={settings.dashboardPreferences.aiInsightTypes.includes('opportunities')}
                    onCheckedChange={(checked) => {
                      const currentTypes = [...settings.dashboardPreferences.aiInsightTypes];
                      if (checked) {
                        if (!currentTypes.includes('opportunities')) {
                          currentTypes.push('opportunities');
                        }
                      } else {
                        const index = currentTypes.indexOf('opportunities');
                        if (index !== -1) {
                          currentTypes.splice(index, 1);
                        }
                      }
                      updateDashboardWidgets('aiInsightTypes', currentTypes);
                    }}
                  />
                  <Label htmlFor="insight-opportunities">Opportunities</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="insight-customers" 
                    checked={settings.dashboardPreferences.aiInsightTypes.includes('customers')}
                    onCheckedChange={(checked) => {
                      const currentTypes = [...settings.dashboardPreferences.aiInsightTypes];
                      if (checked) {
                        if (!currentTypes.includes('customers')) {
                          currentTypes.push('customers');
                        }
                      } else {
                        const index = currentTypes.indexOf('customers');
                        if (index !== -1) {
                          currentTypes.splice(index, 1);
                        }
                      }
                      updateDashboardWidgets('aiInsightTypes', currentTypes);
                    }}
                  />
                  <Label htmlFor="insight-customers">Customers</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="insight-revenue" 
                    checked={settings.dashboardPreferences.aiInsightTypes.includes('revenue')}
                    onCheckedChange={(checked) => {
                      const currentTypes = [...settings.dashboardPreferences.aiInsightTypes];
                      if (checked) {
                        if (!currentTypes.includes('revenue')) {
                          currentTypes.push('revenue');
                        }
                      } else {
                        const index = currentTypes.indexOf('revenue');
                        if (index !== -1) {
                          currentTypes.splice(index, 1);
                        }
                      }
                      updateDashboardWidgets('aiInsightTypes', currentTypes);
                    }}
                  />
                  <Label htmlFor="insight-revenue">Revenue</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="insight-all" 
                    checked={settings.dashboardPreferences.aiInsightTypes.includes('all')}
                    onCheckedChange={(checked) => {
                      const currentTypes = [...settings.dashboardPreferences.aiInsightTypes];
                      if (checked) {
                        if (!currentTypes.includes('all')) {
                          currentTypes.push('all');
                        }
                      } else {
                        const index = currentTypes.indexOf('all');
                        if (index !== -1) {
                          currentTypes.splice(index, 1);
                        }
                      }
                      updateDashboardWidgets('aiInsightTypes', currentTypes);
                    }}
                  />
                  <Label htmlFor="insight-all">All Data (Comprehensive)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Statistics Options */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.statisticsOptions')}</CardTitle>
            <CardDescription>{t('dashboard.chooseStatsToDisplay')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-leads-stats">{t('dashboard.leadsStatistics')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showLeadsStatsDesc')}</p>
              </div>
              <Switch 
                id="show-leads-stats" 
                checked={settings.dashboardPreferences.showLeadsStats}
                onCheckedChange={(checked) => updateDashboardWidgets('showLeadsStats', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-conversion-stats">{t('dashboard.conversionStatistics')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showConversionStatsDesc')}</p>
              </div>
              <Switch 
                id="show-conversion-stats" 
                checked={settings.dashboardPreferences.showConversionStats}
                onCheckedChange={(checked) => updateDashboardWidgets('showConversionStats', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-revenue-stats">{t('dashboard.revenueStatistics')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showRevenueStatsDesc')}</p>
              </div>
              <Switch 
                id="show-revenue-stats" 
                checked={settings.dashboardPreferences.showRevenueStats}
                onCheckedChange={(checked) => updateDashboardWidgets('showRevenueStats', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="show-opportunities-stats">{t('dashboard.opportunitiesStatistics')}</Label>
                <p className="text-sm text-muted-foreground">{t('dashboard.showOpportunitiesStatsDesc')}</p>
              </div>
              <Switch 
                id="show-opportunities-stats" 
                checked={settings.dashboardPreferences.showOpportunitiesStats}
                onCheckedChange={(checked) => updateDashboardWidgets('showOpportunitiesStats', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart Type Options */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.chartTypeOptions')}</CardTitle>
            <CardDescription>{t('dashboard.selectVisualizationTypes')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="pipeline-chart-type">{t('dashboard.salesPipelineChartType')}</Label>
              <Select 
                value={settings.dashboardPreferences.pipelineChartType} 
                onValueChange={(value) => updateDashboardChartType('pipelineChartType', value as 'pie' | 'bar' | 'funnel')}
              >
                <SelectTrigger id="pipeline-chart-type" className="w-full">
                  <SelectValue placeholder={t('dashboard.selectChartType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pie">
                    <div className="flex items-center">
                      <PieChart className="mr-2 h-4 w-4" />
                      {t('dashboard.pieChart')}
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4" />
                      {t('dashboard.barChart')}
                    </div>
                  </SelectItem>
                  <SelectItem value="funnel">
                    <div className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('dashboard.funnelChart')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="revenue-chart-type">{t('dashboard.revenueChartType')}</Label>
              <Select 
                value={settings.dashboardPreferences.revenueChartType} 
                onValueChange={(value) => updateDashboardChartType('revenueChartType', value as 'line' | 'bar' | 'area')}
              >
                <SelectTrigger id="revenue-chart-type" className="w-full">
                  <SelectValue placeholder={t('dashboard.selectChartType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center">
                      <LineChart className="mr-2 h-4 w-4" />
                      {t('dashboard.lineChart')}
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4" />
                      {t('dashboard.barChart')}
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('dashboard.areaChart')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="leads-chart-type">{t('dashboard.leadsChartType')}</Label>
              <Select 
                value={settings.dashboardPreferences.leadsChartType} 
                onValueChange={(value) => updateDashboardChartType('leadsChartType', value as 'line' | 'bar' | 'area')}
              >
                <SelectTrigger id="leads-chart-type" className="w-full">
                  <SelectValue placeholder={t('dashboard.selectChartType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">
                    <div className="flex items-center">
                      <LineChart className="mr-2 h-4 w-4" />
                      {t('dashboard.lineChart')}
                    </div>
                  </SelectItem>
                  <SelectItem value="bar">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4" />
                      {t('dashboard.barChart')}
                    </div>
                  </SelectItem>
                  <SelectItem value="area">
                    <div className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('dashboard.areaChart')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Time Range Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.timeRangeSettings')}</CardTitle>
            <CardDescription>{t('dashboard.defaultTimeRangeDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="default-time-range">{t('dashboard.defaultTimeRange')}</Label>
              <Select 
                value={settings.dashboardPreferences.defaultTimeRange} 
                onValueChange={(value) => updateDashboardTimeRange(value as 'week' | 'month' | 'quarter' | 'year')}
              >
                <SelectTrigger id="default-time-range" className="w-full">
                  <SelectValue placeholder={t('dashboard.selectTimeRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('dashboard.week')}
                    </div>
                  </SelectItem>
                  <SelectItem value="month">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('dashboard.month')}
                    </div>
                  </SelectItem>
                  <SelectItem value="quarter">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('dashboard.quarter')}
                    </div>
                  </SelectItem>
                  <SelectItem value="year">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('dashboard.year')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {t('dashboard.timeRangeHelp')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isSaving || isUpdating}>
          {(isSaving || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('dashboard.applyChanges')}
        </Button>
      </div>
    </div>
  );
}