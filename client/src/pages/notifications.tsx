import { useNotifications, Notification } from "@/hooks/use-notifications";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  User,
} from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const { 
    notifications, 
    messages, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    markMessageAsRead,
    markAllMessagesAsRead,
    isLoading,
    refresh
  } = useNotifications();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'task':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'meeting':
        return <Calendar className="h-5 w-5 text-secondary" />;
      case 'opportunity':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
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

  const handleMarkAllAsRead = () => {
    if (activeTab === "messages") {
      markAllMessagesAsRead();
    } else {
      markAllNotificationsAsRead();
    }
    
    toast({
      title: `Marked all ${activeTab === "messages" ? "messages" : "notifications"} as read`,
      description: "All items have been marked as read",
    });
  };

  const handleRefresh = () => {
    refresh();
    
    toast({
      title: "Refreshed",
      description: "Notification list has been refreshed",
    });
  };

  const filteredNotifications = activeTab === "all" ? notifications 
    : activeTab === "unread" ? notifications.filter(n => !n.read)
    : [];

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            disabled={
              (activeTab === "messages" && messages.filter(m => !m.read).length === 0) || 
              (activeTab !== "messages" && filteredNotifications.filter(n => !n.read).length === 0)
            }
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="ghost" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <NotificationsLoadingSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState type="notifications" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>Your recent system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 flex items-start gap-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-accent/10' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`text-base ${!notification.read ? 'font-medium' : ''}`}>{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            {!notification.read && <Badge variant="outline">New</Badge>}
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                        {notification.link && (
                          <div className="flex items-center mt-2 text-xs text-primary hover:underline">
                            <span>View details</span>
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="space-y-4 mt-6">
          {isLoading ? (
            <NotificationsLoadingSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState type="unread" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Unread Notifications</CardTitle>
                <CardDescription>Notifications that you haven't read yet</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 flex items-start gap-4 hover:bg-muted/50 cursor-pointer transition-colors bg-accent/10`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">New</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                        {notification.link && (
                          <div className="flex items-center mt-2 text-xs text-primary hover:underline">
                            <span>View details</span>
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="messages" className="space-y-4 mt-6">
          {isLoading ? (
            <MessagesLoadingSkeleton />
          ) : messages.length === 0 ? (
            <EmptyState type="messages" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Recent messages from contacts and colleagues</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 flex items-start gap-4 hover:bg-muted/50 cursor-pointer transition-colors ${!message.read ? 'bg-accent/10' : ''}`}
                      onClick={() => {
                        if (!message.read) {
                          markMessageAsRead(message.id);
                        }
                        setLocation('/communication-center');
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        {message.sender.avatar ? (
                          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`text-base ${!message.read ? 'font-medium' : ''}`}>
                            {message.sender.name}
                            {message.urgent && (
                              <Badge variant="destructive" className="ml-2">Urgent</Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!message.read && <Badge variant="outline">New</Badge>}
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{message.content}</p>
                        <div className="flex items-center mt-2 text-xs text-primary hover:underline">
                          <span>Open in communication center</span>
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ type }: { type: 'notifications' | 'unread' | 'messages' }) {
  return (
    <div className="text-center py-12">
      {type === 'messages' ? (
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
      ) : (
        <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
      )}
      <h3 className="text-xl font-medium mb-2">No {type} to display</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {type === 'unread' 
          ? "You're all caught up! There are no unread notifications at the moment." 
          : type === 'messages'
            ? "You don't have any messages yet. When you receive messages, they will appear here."
            : "You don't have any notifications yet. When you receive notifications, they will appear here."}
      </p>
    </div>
  );
}

function NotificationsLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[250px] mt-2" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MessagesLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[250px] mt-2" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}