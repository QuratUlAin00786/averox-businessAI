import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";
import { Bell, Check, CheckCheck, Calendar, Clock, FileText, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationDropdown() {
  const [, setLocation] = useLocation();
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isLoading
  } = useNotifications();
  
  // Get appropriate icon for notification type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'task':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-secondary" />;
      case 'opportunity':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    if (notification.link) {
      setLocation(notification.link);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="p-1 ml-3 text-neutral-400 hover:text-neutral-500 relative">
          <span className="sr-only">View notifications</span>
          <Bell className="w-6 h-6" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-destructive text-white text-xs rounded-full font-semibold">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadNotificationCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllNotificationsAsRead()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500">
              No notifications to display
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`cursor-pointer p-3 flex items-start gap-3 ${!notification.read ? 'bg-accent/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                      {notification.description}
                    </p>
                    <div className="flex items-center mt-1 gap-3">
                      <span className="text-xs text-neutral-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.read && (
                        <span className="flex items-center text-xs text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer justify-center text-center text-primary"
          onClick={() => setLocation("/notifications")}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}