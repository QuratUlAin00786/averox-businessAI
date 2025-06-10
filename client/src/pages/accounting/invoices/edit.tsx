import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  accountId: number;
  contactId?: number;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  notes?: string;
  terms?: string;
  paymentMethod: string;
  paymentReference?: string;
  currency: string;
}

interface Account {
  id: number;
  name: string;
  email?: string;
}

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    accountId: '',
    issueDate: '',
    dueDate: '',
    status: 'Draft',
    subtotal: '0.00',
    taxAmount: '0.00',
    discountAmount: '0.00',
    totalAmount: '0.00',
    notes: '',
    terms: '',
    paymentMethod: 'Cash',
    paymentReference: '',
    currency: 'USD'
  });

  // Fetch invoice data
  const { data: invoice, isLoading: isLoadingInvoice } = useQuery<Invoice>({
    queryKey: ['/api/invoices', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/invoices/${id}`);
      return response.json();
    },
    enabled: !!id
  });

  // Fetch accounts for dropdown
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/accounts');
      return response.json();
    }
  });

  // Update form data when invoice loads
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        accountId: invoice.accountId?.toString() || '',
        issueDate: invoice.issueDate || '',
        dueDate: invoice.dueDate || '',
        status: invoice.status || 'Draft',
        subtotal: invoice.subtotal || '0.00',
        taxAmount: invoice.taxAmount || '0.00',
        discountAmount: invoice.discountAmount || '0.00',
        totalAmount: invoice.totalAmount || '0.00',
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        paymentMethod: invoice.paymentMethod || 'Cash',
        paymentReference: invoice.paymentReference || '',
        currency: invoice.currency || 'USD'
      });
    }
  }, [invoice]);

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/invoices/${id}`, {
        ...data,
        accountId: parseInt(data.accountId),
        subtotal: parseFloat(data.subtotal).toFixed(2),
        taxAmount: parseFloat(data.taxAmount).toFixed(2),
        discountAmount: parseFloat(data.discountAmount).toFixed(2),
        totalAmount: parseFloat(data.totalAmount).toFixed(2)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices', id] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      setLocation('/accounting');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total when subtotal, tax, or discount changes
      if (['subtotal', 'taxAmount', 'discountAmount'].includes(field)) {
        const subtotal = parseFloat(updated.subtotal) || 0;
        const tax = parseFloat(updated.taxAmount) || 0;
        const discount = parseFloat(updated.discountAmount) || 0;
        updated.totalAmount = (subtotal + tax - discount).toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvoiceMutation.mutate(formData);
  };

  if (isLoadingInvoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invoice Not Found</h2>
          <Button onClick={() => setLocation('/accounting')}>
            Back to Accounting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/accounting')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
          <p className="text-muted-foreground">
            Modify invoice details and update information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  placeholder="INV-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => handleInputChange('accountId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} {account.email && `(${account.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subtotal">Subtotal</Label>
                <Input
                  id="subtotal"
                  type="number"
                  step="0.01"
                  value={formData.subtotal}
                  onChange={(e) => handleInputChange('subtotal', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxAmount">Tax Amount</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  value={formData.taxAmount}
                  onChange={(e) => handleInputChange('taxAmount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountAmount">Discount</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => handleInputChange('discountAmount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  value={formData.paymentReference}
                  onChange={(e) => handleInputChange('paymentReference', e.target.value)}
                  placeholder="Reference number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                placeholder="Terms and conditions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/accounting')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateInvoiceMutation.isPending}
              >
                {updateInvoiceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Invoice
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}