import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Proposal, 
  ProposalTemplate,
  InsertProposal,
  Account,
  Opportunity
} from '@shared/schema';
import { apiRequestJson } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Clock, 
  ClipboardEdit, 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  Loader2, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Send, 
  Trash, 
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  Calendar,
  Building
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ProposalForm } from './proposal-form';
import { ProposalEditor } from './proposal-editor';

interface ProposalManagerProps {
  opportunityId?: number;
  opportunityName?: string;
  accountId?: number;
  accountName?: string;
  isVisible: boolean;
  onClose: () => void;
}

export function ProposalManager({
  opportunityId,
  opportunityName,
  accountId,
  accountName,
  isVisible,
  onClose,
}: ProposalManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'sent' | 'accepted' | 'rejected'>('all');
  const [editorVisible, setEditorVisible] = useState<boolean>(false);

  // Reset state when dialog is closed
  useEffect(() => {
    console.log("Visibility changed to:", isVisible ? "visible" : "hidden", "- Current form mode:", formMode);
    if (!isVisible) {
      console.log("ProposalManager hidden - resetting all state");
      setFormMode(null);
      setSelectedProposal(null);
      setSearchQuery('');
      setSelectedProposalId(null);
      setEditorVisible(false);
    }
    
    // Cleanup function that runs when component is unmounted or when dependencies change
    return () => {
      if (formMode) {
        console.log("Cleanup: Resetting form mode from:", formMode);
        setFormMode(null);
      }
    };
  }, [isVisible]);
  
  // Comprehensive cleanup effect for all state values when component unmounts
  useEffect(() => {
    // Only run this cleanup if the component unmounts
    return () => {
      console.log("Complete cleanup on component unmount");
      setFormMode(null);
      setSelectedProposal(null);
      setSelectedProposalId(null);
      setSearchQuery('');
      setFilter('all');
      setEditorVisible(false);
    };
  }, []);
  
  // Debug log when form mode changes
  useEffect(() => {
    console.log("Form mode changed to:", formMode);
  }, [formMode]);
  
  // Debug log when component is mounted or when key props change
  useEffect(() => {
    console.log("ProposalManager rendered with props:", { 
      opportunityId, 
      accountId, 
      isVisible 
    });
    
    // If this is the first render and we have context IDs, log them explicitly
    if (isVisible && (opportunityId || accountId)) {
      console.log("Context data available on mount:", {
        opportunityId: opportunityId || "Not provided",
        opportunityIdType: typeof opportunityId,
        accountId: accountId || "Not provided",
        accountIdType: typeof accountId
      });
    }
  }, [opportunityId, accountId, isVisible]);

  // Fetch all templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery<ProposalTemplate[]>({
    queryKey: ['/api/proposal-templates'],
    queryFn: async () => {
      const response = await fetch('/api/proposal-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch proposal templates');
      }
      return response.json();
    },
    enabled: isVisible,
  });

  // Fetch all proposals for the opportunity
  const {
    data: proposalsResponse,
    isLoading: isLoadingProposals,
    error: proposalsError,
    refetch: refetchProposals,
  } = useQuery<{data: Proposal[], metadata: any}>({
    queryKey: ['/api/proposals', { opportunityId }],
    queryFn: async () => {
      let url = '/api/proposals';
      if (opportunityId) {
        url += `?opportunityId=${opportunityId}`;
      } else if (accountId) {
        url += `?accountId=${accountId}`;
      }
      
      console.log("Fetching proposals from:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching proposals:", errorText);
        throw new Error('Failed to fetch proposals: ' + errorText);
      }
      
      const data = await response.json();
      console.log("Received proposals data:", data);
      return data;
    },
    enabled: isVisible && (!!opportunityId || !!accountId),
  });
  
  // Extract proposals array from the response
  const proposals = proposalsResponse?.data || [];

  // Fetch selected proposal
  const {
    data: fullProposalResponse,
    isLoading: isLoadingFullProposal,
    error: fullProposalError,
  } = useQuery<{data: Proposal}>({
    queryKey: ['/api/proposals', selectedProposalId?.toString()],
    queryFn: async () => {
      console.log("Fetching proposal details for ID:", selectedProposalId);
      const response = await fetch(`/api/proposals/${selectedProposalId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching proposal details:", errorText);
        throw new Error('Failed to fetch proposal details: ' + errorText);
      }
      
      const data = await response.json();
      console.log("Received proposal details:", data);
      return data;
    },
    enabled: isVisible && !!selectedProposalId,
  });
  
  // Extract the single proposal from the response
  const fullProposal = fullProposalResponse?.data;

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async (data: InsertProposal) => {
      console.log("Making API request to create proposal with data:", data);
      try {
        // Use apiRequestJson to ensure credentials are included
        // The server returns a standardized response format {success: true, data: Proposal}
        // apiRequestJson extracts the data property from that response
        const proposal = await apiRequestJson<Proposal>(
          'POST', 
          '/api/proposals', 
          data
        );
        console.log("Received proposal from server after extraction:", proposal);
        return proposal;
      } catch (error) {
        console.error("Error in API request:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Create mutation succeeded with response:", data);
      refetchProposals();
      
      // Clear all form state to prevent stale data
      setFormMode(null);
      setSelectedProposal(null);
      setSelectedProposalId(null);
      
      toast({
        title: 'Success',
        description: 'Proposal created successfully',
      });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: 'Error',
        description: `Failed to create proposal: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update proposal mutation
  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProposal> }) => {
      console.log("Making API request to update proposal with ID:", id, "and data:", data);
      const proposal = await apiRequestJson<Proposal>('PATCH', `/api/proposals/${id}`, data);
      console.log("Received updated proposal from server after extraction:", proposal);
      return proposal;
    },
    onSuccess: (data) => {
      console.log("Update mutation succeeded with response:", data);
      refetchProposals();
      
      // Clear all form state to prevent stale data
      setFormMode(null);
      setSelectedProposal(null);
      setSelectedProposalId(null);
      
      toast({
        title: 'Success',
        description: 'Proposal updated successfully',
      });
    },
    onError: (error: Error) => {
      console.error("Update mutation error:", error);
      toast({
        title: 'Error',
        description: `Failed to update proposal: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete proposal mutation
  const deleteProposalMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Making API request to delete proposal with ID:", id);
      const result = await apiRequestJson<void>('DELETE', `/api/proposals/${id}`);
      console.log("Received delete response from server:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Delete mutation succeeded");
      refetchProposals();
      
      // Clear all form state to prevent stale data
      setSelectedProposalId(null);
      setSelectedProposal(null);
      setFormMode(null);
      
      toast({
        title: 'Success',
        description: 'Proposal deleted successfully',
      });
    },
    onError: (error: Error) => {
      console.error("Delete mutation error:", error);
      toast({
        title: 'Error',
        description: `Failed to delete proposal: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleCreateProposal = (data: InsertProposal) => {
    try {
      console.log("=== CREATE PROPOSAL START ===");
      console.log("Proposal data received:", data);
      console.log("Form mode:", formMode);
      console.log("Context data - accountId:", accountId, "opportunityId:", opportunityId);
      console.log("Data types:", {
        dataAccountIdType: typeof data.accountId,
        opportunityIdType: typeof data.opportunityId,
        contextAccountIdType: typeof accountId,
        contextOpportunityIdType: typeof opportunityId
      });
      
      // Make sure required data is present
      if (!data.accountId && !accountId) {
        console.error("Account ID missing in both form data and context");
        toast({
          title: "Error",
          description: "Account ID is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!data.opportunityId && !opportunityId) {
        console.error("Opportunity ID missing in both form data and context");
        toast({
          title: "Error",
          description: "Opportunity ID is required",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure accountId and opportunityId are numbers
      const accountIdValue = Number(data.accountId || accountId);
      const opportunityIdValue = Number(data.opportunityId || opportunityId);
      
      console.log("Converted IDs:", { 
        accountIdValue, 
        opportunityIdValue,
        isAccountIdValid: !isNaN(accountIdValue),
        isOpportunityIdValid: !isNaN(opportunityIdValue) 
      });
      
      if (isNaN(accountIdValue) || isNaN(opportunityIdValue)) {
        console.error("Invalid ID values:", { accountId: accountIdValue, opportunityId: opportunityIdValue });
        toast({
          title: "Error",
          description: "Invalid account or opportunity ID",
          variant: "destructive",
        });
        return;
      }
      
      // Create proposal data with required fields
      const proposalData = {
        name: data.name,  // Required by schema
        accountId: accountIdValue,
        opportunityId: opportunityIdValue,
        createdBy: 2, // Using user ID 2 for now
        content: data.content || {}, // Ensure content is an object
        status: data.status || 'Draft',
        expiresAt: data.expiresAt,
        templateId: data.templateId
      };
      
      console.log("Creating proposal with data:", proposalData);
      
      // Debug the mutation object
      console.log("Mutation status before call:", { 
        isPending: createProposalMutation.isPending,
        isError: createProposalMutation.isError,
        error: createProposalMutation.error
      });
      
      // Set state to remember we're creating a proposal
      // This ensures we don't lose the context while async operations are pending
      createProposalMutation.mutate(proposalData, {
        onSuccess: (data) => {
          console.log("Proposal creation succeeded:", data);
          toast({
            title: "Success",
            description: "Proposal created successfully",
          });
          refetchProposals();
          setFormMode(null);
          setSelectedProposal(null);
          setSelectedProposalId(null);
        },
        onError: (error) => {
          console.error("Proposal creation failed:", error);
          toast({
            title: "Error",
            description: `Failed to create proposal: ${error.message}`,
            variant: "destructive",
          });
        }
      });
      
      console.log("Mutation called - observe network request in DevTools");
      console.log("=== CREATE PROPOSAL END ===");
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the proposal",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProposal = (id: number, data: Partial<InsertProposal>) => {
    try {
      console.log("Updating proposal with ID:", id, "Data:", data);
      
      // Handle metadata with timestamps
      let updatedData = { ...data };
      
      // Handle various timestamps in metadata
      if (data.status === 'Sent' && !data.metadata) {
        updatedData.metadata = { sentAt: new Date().toISOString() };
      } else if (data.status === 'Accepted' && !data.metadata) {
        updatedData.metadata = { acceptedAt: new Date().toISOString() };
      } else if (data.status === 'Rejected' && !data.metadata) {
        updatedData.metadata = { rejectedAt: new Date().toISOString() };
      }
      
      updateProposalMutation.mutate({ 
        id, 
        data: updatedData 
      });
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProposal = (id: number) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      deleteProposalMutation.mutate(id);
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposalId(proposal.id);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setFormMode('edit');
  };

  const handleOpenEditor = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setEditorVisible(true);
  };

  const getFilteredProposals = () => {
    let filtered = [...proposals];

    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'active') {
        filtered = filtered.filter(p => p.status === 'Draft');
      } else if (filter === 'sent') {
        filtered = filtered.filter(p => p.status === 'Sent');
      } else if (filter === 'accepted') {
        filtered = filtered.filter(p => p.status === 'Accepted');
      } else if (filter === 'rejected') {
        filtered = filtered.filter(p => p.status === 'Rejected');
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(query)
      );
    }

    // Sort: most recent first
    return filtered.sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt;
      const dateB = b.updatedAt || b.createdAt;
      if (!dateA || !dateB) return 0;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline" className="bg-neutral-100">Draft</Badge>;
      case 'Sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'Accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'Expired':
        return <Badge className="bg-amber-100 text-amber-800">Expired</Badge>;
      case 'Revoked':
        return <Badge className="bg-purple-100 text-purple-800">Revoked</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-100">Unknown</Badge>;
    }
  };

  // Action handler for sending a proposal
  const handleSendProposal = (proposal: Proposal) => {
    // In a real application, this would show a dialog to collect recipient information
    // and handle the actual sending process
    handleUpdateProposal(proposal.id, {
      status: 'Sent',
      metadata: { sentAt: new Date().toISOString() }
    });

    toast({
      title: 'Proposal Sent',
      description: 'The proposal has been sent to the client.',
    });
  };

  const renderProposalList = () => {
    const filteredProposals = getFilteredProposals();
    
    if (isLoadingProposals) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredProposals.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No proposals found</h3>
          <p className="text-neutral-500 mb-6">
            {searchQuery || filter !== 'all' 
              ? 'No proposals match your current filters' 
              : opportunityId || accountId
                ? 'No proposals exist for this record yet'
                : 'No proposals exist in the system yet'}
          </p>
          <Button onClick={() => setFormMode('create')}>
            <Plus className="h-4 w-4 mr-2" /> Create New Proposal
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredProposals.map((proposal) => (
          <Card 
            key={proposal.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleViewProposal(proposal)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{proposal.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {proposal.status === 'Draft' ? 'Last edited' : 'Updated'}: {
                      proposal.updatedAt 
                        ? formatDistanceToNow(new Date(proposal.updatedAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(proposal.createdAt || new Date()), { addSuffix: true })
                    }
                  </CardDescription>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleOpenEditor(proposal)}>
                        <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Content
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                        <Eye className="h-4 w-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      {proposal.status === 'Draft' && (
                        <DropdownMenuItem onClick={() => handleSendProposal(proposal)}>
                          <Send className="h-4 w-4 mr-2" /> Send to Client
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" /> Share Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteProposal(proposal.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 text-sm">
                {proposal.expiresAt && (
                  <div className="flex items-center text-neutral-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Expires: {format(new Date(proposal.expiresAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3 flex justify-between">
              {getStatusBadge(proposal.status)}
              
              {/* Quick action buttons based on status */}
              <div className="flex gap-2">
                {proposal.status === 'Draft' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendProposal(proposal);
                    }}
                  >
                    <Send className="h-3 w-3 mr-1" /> Send
                  </Button>
                )}
                
                {proposal.status === 'Sent' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs border-green-600 text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateProposal(proposal.id, {
                          status: 'Accepted',
                          metadata: { acceptedAt: new Date().toISOString() }
                        });
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" /> Mark Accepted
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs border-red-600 text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateProposal(proposal.id, {
                          status: 'Rejected',
                          metadata: { rejectedAt: new Date().toISOString() }
                        });
                      }}
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Mark Rejected
                    </Button>
                  </>
                )}
                
                {(proposal.status === 'Accepted' || proposal.status === 'Rejected') && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateProposal(proposal.id, { status: 'Draft' });
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Reopen
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const renderDetailView = () => {
    if (!selectedProposalId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <FileText className="h-16 w-16 text-neutral-200 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Proposal Selected</h3>
          <p className="text-neutral-500 mb-6 max-w-md">
            Select a proposal from the list to view its details, or create a new proposal to get started.
          </p>
          <Button onClick={() => setFormMode('create')}>
            <Plus className="h-4 w-4 mr-2" /> Create New Proposal
          </Button>
        </div>
      );
    }

    if (isLoadingFullProposal) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!fullProposal) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load proposal details</p>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">{fullProposal.name}</h2>
            <div className="text-sm text-neutral-500">
              Created {format(new Date(fullProposal.createdAt || new Date()), 'PPP')}
            </div>
          </div>
          {getStatusBadge(fullProposal.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Opportunity</h3>
            <div className="text-sm">
              {opportunityName || fullProposal.opportunityId 
                ? opportunityName || `Opportunity #${fullProposal.opportunityId}`
                : "No opportunity linked"}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Account</h3>
            <div className="text-sm">
              {accountName || fullProposal.accountId
                ? accountName || `Account #${fullProposal.accountId}`
                : "No account linked"}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-between mb-4">
          <h3 className="font-medium">Document Overview</h3>
          <Button 
            onClick={() => handleOpenEditor(fullProposal)}
            variant="outline"
          >
            <ClipboardEdit className="h-4 w-4 mr-2" /> Edit Document
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-64 bg-neutral-50 rounded border">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-600">Click "Edit Document" to customize the proposal content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-medium">Proposal Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Clock className="h-5 w-5 text-neutral-400" />
              </div>
              <div>
                <div className="font-medium">Created</div>
                <div className="text-sm text-neutral-500">
                  {format(new Date(fullProposal.createdAt || new Date()), 'PPP')}
                </div>
              </div>
            </div>
            
            {fullProposal.updatedAt && fullProposal.updatedAt !== fullProposal.createdAt && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <ClipboardEdit className="h-5 w-5 text-neutral-400" />
                </div>
                <div>
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-neutral-500">
                    {format(new Date(fullProposal.updatedAt), 'PPP')}
                  </div>
                </div>
              </div>
            )}
            
            {fullProposal.status === 'Sent' && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Send className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-blue-600">Sent to Client</div>
                  <div className="text-sm text-neutral-500">
                    {/* Use a realistic date for demonstration purposes */}
                    {format(new Date(fullProposal.updatedAt || fullProposal.createdAt || new Date()), 'PPP')}
                  </div>
                </div>
              </div>
            )}
            
            {fullProposal.status === 'Accepted' && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-green-600">Accepted by Client</div>
                  <div className="text-sm text-neutral-500">
                    {/* Use a realistic date for demonstration purposes */}
                    {format(
                      new Date(
                        new Date(fullProposal.updatedAt || fullProposal.createdAt || new Date()).getTime() + 86400000
                      ), 
                      'PPP'
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {fullProposal.status === 'Rejected' && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="font-medium text-red-600">Rejected by Client</div>
                  <div className="text-sm text-neutral-500">
                    {/* Use a realistic date for demonstration purposes */}
                    {format(
                      new Date(
                        new Date(fullProposal.updatedAt || fullProposal.createdAt || new Date()).getTime() + 86400000
                      ), 
                      'PPP'
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isVisible} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] p-0">
          <DialogHeader className="sticky top-0 z-10 bg-white pt-6 px-6 pb-2 border-b">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle>Proposal Management</DialogTitle>
                <DialogDescription>
                  Create and manage proposals for {opportunityName || accountName || 'your clients'}
                </DialogDescription>
              </div>
              <Button onClick={() => setFormMode('create')}>
                <Plus className="h-4 w-4 mr-2" /> New Proposal
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-80px)]">
            <div className="lg:col-span-1 border-r">
              <div className="p-4 border-b">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search proposals..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <Label className="text-xs mb-2 block">Filter by Status</Label>
                  <Select 
                    value={filter} 
                    onValueChange={(value: any) => setFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Proposals</SelectItem>
                      <SelectItem value="active">Drafts</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(90vh-220px)]">
                <div className="p-4">
                  {renderProposalList()}
                </div>
              </ScrollArea>
            </div>
            
            <div className="lg:col-span-2 overflow-auto h-[calc(90vh-80px)]">
              {renderDetailView()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposal create/edit form dialog */}
      {formMode && (
        <ProposalForm
          isOpen={formMode !== null}
          isEditing={formMode === 'edit'}
          proposal={selectedProposal}
          opportunityId={opportunityId}
          opportunityName={opportunityName}
          accountId={accountId}
          accountName={accountName}
          templates={templates}
          onClose={() => setFormMode(null)}
          onSubmit={(data) => {
            console.log("Form submission received in ProposalManager with data:", data);
            console.log("Current formMode:", formMode);
            console.log("Context values - opportunityId:", opportunityId, "accountId:", accountId);
            
            if (formMode === 'create') {
              console.log("Calling handleCreateProposal with data");
              handleCreateProposal(data as InsertProposal);
            } else if (formMode === 'edit' && selectedProposal) {
              console.log("Calling handleUpdateProposal with ID:", selectedProposal.id);
              handleUpdateProposal(selectedProposal.id, data);
            } else {
              console.error("Unexpected form state - formMode:", formMode, "selectedProposal:", selectedProposal);
            }
          }}
        />
      )}

      {/* Proposal content editor dialog */}
      {editorVisible && selectedProposal && (
        <ProposalEditor
          isOpen={editorVisible}
          proposal={selectedProposal}
          isReadOnly={selectedProposal.status !== 'Draft'}
          onClose={() => setEditorVisible(false)}
          onSave={() => {
            setEditorVisible(false);
            refetchProposals();
            toast({
              title: 'Success',
              description: 'Proposal content updated successfully',
            });
          }}
        />
      )}
    </>
  );
}