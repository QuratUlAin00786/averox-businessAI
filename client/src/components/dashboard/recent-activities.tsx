import { SimpleButton } from "@/components/ui/simple-button";
import { PlusCircle, CheckCircle, MessageCircle, Calendar } from "lucide-react";
import { DashboardActivity } from "@/lib/data";
import { useLanguage } from "@/hooks/use-language";
import { TooltipStepHelper } from "@/components/ui/tooltip-helper";

interface RecentActivitiesProps {
  activities: DashboardActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const { t } = useLanguage();
  const getIconByType = (type: string | null = "added") => {
    switch (type) {
      case "added":
        return <PlusCircle className="w-5 h-5 text-primary" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "commented":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "scheduled":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <PlusCircle className="w-5 h-5 text-primary" />;
    }
  };

  const getIconBgByType = (type: string | null = "added") => {
    switch (type) {
      case "added":
        return "bg-primary/10";
      case "completed":
        return "bg-green-500/10";
      case "commented":
        return "bg-blue-500/10";
      case "scheduled":
        return "bg-purple-500/10";
      default:
        return "bg-primary/10";
    }
  };

  return (
    <div className="h-full overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-neutral-200 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <h3 className="text-lg font-medium leading-6 text-neutral-700">{t.dashboard.recentActivities}</h3>
            <TooltipStepHelper 
              steps={[
                {
                  title: t.dashboard.recentActivities,
                  content: t.tooltips.dashboard.activities
                },
                {
                  title: t.general.actions,
                  content: "Click on any activity to view details and related actions"
                },
                {
                  title: t.buttons.filter,
                  content: "Use the filter options to sort activities by type, date, or user"
                }
              ]}
              side="right" 
              className="ml-2"
              iconSize={18}
            />
          </div>
          <SimpleButton 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => {
              // Navigate to activities page
              window.location.hash = '/activities';
            }}
          >
            {t.dashboard.viewAll}
          </SimpleButton>
        </div>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="flow-root">
          {activities.length > 0 ? (
            <ul className="-mb-8">
              {activities.map((activity, index) => {
                const isLast = index === activities.length - 1;
                return (
                <li key={activity.id}>
                  <div className="relative pb-6">
                    {!isLast && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex items-start space-x-3 group cursor-pointer" 
                         onClick={() => window.alert(`Viewing details for activity: ${activity.action}`)}>
                      <div className="relative flex-shrink-0">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getIconBgByType(activity.icon)}`}>
                          {getIconByType(activity.icon)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-medium text-neutral-700">{activity.user.name}</span>{" "}
                          <span>{activity.action}</span>
                        </div>
                        {activity.detail && (
                          <p className="mt-0.5 text-sm text-neutral-500">
                            {activity.detail}
                          </p>
                        )}
                        <div className="mt-1 text-xs text-neutral-500">
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )})}
            </ul>
          ) : (
            <div className="py-6 text-center text-neutral-500">
              <p>{t.dashboard.noActivities}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
