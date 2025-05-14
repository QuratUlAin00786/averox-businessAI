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
  
  // Add a debug effect for tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);

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
  
  // Component lifecycle effect
  useEffect(() => {
    console.log("ProposalEditor component mounted with isOpen:", isOpen, "proposalId:", proposal.id);
    
    // Check if we have an element ID in session storage
    let storedElement = null;
    let storedElementId = null;
    try {
      // First try the new ID-only approach
      const storedId = sessionStorage.getItem(`proposal_${proposal.id}_selected_element_id`);
      if (storedId) {
        console.log("Found stored selected element ID:", storedId);
        storedElementId = parseInt(storedId, 10);
      } else {
        // For backwards compatibility, try the old approach but extract just the ID
        const storedElementString = sessionStorage.getItem(`proposal_${proposal.id}_selected_element`);
        if (storedElementString) {
          try {
            const parsedElement = JSON.parse(storedElementString);
            storedElement = parsedElement;
            if (parsedElement && parsedElement.id) {
              console.log("Found stored element with ID:", parsedElement.id);
              storedElementId = parsedElement.id;
              
              // Clean up old storage format
              console.log("Removing old storage format");
              sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`); 
            }
          } catch (parseError) {
            console.warn("Error parsing stored element:", parseError);
          }
        }
      }
    } catch (error) {
      console.warn("Error reading from sessionStorage:", error);
    }
    
    if (isOpen) {
      console.log("ProposalEditor is open, fetching elements for proposal:", proposal.id);
      refetchElements().then(() => {
        console.log("Elements fetched, ready for editing");
        
        // If we had a stored element ID, try to match it with fetched elements
        if (storedElementId && elements.length > 0) {
          const foundElement = elements.find(e => e.id === storedElementId);
          if (foundElement) {
            console.log("Setting stored element by ID as selected:", foundElement.id);
            setSelectedElement(foundElement);
            setActiveTab('editor');
          } else if (elements.length > 0) {
            // If we can't find the element with stored ID, select the first one
            console.log("Element with ID", storedElementId, "not found, selecting first element:", elements[0].id);
            // Save the ID of the selected element to storage
            try {
              sessionStorage.setItem(
                `proposal_${proposal.id}_selected_element_id`, 
                elements[0].id.toString()
              );
            } catch (err) {
              console.warn("Failed to store element ID in session storage:", err);
            }
            setSelectedElement(elements[0]);
            setActiveTab('editor');
          }
        } 
        // For backwards compatibility, try with storedElement object if no ID was found
        else if (storedElement && elements.length > 0) {
          const foundElement = elements.find(e => e.id === storedElement.id);
          if (foundElement) {
            console.log("Setting stored element as selected:", foundElement.id);
            setSelectedElement(foundElement);
            setActiveTab('editor');
          } else if (elements.length > 0) {
            // If we can't find the exact stored element but have elements, select the first one
            console.log("Stored element not found, selecting first element:", elements[0].id);
            // Save the ID of the selected element to storage
            try {
              sessionStorage.setItem(
                `proposal_${proposal.id}_selected_element_id`, 
                elements[0].id.toString()
              );
            } catch (err) {
              console.warn("Failed to store element ID in session storage:", err);
            }
            setSelectedElement(elements[0]);
            setActiveTab('editor');
          }
        } else if (elements.length > 0) {
          // If we don't have a stored element/ID but have elements, select the first one
          console.log("No stored element, selecting first element:", elements[0].id);
          setSelectedElement(elements[0]);
          setActiveTab('editor');
        }
      });
    }
    
    // Clear the session storage on unmount
    return () => {
      console.log("Complete cleanup on component unmount");
      try {
        // Clean up both old and new storage formats
        sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`);
        sessionStorage.removeItem(`proposal_${proposal.id}_selected_element_id`);
        sessionStorage.removeItem(`proposal_${proposal.id}_elements`);
        console.log("Session storage cleaned up for proposal:", proposal.id);
      } catch (error) {
        console.warn("Error clearing sessionStorage:", error);
      }
    };
  }, [isOpen, proposal.id, refetchElements, elements]);

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
      
      // If we have elements already, just select the first one
      if (elements.length > 0 && !selectedElement) {
        console.log("Auto-selecting first element:", elements[0].id);
        setSelectedElement(elements[0]);
        
        // Switch to editor tab if not already on it
        if (activeTab !== 'editor') {
          setActiveTab('editor');
        }
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
            throw new Error(`Failed to create element: ${response.status}`);
          }
          
          console.log("Default element created, refreshing...");
          refetchElements();
        } catch (error) {
          console.error("Failed to create default element:", error);
          toast({
            title: 'Error',
            description: 'Failed to create default element',
            variant: 'destructive',
          });
        }
      }
    };
    
    // Run the effect when elements, loadingElements or mutation state changes
    handleElementsLoaded();
  }, [elements, isLoadingElements, selectedElement, activeTab, addElementMutation.isPending, refetchElements, proposal.id]);
  
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
        return json.data;
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

  // Dedicated handler for element selection
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
    
    // Store only the element ID in session storage to persist through page navigations
    try {
      // Clear any old format storage
      sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`);
      
      // Save only the ID using the new format
      sessionStorage.setItem(
        `proposal_${proposal.id}_selected_element_id`, 
        elementCopy.id.toString()
      );
      console.log("Element ID saved to session storage:", elementCopy.id);
    } catch (err) {
      console.warn("Failed to store selected element ID in session storage:", err);
    }
    
    // Update state and switch to editor tab
    setSelectedElement(elementCopy);
    setActiveTab('editor');
  };

  // Function to handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload first.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // In a real implementation, you would upload the file to the server
    // and process it to extract content and create elements
    
    // Simulate processing delay
    setTimeout(() => {
      // Create some default elements based on file type
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      // Add a header element with the file name
      const headerContent = { 
        text: file.name.split('.')[0], 
        level: 1 
      };
      
      addElementMutation.mutate({
        proposalId: proposal.id,
        elementType: 'Header',
        name: 'Document Title',
        content: JSON.stringify(headerContent),
        sortOrder: elements.length
      });
      
      // Add a text element with placeholder content
      const textContent = { 
        text: `Content imported from ${file.name}. You can edit this text with your actual document content.` 
      };
      
      addElementMutation.mutate({
        proposalId: proposal.id,
        elementType: 'Text',
        name: 'Document Content',
        content: JSON.stringify(textContent),
        sortOrder: elements.length + 1
      });
      
      setIsUploading(false);
      setFile(null);
      
      toast({
        title: "Document Imported",
        description: "Your document has been imported. You can now edit the content.",
      });
      
      // Reset the file input
      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 2000);
  };

  // Function to add a new element to the proposal
  const handleAddElement = (type: ElementType) => {
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
        content: JSON.stringify(getElementDefaultContent(type)), // Get appropriate default content
      };
      
      // Add the element
      addElementMutation.mutate(elementData);
      
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

    moveElementMutation.mutate({ id: elementId, direction });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-white" style={{display: isOpen ? 'block' : 'none'}}>
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
              onClick={() => onSave()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Main content layout with sidebar */}
      <div className="flex h-[calc(100vh-120px)] w-full">
        {/* Left side: Main content area with tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => {
              console.log("Tab clicked:", value);
              setActiveTab(value as "editor" | "elements" | "comments");
            }} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="editor">Content</TabsTrigger>
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="h-[calc(100vh-180px)] overflow-auto">
              <div className="p-6">
                {/* Document Upload Section */}
                {elements.length === 0 && !isReadOnly && (
                  <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Import Existing Document</CardTitle>
                      <CardDescription>
                        Upload an existing proposal or contract to use as a starting point
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label htmlFor="document-upload">Upload Document</Label>
                          <Input 
                            id="document-upload" 
                            type="file" 
                            accept=".pdf,.doc,.docx,.txt"
                            className="cursor-pointer"
                            onChange={handleFileChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, Word, Text
                          </p>
                        </div>
                        <Button 
                          className="mt-6"
                          onClick={handleFileUpload}
                          disabled={!file || isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload & Import
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Editor content */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left side: Elements list */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg">Elements</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {isLoadingElements ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : elements.length === 0 ? (
                          <div className="text-center py-8 px-4">
                            <div className="mb-3 text-muted-foreground">
                              <FileIcon className="h-8 w-8 mx-auto mb-2" />
                              <p>No elements yet</p>
                            </div>
                            {!isReadOnly && (
                              <p className="text-sm">
                                Add elements from the Elements tab to build your proposal
                              </p>
                            )}
                          </div>
                        ) : (
                          <ScrollArea className="h-[calc(100vh-400px)]">
                            <div className="py-1">
                              {elements.map((element) => (
                                <div 
                                  key={element.id}
                                  onClick={() => handleElementSelection(element)}
                                  className={cn(
                                    "flex items-center justify-between p-3 cursor-pointer border-b last:border-0 hover:bg-muted/20",
                                    selectedElement?.id === element.id && "bg-muted"
                                  )}
                                >
                                  <div className="flex items-center">
                                    <div className="text-xs bg-muted text-muted-foreground py-1 px-2 rounded mr-2">
                                      {element.elementType}
                                    </div>
                                    <div className="font-medium truncate max-w-[200px]">
                                      {element.name || `Unnamed ${element.elementType}`}
                                    </div>
                                  </div>
                                  {!isReadOnly && (
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveElement(element.id, 'up');
                                        }}
                                        disabled={elements.indexOf(element) === 0}
                                      >
                                        <ChevronUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveElement(element.id, 'down');
                                        }}
                                        disabled={elements.indexOf(element) === elements.length - 1}
                                      >
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteElement(element.id);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                      {!isReadOnly && (
                        <CardFooter className="py-3 border-t flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab('elements')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Element
                          </Button>
                          {selectedElement && (
                            <Button
                              size="sm"
                              onClick={() => handleElementUpdate(selectedElement)}
                            >
                              <Save className="h-4 w-4 mr-1" /> Save Element
                            </Button>
                          )}
                        </CardFooter>
                      )}
                    </Card>
                  </div>

                  {/* Right side: Element editor */}
                  <div className="lg:col-span-3">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="py-3 border-b">
                        <CardTitle className="text-lg">
                          {selectedElement 
                            ? `Edit: ${selectedElement.name || selectedElement.elementType}` 
                            : 'Select an element to edit'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 overflow-auto">
                        {isLoadingElements ? (
                          <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : !selectedElement ? (
                          <div className="flex flex-col justify-center items-center h-full text-center p-8">
                            <MousePointerClickIcon className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium mb-2">No Element Selected</h3>
                            <p className="text-muted-foreground mb-4">
                              Select an element from the list on the left to edit its content
                            </p>
                            {elements.length === 0 && !isReadOnly && (
                              <Button 
                                variant="outline"
                                onClick={() => setActiveTab('elements')}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add First Element
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div>
                            <ElementEditorFactory 
                              element={selectedElement}
                              onSave={handleElementUpdate}
                              isReadOnly={isReadOnly}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="elements" className="h-[calc(100vh-180px)] overflow-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Proposal Elements</h2>
                
                {/* Quick action buttons */}
                {!isReadOnly && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Add Elements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Header')}
                      >
                        <span className="text-lg font-bold mb-1">H</span>
                        <span>Header</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Text')}
                      >
                        <span className="text-lg mb-1">¶</span>
                        <span>Text</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Image')}
                      >
                        <span className="text-lg mb-1">🖼️</span>
                        <span>Image</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Table')}
                      >
                        <span className="text-lg mb-1">📊</span>
                        <span>Table</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('List')}
                      >
                        <span className="text-lg mb-1">•</span>
                        <span>List</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Quote')}
                      >
                        <span className="text-lg mb-1">"</span>
                        <span>Quote</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('ProductList')}
                      >
                        <span className="text-lg mb-1">🛒</span>
                        <span>Products</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Signature')}
                      >
                        <span className="text-lg mb-1">✍️</span>
                        <span>Signature</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('PageBreak')}
                      >
                        <span className="text-lg mb-1">⤵️</span>
                        <span>Page Break</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto py-3 px-4 flex flex-col items-center justify-center text-center"
                        onClick={() => handleAddElement('Custom')}
                      >
                        <span className="text-lg mb-1">⚙️</span>
                        <span>Custom</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Current elements */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Elements</h3>
                  
                  {isLoadingElements ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : elements.length === 0 ? (
                    <Card className="text-center py-12">
                      <CardContent>
                        <div className="mb-4 text-muted-foreground">
                          <FileIcon className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-lg">No elements in this proposal yet</p>
                        </div>
                        {!isReadOnly && (
                          <p>Use the buttons above to add elements to your proposal</p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {elements.map((element, index) => (
                            <div 
                              key={element.id}
                              className="flex items-center p-4"
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="flex-shrink-0 mr-3 text-muted-foreground">
                                  <GripVerticalIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {element.name || `Unnamed ${element.elementType}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {element.elementType}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleElementSelection(element)}
                                >
                                  Edit
                                </Button>
                                
                                {!isReadOnly && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleMoveElement(element.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleMoveElement(element.id, 'down')}
                                      disabled={index === elements.length - 1}
                                    >
                                      <MoveDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => handleDeleteElement(element.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="h-[calc(100vh-180px)] overflow-auto">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Collaborators section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Collaborators</h3>
                  <CollaboratorSection 
                    proposalId={proposal.id}
                    isReadOnly={isReadOnly}
                  />
                </div>
                
                {/* Comments section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Comments</h3>
                  <CommentSection proposalId={proposal.id} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}