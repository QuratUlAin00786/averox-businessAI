import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageSquare, 
  MessageCircle, 
  Send, 
  Clock, 
  RefreshCw, 
  Inbox, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  ChevronDown, 
  Users, 
  User,
  MoreVertical
} from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaLinkedin, FaTwitter, FaInstagram, FaSms } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

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
  receivedAt: string;
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
  socialProfiles?: {
    whatsapp?: string;
    messenger?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
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

// Contact action button component
const ContactActionButton = ({ 
  channel, 
  contactDetails, 
  onAction 
}: { 
  channel: string, 
  contactDetails: ContactDetails, 
  onAction: () => void 
}) => {
  let Icon;
  let color = "text-gray-500 hover:text-primary";
  let tooltip = "";

  switch (channel.toLowerCase()) {
    case 'whatsapp':
      Icon = FaWhatsapp;
      color = "text-green-500 hover:text-green-600";
      tooltip = "Send WhatsApp message";
      break;
    case 'messenger':
      Icon = FaFacebookMessenger;
      color = "text-blue-500 hover:text-blue-600";
      tooltip = "Send Messenger message";
      break;
    case 'email':
      Icon = Mail;
      color = "text-gray-500 hover:text-gray-600";
      tooltip = "Send email";
      break;
    case 'phone':
      Icon = Phone;
      color = "text-purple-500 hover:text-purple-600";
      tooltip = "Make a call";
      break;
    case 'sms':
      Icon = FaSms;
      color = "text-orange-500 hover:text-orange-600";
      tooltip = "Send SMS";
      break;
    case 'twitter':
    case 'x':
      Icon = FaTwitter;
      color = "text-blue-400 hover:text-blue-500";
      tooltip = "Send Twitter message";
      break;
    case 'linkedin':
      Icon = FaLinkedin;
      color = "text-blue-700 hover:text-blue-800";
      tooltip = "Send LinkedIn message";
      break;
    case 'instagram':
      Icon = FaInstagram;
      color = "text-pink-500 hover:text-pink-600";
      tooltip = "Send Instagram message";
      break;
    default:
      Icon = MessageSquare;
      tooltip = "Send message";
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`rounded-full ${color}`}
      onClick={onAction}
      title={tooltip}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
};

const CommunicationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactDetails | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeChannel, setComposeChannel] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  // Fetch communications data
  const {
    data: communications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Communication[]>({
    queryKey: ['/api/communications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/communications');
      const data = await response.json();
      return data;
    }
  });

  // Mutate communication status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/communications/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      toast({
        title: "Status updated",
        description: "Communication status has been updated.",
      });
    }
  });

  // Send reply
  const sendReplyMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      setReplyContent('');
      setIsMessageDialogOpen(false);
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
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

  // Filter communications based on tab, search term, and filters
  const filteredCommunications = useMemo(() => {
    return communications.filter(comm => {
      // Filter by tab
      if (selectedTab === 'unread' && comm.status !== 'unread') return false;
      if (selectedTab === 'inbound' && comm.direction !== 'inbound') return false;
      if (selectedTab === 'outbound' && comm.direction !== 'outbound') return false;
      if (selectedTab === 'leads' && comm.contactType !== 'lead') return false;
      if (selectedTab === 'customers' && comm.contactType !== 'customer') return false;

      // Filter by search term
      if (
        searchTerm && 
        !`${comm.contactDetails.firstName} ${comm.contactDetails.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comm.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by selected filters
      if (selectedFilters.length > 0 && !selectedFilters.includes(comm.channel)) {
        return false;
      }

      return true;
    });
  }, [communications, selectedTab, searchTerm, selectedFilters]);

  // Handler for opening compose dialog
  const handleComposeMessage = (contact: ContactDetails, channel: string) => {
    setSelectedContact(contact);
    setComposeChannel(channel);
    setIsComposing(true);
    setIsMessageDialogOpen(true);
  };

  // Handler for opening reply dialog
  const handleReply = (communication: Communication) => {
    setSelectedCommunication(communication);
    setSelectedContact(communication.contactDetails);
    setComposeChannel(communication.channel);
    setIsComposing(false);
    setIsMessageDialogOpen(true);
  };

  // Handler for sending a reply
  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Message content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (isComposing && selectedContact) {
      sendReplyMutation.mutate({
        recipientId: selectedContact.id,
        channel: composeChannel,
        content: replyContent,
        contactType: selectedContact.company ? 'customer' : 'lead' // Simple heuristic, could be improved
      });
    } else if (selectedCommunication) {
      sendReplyMutation.mutate({
        recipientId: selectedCommunication.contactId,
        channel: selectedCommunication.channel,
        content: replyContent,
        contactType: selectedCommunication.contactType
      });
    }
  };

  // Toggle a channel filter
  const toggleFilter = (channel: string) => {
    if (selectedFilters.includes(channel)) {
      setSelectedFilters(selectedFilters.filter(f => f !== channel));
    } else {
      setSelectedFilters([...selectedFilters, channel]);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // Same day - show time only
    if (
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    ) {
      return format(messageDate, 'h:mm a');
    }
    
    // Within last week
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return format(messageDate, 'EEE h:mm a');
    }
    
    // Otherwise show date
    return format(messageDate, 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
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

  // Available communication channels
  const channels = [
    { id: 'email', name: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'whatsapp', name: 'WhatsApp', icon: <FaWhatsapp className="h-4 w-4 text-green-500" /> },
    { id: 'phone', name: 'Phone', icon: <Phone className="h-4 w-4" /> },
    { id: 'sms', name: 'SMS', icon: <FaSms className="h-4 w-4 text-orange-500" /> },
    { id: 'messenger', name: 'Messenger', icon: <FaFacebookMessenger className="h-4 w-4 text-blue-500" /> },
    { id: 'twitter', name: 'Twitter', icon: <FaTwitter className="h-4 w-4 text-blue-400" /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin className="h-4 w-4 text-blue-700" /> },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="h-4 w-4 text-pink-500" /> },
  ];

  // JSX
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
          <p className="text-muted-foreground">
            Manage all your customer and lead communications in one place
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Filters</CardTitle>
              <CardDescription>
                Filter communications by type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="space-y-4">
                {channels.map(channel => (
                  <div key={channel.id} className="flex items-center">
                    <Button
                      variant={selectedFilters.includes(channel.id) ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => toggleFilter(channel.id)}
                    >
                      <div className="mr-2">{channel.icon}</div>
                      <span>{channel.name}</span>
                      {selectedFilters.includes(channel.id) && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Communication Stats</CardTitle>
              <CardDescription>
                Overview of your conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unread Messages</span>
                  <span className="font-medium">
                    {communications.filter(comm => comm.status === 'unread').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Leads Conversations</span>
                  <span className="font-medium">
                    {communications.filter(comm => comm.contactType === 'lead').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer Conversations</span>
                  <span className="font-medium">
                    {communications.filter(comm => comm.contactType === 'customer').length}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Messages</span>
                  <span className="font-bold">{communications.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or message content..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedFilters([])}>
                    Clear filters
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilters(['email', 'whatsapp'])}>
                    Email & WhatsApp only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilters(['phone', 'sms'])}>
                    Phone & SMS only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilters(['messenger', 'whatsapp', 'twitter', 'instagram'])}>
                    Social media only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700">
                  {communications.filter(c => c.status === 'unread').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inbound">Inbound</TabsTrigger>
              <TabsTrigger value="outbound">Outbound</TabsTrigger>
              <TabsTrigger value="leads">
                <User className="h-4 w-4 mr-1" /> 
                Leads
              </TabsTrigger>
              <TabsTrigger value="customers">
                <Users className="h-4 w-4 mr-1" /> 
                Customers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-1">No messages found</h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchTerm || selectedFilters.length > 0 
                          ? "Try adjusting your search or filters to find what you're looking for." 
                          : "You don't have any communications yet."}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Contact</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead className="hidden md:table-cell">Message</TableHead>
                          <TableHead className="hidden md:table-cell">Status</TableHead>
                          <TableHead className="hidden md:table-cell">Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommunications.map((comm) => (
                          <TableRow key={comm.id} className={comm.status === 'unread' ? "font-medium bg-blue-50" : ""}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={comm.contactDetails.avatarUrl} />
                                  <AvatarFallback>
                                    {comm.contactDetails.firstName?.charAt(0) || ''}
                                    {comm.contactDetails.lastName?.charAt(0) || ''}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span>{comm.contactDetails.firstName} {comm.contactDetails.lastName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {comm.contactType === 'lead' ? 'Lead' : 'Customer'}
                                    {comm.contactDetails.company && ` at ${comm.contactDetails.company}`}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <ChannelIcon channel={comm.channel} />
                                <span className="text-xs hidden sm:inline ml-1 capitalize">
                                  {comm.channel}
                                </span>
                                {comm.direction === 'inbound' ? (
                                  <ArrowDown className="h-3 w-3 text-green-500 ml-1" />
                                ) : (
                                  <ArrowUp className="h-3 w-3 text-blue-500 ml-1" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="line-clamp-1">{comm.content}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getStatusBadge(comm.status)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(new Date(comm.sentAt))}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleReply(comm)}
                                  title="Reply"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {comm.status !== 'read' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'read' })}
                                      >
                                        Mark as read
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'unread' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'unread' })}
                                      >
                                        Mark as unread
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'archived' && (
                                      <DropdownMenuItem 
                                        onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'archived' })}
                                      >
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex items-center ml-1">
                                  {Object.entries(comm.contactDetails.socialProfiles || {}).map(([platform, value]) => 
                                    value ? (
                                      <ContactActionButton 
                                        key={platform} 
                                        channel={platform} 
                                        contactDetails={comm.contactDetails}
                                        onAction={() => handleComposeMessage(comm.contactDetails, platform)}
                                      />
                                    ) : null
                                  )}
                                  {comm.contactDetails.email && (
                                    <ContactActionButton 
                                      channel="email" 
                                      contactDetails={comm.contactDetails}
                                      onAction={() => handleComposeMessage(comm.contactDetails, 'email')}
                                    />
                                  )}
                                  {comm.contactDetails.phone && (
                                    <>
                                      <ContactActionButton 
                                        channel="phone" 
                                        contactDetails={comm.contactDetails}
                                        onAction={() => handleComposeMessage(comm.contactDetails, 'phone')}
                                      />
                                      <ContactActionButton 
                                        channel="sms" 
                                        contactDetails={comm.contactDetails}
                                        onAction={() => handleComposeMessage(comm.contactDetails, 'sms')}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs share the same content with different filters, handled by state */}
            <TabsContent value="unread" className="mt-4">
              {/* Same content as 'all' tab, filtered by 'unread' status */}
              <Card>
                <CardContent className="p-0">
                  {/* Content is filtered via the filteredCommunications function */}
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-1">No unread messages</h3>
                      <p className="text-muted-foreground max-w-md">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Contact</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead className="hidden md:table-cell">Message</TableHead>
                          <TableHead className="hidden md:table-cell">Status</TableHead>
                          <TableHead className="hidden md:table-cell">Time</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommunications.map((comm) => (
                          <TableRow key={comm.id} className="font-medium bg-blue-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={comm.contactDetails.avatarUrl} />
                                  <AvatarFallback>
                                    {comm.contactDetails.firstName?.charAt(0) || ''}
                                    {comm.contactDetails.lastName?.charAt(0) || ''}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span>{comm.contactDetails.firstName} {comm.contactDetails.lastName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {comm.contactType === 'lead' ? 'Lead' : 'Customer'}
                                    {comm.contactDetails.company && ` at ${comm.contactDetails.company}`}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <ChannelIcon channel={comm.channel} />
                                <span className="text-xs hidden sm:inline ml-1 capitalize">
                                  {comm.channel}
                                </span>
                                {comm.direction === 'inbound' ? (
                                  <ArrowDown className="h-3 w-3 text-green-500 ml-1" />
                                ) : (
                                  <ArrowUp className="h-3 w-3 text-blue-500 ml-1" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="line-clamp-1">{comm.content}</span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getStatusBadge(comm.status)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(new Date(comm.sentAt))}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleReply(comm)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'read' })}
                                    >
                                      Mark as read
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'archived' })}
                                    >
                                      Archive
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex items-center ml-1">
                                  {Object.entries(comm.contactDetails.socialProfiles || {}).map(([platform, value]) => 
                                    value ? (
                                      <ContactActionButton 
                                        key={platform} 
                                        channel={platform} 
                                        contactDetails={comm.contactDetails}
                                        onAction={() => handleComposeMessage(comm.contactDetails, platform)}
                                      />
                                    ) : null
                                  )}
                                  {comm.contactDetails.email && (
                                    <ContactActionButton 
                                      channel="email" 
                                      contactDetails={comm.contactDetails}
                                      onAction={() => handleComposeMessage(comm.contactDetails, 'email')}
                                    />
                                  )}
                                  {comm.contactDetails.phone && (
                                    <>
                                      <ContactActionButton 
                                        channel="phone" 
                                        contactDetails={comm.contactDetails}
                                        onAction={() => handleComposeMessage(comm.contactDetails, 'phone')}
                                      />
                                      <ContactActionButton 
                                        channel="sms" 
                                        contactDetails={comm.contactDetails}
                                        onAction={() => handleComposeMessage(comm.contactDetails, 'sms')}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Identical structure for other tabs - using the filteredCommunications function to handle filtering */}
            <TabsContent value="inbound" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="font-medium text-lg">No Inbound Messages</h3>
                      <p className="text-muted-foreground">
                        There are no inbound messages matching your criteria.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Contact</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="w-[110px]">Date</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommunications.map((comm) => (
                          <TableRow key={comm.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  {comm.contactDetails.avatarUrl && (
                                    <AvatarImage src={comm.contactDetails.avatarUrl} alt={`${comm.contactDetails.firstName} ${comm.contactDetails.lastName}`} />
                                  )}
                                  <AvatarFallback>{comm.contactDetails.firstName.charAt(0)}{comm.contactDetails.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{comm.contactDetails.firstName} {comm.contactDetails.lastName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <ChannelIcon channel={comm.channel} /> 
                                    <span className="ml-1">{comm.channel}</span>
                                    {comm.contactType === 'lead' ? (
                                      <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200">Lead</Badge>
                                    ) : (
                                      <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200">Customer</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md truncate">{comm.content}</div>
                            </TableCell>
                            <TableCell>
                              {formatDate(new Date(comm.receivedAt || comm.sentAt))}
                            </TableCell>
                            <TableCell>{getStatusBadge(comm.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReply(comm)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {comm.status !== 'read' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'read' })}>
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'unread' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'unread' })}>
                                        Mark as Unread
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'archived' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'archived' })}>
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="outbound" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="font-medium text-lg">No Outbound Messages</h3>
                      <p className="text-muted-foreground">
                        There are no outbound messages matching your criteria.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Contact</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="w-[110px]">Date</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommunications.map((comm) => (
                          <TableRow key={comm.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  {comm.contactDetails.avatarUrl && (
                                    <AvatarImage src={comm.contactDetails.avatarUrl} alt={`${comm.contactDetails.firstName} ${comm.contactDetails.lastName}`} />
                                  )}
                                  <AvatarFallback>{comm.contactDetails.firstName.charAt(0)}{comm.contactDetails.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{comm.contactDetails.firstName} {comm.contactDetails.lastName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <ChannelIcon channel={comm.channel} /> 
                                    <span className="ml-1">{comm.channel}</span>
                                    {comm.contactType === 'lead' ? (
                                      <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200">Lead</Badge>
                                    ) : (
                                      <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200">Customer</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md truncate">{comm.content}</div>
                            </TableCell>
                            <TableCell>
                              {formatDate(new Date(comm.sentAt))}
                            </TableCell>
                            <TableCell>{getStatusBadge(comm.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReply(comm)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {comm.status !== 'read' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'read' })}>
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'unread' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'unread' })}>
                                        Mark as Unread
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'archived' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'archived' })}>
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="leads" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="font-medium text-lg">No Lead Messages</h3>
                      <p className="text-muted-foreground">
                        There are no lead messages matching your criteria.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Lead</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="w-[110px]">Date</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommunications.map((comm) => (
                          <TableRow key={comm.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  {comm.contactDetails.avatarUrl && (
                                    <AvatarImage src={comm.contactDetails.avatarUrl} alt={`${comm.contactDetails.firstName} ${comm.contactDetails.lastName}`} />
                                  )}
                                  <AvatarFallback>{comm.contactDetails.firstName.charAt(0)}{comm.contactDetails.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{comm.contactDetails.firstName} {comm.contactDetails.lastName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <ChannelIcon channel={comm.channel} /> 
                                    <span className="ml-1">{comm.channel}</span>
                                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200">Lead</Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md truncate">{comm.content}</div>
                            </TableCell>
                            <TableCell>
                              {formatDate(new Date(comm.receivedAt || comm.sentAt))}
                            </TableCell>
                            <TableCell>{getStatusBadge(comm.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReply(comm)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {comm.status !== 'read' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'read' })}>
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'unread' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'unread' })}>
                                        Mark as Unread
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'archived' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'archived' })}>
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="customers" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <User className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="font-medium text-lg">No Customer Messages</h3>
                      <p className="text-muted-foreground">
                        There are no customer messages matching your criteria.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Customer</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="w-[110px]">Date</TableHead>
                          <TableHead className="w-[120px]">Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCommunications.map((comm) => (
                          <TableRow key={comm.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  {comm.contactDetails.avatarUrl && (
                                    <AvatarImage src={comm.contactDetails.avatarUrl} alt={`${comm.contactDetails.firstName} ${comm.contactDetails.lastName}`} />
                                  )}
                                  <AvatarFallback>{comm.contactDetails.firstName.charAt(0)}{comm.contactDetails.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{comm.contactDetails.firstName} {comm.contactDetails.lastName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <ChannelIcon channel={comm.channel} /> 
                                    <span className="ml-1">{comm.channel}</span>
                                    <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-200">Customer</Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md truncate">{comm.content}</div>
                            </TableCell>
                            <TableCell>
                              {formatDate(new Date(comm.receivedAt || comm.sentAt))}
                            </TableCell>
                            <TableCell>{getStatusBadge(comm.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleReply(comm)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {comm.status !== 'read' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'read' })}>
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'unread' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'unread' })}>
                                        Mark as Unread
                                      </DropdownMenuItem>
                                    )}
                                    {comm.status !== 'archived' && (
                                      <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: comm.id, status: 'archived' })}>
                                        Archive
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Message dialog for composing or replying */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isComposing ? "New Message" : "Reply"}
              {selectedContact && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  to {selectedContact.firstName} {selectedContact.lastName}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {isComposing 
                ? `Send a new message via ${composeChannel}` 
                : `Reply to this conversation via ${composeChannel}`}
            </DialogDescription>
          </DialogHeader>

          {selectedCommunication && !isComposing && (
            <div className="bg-muted p-3 rounded-md text-sm mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ChannelIcon channel={selectedCommunication.channel} />
                  <span className="ml-2 font-medium">Original message</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(new Date(selectedCommunication.sentAt))}
                </span>
              </div>
              <p className="line-clamp-3">{selectedCommunication.content}</p>
            </div>
          )}

          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
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
              onClick={handleSendReply}
              disabled={sendReplyMutation.isPending || !replyContent.trim()}
            >
              {sendReplyMutation.isPending ? (
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
    </div>
  );
};

export default CommunicationCenter;