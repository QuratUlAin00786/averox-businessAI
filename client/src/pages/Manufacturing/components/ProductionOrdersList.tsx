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
import { Pencil, Plus, Trash, AlertCircle, FileText, ChevronDown, ChevronUp, Eye } from 'lucide-react';
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
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Define the schema for production order operation
const productionOrderOperationSchema = z.object({
  operation_name: z.string().min(1, "Operation name is required"),
  work_center_id: z.coerce.number().positive("Work center is required"),
  planned_duration: z.coerce.number().positive("Duration must be positive"),
  sequence: z.coerce.number().int().min(0, "Sequence must be a non-negative integer"),
  description: z.string().optional(),
});

// Define the schema for material consumption
const materialConsumptionSchema = z.object({
  product_id: z.coerce.number().positive("Material is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
});

// Define the schema for production order data
const productionOrderSchema = z.object({
  bom_id: z.coerce.number().positive("Bill of Materials is required"),
  product_id: z.coerce.number().positive("Product is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  planned_start_date: z.date({
    required_error: "Planned start date is required",
  }),
  planned_end_date: z.date({
    required_error: "Planned end date is required",
  }),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  operations: z.array(productionOrderOperationSchema).min(1, "At least one operation is required"),
  materials: z.array(materialConsumptionSchema).optional(),
});

type ProductionOrderFormValues = z.infer<typeof productionOrderSchema>;

type ProductionOrder = {
  id: number;
  order_number: string;
  bom_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  status: string;
  priority: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: number;
};

type ProductionOrderOperation = {
  id: number;
  production_order_id: number;
  operation_name: string;
  work_center_id: number;
  work_center_name?: string;
  planned_duration: number;
  actual_duration: number | null;
  sequence: number;
  status: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
};

type MaterialConsumption = {
  id: number;
  production_order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_of_measure: string;
  consumed_quantity: number | null;
  status: string;
};

type Bom = {
  id: number;
  name: string;
  product_id: number;
  product_name: string;
};

type Product = {
  id: number;
  name: string;
  sku: string;
};

type WorkCenter = {
  id: number;
  name: string;
  type: string;
};

