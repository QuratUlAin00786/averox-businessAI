import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Globe, ExternalLink, MessageCircleQuestion, Eye, ArrowLeft, Plus
} from 'lucide-react';

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

const NewTicketDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketPriority, setTicketPriority] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/support-tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Support ticket created",
        description: "Your support ticket has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      onOpenChange(false);
      setTicketSubject('');
      setTicketCategory('');
      setTicketPriority('');
      setTicketDescription('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!ticketSubject.trim() || !ticketCategory || !ticketPriority || !ticketDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate({
      subject: ticketSubject,
      type: ticketCategory,
      priority: ticketPriority,
      description: ticketDescription,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Support Ticket</DialogTitle>
          <DialogDescription>
            Submit a new support request and our team will respond within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticket-subject" className="text-right">
              Subject *
            </Label>
            <Input
              id="ticket-subject"
              placeholder="Brief description of your issue"
              className="col-span-3"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticket-category" className="text-right">
              Category *
            </Label>
            <Select value={ticketCategory} onValueChange={setTicketCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing & Payments</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
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
  const [, setLocation] = useLocation();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/support-tickets'],
  });

  // Filter tickets based on tab selection and search query
  const filteredTickets = (tickets as any[]).filter((ticket) => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    let matchesTab = true;
    if (selectedTab === 'open') matchesTab = ticket.status === 'open';
    else if (selectedTab === 'in-progress') matchesTab = ticket.status === 'in_progress';
    else if (selectedTab === 'resolved') matchesTab = ticket.status === 'resolved';
    
    return matchesSearch && matchesTab;
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
          <Button onClick={() => setIsNewTicketDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {selectedTicket ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTicket(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle className="text-xl">{selectedTicket.title}</CardTitle>
                  <CardDescription>Ticket #{selectedTicket.id} • Created {new Date(selectedTicket.createdAt).toLocaleDateString()}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={selectedTicket.status === 'Open' ? 'destructive' : 
                               selectedTicket.status === 'In Progress' ? 'default' : 
                               selectedTicket.status === 'Resolved' ? 'secondary' : 'outline'}>
                  {selectedTicket.status}
                </Badge>
                <Badge variant={selectedTicket.priority === 'Critical' ? 'destructive' :
                               selectedTicket.priority === 'High' ? 'destructive' :
                               selectedTicket.priority === 'Medium' ? 'default' : 'secondary'}>
                  {selectedTicket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedTicket.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Conversation</h3>
                <div className="space-y-3">
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isAgent ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        message.isAgent 
                          ? 'bg-muted text-muted-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.isAgent ? 'text-muted-foreground' : 'text-primary-foreground/70'
                        }`}>
                          {message.isAgent ? 'Support Agent' : 'You'} • {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Tabs defaultValue="all" className="w-auto" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
            
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
            </div>
          </div>
          
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
        </>
      )}
      
      <NewTicketDialog
        open={isNewTicketDialogOpen}
        onOpenChange={setIsNewTicketDialogOpen}
      />
    </div>
  );
}