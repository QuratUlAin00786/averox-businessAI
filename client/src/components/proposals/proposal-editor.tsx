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
  
  // Add a debug effect for tab changes
  useEffect(() => {
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);
  
  // Component lifecycle effect
  useEffect(() => {
    console.log("ProposalEditor component mounted with isOpen:", isOpen, "proposalId:", proposal.id);
    
    // Check if there are cached elements in session storage
    let storedElement = null;
    try {
      const storedElementString = sessionStorage.getItem(`proposal_${proposal.id}_selected_element`);
      if (storedElementString) {
        const parsedElement = JSON.parse(storedElementString);
        console.log("Found stored selected element:", parsedElement);
        storedElement = parsedElement;
      }
    } catch (error) {
      console.warn("Error reading from sessionStorage:", error);
    }
    
    if (isOpen) {
      console.log("ProposalEditor is open, fetching elements for proposal:", proposal.id);
      refetchElements().then(() => {
        console.log("Elements fetched, ready for editing");
        
        // If we had a stored element, try to match it with fetched elements
        if (storedElement && elements.length > 0) {
          const foundElement = elements.find(e => e.id === storedElement.id);
          if (foundElement) {
            console.log("Setting stored element as selected:", foundElement.id);
            setSelectedElement(foundElement);
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
        }
      });
    }
    
    // Clear the session storage on unmount
    return () => {
      console.log("Complete cleanup on component unmount");
      try {
        sessionStorage.removeItem(`proposal_${proposal.id}_selected_element`);
        sessionStorage.removeItem(`proposal_${proposal.id}_elements`);
      } catch (error) {
        console.warn("Error clearing sessionStorage:", error);
      }
    };
  }, []);
  
  // For now, we'll remove this effect as it causes issues with the initialization order
  // We'll add it back after the elements query is defined
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
  
  // We'll add this effect after the addElementMutation is defined, to avoid reference errors

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
      // Create a simplified element with only the fields we need to update
      const simplifiedElement = {
        id: element.id,
        proposalId: element.proposalId,
        name: element.name,
        elementType: element.elementType,
        sortOrder: element.sortOrder,
        // Handle the content separately
      };
      
      // Prepare content properly
      let contentString = "";
      if (typeof element.content === 'string') {
        try {
          // Validate it's proper JSON by parsing and re-stringifying it
          const parsed = JSON.parse(element.content);
          contentString = JSON.stringify(parsed);
        } catch (e) {
          console.error("Content was string but not valid JSON:", e);
          contentString = JSON.stringify({ text: String(element.content) });
        }
      } else if (typeof element.content === 'object') {
        contentString = JSON.stringify(element.content);
      } else {
        // Fallback for any other type
        contentString = JSON.stringify({ text: "Content could not be processed" });
      }
      
      // Create the final data to send
      const dataToSend = {
        ...simplifiedElement,
        content: contentString
      };
      
      console.log("Sending data for update:", dataToSend);
      
      try {
        // Use the correct endpoint
        const response = await fetch(`/api/proposal-elements/${element.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
        
        const responseText = await response.text();
        console.log("Raw server response:", responseText);
        
        if (!response.ok) {
          console.error("Error updating element. Status:", response.status, "Message:", responseText);
          throw new Error(`Failed to update element: Status ${response.status}`);
        }
        
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse server response as JSON:", e);
          throw new Error("Invalid response from server");
        }
        
        console.log("Update element response:", json);
        return json.data || json;
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
        // Use the correct endpoint format
        const response = await fetch(`/api/proposal-elements/${elementId}`, {
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
      // Use the correct endpoint format
      const response = await fetch(`/api/proposal-elements/${id}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          direction,
          proposalId: proposal.id // Add proposal ID for context
        }),
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
          
          const result = await response.json();
          console.log("Server response for element creation:", result);
          
          if (result.data) {
            const newElement = result.data;
            console.log("Created default text element:", newElement);
            
            // Set the element directly
            setSelectedElement(newElement);
            setActiveTab('editor');
            
            // Also refetch to ensure state consistency 
            refetchElements();
            
            toast({
              title: "Element Created",
              description: "A default text element has been added to your proposal.",
            });
          }
        } catch (error) {
          console.error("Error creating default element:", error);
          toast({
            title: "Error",
            description: "Failed to create default element. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    
    handleElementsLoaded();
  }, [elements, selectedElement, activeTab, isLoadingElements, addElementMutation.isPending, proposal.id]);

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

  const handleAddElement = async (type: ElementType) => {
    if (isReadOnly) return;
    
    console.log("Adding new element of type:", type);
    
    try {
      // Use our new implementation for creating elements
      const result = await createProposalElement(
        proposal.id,
        type as ProposalElementType,
        2 // Default user ID
      );
      
      if (!result) {
        throw new Error("Element creation failed with no error message");
      }
      
      console.log("Element created successfully:", result);
      
      // Refresh the elements list
      console.log("Refreshing elements list after element creation...");
      await refetchElements();
      console.log("Elements after add: updated list");
      
      // If this is our first element, switch to editor tab to show it
      if (elements.length === 0) {
        setTimeout(() => {
          setActiveTab('editor');
          toast({
            title: 'Element Created',
            description: 'Your first element has been added to the proposal.',
          });
        }, 500);
      }
      
      return result;
      
    } catch (error: any) {
      console.error("Error in handleAddElement:", error);
      toast({
        title: 'Error',
        description: `Failed to add element: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const handleDeleteElement = (id: number) => {
    if (isReadOnly) return;
    
    if (confirm('Are you sure you want to delete this element?')) {
      deleteElementMutation.mutate(id);
    }
  };
  
  const handleSaveElement = () => {
    if (!selectedElement || isReadOnly) {
      console.log("Cannot save element - no element selected or readonly mode");
      return;
    }
    
    console.log("Saving element with ID:", selectedElement.id);
    console.log("Element data being saved:", selectedElement);
    
    // Add a UI indicator
    toast({
      title: "Saving...",
      description: "Updating element content",
    });
    
    updateElementMutation.mutate(selectedElement);
  };

  const getElementDisplay = (element: ProposalElement) => {
    return <ElementRenderer element={element} />;
  };
  
  const renderElementEditor = () => {
    // If we're still loading elements, show a loading indicator
    if (isLoadingElements) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500">Loading proposal elements...</p>
          </div>
        </div>
      );
    }
    
    // If we have no elements at all, show a helpful message
    if (elements.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center p-4">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Content Elements</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md">
            Your proposal doesn't have any content elements yet. Use the "Add Element" 
            button to start adding content to your proposal.
          </p>
          <Button 
            onClick={() => handleAddElement('Text')}
            disabled={isReadOnly}
          >
            <Plus className="h-4 w-4 mr-2" /> 
            Add Text Element
          </Button>
        </div>
      );
    }
    
    // If we have elements but none is selected, show element picker
    if (!selectedElement) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center p-4">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Select an Element</h3>
          <p className="text-sm text-gray-500 mb-4">
            Please select an element from the list on the left to edit its content.
          </p>
          {elements.length > 0 && (
            <Button 
              onClick={() => setSelectedElement(elements[0])}
              variant="outline"
            >
              Edit First Element
            </Button>
          )}
        </div>
      );
    }
    
    // We have a selected element, set up the editor
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
        onChange={(updatedElement) => {
          console.log("Element updated in editor:", updatedElement);
          setSelectedElement(updatedElement);
        }}
        disabled={isReadOnly}
      />
    );
  };

  // If not open, don't even render the component
  if (!isOpen) {
    console.log("ProposalEditor is not open, not rendering");
    return null;
  }

  console.log("ProposalEditor rendering in open state for proposal:", proposal.id);
  
  return (
    <div className="fixed inset-0 z-50 bg-white">
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
                          disabled={isUploading || !file}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" /> Import Document
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-white p-6 shadow rounded border max-w-4xl mx-auto">
                  <h3 className="text-lg font-medium mb-4">Document Content</h3>
                  <p className="mb-6 text-neutral-600">Edit the overall document content here. Arrange individual elements in the Elements tab.</p>
                  
                  <div className="space-y-8">
                    {elements.map(element => (
                      <div 
                        key={element.id} 
                        className={`border rounded-md p-4 bg-white shadow-sm cursor-pointer transition-all ${
                          selectedElement?.id === element.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                        }`}
                        onClick={() => {
                          console.log("Element clicked in content view:", element.id);
                          setSelectedElement(element);
                          setActiveTab('elements');
                        }}
                      >
                        {getElementDisplay(element)}
                        
                        {/* Add an edit overlay with icon */}
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the parent onClick from firing
                              console.log("Edit button clicked for element:", element.id);
                              setSelectedElement(element);
                              setActiveTab('elements');
                            }}
                          >
                            <PencilIcon className="h-3 w-3 mr-1" /> Edit Content
                          </Button>
                        </div>
                      </div>
                    ))}

                    {elements.length === 0 && (
                      <div className="text-center py-12 border border-dashed rounded-md">
                        <h4 className="text-lg font-medium text-neutral-600 mb-2">No Content Yet</h4>
                        <p className="text-neutral-500 mb-4">Start adding elements to build your proposal document</p>
                        {!isReadOnly && (
                          <div className="flex flex-col items-center gap-3">
                            <Button onClick={() => setActiveTab('elements')}>
                              <Plus className="h-4 w-4 mr-2" /> Go to Elements Tab
                            </Button>
                            
                            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md mx-auto">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddElement('Header')}
                              >
                                Add Header
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddElement('Text')}
                              >
                                Add Text
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddElement('Image')}
                              >
                                Add Image
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddElement('Table')}
                              >
                                Add Table
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="elements" className="flex flex-col md:flex-row h-[calc(100vh-180px)]">
              {/* Elements list and controls */}
              <div className="w-full md:w-64 border-r p-4 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Elements</h3>
                  {!isReadOnly && (
                    <Select 
                      onValueChange={(value) => handleAddElement(value as ElementType)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="w-8 h-8 p-0 flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Header">Header</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Image">Image</SelectItem>
                        <SelectItem value="Table">Table</SelectItem>
                        <SelectItem value="List">List</SelectItem>
                        <SelectItem value="Quote">Quote</SelectItem>
                        <SelectItem value="ProductList">Product List</SelectItem>
                        <SelectItem value="Signature">Signature</SelectItem>
                        <SelectItem value="PageBreak">Page Break</SelectItem>
                        <SelectItem value="Custom">Custom HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <ScrollArea className="flex-1 pr-3 -mr-3 max-h-[600px]">
                  {isLoadingElements ? (
                    <div className="flex justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    </div>
                  ) : (
                    <DraggableElementList
                      elements={elements}
                      selectedElementId={selectedElement?.id || null}
                      isReadOnly={isReadOnly}
                      onSelectElement={setSelectedElement}
                      onReorderElement={(elementId, newIndex) => {
                        // Get the current element and its index
                        const elementToMove = elements.find(el => el.id === elementId);
                        const currentIndex = elements.findIndex(el => el.id === elementId);
                        
                        if (!elementToMove || currentIndex === -1 || currentIndex === newIndex) {
                          return;
                        }
                        
                        // For our demo, we're using the moveElementMutation which requires direction
                        // This is a simplification - in a real implementation, you would have a proper API endpoint
                        // that accepts the new sort order or index directly
                        
                        const direction = currentIndex > newIndex ? 'up' : 'down';
                        const steps = Math.abs(currentIndex - newIndex);
                        
                        // Create a chain of mutations
                        let currentStep = 0;
                        const moveNextStep = () => {
                          if (currentStep < steps) {
                            moveElementMutation.mutate(
                              { id: elementId, direction }, 
                              {
                                onSuccess: () => {
                                  currentStep++;
                                  moveNextStep();
                                },
                                onError: (error) => {
                                  toast({
                                    title: 'Error',
                                    description: `Failed to reorder element: ${error.message}`,
                                    variant: 'destructive'
                                  });
                                }
                              }
                            );
                          } else {
                            // Done with all steps
                            toast({
                              title: 'Success',
                              description: 'Element reordered successfully'
                            });
                          }
                        };
                        
                        // Start the chain
                        moveNextStep();
                      }}
                      onDeleteElement={handleDeleteElement}
                    />
                  )}
                </ScrollArea>
              </div>

              {/* Editor and preview */}
              <div className="flex-1 flex flex-col">
                {selectedElement ? (
                  <div className="flex flex-col h-full">
                    {/* Element editor */}
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">
                          Editing: {selectedElement.name}
                        </h3>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedElement(null)}
                          >
                            <X className="h-4 w-4 mr-2" /> Close
                          </Button>
                          {!isReadOnly && (
                            <Button 
                              size="sm" 
                              onClick={handleSaveElement}
                              disabled={updateElementMutation.isPending}
                            >
                              {updateElementMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" /> Save
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-sm font-medium">Element Name</label>
                        <Input 
                          value={selectedElement.name} 
                          onChange={(e) => setSelectedElement({
                            ...selectedElement,
                            name: e.target.value,
                          })}
                          className="mb-4"
                          disabled={isReadOnly}
                        />
                        
                        {renderElementEditor()}
                        
                        {!isReadOnly && (
                          <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedElement(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleSaveElement}
                              disabled={updateElementMutation.isPending}
                            >
                              {updateElementMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" /> Save
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="flex-1 p-4 overflow-auto">
                      <div className="mb-3 flex justify-between items-center">
                        <h3 className="text-sm font-medium">Preview</h3>
                        <div className="text-xs text-neutral-500">
                          Last Updated: {selectedElement.updatedAt ? new Date(selectedElement.updatedAt).toLocaleString() : 'Never'}
                        </div>
                      </div>
                      <div className="p-4 border rounded-md bg-neutral-50">
                        <ElementPreview element={selectedElement} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center">
                    <div>
                      <FileIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Element Editor</h3>
                      <p className="text-neutral-500 max-w-md mb-6">
                        Select an element from the list on the left to edit its content, or add a new element to get started.
                      </p>
                      {!isReadOnly && (
                        <Select 
                          onValueChange={(value) => handleAddElement(value as ElementType)}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="w-48 mx-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add New Element
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Header">Header</SelectItem>
                            <SelectItem value="Text">Text</SelectItem>
                            <SelectItem value="Image">Image</SelectItem>
                            <SelectItem value="Table">Table</SelectItem>
                            <SelectItem value="List">List</SelectItem>
                            <SelectItem value="Quote">Quote</SelectItem>
                            <SelectItem value="ProductList">Product List</SelectItem>
                            <SelectItem value="Signature">Signature</SelectItem>
                            <SelectItem value="PageBreak">Page Break</SelectItem>
                            <SelectItem value="Custom">Custom HTML</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
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
    </div>
  );
}