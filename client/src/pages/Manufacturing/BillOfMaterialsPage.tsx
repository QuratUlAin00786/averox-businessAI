import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Redirect, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Pencil, 
  Plus, 
  Trash, 
  AlertCircle, 
  FileText, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  CheckCircle 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// Define the schema for BOM item
const bomItemSchema = z.object({
  component_id: z.coerce.number().positive("Component is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be positive"),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  position: z.coerce.number().optional(),
  is_optional: z.boolean().default(false),
  is_sub_assembly: z.boolean().default(false),
  scrap_rate: z.coerce.number().min(0).default(0),
  operation: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  work_center_id: z.coerce.number().optional().nullable(),
});

// Define the schema for BOM creation
const bomCreateSchema = z.object({
  product_id: z.coerce.number().positive("Product is required"),
  name: z.string().min(1, "Name is required"),
  version: z.string().min(1, "Version is required"),
  description: z.string().optional(),
  manufacturing_type: z.string().default("Discrete"),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
  revision_notes: z.string().optional(),
});

// Define the schema for BOM version copying
const bomCopySchema = z.object({
  new_version: z.string().min(1, "New version is required"),
  new_name: z.string().min(1, "New name is required"),
});

type BomFormValues = z.infer<typeof bomCreateSchema>;
type BomItemFormValues = z.infer<typeof bomItemSchema>;
type BomCopyFormValues = z.infer<typeof bomCopySchema>;

type Bom = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  version: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  created_by: number;
  created_by_name: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  industry_type: string;
  notes: string | null;
  component_count: string;
};

type BomDetail = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  version: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  created_by: number;
  created_by_name: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  industry_type: string;
  yield_percentage: string;
  total_cost: string;
  notes: string | null;
  revision: string | null;
  items: BomItem[];
};

type BomItem = {
  id: number;
  component_id: number;
  component_name: string;
  component_sku: string;
  quantity: string;
  unit_of_measure: string;
  position: number;
  is_optional: boolean;
  is_sub_assembly: boolean;
  scrap_rate: string;
  operation: string | null;
  notes: string | null;
  work_center_id: number | null;
  work_center_name: string | null;
  unit_cost: string;
  total_cost: string;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
  stockQuantity: number;
};

