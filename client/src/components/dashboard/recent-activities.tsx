import { Button } from "@/components/ui/button";
import { DashboardButton } from "@/components/ui/dashboard-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, CheckCircle, MessageCircle, UserPlus, Calendar } from "lucide-react";
import { DashboardActivity } from "@/lib/data";

interface RecentActivitiesProps {
  activities: DashboardActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getIconByType = (type: string | null = "added") => {
    switch (type) {
      case "added":
        return <PlusCircle className="w-5 h-5 text-primary" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-secondary" />;
      case "commented":
        return <MessageCircle className="w-5 h-5 text-accent" />;
      case "scheduled":
        return <Calendar className="w-5 h-5 text-info" />;
      default:
        return <PlusCircle className="w-5 h-5 text-primary" />;
    }
  };

  const getIconBgByType = (type: string | null = "added") => {
    switch (type) {
      case "added":
        return "bg-primary bg-opacity-10";
      case "completed":
        return "bg-secondary bg-opacity-10";
      case "commented":
        return "bg-accent bg-opacity-10";
      case "scheduled":
        return "bg-info bg-opacity-10";
      default:
        return "bg-primary bg-opacity-10";
    }
  };

  // This function is replaced by DashboardButton's actionText

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700">Recent Activities</h3>
          <div>
            <DashboardButton 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              actionText="Opening all activities history..."
            >
              View All
            </DashboardButton>
          </div>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flow-root">
          {activities.length > 0 ? (
            <ul className="-mb-8">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {!activity.isLast && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                    )}
                    <DashboardButton
                      variant="ghost"
                      className="relative w-full p-0 h-auto hover:bg-neutral-50 focus:ring-0 text-left"
                      actionText={`Viewing details for activity: ${activity.action}`}
                    >
                      <div className="relative flex items-start space-x-3">
                        <div className="relative">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getIconBgByType(activity.icon)}`}>
                            {getIconByType(activity.icon)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div>
                            <div className="text-sm">
                              <span className="font-medium text-neutral-700">{activity.user.name}</span> {activity.action}
                            </div>
                            <p className="mt-0.5 text-sm text-neutral-500">
                              {activity.detail}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-neutral-500">
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </DashboardButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center text-neutral-500">
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
