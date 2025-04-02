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
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesPipeline } from "@/components/dashboard/sales-pipeline";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { MyTasks } from "@/components/dashboard/my-tasks";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "MMMM d, yyyy"));
  }, []);

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
            <Button variant="outline" className="text-neutral-600">
              <Download className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
              Export
            </Button>
            <Button className="ml-3">
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Report
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 mx-auto mt-6 max-w-7xl sm:px-6 md:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Leads"
            value="34"
            change={{ value: "+12%", trend: "up", text: "from last week" }}
            icon={UserPlus}
            iconColor="primary"
          />
          <StatCard
            title="Conversion Rate"
            value="28.5%"
            change={{ value: "+5.4%", trend: "up", text: "from last month" }}
            icon={TrendingUp}
            iconColor="secondary"
          />
          <StatCard
            title="Revenue"
            value="$24,563"
            change={{ value: "-2.3%", trend: "down", text: "from last month" }}
            icon={DollarSign}
            iconColor="accent"
          />
          <StatCard
            title="Open Deals"
            value="18"
            change={{ value: "+4", trend: "up", text: "from last week" }}
            icon={Briefcase}
            iconColor="info"
          />
        </div>
        
        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
          <SalesPipeline />
          <RecentActivities />
        </div>
        
        {/* Tasks and Upcoming Events */}
        <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-2">
          <MyTasks />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}
