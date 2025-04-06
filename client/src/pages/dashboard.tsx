import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Download, 
  Plus 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SimpleButton } from "@/components/ui/simple-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { LeadsStatCard } from "@/components/dashboard/leads-stat-card";
import { SalesPipeline } from "@/components/dashboard/sales-pipeline";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { MyTasks } from "@/components/dashboard/my-tasks";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { getDashboardData } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Function to get a greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.goodMorning;
    if (hour < 18) return t.dashboard.goodAfternoon;
    return t.dashboard.goodEvening;
  };

  useEffect(() => {
    // Format date based on language
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));
  }, [language]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: getDashboardData,
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-600 sm:text-3xl sm:truncate">
              {getGreeting()}{user?.firstName ? `, ${user.firstName}` : ''}
            </h2>
            <div className="flex flex-col mt-1 sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="flex items-center mt-2 text-sm text-neutral-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {t.dashboard.today}, <span>{currentDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row mt-4 gap-2 sm:gap-3 md:mt-0 md:ml-4">
            <SimpleButton 
              variant="outline" 
              className="text-primary border-primary hover:bg-primary/10 w-full sm:w-auto"
              onClick={() => {
                try {
                  // Verify data is available and has expected structure
                  if (!data || !data.stats || !Array.isArray(data.stats)) {
                    window.alert("No dashboard data available to export");
                    return;
                  }
                  
                  // Basic dashboard information
                  let csvRows = [];
                  
                  // Add stats section
                  csvRows.push(["Dashboard Statistics"]);
                  csvRows.push(["Metric", "Value", "Change"]);
                  
                  data.stats.forEach(stat => {
                    csvRows.push([
                      stat.title,
                      stat.value,
                      `${stat.change.value} (${stat.change.trend === 'up' ? 'Increase' : stat.change.trend === 'down' ? 'Decrease' : 'No change'})`
                    ]);
                  });
                  
                  // Add pipeline data
                  if (data.pipelineStages && data.pipelineStages.length > 0) {
                    csvRows.push([]);
                    csvRows.push(["Sales Pipeline"]);
                    csvRows.push(["Stage", "Value", "Percentage"]);
                    
                    data.pipelineStages.forEach(stage => {
                      csvRows.push([
                        stage.name,
                        stage.value,
                        `${stage.percentage}%`
                      ]);
                    });
                  }
                  
                  // Add recent activities
                  if (data.recentActivities && data.recentActivities.length > 0) {
                    csvRows.push([]);
                    csvRows.push(["Recent Activities"]);
                    csvRows.push(["User", "Action", "Time"]);
                    
                    data.recentActivities.forEach(activity => {
                      csvRows.push([
                        activity.user.name,
                        activity.action,
                        activity.time
                      ]);
                    });
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
                  link.setAttribute("download", `averox_crm_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
                  
                  // Append link, trigger download, then clean up
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  
                  console.log("Export completed successfully");
                } catch (error) {
                  console.error("Export failed:", error);
                  window.alert("Failed to export dashboard data. Please try again.");
                }
              }}
              type="button"
            >
              <Download className="-ml-1 mr-2 h-5 w-5 text-primary" />
              <span>{t.buttons.export}</span>
            </SimpleButton>
            <SimpleButton 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                const reportTypes = [
                  "Sales Performance", 
                  "Lead Conversion", 
                  "Customer Engagement", 
                  "Team Activity"
                ];
                
                const reportType = window.prompt(
                  `Select a report type (enter number):\n${reportTypes.map((type, i) => `${i + 1}. ${type}`).join('\n')}`, 
                  "1"
                );
                
                if (!reportType) return;
                
                const selectedIndex = parseInt(reportType) - 1;
                if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= reportTypes.length) {
                  window.alert("Invalid selection. Please try again.");
                  return;
                }
                
                const selectedReport = reportTypes[selectedIndex];
                window.alert(`Creating new ${selectedReport} report...\nNavigating to reports page.`);
                setLocation("/reports?new=true&type=" + encodeURIComponent(selectedReport));
              }}
              type="button"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              <span>{t.buttons.add} {t.navigation.reports}</span>
            </SimpleButton>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        {error ? (
          <div className="p-4 mt-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
            <h3 className="text-lg font-medium">Error loading dashboard data</h3>
            <p className="mt-1">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          </div>
        ) : isLoading ? (
          // Loading state with skeletons
          <>
            {/* Stats Card Skeletons */}
            <div className="grid grid-cols-1 gap-6 mt-4 sm:gap-5 sm:mt-2 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex-shrink-0 mb-3 sm:mb-0">
                      <Skeleton className="h-20 w-20 sm:h-14 sm:w-14 rounded-md mx-auto sm:mx-0" />
                    </div>
                    <div className="flex-1 w-full sm:w-0 sm:ml-5 text-center sm:text-left">
                      <Skeleton className="h-8 w-32 mx-auto sm:mx-0" />
                      <Skeleton className="h-6 w-20 mt-2 mx-auto sm:mx-0" />
                      <Skeleton className="h-4 w-24 mt-2 mx-auto sm:mx-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Charts & Tables Skeletons */}
            <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
              <div className="p-6 bg-white rounded-lg shadow">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-[250px] w-full rounded-md" />
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Loaded state with actual data
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 mt-4 sm:gap-5 sm:mt-2 sm:grid-cols-2 lg:grid-cols-4">
              {data?.stats.map((stat, index) => {
                const icons = [UserPlus, TrendingUp, DollarSign, Briefcase];
                const colors = ["primary", "secondary", "accent", "info"] as const;
                
                // Use special card for New Leads (typically first card)
                if (index === 0 && stat.title === "New Leads") {
                  return (
                    <LeadsStatCard
                      key={stat.id}
                      value={stat.value}
                      change={stat.change}
                    />
                  );
                }
                
                // Use standard card for all other stats
                return (
                  <StatCard
                    key={stat.id}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                    icon={icons[index % icons.length]}
                    iconColor={colors[index % colors.length]}
                  />
                );
              })}
            </div>
            
            {/* Charts & Tables Section */}
            <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
              <SalesPipeline stages={data?.pipelineStages || []} />
              <RecentActivities activities={data?.recentActivities || []} />
            </div>
            
            {/* Tasks and Upcoming Events */}
            <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
              <MyTasks tasks={data?.myTasks || []} />
              <UpcomingEvents events={data?.upcomingEvents || []} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