export default function ProductionOrdersList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProductionOrder, setEditingProductionOrder] = useState<ProductionOrder | null>(null);
  const [selectedProductionOrder, setSelectedProductionOrder] = useState<ProductionOrder | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [detailsTab, setDetailsTab] = useState('operations');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch production orders data
  const { data: productionOrders, isLoading, error } = useQuery<ProductionOrder[]>({
    queryKey: ['/api/manufacturing/production-orders'],
  });

  // Fetch order details when an order is expanded
  const { 
    data: orderDetails, 
    isLoading: isLoadingDetails 
  } = useQuery<{
    operations: ProductionOrderOperation[];
    materialConsumptions: MaterialConsumption[];
    qualityInspections: any[];
  }>({
    queryKey: ['/api/manufacturing/production-orders', expandedOrderId],
    enabled: !!expandedOrderId,
    queryFn: () => 
      apiRequest(`/api/manufacturing/production-orders/${expandedOrderId}`),
  });

  // Fetch BOMs for the dropdown
  const { data: boms } = useQuery<Bom[]>({
    queryKey: ['/api/manufacturing/bom'],
  });

  // Fetch products for the dropdown
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Fetch work centers for the dropdown
  const { data: workCenters } = useQuery<WorkCenter[]>({
    queryKey: ['/api/manufacturing/work-centers'],
  });

  // Create form
  const form = useForm<ProductionOrderFormValues>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      bom_id: 0,
      product_id: 0,
      quantity: 1,
      planned_start_date: new Date(),
      planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "Planned",
      priority: "Normal",
      reference: "",
      notes: "",
      operations: [
        {
          operation_name: "Manufacturing",
          work_center_id: 0,
          planned_duration: 8,
          sequence: 10,
          description: "",
        },
      ],
      materials: [],
    },
  });

  const { fields: operationFields, append: appendOperation, remove: removeOperation } = useFieldArray({
    control: form.control,
    name: "operations",
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  // Update materials when BOM changes
  const watchBomId = form.watch('bom_id');
  
  // Get BOM details when BOM selection changes
  useQuery<any>({
    queryKey: ['/api/manufacturing/bom', watchBomId],
    enabled: !!watchBomId && watchBomId > 0,
    queryFn: () => apiRequest(`/api/manufacturing/bom/${watchBomId}`),
    onSuccess: (data) => {
      if (data && data.items) {
        // Set product_id based on the BOM
        form.setValue('product_id', data.product_id);
        
        // Update materials based on BOM items
        const bomMaterials = data.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity * form.getValues('quantity'),
          unit_of_measure: item.unit_of_measure,
        }));
        
        form.setValue('materials', bomMaterials);
      }
    },
  });

  // Create production order mutation
  const createProductionOrderMutation = useMutation({
    mutationFn: (newOrder: ProductionOrderFormValues) => {
      // Convert dates to ISO strings
      const orderData = {
        ...newOrder,
        planned_start_date: newOrder.planned_start_date.toISOString(),
        planned_end_date: newOrder.planned_end_date.toISOString(),
      };
      
      return apiRequest('/api/manufacturing/production-orders', {
        method: 'POST',
        data: orderData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/production-orders'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Production order created",
        description: "The production order has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating production order",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Update production order mutation
  const updateProductionOrderMutation = useMutation({
    mutationFn: (updatedOrder: ProductionOrderFormValues & { id: number }) => {
      const { id, ...data } = updatedOrder;
      
      // Convert dates to ISO strings
      const orderData = {
        ...data,
        planned_start_date: data.planned_start_date.toISOString(),
        planned_end_date: data.planned_end_date.toISOString(),
      };
      
      return apiRequest(`/api/manufacturing/production-orders/${id}`, {
        method: 'PUT',
        data: orderData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/production-orders'] });
      setEditingProductionOrder(null);
      form.reset();
      toast({
        title: "Production order updated",
        description: "The production order has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating production order",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Delete production order mutation
  const deleteProductionOrderMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/manufacturing/production-orders/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/production-orders'] });
      setDeleteOrderId(null);
      if (expandedOrderId === deleteOrderId) {
        setExpandedOrderId(null);
      }
      toast({
        title: "Production order deleted",
        description: "The production order has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting production order",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const onSubmit = (values: ProductionOrderFormValues) => {
    // Check that planned end date is after planned start date
    if (values.planned_end_date < values.planned_start_date) {
      toast({
        variant: "destructive",
        title: "Invalid dates",
        description: "Planned end date must be after planned start date",
      });
      return;
    }

    if (editingProductionOrder) {
      updateProductionOrderMutation.mutate({ ...values, id: editingProductionOrder.id });
    } else {
      createProductionOrderMutation.mutate(values);
    }
  };

  const handleEditProductionOrder = async (order: ProductionOrder) => {
    setEditingProductionOrder(order);
    
    // Fetch order details for the selected order
    try {
      const orderData = await apiRequest(`/api/manufacturing/production-orders/${order.id}`);
      const operations = orderData.operations || [];
      const materials = orderData.materialConsumptions || [];
      
      // Reset form with order data
      form.reset({
        bom_id: order.bom_id,
        product_id: order.product_id,
        quantity: order.quantity,
        planned_start_date: new Date(order.planned_start_date),
        planned_end_date: new Date(order.planned_end_date),
        status: order.status,
        priority: order.priority,
        reference: order.reference || undefined,
        notes: order.notes || undefined,
        operations: operations.map((op: ProductionOrderOperation) => ({
          operation_name: op.operation_name,
          work_center_id: op.work_center_id,
          planned_duration: op.planned_duration,
          sequence: op.sequence,
          description: op.description || undefined,
        })),
        materials: materials.map((mat: MaterialConsumption) => ({
          product_id: mat.product_id,
          quantity: mat.quantity,
          unit_of_measure: mat.unit_of_measure,
        })),
      });
      
      setIsAddDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching production order details",
        description: "Failed to load order data. Please try again.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProductionOrder(null);
    form.reset();
  };

  const handleOrderRowClick = (order: ProductionOrder) => {
    setExpandedOrderId(expandedOrderId === order.id ? null : order.id);
  };

  const getProductName = (productId: number) => {
    if (!products) return "Unknown";
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  const getBomName = (bomId: number) => {
    if (!boms) return "Unknown";
    const bom = boms.find(b => b.id === bomId);
    return bom ? bom.name : "Unknown";
  };

  const getWorkCenterName = (workCenterId: number) => {
    if (!workCenters) return "Unknown";
    const workCenter = workCenters.find(w => w.id === workCenterId);
    return workCenter ? workCenter.name : "Unknown";
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'On Hold':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const updateQuantityBasedOnBomItems = (bomItems: any[], quantity: number) => {
    const materials = bomItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity * quantity,
      unit_of_measure: item.unit_of_measure,
    }));
    
    form.setValue('materials', materials);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Production Orders</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Create Production Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                {editingProductionOrder ? "Edit Production Order" : "Create New Production Order"}
              </DialogTitle>
              <DialogDescription>
                {editingProductionOrder 
                  ? "Update production order details" 
                  : "Create a new production order for manufacturing"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bom_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill of Materials</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const bomId = parseInt(value);
                            field.onChange(bomId);
                            // No need to manually update product_id and materials here
                            // The useQuery hook will handle that when the BOM selection changes
                          }} 
                          defaultValue={field.value ? field.value.toString() : undefined}
                          value={field.value ? field.value.toString() : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select BOM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {boms?.map((bom) => (
                              <SelectItem key={bom.id} value={bom.id.toString()}>
                                {bom.name} ({bom.product_name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          disabled={!!form.getValues('bom_id')} // Disable when BOM is selected
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
                        <FormDescription>
                          {form.getValues('bom_id') 
                            ? "Product automatically selected from BOM" 
                            : "Select the product to be manufactured"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity to Produce</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Quantity" 
                            {...field}
                            onChange={(e) => {
                              const newQuantity = parseFloat(e.target.value);
                              field.onChange(newQuantity);
                              
                              // If BOM is selected, update material quantities based on the new production quantity
                              const bomId = form.getValues('bom_id');
                              if (bomId) {
                                // We need to get the BOM items and update the materials
                                const bomDataQuery = queryClient.getQueryData<any>(['/api/manufacturing/bom', bomId]);
                                if (bomDataQuery && bomDataQuery.items) {
                                  updateQuantityBasedOnBomItems(bomDataQuery.items, newQuantity);
                                }
                              }
                            }} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Planned">Planned</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="On Hold">On Hold</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
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
                    name="planned_start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Planned Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="planned_end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Planned End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => {
                                // Disable dates before the planned start date
                                const startDate = form.getValues('planned_start_date');
                                return startDate && date < startDate;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="External reference (optional)" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Customer order number or other reference
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Production notes (optional)"
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
                    <h3 className="text-lg font-semibold">Production Operations</h3>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => appendOperation({
                        operation_name: "Operation",
                        work_center_id: 0,
                        planned_duration: 8,
                        sequence: operationFields.length ? Math.max(...operationFields.map(f => f.sequence)) + 10 : 10,
                        description: "",
                      })}
                    >
                      <Plus className="h-4 w-4" />
                      Add Operation
                    </Button>
                  </div>
                  
                  {operationFields.map((field, index) => (
                    <Card key={field.id} className="border">
                      <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-md">Operation #{index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOperation(index)}
                          className="text-red-500"
                          disabled={operationFields.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <FormField
                            control={form.control}
                            name={`operations.${index}.operation_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Operation Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Operation name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`operations.${index}.work_center_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Work Center</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value))} 
                                  defaultValue={field.value ? field.value.toString() : undefined}
                                  value={field.value ? field.value.toString() : undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select work center" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {workCenters?.map((workCenter) => (
                                      <SelectItem key={workCenter.id} value={workCenter.id.toString()}>
                                        {workCenter.name} ({workCenter.type})
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
                            name={`operations.${index}.planned_duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Planned Duration (hours)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Duration" 
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
                            name={`operations.${index}.sequence`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sequence Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Sequence" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Order of operations (lower numbers first)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {operationFields.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No operations added</AlertTitle>
                      <AlertDescription>
                        Add at least one operation to the production order.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {watchBomId > 0 && materialFields.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Material Requirements</h3>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialFields.map((field, index) => {
                          const productId = form.getValues(`materials.${index}.product_id`);
                          return (
                            <TableRow key={field.id}>
                              <TableCell>{getProductName(productId)}</TableCell>
                              <TableCell>{form.getValues(`materials.${index}.quantity`)}</TableCell>
                              <TableCell>{form.getValues(`materials.${index}.unit_of_measure`)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

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
                    disabled={createProductionOrderMutation.isPending || updateProductionOrderMutation.isPending}
                  >
                    {editingProductionOrder 
                      ? (updateProductionOrderMutation.isPending ? "Updating..." : "Update") 
                      : (createProductionOrderMutation.isPending ? "Creating..." : "Create")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading production orders...</div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load production orders. Please try again.
          </AlertDescription>
        </Alert>
      ) : productionOrders && productionOrders.length > 0 ? (
        <Table>
          <TableCaption>List of all production orders</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Order Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productionOrders.map((order) => (
              <>
                <TableRow 
                  key={order.id} 
                  className="cursor-pointer"
                  onClick={() => handleOrderRowClick(order)}
                >
                  <TableCell>
                    {expandedOrderId === order.id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </TableCell>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeClass(order.priority)}`}>
                      {order.priority}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(order.planned_start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(order.planned_end_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProductionOrder(order);
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
                          setDeleteOrderId(order.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedOrderId === order.id && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <Tabs defaultValue="operations" value={detailsTab} onValueChange={setDetailsTab}>
                          <TabsList className="mb-4">
                            <TabsTrigger value="operations">Operations</TabsTrigger>
                            <TabsTrigger value="materials">Materials</TabsTrigger>
                            <TabsTrigger value="quality">Quality</TabsTrigger>
                          </TabsList>
                          <TabsContent value="operations">
                            <h4 className="font-medium mb-2">Production Operations</h4>
                            {isLoadingDetails ? (
                              <div className="py-4 text-center">Loading operations...</div>
                            ) : !orderDetails?.operations || orderDetails.operations.length === 0 ? (
                              <div className="py-4 text-center text-muted-foreground">No operations defined for this order</div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sequence</TableHead>
                                    <TableHead>Operation</TableHead>
                                    <TableHead>Work Center</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Planned Duration</TableHead>
                                    <TableHead>Actual Duration</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {orderDetails.operations
                                    .sort((a, b) => a.sequence - b.sequence)
                                    .map((operation) => (
                                      <TableRow key={operation.id}>
                                        <TableCell>{operation.sequence}</TableCell>
                                        <TableCell>{operation.operation_name}</TableCell>
                                        <TableCell>{operation.work_center_name || getWorkCenterName(operation.work_center_id)}</TableCell>
                                        <TableCell>
                                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(operation.status)}`}>
                                            {operation.status}
                                          </span>
                                        </TableCell>
                                        <TableCell>{operation.planned_duration} hours</TableCell>
                                        <TableCell>{operation.actual_duration ? `${operation.actual_duration} hours` : "-"}</TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                          <TabsContent value="materials">
                            <h4 className="font-medium mb-2">Material Consumption</h4>
                            {isLoadingDetails ? (
                              <div className="py-4 text-center">Loading materials...</div>
                            ) : !orderDetails?.materialConsumptions || orderDetails.materialConsumptions.length === 0 ? (
                              <div className="py-4 text-center text-muted-foreground">No materials defined for this order</div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Required Quantity</TableHead>
                                    <TableHead>Consumed Quantity</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {orderDetails.materialConsumptions.map((material) => (
                                    <TableRow key={material.id}>
                                      <TableCell>{material.product_name}</TableCell>
                                      <TableCell>{material.quantity}</TableCell>
                                      <TableCell>{material.consumed_quantity || "-"}</TableCell>
                                      <TableCell>{material.unit_of_measure}</TableCell>
                                      <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(material.status)}`}>
                                          {material.status}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                          <TabsContent value="quality">
                            <h4 className="font-medium mb-2">Quality Inspections</h4>
                            {isLoadingDetails ? (
                              <div className="py-4 text-center">Loading quality data...</div>
                            ) : !orderDetails?.qualityInspections || orderDetails.qualityInspections.length === 0 ? (
                              <div className="py-4 text-center text-muted-foreground">No quality inspections for this order</div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {orderDetails.qualityInspections.map((inspection) => (
                                    <TableRow key={inspection.id}>
                                      <TableCell>{new Date(inspection.inspection_date).toLocaleDateString()}</TableCell>
                                      <TableCell>{inspection.inspector_name || "-"}</TableCell>
                                      <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                          ${inspection.result === 'Pass' 
                                            ? 'bg-green-100 text-green-800' 
                                            : inspection.result === 'Fail'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'}`}>
                                          {inspection.result}
                                        </span>
                                      </TableCell>
                                      <TableCell>{inspection.notes || "-"}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                        </Tabs>
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
          <p className="text-muted-foreground mb-4">No production orders found</p>
          <p className="text-sm text-muted-foreground">
            Create your first production order to start manufacturing.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOrderId && (
        <Dialog
          open={!!deleteOrderId}
          onOpenChange={(open) => !open && setDeleteOrderId(null)}
        >
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Delete Production Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this production order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOrderId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteProductionOrderMutation.isPending}
                onClick={() => deleteOrderId && deleteProductionOrderMutation.mutate(deleteOrderId)}
              >
                {deleteProductionOrderMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}