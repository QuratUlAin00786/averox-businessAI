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
        return json.data;
      } catch (error) {
        console.error("Exception in deleteElementMutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Element Deleted',
        description: 'The element has been removed from your proposal',
      });
      if (selectedElement) {
        setSelectedElement(null);
      }
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

  const moveElementMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
      // Use the original endpoint format for consistency
      const response = await fetch(`/api/proposals/${proposal.id}/elements/${id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });
      
      // Add proper error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error moving element. Status:", response.status, "Message:", errorText);
        throw new Error(`Failed to move element: ${response.status}`);
      }
      
      const json = await response.json();
      console.log("Move element response:", json);
      return json.data;
    },
    onSuccess: () => {
      refetchElements();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to move element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Add effect to automatically select the first element when elements are loaded
  // Or create a default element if none exist
  useEffect(() => {
    const handleElementsLoaded = async () => {
      console.log("Elements effect triggered, elements count:", elements.length, 
                  "selectedElement:", selectedElement?.id || 'none',
                  "isLoading:", isLoadingElements, 
                  "isPending:", addElementMutation.isPending);
      
      // Try to restore selected element from session storage
      try {
        const storedElementKey = `proposal_${proposal.id}_selected_element`;
        const storedElementJson = sessionStorage.getItem(storedElementKey);
        
        if (storedElementJson && !selectedElement) {
          const storedElement = JSON.parse(storedElementJson);
          console.log("Restored element from session storage:", storedElement);
          
          // Find the element in our current elements list to ensure it's fresh
          const matchingElement = elements.find(el => el.id === storedElement.id);
          if (matchingElement) {
            console.log("Found matching element in current list:", matchingElement);
            handleElementSelection(matchingElement);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to restore element from session storage:", err);
      }
      
      // If we have elements already, just select the first one
      if (elements.length > 0 && !selectedElement) {
        console.log("Auto-selecting first element:", elements[0].id);
        handleElementSelection(elements[0]);
      } 
      // If we have no elements but aren't currently loading, create a default text element
      else if (elements.length === 0 && !isLoadingElements && !addElementMutation.isPending) {
        console.log("No elements found. Creating a default text element...");
        
        try {
          // Define the element content directly
          const elementData = {
            proposalId: proposal.id,
            elementType: 'Text' as ProposalElementType,
            name: "New Text",
            content: {
              text: "Enter your text here. This is a paragraph that can contain detailed information about your products or services.",
              alignment: "left"
            },
            sortOrder: 0,
            createdBy: 2 // Default user ID
          };
          
          console.log("Prepared element data:", elementData);
          
          // Use direct API call for more control
          const response = await fetch(`/api/proposals/${proposal.id}/elements`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(elementData),
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const json = await response.json();
          console.log("Default element created successfully:", json.data);
          
          // Refresh the elements to include our new default element
          refetchElements();
        } catch (error) {
          console.error("Error creating default element:", error);
          toast({
            title: 'Error',
            description: 'Failed to create a default element.',
            variant: 'destructive',
          });
        }
      }
    };
    
    handleElementsLoaded();
  }, [elements, selectedElement, isLoadingElements]);

  // Mutation for adding a comment to the proposal
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      // Keep the implementation the same
      const requestBody = {
        proposalId: proposal.id,
        content: newComment,
        createdBy: 2, // Default user ID
        userId: 2, // Default user ID
      };
      
      const response = await fetch(`/api/proposals/${proposal.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['/api/proposals', proposal.id, 'comments'] });
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added to the proposal',
      });
    },
  });

  // Mutation for adding a collaborator
  const addCollaboratorMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) {
        throw new Error('No user selected');
      }
      
      const requestBody = {
        proposalId: proposal.id,
        userId: selectedUserId,
        role: selectedRole,
      };
      
      const response = await fetch(`/api/proposals/${proposal.id}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add collaborator: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setSelectedUserId(null);
      refetchCollaborators();
      toast({
        title: 'Collaborator Added',
        description: 'The user has been added to the proposal',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add collaborator',
        variant: 'destructive',
      });
    },
  });

  const handleAddElement = async (type: ElementType) => {
    try {
      // Get element default content and prepare the element creation
      console.log(`Adding new ${type} element to proposal ${proposal.id}`);
      
      const defaultContent = getElementDefaultContent(type as ProposalElementType);
      console.log(`Generated default content for ${type}:`, defaultContent);
      
      // Prepare element data
      const elementData: InsertProposalElement = {
        proposalId: proposal.id,
        elementType: type as ProposalElementType, 
        name: `New ${type}`,
        content: defaultContent,
        sortOrder: elements.length,
        createdBy: 2, // Default user ID
      };
      
      // Add the new element
      await addElementMutation.mutateAsync(elementData);
      
      // After adding, fetch the updated list of elements
      await refetchElements();
      
    } catch (error) {
      console.error(`Error adding ${type} element:`, error);
      toast({
        title: 'Error',
        description: `Failed to add ${type} element`,
        variant: 'destructive',
      });
    }
  };

  const getElementDisplay = (element: ProposalElement) => {
    try {
      let displayText = element.name || 'Unnamed element';
      let details = '';
      
      // Get element type-specific details to display
      switch (element.elementType) {
        case 'Header':
          try {
            const content = typeof element.content === 'string' 
              ? JSON.parse(element.content) 
              : element.content;
            details = content?.title || 'No title';
          } catch (e) {
            details = 'Invalid header content';
          }
          break;
        case 'Text':
          try {
            const content = typeof element.content === 'string' 
              ? JSON.parse(element.content) 
              : element.content;
            details = content?.text 
              ? `${content.text.substring(0, 30)}${content.text.length > 30 ? '...' : ''}`
              : 'No text';
          } catch (e) {
            details = 'Invalid text content';
          }
          break;
        case 'Image':
          details = 'Image element';
          break;
        case 'Table':
          details = 'Table element';
          break;
        case 'List':
          details = 'List element';
          break;
        case 'Quote':
          try {
            const content = typeof element.content === 'string' 
              ? JSON.parse(element.content) 
              : element.content;
            details = content?.quote 
              ? `${content.quote.substring(0, 30)}${content.quote.length > 30 ? '...' : ''}`
              : 'No quote text';
          } catch (e) {
            details = 'Invalid quote content';
          }
          break;
        case 'ProductList':
          details = 'Product list';
          break;
        case 'Signature':
          details = 'Signature field';
          break;
        case 'PageBreak':
          details = 'Page break';
          break;
        default:
          details = `${element.elementType} element`;
      }
      
      return { name: displayText, details };
    } catch (error) {
      console.error("Error parsing element for display:", error);
      return { name: element.name || 'Unnamed element', details: 'Error parsing element' };
    }
  };

  console.log("ProposalEditor rendering in open state for proposal:", proposal.id);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-full h-[95vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Main content area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Header area */}
            <div className="sticky top-0 z-10 bg-white p-4 border-b flex justify-between items-center shadow-sm">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">{proposal.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {isReadOnly ? 'Viewing proposal content' : 'Edit proposal content and structure'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isReadOnly && (
                  <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
                    <LockIcon className="h-3 w-3 mr-1" /> Read Only
                  </Badge>
                )}
                {!isReadOnly && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSave}
                  >
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                )}
              </div>
            </div>
            
            {/* Proposal editor tabs */}
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'editor' | 'elements' | 'comments')}
              className="flex-1 flex flex-col"
            >
              <div className="bg-white px-4 border-b">
                <TabsList className="grid w-[400px] grid-cols-3">
                  <TabsTrigger value="editor">
                    <FileText className="h-4 w-4 mr-2" /> Editor
                  </TabsTrigger>
                  <TabsTrigger value="elements">
                    <Plus className="h-4 w-4 mr-2" /> Add Elements
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <MessageSquare className="h-4 w-4 mr-2" /> Comments
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="editor" className="flex-1 overflow-auto p-0 m-0">
                <div className="flex h-full">
                  {/* Left sidebar: Element list */}
                  <div className="w-64 border-r bg-neutral-50 overflow-y-auto">
                    <div className="p-3 border-b bg-white">
                      <h3 className="text-sm font-medium">Document Elements</h3>
                    </div>
                    
                    {isLoadingElements ? (
                      <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : elements.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <p>No elements added yet</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2" 
                          onClick={() => setActiveTab('elements')}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Elements
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2">
                        {elements.map((element) => {
                          const { name, details } = getElementDisplay(element);
                          const isSelected = selectedElement?.id === element.id;
                          
                          return (
                            <div 
                              key={element.id} 
                              className={cn(
                                "mb-1 p-2 rounded cursor-pointer border text-sm",
                                isSelected 
                                  ? "bg-primary/10 border-primary/30" 
                                  : "bg-white border-neutral-200 hover:bg-neutral-100"
                              )}
                              onClick={() => handleElementSelection(element)}
                            >
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-muted-foreground truncate">{details}</div>
                              
                              {/* Controls for each element */}
                              {!isReadOnly && isSelected && (
                                <div className="flex mt-2 gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementMutation.mutate({ id: element.id, direction: 'up' });
                                    }}
                                    disabled={elements.indexOf(element) === 0}
                                  >
                                    <MoveUp className="h-4 w-4" />
                                    <span className="sr-only">Move Up</span>
                                  </Button>
                                  
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementMutation.mutate({ id: element.id, direction: 'down' });
                                    }}
                                    disabled={elements.indexOf(element) === elements.length - 1}
                                  >
                                    <MoveDown className="h-4 w-4" />
                                    <span className="sr-only">Move Down</span>
                                  </Button>
                                  
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('Are you sure you want to delete this element?')) {
                                        deleteElementMutation.mutate(element.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Main content area: Element editor */}
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {selectedElement ? (
                      <div>
                        <ElementEditorFactory 
                          element={selectedElement} 
                          onSave={(updatedElement) => {
                            updateElementMutation.mutate(updatedElement);
                          }}
                          isReadOnly={isReadOnly}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <FileIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Element Selected</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                          {elements.length > 0 
                            ? 'Select an element from the left sidebar to view or edit its content.'
                            : 'Your proposal has no elements yet. Add elements from the "Add Elements" tab to start building your proposal.'}
                        </p>
                        {elements.length === 0 && !isReadOnly && (
                          <Button 
                            variant="outline" 
                            className="mt-4" 
                            onClick={() => setActiveTab('elements')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Elements
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="elements" className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-xl font-semibold mb-4">Add Elements to Your Proposal</h2>
                  <p className="text-muted-foreground mb-6">Select an element type to add to your proposal document.</p>
                  
                  {isReadOnly ? (
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>You cannot add elements in read-only mode.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Element type cards */}
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('Header')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Header</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a section header or title to your document</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('Text')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Text Block</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a paragraph or formatted text content</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('Image')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add an image with optional caption</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('Table')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Table</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a data table with rows and columns</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('List')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">List</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a bulleted or numbered list</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('Quote')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Quote</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a styled quotation or testimonial</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('ProductList')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Product List</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a list of products with details and pricing</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('Signature')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Signature</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a signature field for document approval</p>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleAddElement('PageBreak')}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Page Break</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">Add a forced page break for printed documents</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="comments" className="h-[calc(100vh-180px)] overflow-auto">
                <CommentSection proposalId={proposal.id} isReadOnly={isReadOnly} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right side: Collaborators sidebar */}
          <div className="w-64 border-l bg-neutral-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" /> Collaborators
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <CollaboratorSection proposalId={proposal.id} isReadOnly={isReadOnly} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}