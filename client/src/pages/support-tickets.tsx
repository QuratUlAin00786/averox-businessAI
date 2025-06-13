import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  AlertCircle, Clock, Filter, MessageSquare, Search, User, Info, Ticket, 
  CheckCircle2, AlertTriangle, HelpCircle, XCircle, Phone, Mail, 
  MessageCircleQuestion, ExternalLink, Globe, Send, X, Plus, ArrowLeft, Eye
} from 'lucide-react';

// Mock data structure until API is implemented
interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  userId: number;
  messages: {
    id: number;
    message: string;
    createdAt: string;
    isAgent: boolean;
    attachments?: string[];
  }[];
}

const mockTickets: SupportTicket[] = [
  {
    id: 1,
    title: "Cannot access accounting module",
    description: "I'm getting an error when trying to access the accounting module. The error says 'Permission denied'.",
    status: "Open",
    priority: "High",
    category: "Technical Issue",
    createdAt: "2025-04-01T10:30:00Z",
    updatedAt: "2025-04-01T10:30:00Z",
    userId: 2,
    messages: [
      {
        id: 1,
        message: "I'm getting an error when trying to access the accounting module. The error says 'Permission denied'.",
        createdAt: "2025-04-01T10:30:00Z",
        isAgent: false
      },
      {
        id: 2,
        message: "Thank you for reporting this issue. Can you tell me what role you're assigned in the system? I'll check the permissions settings for your account.",
        createdAt: "2025-04-01T11:15:00Z", 
        isAgent: true
      }
    ]
  },
  {
    id: 2,
    title: "Need help setting up Stripe integration",
    description: "I'm trying to connect my Stripe account but keep getting an authentication error. I've double-checked my API keys.",
    status: "In Progress",
    priority: "Medium",
    category: "Integration",
    createdAt: "2025-04-02T14:45:00Z",
    updatedAt: "2025-04-03T09:20:00Z",
    assignedTo: "Technical Support",
    userId: 2,
    messages: [
      {
        id: 1,
        message: "I'm trying to connect my Stripe account but keep getting an authentication error. I've double-checked my API keys.",
        createdAt: "2025-04-02T14:45:00Z",
        isAgent: false
      },
      {
        id: 2,
        message: "Let me help you with this integration issue. Could you please provide a screenshot of the error message you're seeing? Also, please confirm you're using the correct API keys (live vs test).",
        createdAt: "2025-04-02T15:30:00Z",
        isAgent: true
      },
      {
        id: 3,
        message: "I've attached the screenshot. I'm using the live keys as we're ready to process real payments now.",
        createdAt: "2025-04-03T09:15:00Z",
        isAgent: false
      }
    ]
  },
  {
    id: 3,
    title: "How to export contacts to CSV",
    description: "I need to export all my contacts to a CSV file for a marketing campaign. Where can I find this feature?",
    status: "Resolved",
    priority: "Low",
    category: "How-to Question",
    createdAt: "2025-04-03T16:10:00Z",
    updatedAt: "2025-04-04T11:05:00Z",
    assignedTo: "Customer Success",
    userId: 2,
    messages: [
      {
        id: 1,
        message: "I need to export all my contacts to a CSV file for a marketing campaign. Where can I find this feature?",
        createdAt: "2025-04-03T16:10:00Z",
        isAgent: false
      },
      {
        id: 2,
        message: "You can export contacts by going to Contacts > select all (or filter as needed) > click the Export button in the top right. Choose CSV as the format. Let me know if you need any further assistance!",
        createdAt: "2025-04-04T09:30:00Z",
        isAgent: true
      },
      {
        id: 3,
        message: "Found it! Thanks for your help.",
        createdAt: "2025-04-04T11:00:00Z",
        isAgent: false
      },
      {
        id: 4,
        message: "Great! I'm glad you found it. Is there anything else you need help with?",
        createdAt: "2025-04-04T11:05:00Z",
        isAgent: true
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'Resolved':
      return 'bg-green-100 text-green-800';
    case 'Closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-blue-100 text-blue-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Low':
      return <Info className="h-4 w-4 mr-1" />;
    case 'Medium':
      return <AlertCircle className="h-4 w-4 mr-1" />;
    case 'High':
      return <AlertTriangle className="h-4 w-4 mr-1" />;
    case 'Critical':
      return <XCircle className="h-4 w-4 mr-1" />;
    default:
      return <Info className="h-4 w-4 mr-1" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Open':
      return <HelpCircle className="h-4 w-4 mr-1" />;
    case 'In Progress':
      return <Clock className="h-4 w-4 mr-1" />;
    case 'Resolved':
      return <CheckCircle2 className="h-4 w-4 mr-1" />;
    case 'Closed':
      return <XCircle className="h-4 w-4 mr-1" />;
    default:
      return <HelpCircle className="h-4 w-4 mr-1" />;
  }
};

const ChatBox = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      message: "Hello! I'm here to help you with any questions or issues you may have. How can I assist you today?",
      isAgent: true,
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      message: newMessage,
      isAgent: false,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: chatMessages.length + 2,
        message: "Thank you for your message. I'm reviewing your inquiry and will provide assistance shortly. Is there any additional information you'd like to share?",
        isAgent: true,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, agentResponse]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 bg-primary text-white rounded-t-lg">
        <div className="flex items-center">
          <MessageCircleQuestion className="h-4 w-4 mr-2" />
          <span className="font-medium">Live Chat Support</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-primary-foreground/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isAgent ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg ${
              msg.isAgent 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-primary text-white'
            }`}>
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TicketDetails = ({ ticket, onClose }: { ticket: SupportTicket | null, onClose: () => void }) => {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  
  if (!ticket) return null;
  
  const handleSubmitMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real implementation, this would send the message to the API
    toast({
      title: "Message sent",
      description: "Your message has been sent to support.",
    });
    
    setNewMessage('');
    onClose();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{ticket.title}</h2>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant="outline" className={getStatusColor(ticket.status)}>
              {getStatusIcon(ticket.status)} {ticket.status}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              {getPriorityIcon(ticket.priority)} {ticket.priority}
            </Badge>
            <span className="text-sm text-gray-500">Ticket #{ticket.id}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Category: {ticket.category} • Opened on {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-md mb-4">
        <p className="font-medium">Original description:</p>
        <p className="mt-1">{ticket.description}</p>
      </div>
      
      <div className="flex-1 overflow-auto mb-4 border rounded-md p-2">
        {ticket.messages.map((message) => (
          <div key={message.id} className={`mb-4 p-3 rounded-lg ${message.isAgent ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
            <div className="flex items-center mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${message.isAgent ? 'bg-blue-100' : 'bg-gray-200'}`}>
                {message.isAgent ? <User className="h-4 w-4 text-blue-700" /> : <User className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">{message.isAgent ? 'Support Agent' : 'You'}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="ml-8">{message.message}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="ml-8 mt-2">
                <p className="text-xs text-gray-500">Attachments:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {message.attachments.map((attachment, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer">
                      {attachment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-auto">
        <Textarea
          placeholder="Type your reply here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="mb-2"
          rows={3}
        />
        <div className="flex justify-between">
          <Button variant="outline" className="text-sm">
            Attach File
          </Button>
          <Button onClick={handleSubmitMessage} disabled={!newMessage.trim()}>
            Send Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

const FilterDialog = ({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  filters: { status: string; priority: string; category: string };
  onFiltersChange: (filters: { status: string; priority: string; category: string }) => void;
}) => {
  const handleClearFilters = () => {
    onFiltersChange({ status: 'all', priority: 'all', category: 'all' });
  };

  const handleApplyFilters = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Tickets</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your support tickets view.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filter-status" className="text-right">
              Status
            </Label>
            <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filter-priority" className="text-right">
              Priority
            </Label>
            <Select value={filters.priority} onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority</SelectLabel>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filter-category" className="text-right">
              Category
            </Label>
            <Select value={filters.category} onValueChange={(value) => onFiltersChange({ ...filters, category: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                  <SelectItem value="Billing & Subscription">Billing & Subscription</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="How-to Question">How-to Question</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button type="button" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NewTicketDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketPriority, setTicketPriority] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: {
      title: string;
      description: string;
      category: string;
      priority: string;
    }) => {
      return await apiRequest('POST', '/api/support-tickets', ticketData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted successfully.",
      });
      // Reset form
      setTicketTitle('');
      setTicketDescription('');
      setTicketCategory('');
      setTicketPriority('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating ticket",
        description: error.message || "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    if (!ticketTitle || !ticketDescription || !ticketCategory || !ticketPriority) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields to create a ticket.",
        variant: "destructive"
      });
      return;
    }
    
    createTicketMutation.mutate({
      title: ticketTitle,
      description: ticketDescription,
      category: ticketCategory,
      priority: ticketPriority
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Support Ticket</DialogTitle>
          <DialogDescription>
            Submit a new ticket to our support team for assistance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticket-title" className="text-right">
              Title
            </Label>
            <Input
              id="ticket-title"
              placeholder="Brief summary of your issue"
              className="col-span-3"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticket-category" className="text-right">
              Category
            </Label>
            <Select value={ticketCategory} onValueChange={setTicketCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing & Subscription</SelectItem>
                  <SelectItem value="howto">How-to Question</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="integration">Integration Help</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticket-priority" className="text-right">
              Priority
            </Label>
            <Select value={ticketPriority} onValueChange={setTicketPriority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority</SelectLabel>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="ticket-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="ticket-description"
              placeholder="Please describe your issue in detail"
              className="col-span-3"
              rows={5}
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={createTicketMutation.isPending}>
            {createTicketMutation.isPending ? "Creating..." : "Submit Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function SupportTicketsPage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExternalPortalOpen, setIsExternalPortalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Real API query for support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/support-tickets'],
    queryFn: () => fetch('/api/support-tickets').then(res => res.json()),
  });
  
  const filteredTickets = tickets.filter(ticket => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Convert database values to display format for filtering
    const displayStatus = ticket.status === 'open' ? 'Open' : 
                         ticket.status === 'in_progress' ? 'In Progress' :
                         ticket.status === 'resolved' ? 'Resolved' :
                         ticket.status === 'closed' ? 'Closed' : ticket.status;
    
    const displayPriority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
    
    const displayCategory = ticket.type === 'technical' ? 'Technical' :
                           ticket.type === 'billing' ? 'Billing' :
                           ticket.type === 'feature_request' ? 'Feature' :
                           ticket.type === 'general_inquiry' ? 'General' : ticket.type;
    
    // Filter by advanced filters
    const matchesStatus = filters.status === 'all' || displayStatus === filters.status;
    const matchesPriority = filters.priority === 'all' || displayPriority === filters.priority;
    const matchesCategory = filters.category === 'all' || displayCategory === filters.category;
    
    // Filter by tab
    let matchesTab = true;
    if (selectedTab === 'open') matchesTab = ticket.status === 'Open';
    else if (selectedTab === 'in-progress') matchesTab = ticket.status === 'In Progress';
    else if (selectedTab === 'resolved') matchesTab = ticket.status === 'Resolved';
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesTab;
  });
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-muted-foreground">Manage and track your support requests</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <a 
            href="https://ticket.averox.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center"
          >
            <Button variant="outline" className="mr-2">
              <ExternalLink className="mr-2 h-4 w-4" /> External Support Portal
            </Button>
          </a>
          <Button variant="default" onClick={() => setIsNewTicketDialogOpen(true)}>
            <Ticket className="mr-2 h-4 w-4" /> New Ticket
          </Button>
        </div>
      </div>
      
      {selectedTicket ? (
        <Card>
          <CardContent className="p-6">
            <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="all" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search tickets..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => setIsFilterDialogOpen(true)}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-6">
              <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No tickets found. Create a new support ticket to get help.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => {
                    // Format values for display
                    const displayStatus = ticket.status === 'open' ? 'Open' : 
                                         ticket.status === 'in_progress' ? 'In Progress' :
                                         ticket.status === 'resolved' ? 'Resolved' :
                                         ticket.status === 'closed' ? 'Closed' : ticket.status;
                    
                    const displayPriority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
                    
                    const displayCategory = ticket.type === 'technical' ? 'Technical' :
                                           ticket.type === 'billing' ? 'Billing' :
                                           ticket.type === 'feature_request' ? 'Feature' :
                                           ticket.type === 'general_inquiry' ? 'General' : ticket.type;
                    
                    return (
                      <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTicket(ticket)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(displayStatus)}>
                            {getStatusIcon(displayStatus)} {displayStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(displayPriority)}>
                            {getPriorityIcon(displayPriority)} {displayPriority}
                          </Badge>
                        </TableCell>
                        <TableCell>{displayCategory}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              </Table>
            </Card>
            </TabsContent>
            
            <TabsContent value="open" className="mt-6">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Loading tickets...
                        </TableCell>
                      </TableRow>
                    ) : filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No open tickets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const displayStatus = ticket.status === 'open' ? 'Open' : 
                                             ticket.status === 'in_progress' ? 'In Progress' :
                                             ticket.status === 'resolved' ? 'Resolved' :
                                             ticket.status === 'closed' ? 'Closed' : ticket.status;
                        
                        const displayPriority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
                        
                        const displayCategory = ticket.type === 'technical' ? 'Technical' :
                                               ticket.type === 'billing' ? 'Billing' :
                                               ticket.type === 'feature_request' ? 'Feature' :
                                               ticket.type === 'general_inquiry' ? 'General' : ticket.type;

                        return (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={displayStatus === 'Open' ? 'destructive' : 
                                             displayStatus === 'In Progress' ? 'default' : 
                                             displayStatus === 'Resolved' ? 'secondary' : 'outline'}>
                                {displayStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={displayPriority === 'Critical' ? 'destructive' :
                                             displayPriority === 'High' ? 'destructive' :
                                             displayPriority === 'Medium' ? 'default' : 'secondary'}>
                                {displayPriority}
                              </Badge>
                            </TableCell>
                            <TableCell>{displayCategory}</TableCell>
                            <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
            
            <TabsContent value="in-progress" className="mt-6">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Loading tickets...
                        </TableCell>
                      </TableRow>
                    ) : filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No tickets in progress found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const displayStatus = ticket.status === 'open' ? 'Open' : 
                                             ticket.status === 'in_progress' ? 'In Progress' :
                                             ticket.status === 'resolved' ? 'Resolved' :
                                             ticket.status === 'closed' ? 'Closed' : ticket.status;
                        
                        const displayPriority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
                        
                        const displayCategory = ticket.type === 'technical' ? 'Technical' :
                                               ticket.type === 'billing' ? 'Billing' :
                                               ticket.type === 'feature_request' ? 'Feature' :
                                               ticket.type === 'general_inquiry' ? 'General' : ticket.type;

                        return (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={displayStatus === 'Open' ? 'destructive' : 
                                             displayStatus === 'In Progress' ? 'default' : 
                                             displayStatus === 'Resolved' ? 'secondary' : 'outline'}>
                                {displayStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={displayPriority === 'Critical' ? 'destructive' :
                                             displayPriority === 'High' ? 'destructive' :
                                             displayPriority === 'Medium' ? 'default' : 'secondary'}>
                                {displayPriority}
                              </Badge>
                            </TableCell>
                            <TableCell>{displayCategory}</TableCell>
                            <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-6">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Loading tickets...
                        </TableCell>
                      </TableRow>
                    ) : filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No resolved tickets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => {
                        const displayStatus = ticket.status === 'open' ? 'Open' : 
                                             ticket.status === 'in_progress' ? 'In Progress' :
                                             ticket.status === 'resolved' ? 'Resolved' :
                                             ticket.status === 'closed' ? 'Closed' : ticket.status;
                        
                        const displayPriority = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
                        
                        const displayCategory = ticket.type === 'technical' ? 'Technical' :
                                               ticket.type === 'billing' ? 'Billing' :
                                               ticket.type === 'feature_request' ? 'Feature' :
                                               ticket.type === 'general_inquiry' ? 'General' : ticket.type;

                        return (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{ticket.subject}</p>
                                <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={displayStatus === 'Open' ? 'destructive' : 
                                             displayStatus === 'In Progress' ? 'default' : 
                                             displayStatus === 'Resolved' ? 'secondary' : 'outline'}>
                                {displayStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={displayPriority === 'Critical' ? 'destructive' :
                                             displayPriority === 'High' ? 'destructive' :
                                             displayPriority === 'Medium' ? 'default' : 'secondary'}>
                                {displayPriority}
                              </Badge>
                            </TableCell>
                            <TableCell>{displayCategory}</TableCell>
                            <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Customer Support Portal</CardTitle>
              <CardDescription>Access your dedicated support portal for personalized assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 bg-blue-50 p-4 rounded-md">
                  <div className="flex items-center mb-3">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-semibold">External Support Portal</h3>
                  </div>
                  <p className="text-sm mb-4">
                    Access our dedicated customer portal to submit tickets, view knowledge base articles, 
                    and get real-time updates on your support requests.
                  </p>
                  <Button onClick={() => setIsExternalPortalOpen(true)}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Access Customer Portal
                  </Button>
                </div>
                
                <div className="flex-1 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-3">
                    <MessageCircleQuestion className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-semibold">Register a Complaint</h3>
                  </div>
                  <p className="text-sm mb-4">
                    Not satisfied with our support? Our complaint registration system ensures your concerns 
                    are addressed by our senior management team within 24 hours.
                  </p>
                  <Button variant="outline" onClick={() => setIsComplaintModalOpen(true)}>
                    <MessageCircleQuestion className="mr-2 h-4 w-4" /> Register Complaint
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Support</CardTitle>
                <CardDescription>Other ways to get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm EST</p>
                      <p className="text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-500">24/7 Response</p>
                      <p className="text-sm">support@averox.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MessageCircleQuestion className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-gray-500">Available during business hours</p>
                      <Button variant="link" className="p-0 h-auto" onClick={() => setIsChatOpen(true)}>Start Chat</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
                <CardDescription>Explore our knowledge base and tutorials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <Button variant="outline" className="justify-start" onClick={() => window.open('https://averox.com', '_blank')}>
                    User Guide
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => window.open('https://api.averox.com', '_blank')}>
                    API Documentation
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => window.open('https://tutorials.averox.com', '_blank')}>
                    Video Tutorials
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => window.open('https://faq.averox.com', '_blank')}>
                    Frequently Asked Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
                <CardDescription>Current operational status of AVEROX services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Core CRM Services</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Processing</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Services</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Degraded
                    </Badge>
                  </div>
                  <Button variant="link" className="text-sm p-0 h-auto mt-2" onClick={() => window.open('https://status.averox.com', '_blank')}>
                    View System Status Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      <NewTicketDialog
        open={isNewTicketDialogOpen}
        onOpenChange={setIsNewTicketDialogOpen}
      />
      
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <ChatBox 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
      
      {/* External Support Portal Modal */}
      <Dialog open={isExternalPortalOpen} onOpenChange={setIsExternalPortalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              External Support Portal
            </DialogTitle>
            <DialogDescription>
              Access your dedicated customer portal for comprehensive support services
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What you can do in the portal:</h3>
              <ul className="text-sm space-y-1">
                <li>• Submit and track support tickets</li>
                <li>• Access knowledge base articles</li>
                <li>• Download documentation and guides</li>
                <li>• View your support history</li>
                <li>• Contact support agents directly</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Portal Access Information:</h3>
              <p className="text-sm mb-2">
                <strong>Portal URL:</strong> https://support.averox.com
              </p>
              <p className="text-sm mb-2">
                <strong>Username:</strong> {user?.email || 'Your registered email'}
              </p>
              <p className="text-sm">
                <strong>Note:</strong> Use your current account credentials to log in
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open('https://support.averox.com', '_blank')}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Portal
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsExternalPortalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Register Complaint Modal */}
      <RegisterComplaintModal 
        open={isComplaintModalOpen}
        onOpenChange={setIsComplaintModalOpen}
      />
    </div>
  );
}

// Register Complaint Modal Component
const RegisterComplaintModal = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) => {
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('');
  const [relatedTicket, setRelatedTicket] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmitComplaint = () => {
    if (!complaintTitle.trim() || !complaintDescription.trim() || !complaintCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would normally submit to an API
    toast({
      title: "Complaint Registered",
      description: "Your complaint has been submitted to our senior management team. You will receive a response within 24 hours.",
    });
    
    // Reset form
    setComplaintTitle('');
    setComplaintDescription('');
    setComplaintCategory('');
    setRelatedTicket('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            Register a Complaint
          </DialogTitle>
          <DialogDescription>
            Submit a formal complaint to our senior management team for immediate attention
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Important Notice</h3>
                <p className="text-sm text-red-700">
                  This form is for formal complaints regarding service quality, staff behavior, 
                  or unresolved issues. For technical support, please use the regular ticket system.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="complaint-title">Complaint Title *</Label>
              <Input
                id="complaint-title"
                placeholder="Brief summary of your complaint"
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="complaint-category">Category *</Label>
              <Select value={complaintCategory} onValueChange={setComplaintCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service-quality">Service Quality</SelectItem>
                  <SelectItem value="response-time">Response Time</SelectItem>
                  <SelectItem value="staff-behavior">Staff Behavior</SelectItem>
                  <SelectItem value="billing-dispute">Billing Dispute</SelectItem>
                  <SelectItem value="unresolved-issue">Unresolved Technical Issue</SelectItem>
                  <SelectItem value="policy-concern">Policy Concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="related-ticket">Related Ticket ID (Optional)</Label>
              <Input
                id="related-ticket"
                placeholder="e.g., TK-2024-001"
                value={relatedTicket}
                onChange={(e) => setRelatedTicket(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="complaint-description">Detailed Description *</Label>
              <Textarea
                id="complaint-description"
                placeholder="Please provide detailed information about your complaint, including dates, times, and any relevant context..."
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                rows={6}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">What happens next?</h4>
              <ul className="text-xs space-y-1">
                <li>• Your complaint will be escalated to senior management</li>
                <li>• You'll receive acknowledgment within 2 hours</li>
                <li>• Investigation will begin immediately</li>
                <li>• Resolution target: 24 hours</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitComplaint}>
              Submit Complaint
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};