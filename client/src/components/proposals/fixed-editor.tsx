import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Proposal, 
  ProposalElement, 
  InsertProposalElement, 
  User,
  ProposalCollaborator,
  ProposalComment,
} from '@shared/schema';
// Import the ProposalElementType from our fix-element-add file
import type { ProposalElementType } from './fix-element-add';
import { CommentSection } from './comment-section';
import { CollaboratorSection } from './collaborator-section';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog';
import { apiRequestJson } from '@/lib/queryClient';
import { ElementEditorFactory } from './element-editors/element-editor-factory';
import { createProposalElement, refreshProposalElements, getElementDefaultContent } from './fix-element-add';
import DraggableElementList from './dnd/draggable-element-list';
import { 
  Loader2, 
  Save, 
  Plus,
  Trash2,
  MoveUp,
  Send,
  MoveDown,
  Users,
  MessageSquare,
  EyeIcon,
  LockIcon,
  ChevronUp,
  ChevronDown,
  GripVertical as GripVerticalIcon,
  UserPlus,
  FileIcon,
  FileText,
  MousePointerClickIcon,
  PlusIcon,
  AlertCircle,
  X,
  Upload,
  ArrowLeft,
  Pencil as PencilIcon
} from 'lucide-react';

// Import element renderer component
import { ElementPreview, ElementRenderer } from './proposal-element-renderer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProposalEditorProps {
  isOpen: boolean;
  proposal: Proposal;
  isReadOnly: boolean;
  onClose: () => void;
  onSave: () => void;
}

type ElementType = 'Header' | 'Text' | 'Image' | 'Table' | 'List' | 'Quote' | 'ProductList' | 'Signature' | 'PageBreak' | 'Custom';

