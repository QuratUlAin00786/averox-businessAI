import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

// Types for the notifications system
export interface Notification {
  id: number;
  type: 'task' | 'meeting' | 'opportunity' | 'system' | 'message';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
  urgent?: boolean;
}

interface NotificationsContextType {
  notifications: Notification[];
  messages: Message[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
  markNotificationAsRead: (id: number) => void;
  markMessageAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  markAllMessagesAsRead: () => void;
  refresh: () => void;
  isLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Query for notification data
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
          throw new Error('Failed to fetch notifications');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [] };
      }
    },
    enabled: !!user,
  });
  
  // Query for messages data
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['/api/communications/unread'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/communications/unread');
        if (!res.ok) {
          throw new Error('Failed to fetch messages');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching messages:', error);
        return { messages: [] };
      }
    },
    enabled: !!user,
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
    }
  }, [notificationsData]);
  
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);
  
  // Calculate unread counts
  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const unreadMessageCount = messages.filter(m => !m.read).length;
  
  // Functions to mark items as read
  const markNotificationAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markMessageAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/communications/${id}/read`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setMessages(prev => 
          prev.map(m => m.id === id ? { ...m, read: true } : m)
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  const markAllNotificationsAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const markAllMessagesAsRead = async () => {
    try {
      const res = await fetch('/api/communications/read-all', {
        method: 'PUT',
      });
      
      if (res.ok) {
        setMessages(prev => 
          prev.map(m => ({ ...m, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };
  
  // Function to refresh data
  const refresh = () => {
    refetchNotifications();
    refetchMessages();
  };
  
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        messages,
        unreadNotificationCount,
        unreadMessageCount,
        markNotificationAsRead,
        markMessageAsRead,
        markAllNotificationsAsRead,
        markAllMessagesAsRead,
        refresh,
        isLoading: isLoadingNotifications || isLoadingMessages,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}