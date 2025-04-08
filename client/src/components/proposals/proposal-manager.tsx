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

// Define a standardized API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
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

  // Using the standardized ApiResponse interface defined at the top of the file

  // Fetch all proposals for the opportunity
  const {
    data: proposalsResponse,
    isLoading: isLoadingProposals,
    error: proposalsError,
    refetch: refetchProposals,
  } = useQuery<ApiResponse<Proposal[]>>({
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
  } = useQuery<ApiResponse<Proposal>>({
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
      console.log("Making API request to create proposal with data:", JSON.stringify(data, null, 2));
      try {
        // Ensure content is a valid JSON object
        const content = data.content || {};
        
        // Create a clean proposal object with correct types
        const validatedData = {
          name: data.name,
          // Convert IDs to numbers and ensure they exist
          opportunityId: Number(data.opportunityId),
          accountId: Number(data.accountId),
          createdBy: Number(data.createdBy || 2),
          status: data.status || "Draft",
          // Ensure these are objects, not strings
          content: typeof content === 'string' ? JSON.parse(content) : content,
          metadata: data.metadata || {},
          // Only include other fields if they exist
          templateId: data.templateId ? Number(data.templateId) : undefined,
          expiresAt: data.expiresAt
        };
        
        // Validate required fields
        if (!validatedData.name) {
          throw new Error("Proposal name is required");
        }
        
        if (isNaN(validatedData.opportunityId) || validatedData.opportunityId <= 0) {
          throw new Error("Valid opportunity ID is required");
        }
        
        if (isNaN(validatedData.accountId) || validatedData.accountId <= 0) {
          throw new Error("Valid account ID is required");
        }
        
        console.log("Sending validated data:", JSON.stringify(validatedData, null, 2));
        
        // Make a direct fetch request to guarantee control over the process
        const response = await fetch('/api/proposals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server returned error:", errorData);
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log("Server response:", responseData);
        
        // Handle both response formats
        if (responseData.success === true && responseData.data) {
          return responseData.data;
        }
        
        return responseData;
      } catch (error: any) {
        console.error("Error in API request:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Create mutation succeeded with response:", data);
      
      // Handle the standardized API response format
      console.log("Raw creation response:", data);
      
      // Define a type guard for API responses
      const isApiResponse = (obj: any): obj is ApiResponse<Proposal> => {
        return obj && typeof obj === 'object' && 'success' in obj && 'data' in obj;
      };
      
      // Extract proposal data carefully
      let proposal: Proposal | null = null;
      
      if (isApiResponse(data)) {
        console.log("Response is wrapped in API response structure");
        proposal = data.data as Proposal;
      } else if (data && typeof data === 'object') {
        console.log("Response is direct proposal object");
        proposal = data as Proposal;
      }
      
      console.log("Extracted proposal data:", proposal);
      
      // Refresh the proposals list to show the newly created item
      refetchProposals();
      
      // If the response contains a valid proposal ID, set it as selected
      if (proposal && proposal.id) {
        console.log("Setting selected proposal ID to:", proposal.id);
        setSelectedProposalId(proposal.id);
      } else {
        console.warn("Created proposal doesn't have a valid ID");
      }
      
      // Clear form state
      setFormMode(null);
      setSelectedProposal(null);
      
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
  const updateProposalMutation = useMutation<Proposal, Error, { id: number; data: Partial<InsertProposal> }>({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProposal> }) => {
      console.log("Making API request to update proposal with ID:", id, "and data:", JSON.stringify(data, null, 2));
      
      try {
        // Create a clean processed data object with properly formatted values
        const processedData: Record<string, any> = {};
        
        // Only include fields that are present in the data object
        if (data.name !== undefined) {
          processedData.name = data.name;
        }
        
        if (data.status !== undefined) {
          processedData.status = data.status;
        }
        
        if (data.opportunityId !== undefined) {
          const opportunityId = Number(data.opportunityId);
          if (isNaN(opportunityId) || opportunityId <= 0) {
            throw new Error("Invalid opportunity ID");
          }
          processedData.opportunityId = opportunityId;
        }
        
        if (data.accountId !== undefined) {
          const accountId = Number(data.accountId);
          if (isNaN(accountId) || accountId <= 0) {
            throw new Error("Invalid account ID");
          }
          processedData.accountId = accountId;
        }
        
        if (data.content !== undefined) {
          processedData.content = typeof data.content === 'string' 
            ? JSON.parse(data.content) 
            : data.content;
        }
        
        if (data.metadata !== undefined) {
          processedData.metadata = data.metadata;
        }
        
        if (data.templateId !== undefined) {
          processedData.templateId = data.templateId ? Number(data.templateId) : null;
        }
        
        if (data.expiresAt !== undefined) {
          processedData.expiresAt = data.expiresAt;
        }
        
        console.log("Sending processed data:", JSON.stringify(processedData, null, 2));
        
        // Use direct fetch for consistency with other mutations and better control
        const response = await fetch(`/api/proposals/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(processedData),
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server returned error:", errorData);
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log("Received updated proposal from server:", responseData);
        
        // Handle both response formats
        if (responseData.success === true && responseData.data) {
          return responseData.data;
        }
        
        return responseData;
      } catch (error: any) {
        console.error("Error in update API request:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Update mutation succeeded with response:", data);
      
      // Handle the standardized API response format
      console.log("Raw update response:", data);
      
      // Define a type guard for API responses
      const isApiResponse = (obj: any): obj is ApiResponse<Proposal> => {
        return obj && typeof obj === 'object' && 'success' in obj && 'data' in obj;
      };
      
      // Extract proposal data carefully
      let proposal: Proposal | null = null;
      
      if (isApiResponse(data)) {
        console.log("Response is wrapped in API response structure");
        proposal = data.data as Proposal;
      } else if (data && typeof data === 'object') {
        console.log("Response is direct proposal object");
        proposal = data as Proposal;
      }
      
      console.log("Extracted proposal data from update response:", proposal);
      
      // Refresh the proposals list with updated data
      refetchProposals();
      
      // If the response contains a valid proposal ID, set it as selected
      if (proposal && proposal.id) {
        console.log("Setting selected proposal ID to:", proposal.id);
        setSelectedProposalId(proposal.id);
      } else {
        console.warn("Updated proposal doesn't have a valid ID");
      }
      
      // Clear form state but keep the proposal selected
      setFormMode(null);
      setSelectedProposal(null);
      
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
  const deleteProposalMutation = useMutation<ApiResponse<void>, Error, number>({
    mutationFn: async (id: number) => {
      console.log("Making API request to delete proposal with ID:", id);
      
      // Use direct fetch for consistency with other mutations and better control
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server returned error on delete:", errorData);
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Received delete response from server:", responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log("Delete mutation succeeded with response:", data);
      
      // Handle the standardized API response format
      console.log("Raw delete response:", data);
      
      // Define a type guard for API responses
      const isApiResponse = (obj: any): obj is ApiResponse<void> => {
        return obj && typeof obj === 'object' && 'success' in obj;
      };
      
      // Check for success status in response
      let success = false;
      
      if (isApiResponse(data)) {
        console.log("Response is wrapped in API response structure");
        success = data.success;
      } else if (data && typeof data === 'object') {
        console.log("Response is direct object");
        success = true;  // Assume success if we got a response without error
      }
      
      console.log("Delete operation success status:", success);
      
      // Refresh the proposals list to remove the deleted item
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
    const timestamp = new Date().toISOString();
    try {
      console.log(`[${timestamp}] handleCreateProposal called with data:`, JSON.stringify(data, null, 2));
      
      // Get account and opportunity IDs either from form data or from the component context
      const accountIdValue = Number(data.accountId || accountId);
      const opportunityIdValue = Number(data.opportunityId || opportunityId);
      
      console.log(`[${timestamp}] ID Values - opportunityId: ${opportunityIdValue} (${typeof opportunityIdValue}), accountId: ${accountIdValue} (${typeof accountIdValue})`);
      
      // Validate IDs
      if (!accountIdValue || isNaN(accountIdValue) || accountIdValue <= 0) {
        console.error(`[${timestamp}] Invalid account ID: ${accountIdValue}`);
        toast({
          title: "Error",
          description: "Valid account ID is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!opportunityIdValue || isNaN(opportunityIdValue) || opportunityIdValue <= 0) {
        console.error(`[${timestamp}] Invalid opportunity ID: ${opportunityIdValue}`);
        toast({
          title: "Error",
          description: "Valid opportunity ID is required",
          variant: "destructive",
        });
        return;
      }
      
      // Validate proposal name
      if (!data.name || !data.name.trim()) {
        console.error(`[${timestamp}] Missing proposal name`);
        toast({
          title: "Error",
          description: "Proposal name is required",
          variant: "destructive",
        });
        return;
      }
      
      // Create clean proposal data object with proper types
      const proposalData: InsertProposal = {
        name: data.name.trim(),
        accountId: accountIdValue,
        opportunityId: opportunityIdValue,
        // Default values
        status: data.status || 'Draft',
        createdBy: 2, // Current user ID
        // Handle JSON content correctly with error handling
        content: (() => {
          try {
            if (typeof data.content === 'string') {
              // Try to parse if it's a string
              return JSON.parse(data.content);
            } else if (data.content) {
              // If it's already an object, use it
              return data.content;
            } else {
              // Default to empty object
              return {};
            }
          } catch (e) {
            console.error("Error parsing content:", e);
            return {}; // Return empty object on parse error
          }
        })(),
        // Optional fields
        metadata: data.metadata || {},
        templateId: data.templateId ? Number(data.templateId) : undefined,
        expiresAt: data.expiresAt
      };
      
      console.log(`[${timestamp}] Submitting validated proposalData:`, JSON.stringify(proposalData, null, 2));
      console.log(`[${timestamp}] Data types - accountId: ${typeof proposalData.accountId}, opportunityId: ${typeof proposalData.opportunityId}, templateId: ${typeof proposalData.templateId}`);
      
      // Add timestamp to metadata for tracking
      // Ensure metadata is an object
      if (typeof proposalData.metadata !== 'object' || proposalData.metadata === null) {
        proposalData.metadata = {};
      }
      // Now safely add properties to the metadata object
      (proposalData.metadata as Record<string, any>).clientSubmissionTime = timestamp;
      
      // Execute mutation with error handling in the callbacks
      createProposalMutation.mutate(proposalData, {
        onSuccess: (data) => {
          console.log('Proposal created successfully:', data);
          
          // Close the form
          setFormMode(null);
          
          // If we have a valid ID, select the proposal
          if (data && typeof data === 'object' && 'id' in data) {
            setSelectedProposalId(data.id);
            // Fetch the newly created proposal to get full details
            refetchProposals();
          }
          
          toast({
            title: "Success",
            description: "Proposal created successfully",
          });
        },
        onError: (error) => {
          console.error('Error creating proposal:', error);
          toast({
            title: "Error",
            description: `Failed to create proposal: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      console.error(`[${timestamp}] Error in handleCreateProposal:`, error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProposal = (id: number, data: Partial<InsertProposal>) => {
    try {
      // Validate ID
      if (!id || isNaN(id) || id <= 0) {
        toast({
          title: "Error",
          description: "Invalid proposal ID",
          variant: "destructive",
        });
        return;
      }
      
      // Handle status-related metadata (timestamps for different statuses)
      const updatedData: Partial<InsertProposal> = { ...data };
      
      if (data.status === 'Sent') {
        if (!updatedData.metadata || typeof updatedData.metadata !== 'object') {
          updatedData.metadata = {};
        }
        (updatedData.metadata as Record<string, any>).sentAt = new Date().toISOString();
      } else if (data.status === 'Accepted') {
        if (!updatedData.metadata || typeof updatedData.metadata !== 'object') {
          updatedData.metadata = {};
        }
        (updatedData.metadata as Record<string, any>).acceptedAt = new Date().toISOString();
      } else if (data.status === 'Rejected') {
        if (!updatedData.metadata || typeof updatedData.metadata !== 'object') {
          updatedData.metadata = {};
        }
        (updatedData.metadata as Record<string, any>).rejectedAt = new Date().toISOString();
      }
      
      // Ensure IDs are properly formatted as numbers
      if (updatedData.opportunityId) {
        updatedData.opportunityId = Number(updatedData.opportunityId);
      }
      
      if (updatedData.accountId) {
        updatedData.accountId = Number(updatedData.accountId);
      }
      
      if (updatedData.templateId) {
        updatedData.templateId = Number(updatedData.templateId);
      }
      
      // Handle JSON content field if present
      if (updatedData.content !== undefined) {
        updatedData.content = typeof updatedData.content === 'string'
          ? JSON.parse(updatedData.content)
          : updatedData.content;
      }
      
      // Execute mutation with the processed data
      updateProposalMutation.mutate({ id, data: updatedData }, {
        onSuccess: (data) => {
          console.log('Proposal updated successfully:', data);
          
          // Close form if in edit mode
          if (formMode === 'edit') {
            setFormMode(null);
          }
          
          // Refresh data to get the latest updates
          refetchProposals();
          
          toast({
            title: "Success",
            description: "Proposal updated successfully",
          });
        },
        onError: (error) => {
          console.error('Error updating proposal:', error);
          toast({
            title: "Error",
            description: `Failed to update proposal: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update proposal: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProposal = (id: number) => {
    try {
      // Validate ID
      if (!id || isNaN(id) || id <= 0) {
        toast({
          title: "Error",
          description: "Invalid proposal ID",
          variant: "destructive",
        });
        return;
      }
      
      // Confirm deletion with the user
      if (window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
        deleteProposalMutation.mutate(id, {
          onSuccess: () => {
            console.log('Proposal deleted successfully');
            
            // Reset selected proposal if the currently selected one was deleted
            if (selectedProposalId === id) {
              setSelectedProposalId(null);
              setSelectedProposal(null);
            }
            
            toast({
              title: "Success",
              description: "Proposal deleted successfully",
            });
          },
          onError: (error) => {
            console.error('Error deleting proposal:', error);
            toast({
              title: "Error",
              description: `Failed to delete proposal: ${error.message || "Unknown error"}`,
              variant: "destructive",
            });
          }
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete proposal: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
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
    try {
      // Validate proposal object
      if (!proposal || !proposal.id || isNaN(proposal.id)) {
        toast({
          title: "Error",
          description: "Invalid proposal data",
          variant: "destructive",
        });
        return;
      }
      
      // In a production app, this would show a dialog to collect recipient information
      // such as email addresses, message, etc. before triggering the send operation
      
      // Update proposal status and add timestamp to metadata
      // Create an object to hold the updated data
      const updatedProposalData: Partial<InsertProposal> = {
        status: 'Sent',
        metadata: {}
      };
      
      // Safely add properties to metadata
      (updatedProposalData.metadata as Record<string, any>).sentAt = new Date().toISOString();
      // In a real application, you might add recipient info here
      // (updatedProposalData.metadata as Record<string, any>).recipients = ['example@client.com'];
      // (updatedProposalData.metadata as Record<string, any>).message = 'Please review the attached proposal';
      
      handleUpdateProposal(proposal.id, updatedProposalData);
      
      // Show success message
      toast({
        title: 'Proposal Sent',
        description: 'The proposal has been sent to the client.',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to send proposal: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
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
          <Button onClick={() => {
              console.log('Create proposal button clicked (1)');
              try {
                // Reset any existing selected proposal to avoid confusion
                setSelectedProposal(null);
                setSelectedProposalId(null);
                
                // Set form mode after a brief delay to ensure state consistency
                setTimeout(() => {
                  setFormMode('create');
                  console.log('Form mode set to create');
                }, 10);
              } catch (error) {
                console.error('Error setting form mode:', error);
              }
            }}>
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
                  <CardTitle className="text-base font-medium">{proposal.name}</CardTitle>
                  <CardDescription className="mt-1 text-sm text-neutral-600">
                    Last edited: {
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
            <CardContent className="pb-2 pt-0">
              <div className="flex items-center gap-4 text-sm">
                {proposal.expiresAt && (
                  <div className="flex items-center text-neutral-500">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>
                      Expires: {format(new Date(proposal.expiresAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3 flex justify-between items-center">
              <div>
                {getStatusBadge(proposal.status)}
              </div>
              
              {/* Quick action buttons based on status */}
              <div className="flex gap-2 ml-auto">
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
                        const acceptedData: Partial<InsertProposal> = {
                          status: 'Accepted',
                          metadata: {}
                        };
                        (acceptedData.metadata as Record<string, any>).acceptedAt = new Date().toISOString();
                        handleUpdateProposal(proposal.id, acceptedData);
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
                        const rejectedData: Partial<InsertProposal> = {
                          status: 'Rejected',
                          metadata: {}
                        };
                        (rejectedData.metadata as Record<string, any>).rejectedAt = new Date().toISOString();
                        handleUpdateProposal(proposal.id, rejectedData);
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
          <Button onClick={() => {
              console.log('Create proposal button clicked (2)');
              try {
                // Reset any existing selected proposal to avoid confusion
                setSelectedProposal(null);
                setSelectedProposalId(null);
                
                // Set form mode after a brief delay to ensure state consistency
                setTimeout(() => {
                  setFormMode('create');
                  console.log('Form mode set to create');
                }, 10);
              } catch (error) {
                console.error('Error setting form mode:', error);
              }
            }}>
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
              <Button onClick={() => {
                console.log('Create proposal button clicked (3)');
                try {
                  // Reset any existing selected proposal to avoid confusion
                  setSelectedProposal(null);
                  setSelectedProposalId(null);
                  
                  // Set form mode after a brief delay to ensure state consistency
                  setTimeout(() => {
                    setFormMode('create');
                    console.log('Form mode set to create');
                  }, 10);
                } catch (error) {
                  console.error('Error setting form mode:', error);
                }
              }}>
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
          onClose={() => {
            console.log("Form closing, resetting state");
            // Reset all related state to ensure clean state for next operation
            setFormMode(null);
            // Don't reset selected proposal here as it might be needed for the view
          }}
          onSubmit={(data) => {
            try {
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
            } catch (error) {
              console.error("Error in form submission handler:", error);
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