export default function BillOfMaterialsPage() {
  const searchParams = useSearch();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedBomId, setSelectedBomId] = useState<number | null>(() => {
    // Initialize selectedBomId from URL parameter
    const params = new URLSearchParams(searchParams);
    const id = params.get('id');
    return id ? parseInt(id) : null;
  });
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!user && !authLoading) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to access this page",
      });
    }
  }, [user, authLoading, toast]);



  // Fetch BOMs list
  const { data: boms, isLoading, error } = useQuery<Bom[]>({
    queryKey: ['/api/manufacturing/boms'],
    select: (data) => {
      console.log("BOM list data loaded successfully:", data);
      return data;
    },
    gcTime: 0 // Disable cache to fetch fresh data
  });

  // Fetch BOM details when selected
  const { data: selectedBom, isLoading: isLoadingBomDetails } = useQuery<BomDetail>({
    queryKey: ['/api/manufacturing/boms', selectedBomId],
    enabled: !!selectedBomId,
    select: (data) => {
      console.log("BOM detail data loaded successfully:", data);
      return data;
    },
    gcTime: 0 // Disable cache to fetch fresh data
  });

  // Fetch products for the dropdown
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // BOM creation form
  const bomForm = useForm<BomFormValues>({
    resolver: zodResolver(bomCreateSchema),
    defaultValues: {
      name: "",
      product_id: 0,
      version: "1.0",
      description: "",
      manufacturing_type: "Discrete",
      is_active: true,
      notes: "",
      revision_notes: "Initial version",
    },
  });

  // BOM item form
  const bomItemForm = useForm<BomItemFormValues>({
    resolver: zodResolver(bomItemSchema),
    defaultValues: {
      component_id: 0,
      quantity: 1,
      unit_of_measure: "Each",
      is_optional: false,
      is_sub_assembly: false,
      scrap_rate: 0,
      operation: null,
      notes: null,
      work_center_id: null,
    },
  });

  // BOM copy form
  const bomCopyForm = useForm<BomCopyFormValues>({
    resolver: zodResolver(bomCopySchema),
    defaultValues: {
      new_version: "",
      new_name: "",
    },
  });

  // Create BOM mutation
  const createBomMutation = useMutation({
    mutationFn: (newBom: BomFormValues) => {
      return apiRequest("POST", '/api/manufacturing/boms', newBom);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/boms'] });
      setAddDialogOpen(false);
      bomForm.reset();
      toast({
        title: "Bill of Materials created",
        description: "The BOM has been successfully created",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating BOM",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  // Add BOM item mutation
  const addBomItemMutation = useMutation({
    mutationFn: (data: { bomId: number, item: BomItemFormValues }) => {
      return apiRequest("POST", `/api/manufacturing/boms/${data.bomId}/items`, data.item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/boms', selectedBomId] });
      setAddItemDialogOpen(false);
      bomItemForm.reset({
        component_id: 0,
        quantity: 1,
        unit_of_measure: "Each",
        is_optional: false,
        is_sub_assembly: false,
        scrap_rate: 0,
        operation: null,
        notes: null,
        work_center_id: null,
      });
      toast({
        title: "Component added",
        description: "The component has been added to the BOM",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding component",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  // Delete BOM item mutation
  const deleteBomItemMutation = useMutation({
    mutationFn: (data: { bomId: number, itemId: number }) => {
      return apiRequest("DELETE", `/api/manufacturing/boms/${data.bomId}/items/${data.itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/boms', selectedBomId] });
      setDeletingItemId(null);
      toast({
        title: "Component removed",
        description: "The component has been removed from the BOM",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error removing component",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  // Update BOM mutation
  const updateBomMutation = useMutation({
    mutationFn: (data: { bomId: number, updates: Partial<BomFormValues> }) => {
      return apiRequest("PATCH", `/api/manufacturing/boms/${data.bomId}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/boms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/boms', selectedBomId] });
      toast({
        title: "BOM updated",
        description: "The BOM has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating BOM",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  // Copy BOM mutation
  const copyBomMutation = useMutation({
    mutationFn: (data: { bomId: number, copyDetails: BomCopyFormValues }) => {
      return apiRequest("POST", `/api/manufacturing/boms/${data.bomId}/copy`, data.copyDetails);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/boms'] });
      setCopyDialogOpen(false);
      bomCopyForm.reset();
      toast({
        title: "BOM copied",
        description: "New BOM version created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error copying BOM",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const handleSelectBom = (bomId: number) => {
    setSelectedBomId(bomId === selectedBomId ? null : bomId);
  };

  // Get next available version for a product
  const getNextAvailableVersion = (productId: number): string => {
    if (!boms || !productId) return "1.0";
    
    // Find all BOMs for this product
    const productBoms = boms.filter(bom => bom.product_id === productId);
    if (productBoms.length === 0) return "1.0";
    
    // Extract version numbers and find the highest
    const versions = productBoms.map(bom => {
      const parts = bom.version.split('.');
      const major = parseInt(parts[0]) || 1;
      const minor = parseInt(parts[1]) || 0;
      return { major, minor, full: bom.version };
    });
    
    // Sort by major then minor version
    versions.sort((a, b) => {
      if (a.major !== b.major) return b.major - a.major;
      return b.minor - a.minor;
    });
    
    const highest = versions[0];
    return `${highest.major}.${highest.minor + 1}`;
  };

  const handleCreateBom = (data: BomFormValues) => {
    createBomMutation.mutate(data);
  };

  const handleAddBomItem = (data: BomItemFormValues) => {
    if (!selectedBomId) return;
    addBomItemMutation.mutate({ bomId: selectedBomId, item: data });
  };

  const handleDeleteBomItem = (itemId: number) => {
    if (!selectedBomId) return;
    deleteBomItemMutation.mutate({ bomId: selectedBomId, itemId });
  };

  const handleCopyBom = (data: BomCopyFormValues) => {
    if (!selectedBomId) return;
    copyBomMutation.mutate({ bomId: selectedBomId, copyDetails: data });
  };

  const handleToggleBomActive = (bom: Bom) => {
    updateBomMutation.mutate({
      bomId: bom.id,
      updates: { is_active: !bom.is_active }
    });
  };

  // Initialize copy form when dialog opens
  const openCopyDialog = () => {
    if (selectedBom) {
      const versionParts = selectedBom.version.split('.');
      let newVersion;
      
      // Try to increment the version number intelligently
      if (versionParts.length > 1 && !isNaN(parseInt(versionParts[versionParts.length - 1]))) {
        const lastPart = parseInt(versionParts[versionParts.length - 1]);
        versionParts[versionParts.length - 1] = (lastPart + 1).toString();
        newVersion = versionParts.join('.');
      } else {
        // If the version doesn't follow a numbering pattern, just append .1
        newVersion = `${selectedBom.version}.1`;
      }
      
      bomCopyForm.reset({
        new_version: newVersion,
        new_name: `${selectedBom.name} (${newVersion})`,
      });
      
      setCopyDialogOpen(true);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading Bills of Materials...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load Bills of Materials</AlertDescription>
      </Alert>
    );
  }

  // If not authenticated and not loading, redirect to auth page
  if (!user && !authLoading) {
    return <Redirect to="/auth" />;
  }

  // If still loading authentication, show loading spinner
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Bills of Materials</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create BOM
        </Button>
      </div>

      {/* Create BOM Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Bill of Materials</DialogTitle>
            <DialogDescription>
              Define the components and structure for a product
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            <Form {...bomForm}>
              <form id="bom-create-form" onSubmit={bomForm.handleSubmit(handleCreateBom)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bomForm.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const productId = parseInt(value);
                          field.onChange(productId);
                          // Auto-set the next available version for this product
                          const nextVersion = getNextAvailableVersion(productId);
                          bomForm.setValue('version', nextVersion);
                          // Auto-generate a default name
                          const selectedProduct = products?.find(p => p.id === productId);
                          if (selectedProduct) {
                            bomForm.setValue('name', `BOM for ${selectedProduct.name} - Version ${nextVersion}`);
                          }
                        }} 
                        value={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!isLoadingProducts && products?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bomForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOM Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter BOM name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bomForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Version is auto-set when you select a product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bomForm.control}
                  name="manufacturing_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Discrete">Discrete</SelectItem>
                          <SelectItem value="Process">Process</SelectItem>
                          <SelectItem value="Repetitive">Repetitive</SelectItem>
                          <SelectItem value="Batch">Batch</SelectItem>
                          <SelectItem value="Lean">Lean</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={bomForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter description" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bomForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bomForm.control}
                  name="revision_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revision Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Revision notes" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={bomForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active
                      </FormLabel>
                      <FormDescription>
                        This BOM will be available for use in production orders
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              </form>
            </Form>
          </div>
          <DialogFooter className="border-t pt-4 mt-4">
            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="bom-create-form" disabled={createBomMutation.isPending}>
              {createBomMutation.isPending ? "Creating..." : "Create BOM"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add BOM Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
            <DialogDescription>
              Add a new component to this Bill of Materials
            </DialogDescription>
          </DialogHeader>
          <Form {...bomItemForm}>
            <form onSubmit={bomItemForm.handleSubmit(handleAddBomItem)} className="space-y-4">
              <FormField
                control={bomItemForm.control}
                name="component_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a component" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!isLoadingProducts && products?.map((product) => (
                          // Don't allow selecting the same product as the BOM itself
                          selectedBom && product.id !== selectedBom.product_id ? (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ) : null
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bomItemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="0.01" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bomItemForm.control}
                  name="unit_of_measure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Each">Each</SelectItem>
                          <SelectItem value="Kg">Kilograms</SelectItem>
                          <SelectItem value="Lb">Pounds</SelectItem>
                          <SelectItem value="L">Liters</SelectItem>
                          <SelectItem value="mL">Milliliters</SelectItem>
                          <SelectItem value="m">Meters</SelectItem>
                          <SelectItem value="cm">Centimeters</SelectItem>
                          <SelectItem value="pcs">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={bomItemForm.control}
                  name="scrap_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scrap Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Expected waste percentage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={bomItemForm.control}
                  name="operation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operation</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Assembly, Cutting, etc." 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex space-x-4">
                <FormField
                  control={bomItemForm.control}
                  name="is_optional"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Optional
                        </FormLabel>
                        <FormDescription>
                          Component is not required
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={bomItemForm.control}
                  name="is_sub_assembly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Sub-Assembly
                        </FormLabel>
                        <FormDescription>
                          This is a sub-assembly
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={bomItemForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Notes about this component" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addBomItemMutation.isPending}>
                  {addBomItemMutation.isPending ? "Adding..." : "Add Component"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Copy BOM Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New BOM Version</DialogTitle>
            <DialogDescription>
              Create a new version of this BOM with all its components
            </DialogDescription>
          </DialogHeader>
          <Form {...bomCopyForm}>
            <form onSubmit={bomCopyForm.handleSubmit(handleCopyBom)} className="space-y-4">
              <FormField
                control={bomCopyForm.control}
                name="new_version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Version</FormLabel>
                    <FormControl>
                      <Input placeholder="2.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bomCopyForm.control}
                name="new_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Name</FormLabel>
                    <FormControl>
                      <Input placeholder="BOM name (new version)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCopyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={copyBomMutation.isPending}>
                  {copyBomMutation.isPending ? "Creating..." : "Create New Version"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Left side - BOM list */}
        <div className="col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bills of Materials</CardTitle>
              <CardDescription>Select a BOM to view its details</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!boms || boms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No Bills of Materials found
                      </TableCell>
                    </TableRow>
                  ) : (
                    boms.map((bom) => (
                      <TableRow 
                        key={bom.id} 
                        className={selectedBomId === bom.id ? "bg-muted/50" : ""}
                        onClick={() => handleSelectBom(bom.id)}
                      >
                        <TableCell>
                          <div className="font-medium">{bom.name}</div>
                          <div className="text-sm text-muted-foreground">{bom.product_name}</div>
                        </TableCell>
                        <TableCell>{bom.version}</TableCell>
                        <TableCell>
                          {bom.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right side - BOM details */}
        <div className="col-span-3">
          {selectedBomId && selectedBom ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedBom.name}</CardTitle>
                    <CardDescription>
                      {selectedBom.product_name} ({selectedBom.product_sku}) - Version {selectedBom.version}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleBomActive({
                        ...selectedBom,
                        component_count: "0"
                      } as Bom)}
                    >
                      {selectedBom.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openCopyDialog}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components">
                  <TabsList className="mb-4">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="components" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Components</h3>
                      <Button 
                        variant="default" 
                        onClick={() => setAddItemDialogOpen(true)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Component
                      </Button>
                    </div>
                    
                    {isLoadingBomDetails ? (
                      <div className="flex items-center justify-center h-40">Loading components...</div>
                    ) : selectedBom.items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <FileText className="h-8 w-8 mb-2" />
                        <p>No components added yet</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setAddItemDialogOpen(true)}
                          className="mt-2"
                        >
                          Add First Component
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Component</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBom.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">{item.component_name}</div>
                                <div className="text-sm text-muted-foreground">{item.component_sku}</div>
                                {item.notes && (
                                  <div className="text-sm italic mt-1">{item.notes}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div>
                                  {item.quantity} {item.unit_of_measure}
                                </div>
                                {item.is_sub_assembly && (
                                  <Badge variant="outline" className="mt-1">Sub-Assembly</Badge>
                                )}
                                {item.is_optional && (
                                  <Badge variant="outline" className="mt-1 ml-1">Optional</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div>${parseFloat(item.unit_cost).toFixed(2)} / unit</div>
                                <div className="font-medium">${parseFloat(item.total_cost).toFixed(2)} total</div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingItemId(item.id)}
                                >
                                  <Trash className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                
                                {/* Confirmation dialog */}
                                {deletingItemId === item.id && (
                                  <Dialog open onOpenChange={() => setDeletingItemId(null)}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Remove Component</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to remove {item.component_name} from this BOM?
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeletingItemId(null)}>
                                          Cancel
                                        </Button>
                                        <Button 
                                          variant="destructive" 
                                          onClick={() => handleDeleteBomItem(item.id)}
                                          disabled={deleteBomItemMutation.isPending}
                                        >
                                          {deleteBomItemMutation.isPending ? "Removing..." : "Remove"}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={2} className="text-right font-medium">Total:</TableCell>
                            <TableCell className="text-right font-bold">
                              ${parseFloat(selectedBom.total_cost || "0").toFixed(2)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                        <p className="mb-3">{selectedBom.description || "No description provided"}</p>
                        
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Manufacturing Type</h4>
                        <p className="mb-3">{selectedBom.industry_type}</p>
                        
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                        <p className="mb-3">{selectedBom.notes || "No notes provided"}</p>
                        
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Revision Notes</h4>
                        <p>{selectedBom.revision || "No revision notes provided"}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Created By</h4>
                        <p className="mb-3">{selectedBom.created_by_name} on {formatDate(selectedBom.created_at)}</p>
                        
                        {selectedBom.approved_by && (
                          <>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Approved By</h4>
                            <p className="mb-3">{selectedBom.approved_by_name} on {formatDate(selectedBom.approved_at || '')}</p>
                          </>
                        )}
                        
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Yield</h4>
                        <p className="mb-3">{selectedBom.yield_percentage}%</p>
                        
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                        <p>
                          {selectedBom.is_active ? (
                            <Badge><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No BOM Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a Bill of Materials from the list or create a new one to get started
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  Create New BOM
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}