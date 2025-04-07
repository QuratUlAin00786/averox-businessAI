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
import { Separator } from '@/components/ui/separator';
import { Loader2, RefreshCw, Send, MessageSquare, Mail, Phone, PhoneCall, PhoneForwarded, PhoneIncoming, PhoneOff, PhoneOutgoing } from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaLinkedin, FaTwitter, FaInstagram, FaSms } from 'react-icons/fa';

// Define communication-related types
interface Communication {
  id: number;
  contactType: 'lead' | 'customer'; // Lead or Customer
  contactId: number;
  relatedToType?: string; // 'account', 'opportunity', etc.
  relatedToId?: number;
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

interface AccountCommunicationsProps {
  accountId: number;
  accountName?: string;
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

export function AccountCommunications({ accountId, accountName = '', email = '', phone = '' }: AccountCommunicationsProps) {
  // Ensure phone is a string and debug log with more visibility
  const phoneStr = typeof phone === 'string' ? phone : String(phone || '');
  
  const { toast } = useToast();
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('email');

  // Query to fetch account-related communications
  const {
    data: communications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Communication[]>({
    queryKey: ['/api/communications/related', 'account', accountId],
    queryFn: async () => {
      console.log(`Fetching communications for account ${accountId}`);
      const response = await apiRequest('GET', `/api/communications/related/account/${accountId}`);
      const data = await response.json();
      console.log('Fetched account communications:', data);
      return data;
    },
    enabled: !!accountId
  });

  // Mutation to update communication status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/communications/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications/related', 'account', accountId] });
      toast({
        title: "Status updated",
        description: "Communication status has been updated."
      });
    }
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      channel, 
      content,
      relatedToType,
      relatedToId
    }: { 
      channel: string; 
      content: string;
      relatedToType: string;
      relatedToId: number;
    }) => {
      // For account-related communications, we only need channel, content, relatedToType, and relatedToId
      const response = await apiRequest('POST', '/api/communications/send', {
        channel,
        content,
        relatedToType,
        relatedToId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications/related', 'account', accountId] });
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

  // Communication methods available
  const availableChannels = [
    { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" />, available: !!email },
    { id: 'phone', name: 'Phone', icon: <Phone className="h-4 w-4" />, available: !!phoneStr },
    { id: 'sms', name: 'SMS', icon: <FaSms className="h-4 w-4 text-orange-500" />, available: !!phoneStr },
    { id: 'whatsapp', name: 'WhatsApp', icon: <FaWhatsapp className="h-4 w-4 text-green-500" />, available: !!phoneStr },
    { id: 'messenger', name: 'Messenger', icon: <FaFacebookMessenger className="h-4 w-4 text-blue-500" />, available: true },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin className="h-4 w-4 text-blue-700" />, available: true },
  ];
  
  // Open compose dialog with a specific channel
  const handleComposeMessage = (channel: string) => {
    // For direct communication channels like phone, SMS, and WhatsApp,
    // we'll handle them differently
    if (channel === 'phone' && phoneStr) {
      // Open native phone dialer
      window.open(`tel:${phoneStr}`, '_blank');
      // Also log this communication
      logCommunication('phone');
      return;
    }
    
    if (channel === 'sms' && phoneStr) {
      // Open native SMS app
      window.open(`sms:${phoneStr}`, '_blank');
      // Also log this communication
      logCommunication('sms');
      return;
    }
    
    if (channel === 'whatsapp' && phoneStr) {
      // Open WhatsApp with the phone number
      // Note: We're removing any non-digit characters from the phone number
      const cleanPhone = phoneStr.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
      // Also log this communication
      logCommunication('whatsapp');
      return;
    }
    
    // For other channels, open the compose dialog
    setSelectedChannel(channel);
    setSelectedCommunication(null);
    setIsMessageDialogOpen(true);
  };
  
  // Log direct communications (phone, SMS, WhatsApp)
  const logCommunication = (channel: string) => {
    sendMessageMutation.mutate({
      channel,
      content: `Initiated ${channel} communication with ${accountName || 'account'}`,
      relatedToType: 'account',
      relatedToId: accountId
    });
    
    toast({
      title: "Communication initiated",
      description: `${channel.charAt(0).toUpperCase() + channel.slice(1)} communication with ${accountName || 'account'} has been initiated.`
    });
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

    console.log('Sending message with params:', {
      channel: selectedChannel,
      content: messageContent,
      relatedToType: 'account', 
      relatedToId: accountId
    });

    sendMessageMutation.mutate({
      channel: selectedChannel,
      content: messageContent,
      relatedToType: 'account', 
      relatedToId: accountId
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
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <p>Loading communications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <p className="text-red-500 mb-2">Error: {(error as Error).message}</p>
        <Button onClick={() => refetch()} size="sm" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Communication options - Always show */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium mb-2">Communication Channels</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {availableChannels.map((channel) => 
              channel.available && (
                <Button 
                  key={channel.id}
                  variant="outline" 
                  className="flex flex-col items-center justify-center p-2 h-auto hover:bg-primary/5"
                  onClick={() => handleComposeMessage(channel.id)}
                >
                  <div className="p-2 rounded-full bg-primary/10 mb-1">
                    {channel.icon}
                  </div>
                  <span className="text-xs">{channel.name}</span>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Communication history */}
        <div>
          <h3 className="text-sm font-medium mb-3">Communication History</h3>
          
          {communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-md">
              <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No communication history yet</p>
              <p className="text-sm">Start a conversation using one of the channels above</p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
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
                    
                    <div className="my-2 text-sm whitespace-pre-wrap">
                      {comm.content}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          {comm.contactDetails?.avatarUrl ? (
                            <img src={comm.contactDetails.avatarUrl} alt={`${comm.contactDetails.firstName} ${comm.contactDetails.lastName}`} />
                          ) : (
                            <AvatarFallback>
                              {comm.contactDetails?.firstName?.[0] || ''}
                              {comm.contactDetails?.lastName?.[0] || ''}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>
                          {comm.contactDetails ? 
                            `${comm.contactDetails.firstName} ${comm.contactDetails.lastName}` : 
                            'Unknown Contact'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span>
                          {formatDate(comm.direction === 'inbound' ? (comm.receivedAt || comm.sentAt) : comm.sentAt)}
                        </span>
                        
                        {comm.direction === 'inbound' && comm.status !== 'replied' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReply(comm);
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {comm.attachments && comm.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {comm.attachments.map((attachment, index) => (
                            <a 
                              key={index} 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center"
                            >
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              {selectedCommunication 
                ? `Reply to message from ${selectedCommunication.contactDetails.firstName} ${selectedCommunication.contactDetails.lastName}`
                : `Send a message to ${accountName || 'this account'} via ${selectedChannel}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedCommunication && (
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Original Message:</p>
                <p className="text-gray-700">{selectedCommunication.content}</p>
              </div>
            )}
            
            <Textarea 
              placeholder="Type your message here..." 
              className="min-h-[120px]"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex items-center">
              <ChannelIcon channel={selectedChannel} />
              <span className="ml-2 text-sm">
                via {selectedChannel}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsMessageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Message
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}