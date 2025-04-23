import { formatDistanceToNow } from "date-fns";
import { BarChart3, MessageSquare, UserPlus, Clock, File } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  action: string;
  detail?: string;
  icon?: string;
  timestamp: string;
  relatedToType?: string;
  relatedToId?: number;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 p-4">
        <Clock className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-center text-muted-foreground">No recent activities</p>
      </div>
    );
  }

  // Get icon based on activity action
  const getIcon = (activity: Activity) => {
    if (activity.icon) {
      // If custom icon is provided
      return activity.icon;
    }

    const action = activity.action.toLowerCase();

    if (action.includes('lead') || action.includes('contact')) {
      return <UserPlus className="h-4 w-4" />;
    } else if (action.includes('opportunity') || action.includes('deal')) {
      return <BarChart3 className="h-4 w-4" />;
    } else if (action.includes('message') || action.includes('email')) {
      return <MessageSquare className="h-4 w-4" />;
    } else if (action.includes('proposal') || action.includes('document')) {
      return <File className="h-4 w-4" />;
    }

    // Default icon
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        // Format timestamp to relative time (e.g., "2 hours ago")
        const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
        
        // Get first letters of name for avatar fallback
        const nameParts = activity.user?.name?.split(' ') || ['U'];
        const initials = nameParts.map(part => part[0]).join('').toUpperCase();
        
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              {activity.user?.avatar ? (
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">
                  {activity.user?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {timeAgo}
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">
                  {getIcon(activity)}
                </span>
                <span>
                  {activity.action}
                  {activity.detail && (
                    <span className="text-muted-foreground"> - {activity.detail}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}