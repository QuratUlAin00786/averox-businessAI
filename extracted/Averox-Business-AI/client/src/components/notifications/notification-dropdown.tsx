import { useNotifications, Notification } from "@/hooks/use-notifications";
import { useLocation } from "wouter";
import { Bell, CheckCheck, FileText, Calendar, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationDropdown() {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    isLoading 
  } = useNotifications();
  const [, setLocation] = useLocation();
  
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
  
  const handleViewAllClick = () => {
    setLocation('/notifications');
  };
  
  // Show only the 5 most recent notifications
  const recentNotifications = Array.isArray(notifications) && notifications.length > 0 
    ? notifications.slice(0, 5) 
    : [];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadNotificationsCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center p-0">
              {unreadNotificationsCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1 px-2"
              onClick={() => markAllNotificationsAsRead()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start cursor-default py-2">
                  <div className="flex w-full items-start gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          ) : recentNotifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <>
              {recentNotifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`flex flex-col items-start cursor-pointer py-2 ${!notification.read ? 'bg-accent/10' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start gap-2">
                    <div className={`h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 w-full flex justify-between">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {!notification.read && (
                      <Badge variant="outline" className="text-xs h-4 px-1">New</Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="outline" className="w-full text-center" onClick={handleViewAllClick}>
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}