import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Pencil, Plus, Trash, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define the schema for BOM item
const bomItemSchema = z.object({
  product_id: z.coerce.number().positive("Product is required"),
  product_name: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  is_assembly: z.boolean().default(false),
  notes: z.string().optional(),
});

// Define the schema for BOM data
const bomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  product_id: z.coerce.number().positive("Product is required"),
  product_name: z.string().optional(),
  version: z.string().min(1, "Version is required"),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
  items: z.array(bomItemSchema).min(1, "At least one material item is required"),
});

type BomFormValues = z.infer<typeof bomSchema>;

type Bom = {
  id: number;
  name: string;
  product_id: number;
  product_name: string;
  version: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number;
};

type BomItem = {
  id: number;
  bom_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_of_measure: string;
  is_assembly: boolean;
  notes: string | null;
};

type Product = {
  id: number;
  name: string;
  sku: string;
};

export default function BOMList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBom, setEditingBom] = useState<Bom | null>(null);
  const [deleteBomId, setDeleteBomId] = useState<number | null>(null);
  const [selectedBom, setSelectedBom] = useState<Bom | null>(null);
  const [expandedBomId, setExpandedBomId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch BOMs data
  const { data: boms, isLoading, error } = useQuery<Bom[]>({
    queryKey: ['/api/manufacturing/bom'],
  });

  // Fetch BOM items when a BOM is selected
  const { data: bomItems, isLoading: isLoadingItems } = useQuery<BomItem[]>({
    queryKey: ['/api/manufacturing/bom', expandedBomId, 'items'],
    enabled: !!expandedBomId,
    queryFn: () => 
      apiRequest(`/api/manufacturing/bom/${expandedBomId}`).then(
        (data) => data.items || []
      ),
  });

  // Fetch products for the dropdown
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Create form
  const form = useForm<BomFormValues>({
    resolver: zodResolver(bomSchema),
    defaultValues: {
      name: "",
      product_id: 0,
      version: "1.0",
      is_active: true,
      description: "",
      items: [
        {
          product_id: 0,
          quantity: 1,
          unit_of_measure: "PC",
          is_assembly: false,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Create BOM mutation
  const createBomMutation = useMutation({
    mutationFn: (newBom: BomFormValues) => {
      return apiRequest('/api/manufacturing/bom', {
        method: 'POST',
        data: newBom,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/bom'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Bill of Materials created",
        description: "The BOM has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating BOM",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Update BOM mutation
  const updateBomMutation = useMutation({
    mutationFn: (updatedBom: BomFormValues & { id: number }) => {
      const { id, ...data } = updatedBom;
      return apiRequest(`/api/manufacturing/bom/${id}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/bom'] });
      setEditingBom(null);
      form.reset();
      toast({
        title: "Bill of Materials updated",
        description: "The BOM has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating BOM",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Delete BOM mutation
  const deleteBomMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/manufacturing/bom/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/bom'] });
      setDeleteBomId(null);
      toast({
        title: "Bill of Materials deleted",
        description: "The BOM has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting BOM",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const onSubmit = (values: BomFormValues) => {
    // Find product names for the selected product IDs
    if (products) {
      // Set product name for the main product
      const mainProduct = products.find(p => p.id === values.product_id);
      if (mainProduct) {
        values.product_name = mainProduct.name;
      }

      // Set product names for BOM items
      values.items = values.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          product_name: product ? product.name : undefined,
        };
      });
    }

    if (editingBom) {
      updateBomMutation.mutate({ ...values, id: editingBom.id });
    } else {
      createBomMutation.mutate(values);
    }
  };

  const handleEditBom = async (bom: Bom) => {
    setEditingBom(bom);
    
    // Fetch BOM items for the selected BOM
    try {
      const bomData = await apiRequest(`/api/manufacturing/bom/${bom.id}`);
      const items = bomData.items || [];
      
      // Reset form with BOM data
      form.reset({
        name: bom.name,
        product_id: bom.product_id,
        product_name: bom.product_name,
        version: bom.version,
        is_active: bom.is_active,
        description: bom.description || undefined,
        items: items.map((item: BomItem) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_of_measure: item.unit_of_measure,
          is_assembly: item.is_assembly,
          notes: item.notes || undefined,
        })),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching BOM details",
        description: "Failed to load BOM items. Please try again.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingBom(null);
    form.reset();
  };

  const handleBomRowClick = (bom: Bom) => {
    setExpandedBomId(expandedBomId === bom.id ? null : bom.id);
  };

  const getProductName = (productId: number) => {
    if (!products) return "Unknown";
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bill of Materials</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create BOM
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[680px]">
            <DialogHeader>
              <DialogTitle>Create New Bill of Materials</DialogTitle>
              <DialogDescription>
                Define the materials needed to produce a product
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BOM Name</FormLabel>
                        <FormControl>
                          <Input placeholder="BOM name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value ? field.value.toString() : undefined}
                          value={field.value ? field.value.toString() : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="Version" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Is this BOM currently active?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="ml-3 h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="BOM description (optional)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Material Items</h3>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => append({
                        product_id: 0,
                        quantity: 1,
                        unit_of_measure: "PC",
                        is_assembly: false,
                        notes: "",
                      })}
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border">
                      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-md">Item #{index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <FormField
                            control={form.control}
                            name={`items.${index}.product_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Material/Component</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  defaultValue={field.value ? field.value.toString() : undefined}
                                  value={field.value ? field.value.toString() : undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select component" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products?.map((product) => (
                                      <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.name} ({product.sku})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="Quantity" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit_of_measure`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>UoM</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Unit" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="PC">PC (Piece)</SelectItem>
                                      <SelectItem value="KG">KG (Kilogram)</SelectItem>
                                      <SelectItem value="L">L (Liter)</SelectItem>
                                      <SelectItem value="M">M (Meter)</SelectItem>
                                      <SelectItem value="M2">M² (Square Meter)</SelectItem>
                                      <SelectItem value="M3">M³ (Cubic Meter)</SelectItem>
                                      <SelectItem value="G">G (Gram)</SelectItem>
                                      <SelectItem value="ML">ML (Milliliter)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.is_assembly`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Sub-Assembly</FormLabel>
                                  <FormDescription className="text-xs">
                                    Is this a manufactured sub-assembly?
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="ml-3 h-4 w-4"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Additional notes"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {fields.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No items added</AlertTitle>
                      <AlertDescription>
                        Add at least one material item to the BOM.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      handleCancelEdit();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBomMutation.isPending || updateBomMutation.isPending}
                  >
                    {editingBom 
                      ? (updateBomMutation.isPending ? "Updating..." : "Update") 
                      : (createBomMutation.isPending ? "Creating..." : "Create")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading bills of materials...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load bills of materials. Please try again.
          </AlertDescription>
        </Alert>
      ) : boms && boms.length > 0 ? (
        <Table>
          <TableCaption>List of all bills of materials</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boms.map((bom) => (
              <>
                <TableRow 
                  key={bom.id} 
                  className="cursor-pointer"
                  onClick={() => handleBomRowClick(bom)}
                >
                  <TableCell>
                    {expandedBomId === bom.id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </TableCell>
                  <TableCell className="font-medium">{bom.name}</TableCell>
                  <TableCell>{bom.product_name}</TableCell>
                  <TableCell>{bom.version}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${bom.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`}>
                      {bom.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{bom.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBom(bom);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteBomId(bom.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedBomId === bom.id && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium mb-2">BOM Items</h4>
                        {isLoadingItems ? (
                          <div className="py-4 text-center">Loading items...</div>
                        ) : !bomItems || bomItems.length === 0 ? (
                          <div className="py-4 text-center text-muted-foreground">No items found in this BOM</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Component</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bomItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.product_name}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.unit_of_measure}</TableCell>
                                  <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                      ${item.is_assembly 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-800'}`}>
                                      {item.is_assembly ? 'Sub-Assembly' : 'Material'}
                                    </span>
                                  </TableCell>
                                  <TableCell>{item.notes || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">No bills of materials found</p>
          <p className="text-sm text-muted-foreground">
            Create your first BOM to define the materials required for your products.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteBomId && (
        <Dialog
          open={!!deleteBomId}
          onOpenChange={(open) => !open && setDeleteBomId(null)}
        >
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Delete Bill of Materials</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this BOM? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteBomId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteBomMutation.isPending}
                onClick={() => deleteBomId && deleteBomMutation.mutate(deleteBomId)}
              >
                {deleteBomMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}