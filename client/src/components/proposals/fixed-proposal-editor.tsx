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
import { CommentSection } from './comment-section';
import { CollaboratorSection } from './collaborator-section';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiRequestJson } from '@/lib/queryClient';
import { ElementEditorFactory } from './element-editors/element-editor-factory';
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
  MousePointerClickIcon,
  PlusIcon,
  AlertCircle,
  X,
  Upload,
  ArrowLeft
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

const getDefaultElementContent = (type: ElementType) => {
  switch (type) {
    case 'Header':
      return { text: 'New Header', level: 2 };
    case 'Text':
      return { text: 'Enter your text here. This can be a paragraph or longer content section.' };
    case 'Image':
      return { url: '', alt: 'Image description', caption: '', width: 500 };
    case 'Table':
      return { 
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Cell 1', 'Cell 2', 'Cell 3'],
          ['Cell 4', 'Cell 5', 'Cell 6'],
        ]
      };
    case 'List':
      return { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
    case 'Quote':
      return { text: 'Quote text', attribution: 'Source' };
    case 'ProductList':
      return { productIds: [] };
    case 'Signature':
      return { name: 'Signature', role: 'Title', date: true };
    case 'PageBreak':
      return {};
    case 'Custom':
      return { html: '<div>Custom content</div>' };
    default:
      return {};
  }
};

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
  
  // Add a debug effect for tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);
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
        const response = await apiRequestJson(`/api/proposals/${proposal.id}/elements`);
        const data = (response.data || []) as ProposalElement[];
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
        const response = await apiRequestJson(`/api/proposals/${proposal.id}/collaborators`);
        return (response.data || []) as (ProposalCollaborator & { user?: User })[];
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

  // Mutations for proposal elements
  const addElementMutation = useMutation({
    mutationFn: async (elementData: InsertProposalElement) => {
      try {
        const response = await apiRequestJson(
          `/api/proposals/${proposal.id}/elements`,
          'POST',
          elementData
        );
        return response.data;
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
      // Ensure content is a string when sending to the server
      const preparedElement = { ...element };
      
      if (typeof preparedElement.content === 'object') {
        preparedElement.content = JSON.stringify(preparedElement.content);
      }
      
      const response = await apiRequestJson(
        `/api/proposals/${proposal.id}/elements/${element.id}`,
        'PATCH',
        preparedElement
      );
      return response.data;
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
      const response = await apiRequestJson(
        `/api/proposals/${proposal.id}/elements/${elementId}`,
        'DELETE'
      );
      return response.data;
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
      const response = await apiRequestJson(
        `/api/proposals/${proposal.id}/elements/${id}/move`,
        'POST',
        { direction }
      );
      return response.data;
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
      addElementMutation.mutate({
        proposalId: proposal.id,
        elementType: 'Header',
        name: 'Document Title',
        content: JSON.stringify({ 
          text: file.name.split('.')[0], 
          level: 1 
        }),
        sortOrder: 0
      });
      
      // Add a text element with placeholder content
      addElementMutation.mutate({
        proposalId: proposal.id,
        elementType: 'Text',
        name: 'Document Content',
        content: JSON.stringify({ 
          text: `Content imported from ${file.name}. You can edit this text with your actual document content.` 
        }),
        sortOrder: 1
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

  const handleAddElement = (type: ElementType) => {
    if (isReadOnly) return;
    
    const newElement: InsertProposalElement = {
      proposalId: proposal.id,
      elementType: type,
      name: `New ${type}`,
      content: JSON.stringify(getDefaultElementContent(type)),
      sortOrder: elements.length
    };
    
    addElementMutation.mutate(newElement);
  };
  
  const handleDeleteElement = (id: number) => {
    if (isReadOnly) return;
    
    if (confirm('Are you sure you want to delete this element?')) {
      deleteElementMutation.mutate(id);
    }
  };
  
  const handleSaveElement = () => {
    if (!selectedElement || isReadOnly) return;
    
    updateElementMutation.mutate(selectedElement);
  };

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

  const getElementDisplay = (element: ProposalElement) => {
    return <ElementRenderer element={element} />;
  };
  
  const renderElementEditor = () => {
    if (!selectedElement) return null;
    
    // Create a deep copy of the element to avoid mutating the original
    const preparedElement = { ...selectedElement };
    
    // If content is a string (from API), parse it to an object for the editor
    if (typeof preparedElement.content === 'string') {
      try {
        preparedElement.content = JSON.parse(preparedElement.content);
      } catch (error) {
        console.error("Error parsing element content:", error);
        toast({
          title: "Error",
          description: "Could not parse element content. Using default instead.",
          variant: "destructive"
        });
        // Fallback to empty object if parsing fails
        preparedElement.content = {};
      }
    }
    
    // Use our ElementEditorFactory to render the appropriate editor
    return (
      <ElementEditorFactory 
        element={preparedElement}
        onSave={(updatedElement) => {
          console.log("Element updated in editor:", updatedElement);
          setSelectedElement(updatedElement);
        }}
        isReadOnly={isReadOnly}
      />
    );
  };

  // Fetch comments only when the comments tab is active
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery<ProposalComment[]>({
    queryKey: ['/api/proposals', proposal.id, 'comments'],
    queryFn: async () => {
      try {
        const response = await apiRequestJson(`/api/proposals/${proposal.id}/comments`);
        return (response.data || []) as ProposalComment[];
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
    },
    enabled: activeTab === 'comments',
  });

  // Available users query for selecting collaborators
  const {
    data: users = [],
    isLoading: isLoadingUsers,
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const response = await apiRequestJson('/api/users');
        return response as User[];
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },
    enabled: activeTab === 'comments', // Only fetch when comments tab is active
  });

  // Add collaborator mutation
  const addCollaboratorMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      try {
        const response = await apiRequestJson(
          `/api/proposals/${proposal.id}/collaborators`,
          'POST',
          {
            userId,
            role,
            proposalId: proposal.id,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error adding collaborator:", error);
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

  // Remove collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: number) => {
      try {
        const response = await apiRequestJson(
          `/api/proposals/${proposal.id}/collaborators/${collaboratorId}`,
          'DELETE'
        );
        return response;
      } catch (error) {
        console.error("Error removing collaborator:", error);
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

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        const response = await apiRequestJson(
          `/api/proposals/${proposal.id}/comments`,
          'POST',
          {
            content,
            proposalId: proposal.id,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error adding comment:", error);
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

  // Handle adding a collaborator
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

  // Handle submitting a comment
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

  return (
    <div className={`fixed inset-0 z-50 bg-white ${isOpen ? 'block' : 'hidden'}`}>
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
                                          moveElementMutation.mutate({ id: element.id, direction: 'up' });
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
                                          moveElementMutation.mutate({ id: element.id, direction: 'down' });
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
                              onClick={handleSaveElement}
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
                            {renderElementEditor()}
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
                                      onClick={() => moveElementMutation.mutate({ id: element.id, direction: 'up' })}
                                      disabled={index === 0}
                                    >
                                      <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => moveElementMutation.mutate({ id: element.id, direction: 'down' })}
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
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">People with access</CardTitle>
                      <CardDescription>
                        These users can view or edit this proposal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingCollaborators ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : collaborators.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2" />
                          <p>No collaborators yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {collaborators.map((collaborator) => (
                            <div 
                              key={collaborator.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback>
                                    {collaborator.user?.firstName?.charAt(0) || 
                                     collaborator.user?.username?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {collaborator.user?.firstName && collaborator.user?.lastName 
                                      ? `${collaborator.user.firstName} ${collaborator.user.lastName}`
                                      : collaborator.user?.username || 'Unknown User'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {collaborator.role || 'Viewer'}
                                  </p>
                                </div>
                              </div>
                              {!isReadOnly && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeCollaboratorMutation.mutate(collaborator.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {!isReadOnly && (
                      <CardFooter className="border-t pt-4 pb-3">
                        <div className="grid w-full gap-2">
                          <div className="flex items-center gap-2">
                            <Select 
                              value={selectedUserId?.toString() || ''}
                              onValueChange={(value) => setSelectedUserId(Number(value))}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select user" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Users</SelectLabel>
                                  {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.username}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            
                            <Select 
                              value={selectedRole}
                              onValueChange={setSelectedRole}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Owner">Owner</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={handleAddCollaborator}
                            disabled={!selectedUserId}
                          >
                            <UserPlus className="h-4 w-4 mr-2" /> Add Collaborator
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                </div>
                
                {/* Comments section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Comments</h3>
                  <Card className="flex flex-col h-[calc(100vh-320px)]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Discussion</CardTitle>
                      <CardDescription>
                        Comments and feedback on this proposal
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                      <ScrollArea className="h-full px-4">
                        {isLoadingComments ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                            <p>No comments yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4 py-4">
                            {comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {comment.createdBy?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-muted p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium">{comment.createdBy || 'User'}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'recently'}
                                      </span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="border-t p-4">
                      <form onSubmit={handleSubmitComment} className="w-full">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="resize-none"
                          />
                          <Button
                            type="submit"
                            className="self-end"
                            disabled={!newComment.trim()}
                          >
                            <Send className="h-4 w-4 mr-1" /> Send
                          </Button>
                        </div>
                      </form>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}