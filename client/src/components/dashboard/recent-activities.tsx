import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, CheckCircle, MessageCircle, UserPlus } from "lucide-react";

interface Activity {
  id: number;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  action: string;
  detail: string;
  time: string;
  icon: "added" | "completed" | "commented" | "scheduled";
  isLast?: boolean;
}

export function RecentActivities() {
  const activities: Activity[] = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        initials: "SJ"
      },
      action: "created a new lead",
      detail: "Acme Corporation - Technology Services",
      time: "35 minutes ago",
      icon: "added"
    },
    {
      id: 2,
      user: {
        name: "Michael Davis",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        initials: "MD"
      },
      action: "completed a task",
      detail: "Follow-up call with GlobalTech Inc.",
      time: "2 hours ago",
      icon: "completed"
    },
    {
      id: 3,
      user: {
        name: "Emily Wilson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        initials: "EW"
      },
      action: "added a comment",
      detail: "On Bright Solutions proposal",
      time: "5 hours ago",
      icon: "commented"
    },
    {
      id: 4,
      user: {
        name: "Robert Thompson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        initials: "RT"
      },
      action: "scheduled a meeting",
      detail: "With Innovative Systems team on Friday",
      time: "Yesterday at 2:30 PM",
      icon: "scheduled",
      isLast: true
    }
  ];

  const getIconByType = (type: Activity["icon"]) => {
    switch (type) {
      case "added":
        return <PlusCircle className="w-5 h-5 text-primary" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-secondary" />;
      case "commented":
        return <MessageCircle className="w-5 h-5 text-accent" />;
      case "scheduled":
        return <UserPlus className="w-5 h-5 text-info" />;
    }
  };

  const getIconBgByType = (type: Activity["icon"]) => {
    switch (type) {
      case "added":
        return "bg-primary-light bg-opacity-20";
      case "completed":
        return "bg-secondary-light bg-opacity-20";
      case "commented":
        return "bg-accent bg-opacity-20";
      case "scheduled":
        return "bg-info bg-opacity-20";
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-neutral-700">Recent Activities</h3>
          <div>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              View All
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {!activity.isLast && (
                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getIconBgByType(activity.icon)}`}>
                        {getIconByType(activity.icon)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-neutral-700">{activity.user.name}</a> {activity.action}
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