export function ProposalEditor({
  isOpen,
  proposal,
  isReadOnly,
  onClose,
  onSave,
}: ProposalEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'editor' | 'elements' | 'comments'>('editor');
  const [isDraggingElement, setIsDraggingElement] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<ProposalElement | null>(null);
  const [newComment, setNewComment] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Viewer');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch proposal elements with better error handling
  const {
    data: elements = [],
    isLoading: isLoadingElements,
    refetch: refetchElements,
    error: elementsError,
  } = useQuery({
    queryKey: ['/api/proposals', proposal.id, 'elements'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/proposals/${proposal.id}/elements`);
        const json = await response.json();
        const data = (json.data || []) as ProposalElement[];
        return data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      } catch (error) {
        console.error("Error fetching proposal elements:", error);
        throw error;
      }
    },
  });
  
  // Always fetch collaborators regardless of active tab
  const {
    data: collaborators = [],
    isLoading: isLoadingCollaborators,
    refetch: refetchCollaborators,
  } = useQuery<(ProposalCollaborator & { user?: User })[]>({
    queryKey: ['/api/proposals', proposal.id, 'collaborators'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/proposals/${proposal.id}/collaborators`);
        const json = await response.json();
        return (json.data || []) as (ProposalCollaborator & { user?: User })[];
      } catch (error) {
        console.error("Error fetching collaborators:", error);
        throw error;
      }
    },
  });
  
  // Component lifecycle effect with enhanced element restoration
  useEffect(() => {
    console.log("ProposalEditor component mounted with isOpen:", isOpen, "proposalId:", proposal.id);
    
    // Check if there are cached elements in session storage
    let storedElement = null;
    try {
      const storedElementString = sessionStorage.getItem(`proposal_${proposal.id}_selected_element`);
      if (storedElementString) {
        try {
          const parsedElement = JSON.parse(storedElementString);
          if (parsedElement && parsedElement.id) {
            console.log("Found stored selected element:", parsedElement.id);
            storedElement = parsedElement;
          } else {
            console.warn("Stored element missing ID:", parsedElement);
            sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`);
          }
        } catch (parseError) {
          console.error("Error parsing stored element:", parseError);
          sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`);
        }
      }
    } catch (error) {
      console.warn("Error reading from sessionStorage:", error);
    }
    
    if (isOpen) {
      console.log("ProposalEditor is open, fetching elements for proposal:", proposal.id);
      refetchElements().then(() => {
        console.log("Elements fetched, ready for editing");
        
        // Cache the entire elements list in session storage
        try {
          sessionStorage.setItem(
            `proposal_${proposal.id}_elements`, 
            JSON.stringify(elements)
          );
          console.log("Cached elements in session storage");
        } catch (cacheError) {
          console.warn("Failed to cache elements in session storage:", cacheError);
        }
        
        // If we had a stored element, try to match it with fetched elements
        if (storedElement && elements.length > 0) {
          const foundElement = elements.find(e => e.id === storedElement.id);
          if (foundElement) {
            console.log("Setting stored element as selected:", foundElement.id);
            // Use the fresh element from the server but preserve any unsaved changes
            const mergedElement = {
              ...foundElement,
              // If the stored element has content that differs from the fetched one,
              // prefer the stored content as it might contain unsaved changes
              content: 
                typeof storedElement.content === 'object' && 
                typeof foundElement.content === 'object' &&
                JSON.stringify(storedElement.content) !== JSON.stringify(foundElement.content)
                  ? storedElement.content 
                  : foundElement.content
            };
            
            setSelectedElement(mergedElement);
            setActiveTab('editor');
          } else if (elements.length > 0) {
            // If we can't find the exact stored element but have elements, select the first one
            console.log("Stored element not found, selecting first element:", elements[0].id);
            setSelectedElement(elements[0]);
            setActiveTab('editor');
          }
        } else if (elements.length > 0) {
          // If we don't have a stored element but have elements, select the first one
          console.log("No stored element, selecting first element:", elements[0].id);
          setSelectedElement(elements[0]);
          setActiveTab('editor');
        } else {
          console.log("No elements available for this proposal");
          setSelectedElement(null);
        }
      });
    }
    
    // Clear only the selected element on unmount to avoid keeping stale selections
    // but keep the elements cache for faster loading next time
    return () => {
      console.log("Partial cleanup on component unmount");
      try {
        sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`);
      } catch (error) {
        console.warn("Error clearing sessionStorage:", error);
      }
    };
  }, [isOpen, proposal.id, refetchElements, elements]);
  
  // Add a debug effect for tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);
  
  // Add auto-save functionality for elements in session storage
  useEffect(() => {
    // Set up timer for autosaving
    const autoSaveInterval = setInterval(() => {
      if (selectedElement) {
        try {
          console.log("Auto-saving element to session storage:", selectedElement.id);
          sessionStorage.setItem(
            `proposal_${proposal.id}_selected_element`, 
            JSON.stringify(selectedElement)
          );
        } catch (err) {
          console.warn("Failed to auto-save selected element:", err);
        }
      }
    }, 15000); // Auto-save every 15 seconds
    
    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [selectedElement, proposal.id]);
  
  // Dedicated handler for element selection with enhanced error handling and debugging
  const handleElementSelection = (element: ProposalElement) => {
    if (!element || !element.id) {
      console.error("Cannot select invalid element:", element);
      toast({
        title: 'Error',
        description: 'Unable to select element: Invalid data',
        variant: 'destructive',
      });
      return;
    }
    
    console.log("Selecting element:", { 
      id: element.id, 
      type: element.elementType, 
      name: element.name,
      contentType: typeof element.content
    });
    
    // First save any pending changes to current element
    if (selectedElement && selectedElement.id !== element.id) {
      console.log("Auto-saving previous element before switching");
      // This is just a safety mechanism - most saves happen via the editors
      // Actually saving elements is handled by the editor components
    }
    
    // Create a clean copy of the element to avoid reference issues
    const elementCopy = { ...element };
    
    // Store element in session storage to persist through page navigations
    try {
      sessionStorage.setItem(
        `proposal_${proposal.id}_selected_element`, 
        JSON.stringify(elementCopy)
      );
      console.log("Element selection saved to session storage:", elementCopy.id);
    } catch (err) {
      console.warn("Failed to store selected element in session storage:", err);
    }
    
    // Update state and switch to editor tab
    setSelectedElement(elementCopy);
    setActiveTab('editor');
  };

  // Mutations for proposal elements
  const addElementMutation = useMutation({
    mutationFn: async (elementData: InsertProposalElement) => {
      try {
        console.log("Add element mutation called with data:", elementData);
        
        // Create a validated copy of the data
        const validatedData = {
          ...elementData,
          // Ensure these fields are present and valid
          proposalId: proposal.id,
          elementType: elementData.elementType,
          name: elementData.name || `New ${elementData.elementType}`,
          // Ensure content is a string
          content: typeof elementData.content === 'string' 
            ? elementData.content 
            : JSON.stringify(elementData.content)
        };
        
        console.log("Sending validated element data:", validatedData);
        
        const response = await fetch(`/api/proposals/${proposal.id}/elements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validatedData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const json = await response.json();
        console.log("Server response for add element:", json);
        return json.data;
      } catch (error) {
        console.error("Error adding element:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Element Added',
        description: 'The element has been added to your proposal',
      });
      refetchElements();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateElementMutation = useMutation({
    mutationFn: async (element: ProposalElement) => {
      console.log("Starting element update for ID:", element.id);
      
      // Keep it simple - copy the element and ensure content is a string
      const updateData = { ...element };
      
      // Ensure content is a string
      if (typeof updateData.content === 'object') {
        updateData.content = JSON.stringify(updateData.content);
      }
      
      // Simple logging 
      console.log(`Updating element ${element.id} with data:`, {
        id: updateData.id,
        name: updateData.name,
        elementType: updateData.elementType,
        // Not logging full content to avoid console spam
      });
      
      try {
        // Use original API endpoint format to avoid disruption
        const response = await fetch(`/api/proposals/${proposal.id}/elements/${element.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error updating element. Status:", response.status, "Message:", errorText);
          throw new Error(`Failed to update element: ${response.status}`);
        }
        
        const json = await response.json();
        console.log("Element successfully updated:", element.id);
        return json.data;
      } catch (error) {
        console.error("Exception in updateElementMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Element Updated',
        description: 'The element has been updated',
      });
      setSelectedElement(null);
      refetchElements();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteElementMutation = useMutation({
    mutationFn: async (elementId: number) => {
      console.log("Deleting element with ID:", elementId, "from proposal:", proposal.id);
      
      try {
        // Use the original endpoint format for consistency
        const response = await fetch(`/api/proposals/${proposal.id}/elements/${elementId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error deleting element. Status:", response.status, "Message:", errorText);
          throw new Error(`Failed to delete element: ${errorText}`);
        }
        
        const json = await response.json();
        console.log("Delete element response:", json);
        return json;
      } catch (error) {
        console.error("Exception in deleteElementMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Element Deleted',
        description: 'The element has been removed from the proposal',
      });
      setSelectedElement(null);
      refetchElements();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Collaborator Management Functions
  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      try {
        console.log("Adding collaborator", userId, "with role", role, "to proposal", proposal.id);
        
        const response = await fetch(`/api/proposals/${proposal.id}/collaborators`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            role,
            proposalId: proposal.id,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error adding collaborator. Status:", response.status, "Message:", errorText);
          throw new Error(`Failed to add collaborator: ${errorText}`);
        }
        
        const json = await response.json();
        console.log("Add collaborator response:", json);
        return json.data;
      } catch (error) {
        console.error("Exception in addCollaboratorMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Collaborator Added',
        description: 'The user has been added as a collaborator',
      });
      setSelectedUserId(null);
      setSelectedRole('Viewer');
      refetchCollaborators();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add collaborator: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: number) => {
      try {
        console.log("Removing collaborator ID:", collaboratorId, "from proposal", proposal.id);
        
        const response = await fetch(`/api/proposals/${proposal.id}/collaborators/${collaboratorId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error removing collaborator. Status:", response.status, "Message:", errorText);
          throw new Error(`Failed to remove collaborator: ${errorText}`);
        }
        
        const json = await response.json();
        console.log("Remove collaborator response:", json);
        return json;
      } catch (error) {
        console.error("Exception in removeCollaboratorMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Collaborator Removed',
        description: 'The collaborator has been removed',
      });
      refetchCollaborators();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove collaborator: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Comment section functions
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery<ProposalComment[]>({
    queryKey: ['/api/proposals', proposal.id, 'comments'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/proposals/${proposal.id}/comments`);
        const json = await response.json();
        return (json.data || []) as ProposalComment[];
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
    },
    enabled: activeTab === 'comments',
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        console.log("Adding comment to proposal", proposal.id, ":", content);
        
        const response = await fetch(`/api/proposals/${proposal.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            proposalId: proposal.id,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error adding comment. Status:", response.status, "Message:", errorText);
          throw new Error(`Failed to add comment: ${errorText}`);
        }
        
        const json = await response.json();
        console.log("Add comment response:", json);
        return json.data;
      } catch (error) {
        console.error("Exception in addCommentMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added to the proposal',
      });
      setNewComment('');
      refetchComments();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add comment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Available users query for selecting collaborators
  const {
    data: users = [],
    isLoading: isLoadingUsers,
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/users');
        const json = await response.json();
        return json as User[];
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    enabled: activeTab === 'comments', // Only fetch when comments tab is active
  });

  // Function to add a new element to the proposal
  const handleAddElement = async (type: ElementType) => {
    if (isReadOnly) {
      toast({
        title: 'Read Only',
        description: 'You cannot edit this proposal',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Creating new element of type:", type);
      
      // Get the last order number to append this element at the end
      const lastOrder = elements.length > 0
        ? Math.max(...elements.map(e => e.sortOrder || 0)) + 1
        : 0;
      
      // Create the element data with default content based on type
      const elementData: InsertProposalElement = {
        name: `New ${type}`,
        proposalId: proposal.id,
        elementType: type as ProposalElementType,
        sortOrder: lastOrder,
        content: getElementDefaultContent(type), // Get appropriate default content
      };
      
      // Add the element
      await addElementMutation.mutateAsync(elementData);
      
    } catch (error) {
      console.error("Error adding element:", error);
      toast({
        title: 'Error',
        description: 'Failed to add element',
        variant: 'destructive',
      });
    }
  };

  // Function to handle element update from editor
  const handleElementUpdate = (updatedElement: ProposalElement) => {
    if (isReadOnly) {
      toast({
        title: 'Read Only',
        description: 'You cannot edit this proposal',
        variant: 'destructive',
      });
      return;
    }

    console.log("Updating element with ID:", updatedElement.id);
    updateElementMutation.mutate(updatedElement);
  };

  // Function to handle element deletion
  const handleDeleteElement = (elementId: number) => {
    if (isReadOnly) {
      toast({
        title: 'Read Only',
        description: 'You cannot edit this proposal',
        variant: 'destructive',
      });
      return;
    }

    if (!elementId) {
      console.error("Cannot delete element with invalid ID");
      return;
    }

    console.log("Deleting element with ID:", elementId);
    deleteElementMutation.mutate(elementId);
  };

  // Function to get element display for the list
  const getElementDisplay = (element: ProposalElement) => {
    if (!element) return null;
    
    // Simple display for list view
    return (
      <div className="flex items-center space-x-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
        <div className="text-sm font-medium">
          {element.name || `Unnamed ${element.elementType}`}
        </div>
      </div>
    );
  };

  // Function to add a collaborator
  const handleAddCollaborator = () => {
    if (!selectedUserId) {
      toast({
        title: 'Select User',
        description: 'Please select a user to add as collaborator',
        variant: 'default',
      });
      return;
    }

    addCollaboratorMutation.mutate({ 
      userId: selectedUserId, 
      role: selectedRole 
    });
  };

  // Function to submit a comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({
        title: 'Empty Comment',
        description: 'Please enter a comment',
        variant: 'default',
      });
      return;
    }

    addCommentMutation.mutate(newComment.trim());
  };

  // Function to move an element up or down in the list
  const handleMoveElement = async (elementId: number, direction: 'up' | 'down') => {
    if (isReadOnly) {
      toast({
        title: 'Read Only',
        description: 'You cannot edit this proposal',
        variant: 'destructive',
      });
      return;
    }

    try {
      const elementIndex = elements.findIndex(e => e.id === elementId);
      if (elementIndex === -1) {
        console.error("Element not found:", elementId);
        return;
      }

      // Calculate the new index based on direction
      const newIndex = direction === 'up' 
        ? Math.max(0, elementIndex - 1)
        : Math.min(elements.length - 1, elementIndex + 1);
      
      // If already at the limit, do nothing
      if (newIndex === elementIndex) return;
      
      // Get the target element
      const element = elements[elementIndex];
      const targetElement = elements[newIndex];
      
      // Swap their order values
      const updatedElement = {
        ...element,
        sortOrder: targetElement.sortOrder,
      };
      
      const updatedTargetElement = {
        ...targetElement,
        sortOrder: element.sortOrder,
      };
      
      // Update both elements with new order
      await updateElementMutation.mutateAsync(updatedElement);
      await updateElementMutation.mutateAsync(updatedTargetElement);
      
      // Refetch to update the list
      refetchElements();
      
    } catch (error) {
      console.error("Error moving element:", error);
      toast({
        title: 'Error',
        description: 'Failed to move element',
        variant: 'destructive',
      });
    }
  };

  // Main component render
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-bold">{proposal.name}</h2>
            {isReadOnly && (
              <Badge variant="outline" className="ml-2">
                <LockIcon className="h-3 w-3 mr-1" />
                Read Only
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isReadOnly && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as any)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-2 justify-start border-b">
            <TabsTrigger value="editor" className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="elements" className="flex items-center">
              <FileIcon className="h-4 w-4 mr-1" />
              Elements
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comments & Collaborators
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="editor" 
            className="flex-1 flex flex-col overflow-hidden p-0 m-0"
          >
            <div className="flex-1 flex">
              {/* Element Editor */}
              <div className="w-1/2 border-r overflow-auto p-4">
                {isLoadingElements ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : elements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Elements Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      This proposal doesn't have any content elements yet. 
                      Add elements from the Elements tab to build your proposal.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('elements')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Elements
                    </Button>
                  </div>
                ) : selectedElement ? (
                  <div className="h-full flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Editing: {selectedElement.name || `Unnamed ${selectedElement.elementType}`}
                      </h3>
                      {!isReadOnly && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteElement(selectedElement.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <ElementEditorFactory 
                        element={selectedElement}
                        onSave={handleElementUpdate}
                        isReadOnly={isReadOnly}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MousePointerClickIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Element Selected</h3>
                    <p className="text-muted-foreground">
                      Select an element from the preview on the right to edit its content.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Preview Panel */}
              <div className="w-1/2 overflow-auto">
                <div className="p-6 bg-white dark:bg-gray-950 min-h-full">
                  <div className="mx-auto max-w-[800px] border p-8 bg-white dark:bg-gray-900 rounded-md shadow">
                    <h1 className="text-2xl font-bold mb-6">{proposal.name}</h1>
                    
                    {isLoadingElements ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : elements.length === 0 ? (
                      <div className="py-8 text-center border border-dashed rounded-md">
                        <p className="text-muted-foreground">
                          No content elements. Add elements from the Elements tab.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {elements.map((element) => (
                          <div 
                            key={element.id}
                            className={cn(
                              "cursor-pointer border rounded-md p-4 transition-all",
                              {
                                "outline outline-2 outline-primary": 
                                  selectedElement?.id === element.id,
                                "hover:border-primary": !isReadOnly
                              }
                            )}
                            onClick={() => handleElementSelection(element)}
                          >
                            <ElementRenderer element={element} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent 
            value="elements" 
            className="flex-1 overflow-auto m-0 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Add Elements</CardTitle>
                    <CardDescription>
                      Add new content elements to your proposal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Header')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Header
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Text')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Text
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Image')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Image
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Table')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Table
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('List')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        List
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Quote')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Quote
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('ProductList')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Products
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Signature')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Signature
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('PageBreak')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Page Break
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => handleAddElement('Custom')}
                        disabled={isReadOnly}
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Custom
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Elements</CardTitle>
                    <CardDescription>
                      Rearrange or remove existing elements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingElements ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : elements.length === 0 ? (
                      <div className="py-8 text-center border border-dashed rounded-md">
                        <p className="text-muted-foreground">
                          No content elements. Add elements using the buttons on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {elements.map((element, index) => (
                          <div 
                            key={element.id}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              <GripVerticalIcon className="h-4 w-4 text-muted-foreground cursor-move" />
                              <div>
                                <div className="font-medium">
                                  {element.name || `Unnamed ${element.elementType}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {element.elementType}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleMoveElement(element.id, 'up')}
                                disabled={index === 0 || isReadOnly}
                                className="h-7 w-7"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleMoveElement(element.id, 'down')}
                                disabled={index === elements.length - 1 || isReadOnly}
                                className="h-7 w-7"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleElementSelection(element)}
                                className="h-7 w-7"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteElement(element.id)}
                                disabled={isReadOnly}
                                className="h-7 w-7 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent 
            value="comments" 
            className="flex-1 overflow-hidden m-0 p-0 flex flex-col md:flex-row"
          >
            <div className="w-full md:w-1/2 p-4 border-r overflow-auto">
              <h3 className="text-lg font-medium mb-4">Collaborators</h3>
              <CollaboratorSection 
                proposalId={proposal.id}
                isReadOnly={isReadOnly}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col p-4 overflow-auto">
              <h3 className="text-lg font-medium mb-4">Comments</h3>
              <CommentSection proposalId={proposal.id} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}