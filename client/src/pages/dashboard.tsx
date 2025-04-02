import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { SalesPipeline } from "@/components/dashboard/sales-pipeline";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { MyTasks } from "@/components/dashboard/my-tasks";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { getDashboardData } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));
  }, []);

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
              Dashboard
            </h2>
            <div className="flex flex-col mt-1 sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="flex items-center mt-2 text-sm text-neutral-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Today, <span>{currentDate}</span>
              </div>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <SimpleButton 
              variant="outline" 
              className="text-neutral-600"
              onClick={() => window.alert("Exporting dashboard data to CSV/Excel...")}
              type="button"
            >
              <Download className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
              Export
            </SimpleButton>
            <SimpleButton 
              className="ml-3"
              onClick={() => window.alert("Opening new report creation form...")}
              type="button"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Report
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
            <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-20 mt-4" />
                  <Skeleton className="h-4 w-24 mt-2" />
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
            <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
              {data?.stats.map((stat, index) => {
                const icons = [UserPlus, TrendingUp, DollarSign, Briefcase];
                const colors = ["primary", "secondary", "accent", "info"] as const;
                
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
