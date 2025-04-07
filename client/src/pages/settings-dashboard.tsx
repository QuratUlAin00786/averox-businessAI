import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Save, PieChart, BarChart, LineChart, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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