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
const invoiceItemSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  unitPrice: z.string().min(1, { message: "Unit price is required" }),
  taxRate: z.string().optional(),
  productId: z.number().nullable().optional(),
  discountAmount: z.string().optional(),
  discountPercent: z.string().optional(),
  sortOrder: z.number().optional(),
  lineTotal: z.string().optional(), // Adding lineTotal, will be calculated before submission
});

const invoiceSchema = z.object({
  accountId: z.number().min(1, { message: "Account is required" }),
  invoiceNumber: z.string().min(1, { message: "Invoice number is required" }),
  issueDate: z.date({ required_error: "Issue date is required" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue", "Cancelled", "Refunded"]).default("Draft"),
  notes: z.string().optional(),
  currency: z.string().optional(),
  taxAmount: z.string().default("0"),
  subtotal: z.string().default("0"),
  totalAmount: z.string().default("0"),
  items: z.array(invoiceItemSchema).min(1, { message: "At least one item is required" }),
  paymentTerms: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  ownerId: z.number().nullable().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;
type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

type InvoiceFormProps = {
  invoiceId?: number;
  onSuccess?: () => void;
};

export default function InvoiceForm({ invoiceId, onSuccess }: InvoiceFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch accounts for dropdown
  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/accounts'],
  });

  // Fetch products for dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  // If editing, fetch the invoice data
  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['/api/invoices', invoiceId],
    enabled: !!invoiceId,
  });

  // Fetch invoice items if editing
  const { data: invoiceItems = [], isLoading: isLoadingInvoiceItems } = useQuery({
    queryKey: ['/api/invoices', invoiceId, 'items'],
    enabled: !!invoiceId,
  });

  // Create form with validation
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      accountId: 0,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: "Draft",
      notes: "",
      currency: "USD",
      taxAmount: "0",
      subtotal: "0",
      totalAmount: "0",
      items: [
        {
          description: "",
          quantity: "1",
          unitPrice: "0",
          taxRate: "0",
          productId: null,
          discountAmount: "0",
          discountPercent: "0",
          lineTotal: "0",
          sortOrder: 0,
        },
      ],
      paymentTerms: "30 days",
      paymentMethod: "",
      paymentReference: "",
      ownerId: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Update form values when invoice data is loaded
  useEffect(() => {
    if (invoice && invoiceItems.length > 0) {
      form.reset({
        ...invoice,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        items: invoiceItems.map(item => ({
          ...item,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          taxRate: item.taxRate?.toString() || "0",
          discountAmount: item.discountAmount?.toString() || "0",
          discountPercent: item.discountPercent?.toString() || "0",
        })),
      });
    }
  }, [invoice, invoiceItems, form]);

  // Calculate totals when form values change
  useEffect(() => {
    const calculateTotals = () => {
      const items = form.getValues("items");
      let subtotal = 0;
      let taxTotal = 0;

      items.forEach((item, index) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const taxRate = parseFloat(item.taxRate || "0") || 0;
        const discountAmount = parseFloat(item.discountAmount || "0") || 0;
        const discountPercent = parseFloat(item.discountPercent || "0") || 0;

        const lineSubtotal = quantity * unitPrice;
        const lineDiscount = discountAmount + (lineSubtotal * (discountPercent / 100));
        const lineTotal = lineSubtotal - lineDiscount;
        const lineTax = lineTotal * (taxRate / 100);

        // Update lineTotal field for each item
        form.setValue(`items.${index}.lineTotal`, lineTotal.toFixed(2));

        subtotal += lineTotal;
        taxTotal += lineTax;
      });

      const total = subtotal + taxTotal;

      form.setValue("subtotal", subtotal.toFixed(2));
      form.setValue("taxAmount", taxTotal.toFixed(2));
      form.setValue("totalAmount", total.toFixed(2));
    };

    calculateTotals();
  }, [form.watch("items"), form]);

  // Handle product selection to auto-fill details
  const handleProductSelection = (productId: number, index: number) => {
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.description`, product.name);
      form.setValue(`items.${index}.unitPrice`, product.price);
      form.setValue(`items.${index}.taxRate`, product.taxRate || "0");
    }
  };

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Create invoice first
      const invoiceData = {
        accountId: data.accountId,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        status: data.status,
        notes: data.notes,
        currency: data.currency,
        taxAmount: data.taxAmount,
        subtotal: data.subtotal,
        totalAmount: data.totalAmount,
        paymentTerms: data.paymentTerms,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        ownerId: data.ownerId,
      };
      
      const invoiceRes = await apiRequest("POST", "/api/invoices", invoiceData);
      const invoice = await invoiceRes.json();
      
      // Add invoice items
      const itemPromises = data.items.map(async (item, index) => {
        const itemData = {
          ...item,
          invoiceId: invoice.id,
          sortOrder: index,
        };
        const itemRes = await apiRequest("POST", "/api/invoice-items", itemData);
        return await itemRes.json();
      });
      
      await Promise.all(itemPromises);
      
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully",
      });
      if (onSuccess) onSuccess();
      else setLocation("/accounting");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      // Update invoice first
      const invoiceData = {
        accountId: data.accountId,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        status: data.status,
        notes: data.notes,
        currency: data.currency,
        taxAmount: data.taxAmount,
        subtotal: data.subtotal,
        totalAmount: data.totalAmount,
        paymentTerms: data.paymentTerms,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        ownerId: data.ownerId,
      };
      
      const invoiceRes = await apiRequest("PATCH", `/api/invoices/${invoiceId}`, invoiceData);
      await invoiceRes.json();
      
      // Delete existing items and add new ones
      // This is a simplistic approach - a more sophisticated implementation would update existing items
      // and only create new ones as needed
      const getItemsRes = await apiRequest("GET", `/api/invoices/${invoiceId}/items`);
      const existingItems = await getItemsRes.json();
      
      for (const item of existingItems) {
        await apiRequest("DELETE", `/api/invoice-items/${item.id}`);
      }
      
      const itemPromises = data.items.map(async (item, index) => {
        const itemData = {
          ...item,
          invoiceId: invoiceId,
          sortOrder: index,
        };
        const itemRes = await apiRequest("POST", "/api/invoice-items", itemData);
        return await itemRes.json();
      });
      
      await Promise.all(itemPromises);
      
      return { id: invoiceId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', invoiceId, 'items'] });
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully",
      });
      if (onSuccess) onSuccess();
      else setLocation("/accounting");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      if (invoiceId) {
        await updateInvoiceMutation.mutateAsync(data);
      } else {
        await createInvoiceMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((invoiceId && isLoadingInvoice) || (invoiceId && isLoadingInvoiceItems)) {
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
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account*</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
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
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter invoice number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date*</FormLabel>
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
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date*</FormLabel>
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
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
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

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentReference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Reference</FormLabel>
                <FormControl>
                  <Input placeholder="Enter payment reference" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Invoice Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                description: "",
                quantity: "1",
                unitPrice: "0",
                taxRate: "0",
                productId: null,
                discountAmount: "0",
                discountPercent: "0",
                lineTotal: "0",
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
                          <SelectItem value="null">None</SelectItem>
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (${product.price})
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
                  name={`items.${index}.taxRate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
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
                  name={`items.${index}.discountPercent`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
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
                  placeholder="Enter invoice notes"
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
          <div className="flex justify-between">
            <span className="font-medium">Tax:</span>
            <span>${form.watch("taxAmount")}</span>
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
                {invoiceId ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{invoiceId ? "Update Invoice" : "Create Invoice"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}