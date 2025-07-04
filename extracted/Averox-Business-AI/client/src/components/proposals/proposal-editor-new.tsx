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
        type: 'Header',
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
        type: 'Text',
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
      type: type,
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
        onChange={(updatedElement) => {
          console.log("Element updated in editor:", updatedElement);
          setSelectedElement(updatedElement);
        }}
        disabled={isReadOnly}
      />
    );
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
                      <div key={element.id} className="border rounded-md p-4 bg-white shadow-sm">
                        {getElementDisplay(element)}
                      </div>
                    ))}

                    {elements.length === 0 && (
                      <div className="text-center py-12 border border-dashed rounded-md">
                        <h4 className="text-lg font-medium text-neutral-600 mb-2">No Content Yet</h4>
                        <p className="text-neutral-500 mb-4">Start adding elements to build your proposal document</p>
                        {!isReadOnly && (
                          <Button onClick={() => setActiveTab('elements')}>
                            <Plus className="h-4 w-4 mr-2" /> Add Elements
                          </Button>
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