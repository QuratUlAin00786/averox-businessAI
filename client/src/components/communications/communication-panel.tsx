import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Send, MessageSquare, Mail, Phone } from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaLinkedin, FaTwitter, FaInstagram, FaSms } from 'react-icons/fa';

// Define types for our components
interface Communication {
  id: number;
  contactType: 'lead' | 'customer'; // Lead or Customer
  contactId: number;
  channel: string; // email, whatsapp, sms, phone, messenger, etc.
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  sentAt: string;
  receivedAt?: string;
  attachments?: Array<{name: string, url: string}>;
  contactDetails: ContactDetails;
}

interface ContactDetails {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  type: 'lead' | 'customer';
  socialProfiles?: {
    whatsapp?: string;
    messenger?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface CommunicationPanelProps {
  contactId: number;
  contactType: 'lead' | 'customer';
  contactName?: string;
  email?: string;
  phone?: string;
}

// Custom icon components for channels
const ChannelIcon = ({ channel }: { channel: string }) => {
  switch (channel.toLowerCase()) {
    case 'whatsapp':
      return <FaWhatsapp className="text-green-500" />;
    case 'messenger':
      return <FaFacebookMessenger className="text-blue-500" />;
    case 'email':
      return <Mail className="text-gray-500" />;
    case 'phone':
      return <Phone className="text-purple-500" />;
    case 'sms':
      return <FaSms className="text-orange-500" />;
    case 'twitter':
    case 'x':
      return <FaTwitter className="text-blue-400" />;
    case 'linkedin':
      return <FaLinkedin className="text-blue-700" />;
    case 'instagram':
      return <FaInstagram className="text-pink-500" />;
    default:
      return <MessageSquare className="text-gray-500" />;
  }
};

export function CommunicationPanel({ contactId, contactType, contactName = '', email = '', phone = '' }: CommunicationPanelProps) {
  const { toast } = useToast();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('email');
  const firstNameLastName = contactName?.split(' ') || ['', ''];
  const firstName = firstNameLastName[0] || '';
  const lastName = firstNameLastName.slice(1).join(' ') || '';

  // Query to fetch contact communications
  const {
    data: communications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Communication[]>({
    queryKey: ['/api/communications/contact', contactId, contactType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/communications/contact/${contactId}?type=${contactType}`);
      return response.json();
    },
    enabled: !!contactId && !!contactType
  });

  // Mutation to update communication status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/communications/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications/contact', contactId, contactType] });
      toast({
        title: "Status updated",
        description: "Communication status has been updated."
      });
    }
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      channel, 
      content, 
      contactType 
    }: { 
      recipientId: number; 
      channel: string; 
      content: string;
      contactType: 'lead' | 'customer';
    }) => {
      const response = await apiRequest('POST', '/api/communications/send', {
        recipientId,
        channel,
        content,
        contactType
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications/contact', contactId, contactType] });
      setMessageContent('');
      setIsMessageDialogOpen(false);
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message.",
        variant: "destructive"
      });
    }
  });

  // Communication methods available for this contact
  const availableChannels = [
    { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" />, available: !!email },
    { id: 'phone', name: 'Phone', icon: <Phone className="h-4 w-4" />, available: !!phone },
    { id: 'sms', name: 'SMS', icon: <FaSms className="h-4 w-4 text-orange-500" />, available: !!phone },
    { id: 'whatsapp', name: 'WhatsApp', icon: <FaWhatsapp className="h-4 w-4 text-green-500" />, available: !!phone },
    { id: 'messenger', name: 'Messenger', icon: <FaFacebookMessenger className="h-4 w-4 text-blue-500" />, available: true },
    { id: 'twitter', name: 'Twitter', icon: <FaTwitter className="h-4 w-4 text-blue-400" />, available: true },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin className="h-4 w-4 text-blue-700" />, available: true },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="h-4 w-4 text-pink-500" />, available: true },
  ];
  
  // Open compose dialog with a specific channel
  const handleComposeMessage = (channel: string) => {
    setSelectedChannel(channel);
    setSelectedCommunication(null);
    setIsMessageDialogOpen(true);
  };

  // Open reply dialog for a specific communication
  const handleReply = (communication: Communication) => {
    setSelectedCommunication(communication);
    setSelectedChannel(communication.channel);
    setIsMessageDialogOpen(true);
  };

  // Handle send message/reply
  const handleSendMessage = () => {
    if (!messageContent.trim()) {
      toast({
        title: "Error",
        description: "Message content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: contactId,
      channel: selectedChannel,
      content: messageContent,
      contactType: contactType
    });
  };

  // Mark a message as read
  const handleMarkAsRead = (communicationId: number) => {
    updateStatusMutation.mutate({ id: communicationId, status: 'read' });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Same day - show time only
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return format(date, 'h:mm a');
    }
    
    // Within last week
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return format(date, 'EEE h:mm a');
    }
    
    // Otherwise show date
    return format(date, 'MMM d, yyyy');
  };

  // Get CSS class based on message direction
  const getMessageClass = (direction: string) => {
    return direction.toLowerCase() === 'inbound' 
      ? 'bg-gray-100 rounded-tr-xl rounded-br-xl rounded-bl-xl ml-auto' 
      : 'bg-primary/10 text-primary-foreground rounded-tl-xl rounded-br-xl rounded-bl-xl';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'unread':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Unread</Badge>;
      case 'read':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">Read</Badge>;
      case 'replied':
        return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Replied</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communications</CardTitle>
          <CardDescription>Loading communication history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communications</CardTitle>
          <CardDescription>Failed to load communications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {(error as Error).message}</p>
          <Button onClick={() => refetch()} className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Communications</CardTitle>
              <CardDescription>
                Message history with {contactName || `this ${contactType}`}
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => refetch()}
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {availableChannels
                .filter(channel => channel.available)
                .map(channel => (
                  <Button 
                    key={channel.id} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleComposeMessage(channel.id)}
                    className="flex items-center gap-1"
                  >
                    {channel.icon}
                    <span>{channel.name}</span>
                  </Button>
                ))
              }
            </div>

            {communications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p>No communication history yet</p>
                <p className="text-sm">Start a conversation using one of the channels above</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div 
                      key={comm.id} 
                      className={`p-4 ${getMessageClass(comm.direction)} relative group`}
                      onClick={() => {
                        if (comm.status === 'unread') {
                          handleMarkAsRead(comm.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={comm.channel} />
                          <span className="font-medium text-sm">
                            {comm.direction.toLowerCase() === 'inbound' ? 'Received via' : 'Sent via'} {comm.channel}
                          </span>
                        </div>
                        {getStatusBadge(comm.status)}
                      </div>
                      
                      <p className="text-sm mb-2">{comm.content}</p>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <span>{formatDate(comm.sentAt)}</span>
                        {comm.direction.toLowerCase() === 'inbound' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReply(comm)}
                          >
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message composition dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCommunication ? "Reply" : "New Message"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                to {firstName} {lastName}
              </span>
            </DialogTitle>
            <DialogDescription>
              {selectedCommunication 
                ? `Reply to this conversation via ${selectedChannel}` 
                : `Send a new message via ${selectedChannel}`}
            </DialogDescription>
          </DialogHeader>

          {selectedCommunication && (
            <div className="bg-muted p-3 rounded-md text-sm mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ChannelIcon channel={selectedCommunication.channel} />
                  <span className="ml-2 font-medium">Original message</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(selectedCommunication.sentAt)}
                </span>
              </div>
              <p className="line-clamp-3">{selectedCommunication.content}</p>
            </div>
          )}

          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMessageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !messageContent.trim()}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}