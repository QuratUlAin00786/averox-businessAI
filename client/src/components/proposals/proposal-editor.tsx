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
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiRequestJson } from '@/lib/queryClient';
import { 
  Loader2, 
  Save, 
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Users,
  MessageSquare,
  EyeIcon,
  LockIcon,
  ChevronUp,
  ChevronDown,
  DragVerticalIcon,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

// Simple empty content by element type
const getDefaultElementContent = (type: ElementType) => {
  switch (type) {
    case 'Header':
      return { text: 'New Header', level: 1 };
    case 'Text':
      return { text: 'Enter your text here...' };
    case 'Image':
      return { url: '', caption: '', alt: '', width: 800 };
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
  const [activeTab, setActiveTab] = useState<'editor' | 'collaborators' | 'comments'>('editor');
  const [isDraggingElement, setIsDraggingElement] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<ProposalElement | null>(null);
  const [newComment, setNewComment] = useState('');

  // Fetch proposal elements
  const {
    data: elements = [],
    isLoading: isLoadingElements,
    refetch: refetchElements,
  } = useQuery<ProposalElement[]>({
    queryKey: ['/api/proposals', proposal.id, 'elements'],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${proposal.id}/elements`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposal elements');
      }
      
      const result = await response.json();
      console.log('Fetched proposal elements:', result);
      
      // Handle both standardized and legacy response formats
      return result.data || result;
    },
    enabled: isOpen,
  });

  // Fetch proposal collaborators
  const {
    data: collaborators = [],
    isLoading: isLoadingCollaborators,
    refetch: refetchCollaborators,
  } = useQuery<(ProposalCollaborator & { user?: User })[]>({
    queryKey: ['/api/proposals', proposal.id, 'collaborators'],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${proposal.id}/collaborators`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposal collaborators');
      }
      
      const result = await response.json();
      console.log('Fetched proposal collaborators:', result);
      
      // Handle both standardized and legacy response formats
      return result.data || result;
    },
    enabled: isOpen && activeTab === 'collaborators',
  });

  // Fetch proposal comments
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery<(ProposalComment & { user?: User })[]>({
    queryKey: ['/api/proposals', proposal.id, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${proposal.id}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposal comments');
      }
      
      const result = await response.json();
      console.log('Fetched proposal comments:', result);
      
      // Handle both standardized and legacy response formats
      return result.data || result;
    },
    enabled: isOpen && activeTab === 'comments',
  });

  // Reset state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('editor');
      setSelectedElement(null);
      setNewComment('');
    }
  }, [isOpen]);

  // Add element mutation
  const addElementMutation = useMutation({
    mutationFn: async (elementData: InsertProposalElement) => {
      return apiRequestJson<ProposalElement>(
        'POST', 
        `/api/proposals/${proposal.id}/elements`, 
        elementData
      );
    },
    onSuccess: () => {
      refetchElements();
      toast({
        title: 'Success',
        description: 'Element added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update element mutation
  const updateElementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProposalElement> }) => {
      return apiRequestJson<ProposalElement>(
        'PATCH', 
        `/api/proposal-elements/${id}`, 
        data
      );
    },
    onSuccess: () => {
      refetchElements();
      toast({
        title: 'Success',
        description: 'Element updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete element mutation
  const deleteElementMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequestJson<void>(
        'DELETE', 
        `/api/proposal-elements/${id}`
      );
    },
    onSuccess: () => {
      setSelectedElement(null);
      refetchElements();
      toast({
        title: 'Success',
        description: 'Element deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete element: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      return apiRequestJson<ProposalComment>(
        'POST', 
        `/api/proposals/${proposal.id}/comments`, 
        { 
          content: comment,
          proposalId: proposal.id,
        }
      );
    },
    onSuccess: () => {
      setNewComment('');
      refetchComments();
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add comment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Add collaborator mutation
  const addCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorData: { userId: number; role: string }) => {
      return apiRequestJson<ProposalCollaborator>(
        'POST', 
        `/api/proposals/${proposal.id}/collaborators`, 
        { 
          userId: collaboratorData.userId,
          role: collaboratorData.role,
          proposalId: proposal.id
        }
      );
    },
    onSuccess: () => {
      refetchCollaborators();
      toast({
        title: 'Success',
        description: 'Collaborator added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add collaborator: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Move element up/down mutations
  const moveElementMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
      const currentIndex = elements.findIndex(e => e.id === id);
      if (currentIndex === -1) return;
      
      const newElements = [...elements];
      const element = newElements[currentIndex];
      
      if (direction === 'up' && currentIndex > 0) {
        const prevElement = newElements[currentIndex - 1];
        
        // Swap sort orders
        const tempSortOrder = element.sortOrder;
        
        // Update the current element
        await updateElementMutation.mutateAsync({
          id: element.id,
          data: { sortOrder: prevElement.sortOrder }
        });
        
        // Update the previous element
        await updateElementMutation.mutateAsync({
          id: prevElement.id,
          data: { sortOrder: tempSortOrder }
        });
      } 
      else if (direction === 'down' && currentIndex < newElements.length - 1) {
        const nextElement = newElements[currentIndex + 1];
        
        // Swap sort orders
        const tempSortOrder = element.sortOrder;
        
        // Update the current element
        await updateElementMutation.mutateAsync({
          id: element.id,
          data: { sortOrder: nextElement.sortOrder }
        });
        
        // Update the next element
        await updateElementMutation.mutateAsync({
          id: nextElement.id,
          data: { sortOrder: tempSortOrder }
        });
      }
      
      return;
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

  const handleAddElement = (type: ElementType) => {
    if (isReadOnly) return;
    
    addElementMutation.mutate({
      proposalId: proposal.id,
      name: `New ${type}`,
      elementType: type,
      content: getDefaultElementContent(type),
      isActive: true,
    });
  };

  const handleSaveElement = () => {
    if (!selectedElement || isReadOnly) return;
    
    updateElementMutation.mutate({
      id: selectedElement.id,
      data: {
        name: selectedElement.name,
        content: selectedElement.content,
      }
    });
  };

  const handleDeleteElement = (id: number) => {
    if (isReadOnly) return;
    
    if (window.confirm('Are you sure you want to delete this element?')) {
      deleteElementMutation.mutate(id);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || isReadOnly) return;
    
    addCommentMutation.mutate(newComment.trim());
  };

  const getElementDisplay = (element: ProposalElement) => {
    const isSelected = selectedElement?.id === element.id;
    
    // Basic preview of the element based on type
    switch (element.elementType) {
      case 'Header':
        return (
          <div className={cn("text-xl font-bold", isSelected && "bg-primary/5 p-2 rounded")}>
            {element.content.text || 'Header Text'}
          </div>
        );
      case 'Text':
        return (
          <div className={cn("text-sm line-clamp-3", isSelected && "bg-primary/5 p-2 rounded")}>
            {element.content.text || 'Text content...'}
          </div>
        );
      case 'Image':
        return (
          <div className={cn("text-center text-sm text-neutral-500", isSelected && "bg-primary/5 p-2 rounded")}>
            {element.content.url ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-12 border flex items-center justify-center bg-neutral-50">
                  <EyeIcon className="h-4 w-4 text-neutral-400" />
                </div>
                <span className="mt-1">Image</span>
              </div>
            ) : (
              <span>[Image placeholder]</span>
            )}
          </div>
        );
      case 'Table':
        return (
          <div className={cn("text-center text-sm text-neutral-500", isSelected && "bg-primary/5 p-2 rounded")}>
            <div className="border-2 border-neutral-200 w-full h-10 flex items-center justify-center">
              Table: {element.content.headers?.length || 0} columns × {element.content.rows?.length || 0} rows
            </div>
          </div>
        );
      case 'List':
        return (
          <div className={cn("text-sm", isSelected && "bg-primary/5 p-2 rounded")}>
            {element.content.ordered ? (
              <ol className="list-decimal list-inside">
                {(element.content.items || ['List item']).slice(0, 3).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                {(element.content.items?.length || 0) > 3 && <li>...</li>}
              </ol>
            ) : (
              <ul className="list-disc list-inside">
                {(element.content.items || ['List item']).slice(0, 3).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
                {(element.content.items?.length || 0) > 3 && <li>...</li>}
              </ul>
            )}
          </div>
        );
      case 'Quote':
        return (
          <div className={cn("border-l-4 pl-4 italic", isSelected && "bg-primary/5 p-2 rounded")}>
            "{element.content.text || 'Quote text'}"
            {element.content.attribution && (
              <div className="text-right text-sm">— {element.content.attribution}</div>
            )}
          </div>
        );
      case 'PageBreak':
        return (
          <div className={cn("border-t-2 border-dashed my-2 text-center text-xs text-neutral-400", isSelected && "bg-primary/5 p-2 rounded")}>
            Page Break
          </div>
        );
      case 'Signature':
        return (
          <div className={cn("text-sm", isSelected && "bg-primary/5 p-2 rounded")}>
            <div className="border-b mt-4 mb-2 w-40"></div>
            <div>{element.content.name || 'Signature'}</div>
            <div className="text-neutral-500 text-xs">{element.content.role || 'Title'}</div>
            {element.content.date && <div className="text-neutral-500 text-xs">Date</div>}
          </div>
        );
      default:
        return (
          <div className={cn("text-sm text-neutral-500", isSelected && "bg-primary/5 p-2 rounded")}>
            {element.elementType} element
          </div>
        );
    }
  };

  const renderElementEditor = () => {
    if (!selectedElement) return null;
    
    switch (selectedElement.elementType) {
      case 'Header':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Header Text</label>
              <Input 
                value={selectedElement.content.text || ''}
                onChange={e => {
                  setSelectedElement({
                    ...selectedElement,
                    content: {
                      ...selectedElement.content,
                      text: e.target.value,
                    }
                  });
                }}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Header Level</label>
              <Select 
                value={String(selectedElement.content.level || 1)}
                onValueChange={value => {
                  setSelectedElement({
                    ...selectedElement,
                    content: {
                      ...selectedElement.content,
                      level: parseInt(value),
                    }
                  });
                }}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select header level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1 - Main Title</SelectItem>
                  <SelectItem value="2">H2 - Section Title</SelectItem>
                  <SelectItem value="3">H3 - Subsection Title</SelectItem>
                  <SelectItem value="4">H4 - Minor Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'Text':
        return (
          <div>
            <label className="text-sm font-medium">Text Content</label>
            <Textarea
              value={selectedElement.content.text || ''}
              onChange={e => {
                setSelectedElement({
                  ...selectedElement,
                  content: {
                    ...selectedElement.content,
                    text: e.target.value,
                  }
                });
              }}
              className="min-h-[200px]"
              disabled={isReadOnly}
            />
          </div>
        );
      // Note: This is a simplified editor. In a real application, you would have more complex
      // editors for each element type with full functionality.
      default:
        return (
          <div className="p-4 bg-neutral-50 rounded text-center">
            <p>
              Editor for {selectedElement.elementType} elements is not fully implemented in this demo.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              In a real application, this would be a full-featured editor specific to this element type.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] p-0">
        <DialogHeader className="sticky top-0 z-10 bg-white pt-6 px-6 pb-2 border-b">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>{proposal.name}</DialogTitle>
              <DialogDescription>
                {isReadOnly ? 'Viewing proposal content' : 'Edit proposal content and structure'}
              </DialogDescription>
            </div>
            {isReadOnly && (
              <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
                <LockIcon className="h-3 w-3 mr-1" /> Read Only
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="editor">Content</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex flex-col md:flex-row h-[calc(90vh-180px)]">
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

              <ScrollArea className="flex-1 pr-3 -mr-3">
                {isLoadingElements ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : elements.length === 0 ? (
                  <div className="text-center p-4 text-neutral-500 text-sm">
                    No elements yet. {!isReadOnly && 'Use the + button to add elements.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {elements.map((element) => (
                      <div 
                        key={element.id}
                        className={cn(
                          "p-2 rounded border cursor-pointer hover:bg-neutral-50 transition-colors",
                          selectedElement?.id === element.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedElement(element)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            {element.elementType}
                          </Badge>
                          
                          {!isReadOnly && selectedElement?.id === element.id && (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
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
                                className="h-6 w-6" 
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
                                className="h-6 w-6 text-red-600 hover:text-red-700" 
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
                        <div className="text-xs truncate">{element.name}</div>
                      </div>
                    ))}
                  </div>
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
                      {!isReadOnly && (
                        <Button 
                          size="sm" 
                          onClick={handleSaveElement}
                          disabled={isReadOnly}
                        >
                          <Save className="h-4 w-4 mr-2" /> Save Element
                        </Button>
                      )}
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
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="p-4 flex-1 overflow-auto bg-neutral-50">
                    <div className="bg-white p-6 shadow rounded max-w-3xl mx-auto">
                      <h3 className="text-sm font-medium mb-2 text-neutral-500">Preview</h3>
                      {getElementDisplay(selectedElement)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-6 flex items-center justify-center bg-neutral-50">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">No Element Selected</h3>
                    <p className="text-sm text-neutral-500">
                      {elements.length > 0 
                        ? 'Select an element from the list on the left to edit it' 
                        : `No elements yet. ${!isReadOnly ? 'Add elements using the + button.' : ''}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="collaborators" className="p-6 max-h-[calc(90vh-180px)] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Collaborators</h3>
              {!isReadOnly && (
                <Button size="sm" disabled>
                  <Plus className="h-4 w-4 mr-2" /> Add Collaborator
                </Button>
              )}
            </div>

            {isLoadingCollaborators ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : collaborators.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-neutral-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No collaborators yet</h3>
                  <p className="text-neutral-500 mb-4">
                    No one has been added as a collaborator on this proposal.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {collaborator.user?.avatar ? (
                            <AvatarImage src={collaborator.user.avatar} alt={collaborator.user.username} />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {collaborator.user?.firstName?.[0]}{collaborator.user?.lastName?.[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {collaborator.user ? `${collaborator.user.firstName} ${collaborator.user.lastName}` : 'Unknown User'}
                          </CardTitle>
                          <CardDescription>
                            Role: {collaborator.role}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2 flex justify-between text-sm text-neutral-500">
                      <div>
                        Added {collaborator.addedAt ? formatDistanceToNow(new Date(collaborator.addedAt), { addSuffix: true }) : 'recently'}
                      </div>
                      <div>
                        {collaborator.lastAccessed ? (
                          `Last active ${formatDistanceToNow(new Date(collaborator.lastAccessed), { addSuffix: true })}`
                        ) : 'Never accessed'}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="p-6 max-h-[calc(90vh-180px)] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Comments</h3>
            </div>

            {isLoadingComments ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        {comment.user?.avatar ? (
                          <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="font-medium">
                            {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User'}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
                          </div>
                        </div>
                        <p className="text-neutral-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <div className="text-center p-8 text-neutral-500">
                      <MessageSquare className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                      <p className="mb-4">
                        Start the conversation by adding the first comment.
                      </p>
                    </div>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Add a comment</h4>
                    <div className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your comment here..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-neutral-50 p-4 flex justify-between gap-2 border-t">
          <div>
            {!isReadOnly && activeTab === 'editor' && elements.length > 0 && (
              <Button 
                onClick={() => onSave()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" /> Save All Changes
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}