import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
  userId: number;
}

export interface Message {
  id: number;
  content: string;
  read: boolean;
  urgent: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  recipientId: number;
}

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { 
    data: notifications = [], 
    isLoading: notificationsLoading 
  } = useQuery({
    queryKey: ["/api/notifications"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch messages
  const { 
    data: messages = [], 
    isLoading: messagesLoading 
  } = useQuery({
    queryKey: ["/api/messages"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate unread counts
  const unreadNotificationsCount = Array.isArray(notifications) 
    ? notifications.filter((n: Notification) => !n.read).length 
    : 0;

  const unreadMessagesCount = Array.isArray(messages) 
    ? messages.filter((m: Message) => !m.read).length 
    : 0;

  // Mark notification as read
  const markNotificationAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  // Mark all notifications as read
  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    },
  });

  // Mark message as read
  const markMessageAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    },
  });

  // Mark all messages as read
  const markAllMessagesAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/messages/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all messages as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Success",
        description: "All messages marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark all messages as read",
        variant: "destructive",
      });
    },
  });

  return {
    notifications,
    messages,
    unreadNotificationsCount,
    unreadMessagesCount,
    isLoading: notificationsLoading || messagesLoading,
    markNotificationAsRead: (id: number) => markNotificationAsReadMutation.mutate(id),
    markAllNotificationsAsRead: () => markAllNotificationsAsReadMutation.mutate(),
    markMessageAsRead: (id: number) => markMessageAsReadMutation.mutate(id),
    markAllMessagesAsRead: () => markAllMessagesAsReadMutation.mutate(),
  };
}