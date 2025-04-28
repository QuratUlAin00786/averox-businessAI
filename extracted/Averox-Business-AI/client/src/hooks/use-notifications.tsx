import { createContext, ReactNode, useContext, useCallback, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type Notification = {
  id: number;
  type: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  link?: string;
};

export type Message = {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar: string | null;
  };
  content: string;
  read: boolean;
  createdAt: string;
  urgent?: boolean;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadNotificationsCount: number;
  messages: Message[];
  unreadMessagesCount: number;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  markMessageAsRead: (id: number) => void;
  markAllMessagesAsRead: () => void;
  isLoading: boolean;
  refresh: () => void;
};

export const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/notifications");
      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return await res.json();
    },
    staleTime: 30000, // 30 seconds
  });

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages");
      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }
      return await res.json();
    },
    staleTime: 30000, // 30 seconds
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(["/api/notifications"], (prevData) => {
        if (!prevData) return [];
        return prevData.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        );
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark notification as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(["/api/notifications"], (prevData) => {
        if (!prevData) return [];
        return prevData.map((notification) => ({ ...notification, read: true }));
      });
      
      toast({
        title: "All notifications marked as read",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark all notifications as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markMessageAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/messages/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Message[]>(["/api/messages"], (prevData) => {
        if (!prevData) return [];
        return prevData.map((message) =>
          message.id === id ? { ...message, read: true } : message
        );
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark message as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAllMessagesAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/messages/read-all");
    },
    onSuccess: () => {
      queryClient.setQueryData<Message[]>(["/api/messages"], (prevData) => {
        if (!prevData) return [];
        return prevData.map((message) => ({ ...message, read: true }));
      });
      
      toast({
        title: "All messages marked as read",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark all messages as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchNotifications(), refetchMessages()]);
    setIsRefreshing(false);
  }, [refetchNotifications, refetchMessages]);

  const unreadNotificationsCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;
  const unreadMessagesCount = Array.isArray(messages) ? messages.filter((m) => !m.read).length : 0;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadNotificationsCount,
        messages,
        unreadMessagesCount,
        markNotificationAsRead: markNotificationAsReadMutation.mutate,
        markAllNotificationsAsRead: markAllNotificationsAsReadMutation.mutate,
        markMessageAsRead: markMessageAsReadMutation.mutate,
        markAllMessagesAsRead: markAllMessagesAsReadMutation.mutate,
        isLoading: isLoadingNotifications || isLoadingMessages || isRefreshing,
        refresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}