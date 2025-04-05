import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { formatDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the form validation schema
const purchaseOrderItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  unitPrice: z.string().min(1, { message: "Unit price is required" }),
  taxAmount: z.string().optional(),
  productId: z.number().nullable().optional(),
  expectedDeliveryDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  receivedQuantity: z.string().optional(),
  sortOrder: z.number().optional(),
});

const purchaseOrderSchema = z.object({
  supplierId: z.number().min(1, { message: "Supplier is required" }),
  poNumber: z.string().min(1, { message: "PO number is required" }),
  orderDate: z.date({ required_error: "Order date is required" }),
  status: z.enum(["Draft", "Sent", "Cancelled", "Received", "Partially Received"]).default("Draft"),
  notes: z.string().optional(),
  currency: z.string().optional(),
  subtotal: z.string().default("0"),
  totalAmount: z.string().default("0"),
  items: z.array(purchaseOrderItemSchema).min(1, { message: "At least one item is required" }),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  paymentTerms: z.string().optional(),
  approvedBy: z.number().nullable().optional(),
  approvalDate: z.date().optional().nullable(),
  expectedDeliveryDate: z.date().optional().nullable(),
  ownerId: z.number().nullable().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
type PurchaseOrderItemFormData = z.infer<typeof purchaseOrderItemSchema>;

type PurchaseOrderFormProps = {
  purchaseOrderId?: number;
  onSuccess?: () => void;
};

export default function PurchaseOrderForm({ purchaseOrderId, onSuccess }: PurchaseOrderFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch accounts (suppliers) for dropdown
  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/accounts'],
  });

  // Fetch products for dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // If editing, fetch the purchase order data
  const { data: purchaseOrder, isLoading: isLoadingPO } = useQuery({
    queryKey: ['/api/purchase-orders', purchaseOrderId],
    enabled: !!purchaseOrderId,
  });

  // Fetch purchase order items if editing
  const { data: poItems = [], isLoading: isLoadingPOItems } = useQuery({
    queryKey: ['/api/purchase-orders', purchaseOrderId, 'items'],
    enabled: !!purchaseOrderId,
  });

  // Create form with validation
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: 0,
      poNumber: `PO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      orderDate: new Date(),
      status: "Draft",
      notes: "",
      currency: "USD",
      subtotal: "0",
      totalAmount: "0",
      items: [
        {
          description: "",
          quantity: "1",
          unitPrice: "0",
          taxAmount: "0",
          productId: null,
          expectedDeliveryDate: null,
          notes: "",
          receivedQuantity: "0",
          sortOrder: 0,
        },
      ],
      billingAddress: "",
      shippingAddress: "",
      paymentTerms: "30 days",
      approvedBy: null,
      approvalDate: null,
      expectedDeliveryDate: null,
      ownerId: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update form values when purchase order data is loaded
  useEffect(() => {
    if (purchaseOrder && poItems.length > 0) {
      form.reset({
        ...purchaseOrder,
        orderDate: new Date(purchaseOrder.orderDate),
        approvalDate: purchaseOrder.approvalDate ? new Date(purchaseOrder.approvalDate) : null,
        expectedDeliveryDate: purchaseOrder.expectedDeliveryDate ? new Date(purchaseOrder.expectedDeliveryDate) : null,
        items: poItems.map(item => ({
          ...item,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          taxAmount: item.taxAmount?.toString() || "0",
          expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : null,
          receivedQuantity: item.receivedQuantity?.toString() || "0",
        })),
      });
    }
  }, [purchaseOrder, poItems, form]);

  // Calculate totals when form values change
  useEffect(() => {
    const calculateTotals = () => {
      const items = form.getValues("items");
      let subtotal = 0;

      items.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const taxAmount = parseFloat(item.taxAmount || "0") || 0;

        const lineTotal = quantity * unitPrice;
        
        subtotal += lineTotal;
      });

      const total = subtotal;

      form.setValue("subtotal", subtotal.toFixed(2));
      form.setValue("totalAmount", total.toFixed(2));
    };

    calculateTotals();
  }, [form.watch("items"), form]);

  // Handle product selection to auto-fill details
  const handleProductSelection = (productId: number, index: number) => {
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.description`, product.name);
      form.setValue(`items.${index}.unitPrice`, product.cost || product.price);
    }
  };

  // Create purchase order mutation
  const createPOMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      // Create purchase order first
      const poData = {
        supplierId: data.supplierId,
        poNumber: data.poNumber,
        orderDate: data.orderDate.toISOString(),
        status: data.status,
        notes: data.notes,
        currency: data.currency,
        subtotal: data.subtotal,
        totalAmount: data.totalAmount,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        paymentTerms: data.paymentTerms,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate ? data.approvalDate.toISOString() : null,
        expectedDeliveryDate: data.expectedDeliveryDate ? data.expectedDeliveryDate.toISOString() : null,
        ownerId: data.ownerId,
      };
      
      const poRes = await apiRequest("POST", "/api/purchase-orders", poData);
      const po = await poRes.json();
      
      // Add purchase order items
      const itemPromises = data.items.map(async (item, index) => {
        const itemData = {
          ...item,
          purchaseOrderId: po.id,
          sortOrder: index,
          expectedDeliveryDate: item.expectedDeliveryDate ? item.expectedDeliveryDate.toISOString() : null,
        };
        const itemRes = await apiRequest("POST", "/api/purchase-order-items", itemData);
        return await itemRes.json();
      });
      
      await Promise.all(itemPromises);
      
      return po;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      toast({
        title: "Purchase Order created",
        description: "The purchase order has been created successfully",
      });
      if (onSuccess) onSuccess();
      else setLocation("/accounting");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create purchase order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update purchase order mutation
  const updatePOMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      // Update purchase order first
      const poData = {
        supplierId: data.supplierId,
        poNumber: data.poNumber,
        orderDate: data.orderDate.toISOString(),
        status: data.status,
        notes: data.notes,
        currency: data.currency,
        subtotal: data.subtotal,
        totalAmount: data.totalAmount,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        paymentTerms: data.paymentTerms,
        approvedBy: data.approvedBy,
        approvalDate: data.approvalDate ? data.approvalDate.toISOString() : null,
        expectedDeliveryDate: data.expectedDeliveryDate ? data.expectedDeliveryDate.toISOString() : null,
        ownerId: data.ownerId,
      };
      
      const poRes = await apiRequest("PATCH", `/api/purchase-orders/${purchaseOrderId}`, poData);
      await poRes.json();
      
      // Delete existing items and add new ones
      const getItemsRes = await apiRequest("GET", `/api/purchase-orders/${purchaseOrderId}/items`);
      const existingItems = await getItemsRes.json();
      
      for (const item of existingItems) {
        await apiRequest("DELETE", `/api/purchase-order-items/${item.id}`);
      }
      
      const itemPromises = data.items.map(async (item, index) => {
        const itemData = {
          ...item,
          purchaseOrderId: purchaseOrderId,
          sortOrder: index,
          expectedDeliveryDate: item.expectedDeliveryDate ? item.expectedDeliveryDate.toISOString() : null,
        };
        const itemRes = await apiRequest("POST", "/api/purchase-order-items", itemData);
        return await itemRes.json();
      });
      
      await Promise.all(itemPromises);
      
      return { id: purchaseOrderId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders', purchaseOrderId] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders', purchaseOrderId, 'items'] });
      toast({
        title: "Purchase Order updated",
        description: "The purchase order has been updated successfully",
      });
      if (onSuccess) onSuccess();
      else setLocation("/accounting");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update purchase order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PurchaseOrderFormData) => {
    setIsSubmitting(true);
    try {
      if (purchaseOrderId) {
        await updatePOMutation.mutateAsync(data);
      } else {
        await createPOMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((purchaseOrderId && isLoadingPO) || (purchaseOrderId && isLoadingPOItems)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier*</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
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
            name="poNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO Number*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PO number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Order Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
            name="expectedDeliveryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expected Delivery Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Partially Received">Partially Received</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="billingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter billing address"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Address</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter shipping address"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Purchase Order Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                description: "",
                quantity: "1",
                unitPrice: "0",
                taxAmount: "0",
                productId: null,
                expectedDeliveryDate: null,
                notes: "",
                receivedQuantity: "0",
                sortOrder: fields.length,
              })}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value ? parseInt(value) : null);
                          handleProductSelection(parseInt(value), index);
                        }}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (${product.cost || product.price})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecting a product will auto-fill details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter item description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          step="1" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            // Force a re-render to update totals
                            setTimeout(() => form.trigger(), 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            // Force a re-render to update totals
                            setTimeout(() => form.trigger(), 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.expectedDeliveryDate`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
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
                  name={`items.${index}.receivedQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                        <Textarea 
                          placeholder="Enter notes for this item" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter purchase order notes"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>${form.watch("subtotal")}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${form.watch("totalAmount")}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/accounting")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                {purchaseOrderId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{purchaseOrderId ? "Update Purchase Order" : "Create Purchase Order"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}