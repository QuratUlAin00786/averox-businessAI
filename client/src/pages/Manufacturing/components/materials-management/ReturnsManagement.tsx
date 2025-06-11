import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  ArrowLeft,
  ChevronRight, 
  Package,
  Plus,
  RefreshCw, 
  Search, 
  Truck, 
  Undo
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface ReturnAuthorization {
  id: number;
  rma_number: string;
  customer_id: number;
  customer_name: string;
  status: string;
  created_at: string;
  received_date: string;
  processed_date: string;
  authorized_date: string;
  return_reason: string;
  notes: string;
  items: ReturnItem[];
  item_count: number;
  total_quantity: number;
  total_value?: number;
}

interface ReturnItem {
  id: number;
  return_authorization_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  return_reason: string;
  condition: string;
  disposition: string;
  lot_number?: string;
  serial_number?: string;
  notes?: string;
  status: string;
}

export default function ReturnsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isNewReturnDialogOpen, setIsNewReturnDialogOpen] = useState(false);
  const [returnFormData, setReturnFormData] = useState({
    customerName: '',
    returnType: 'Product Return',
    returnReason: '',
    productId: '',
    quantity: '',
    condition: 'Used',
    notes: '',
    expectedReturnDate: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch returns data from API
  const { data: returns = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/manufacturing/returns'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/manufacturing/returns');
        return await res.json() as ReturnAuthorization[];
      } catch (error) {
        console.error('Failed to fetch returns:', error);
        return [];
      }
    }
  });

  // Fetch products for dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  // Create return mutation
  const createReturnMutation = useMutation({
    mutationFn: async (returnData: any) => {
      const response = await apiRequest('POST', '/api/manufacturing/returns', returnData);
      if (!response.ok) {
        throw new Error('Failed to create return authorization');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Return Created",
        description: "Return authorization has been created successfully."
      });
      setIsNewReturnDialogOpen(false);
      setReturnFormData({
        customerName: '',
        returnType: 'Product Return',
        returnReason: '',
        productId: '',
        quantity: '',
        condition: 'Used',
        notes: '',
        expectedReturnDate: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/manufacturing/returns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create return authorization.",
        variant: "destructive"
      });
    }
  });

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate RMA number
    const rmaNumber = `RMA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    const returnData = {
      rma_number: rmaNumber,
      customer_name: returnFormData.customerName,
      return_type: returnFormData.returnType,
      return_reason: returnFormData.returnReason,
      product_id: returnFormData.productId ? parseInt(returnFormData.productId) : null,
      quantity: returnFormData.quantity ? parseFloat(returnFormData.quantity) : 0,
      condition: returnFormData.condition,
      notes: returnFormData.notes,
      expected_return_date: returnFormData.expectedReturnDate || null,
      status: 'Pending'
    };
    
    createReturnMutation.mutate(returnData);
  };

  // Filter returns based on tab and search term
  const filteredReturns = returns.filter(returnAuth => {
    const matchesStatus = 
      (activeTab === 'pending' && ['Pending', 'In Transit', 'Approved'].includes(returnAuth.status)) ||
      (activeTab === 'received' && ['Received', 'Inspecting'].includes(returnAuth.status)) ||
      (activeTab === 'processed' && ['Processed', 'Refunded', 'Restocked', 'Scrapped'].includes(returnAuth.status)) ||
      (activeTab === 'all');
      
    const matchesSearch = 
      searchTerm === '' || 
      returnAuth.rma_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnAuth.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSearch;
  });
  
  // Calculate summary statistics
  const pendingCount = returns.filter(r => ['Pending', 'In Transit', 'Approved'].includes(r.status)).length;
  const receivedCount = returns.filter(r => ['Received', 'Inspecting'].includes(r.status)).length;
  const processedCount = returns.filter(r => ['Processed', 'Refunded', 'Restocked', 'Scrapped'].includes(r.status)).length;
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'In Transit': return 'bg-purple-100 text-purple-800';
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Inspecting': return 'bg-indigo-100 text-indigo-800';
      case 'Processed': return 'bg-green-100 text-green-800';
      case 'Refunded': return 'bg-emerald-100 text-emerald-800';
      case 'Restocked': return 'bg-teal-100 text-teal-800';
      case 'Scrapped': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Returns Management</CardTitle>
              <CardDescription>Process and track return merchandise authorizations (RMAs)</CardDescription>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setIsNewReturnDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Return
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Returns</p>
                    <p className="text-3xl font-bold">{pendingCount}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Received Returns</p>
                    <p className="text-3xl font-bold">{receivedCount}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Processed Returns</p>
                    <p className="text-3xl font-bold">{processedCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Undo className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                    <p className="text-3xl font-bold">{returns.length}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Truck className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between mb-6">
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="processed">Processed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search returns..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading returns...
                  </TableCell>
                </TableRow>
              ) : filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No returns found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((returnAuth) => (
                  <TableRow key={returnAuth.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{returnAuth.rma_number}</TableCell>
                    <TableCell>{returnAuth.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(returnAuth.status)}>
                        {returnAuth.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(returnAuth.created_at)}</TableCell>
                    <TableCell>{returnAuth.received_date ? formatDate(returnAuth.received_date) : 'Pending'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(returnAuth.total_value || 0, 'USD')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Return Dialog */}
      <Dialog open={isNewReturnDialogOpen} onOpenChange={setIsNewReturnDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Return Authorization</DialogTitle>
            <DialogDescription>
              Create a new return merchandise authorization (RMA) for product returns.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleReturnSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={returnFormData.customerName}
                  onChange={(e) => setReturnFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="returnType">Return Type</Label>
                <Select 
                  value={returnFormData.returnType} 
                  onValueChange={(value) => setReturnFormData(prev => ({ ...prev, returnType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product Return">Product Return</SelectItem>
                    <SelectItem value="Warranty Return">Warranty Return</SelectItem>
                    <SelectItem value="Exchange">Exchange</SelectItem>
                    <SelectItem value="Refund">Refund</SelectItem>
                    <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select 
                  value={returnFormData.productId} 
                  onValueChange={(value) => setReturnFormData(prev => ({ ...prev, productId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={returnFormData.quantity}
                  onChange={(e) => setReturnFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select 
                  value={returnFormData.condition} 
                  onValueChange={(value) => setReturnFormData(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New/Unopened</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Defective">Defective</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
                <Input
                  id="expectedReturnDate"
                  type="date"
                  value={returnFormData.expectedReturnDate}
                  onChange={(e) => setReturnFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnReason">Return Reason *</Label>
              <Textarea
                id="returnReason"
                value={returnFormData.returnReason}
                onChange={(e) => setReturnFormData(prev => ({ ...prev, returnReason: e.target.value }))}
                placeholder="Enter reason for return"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={returnFormData.notes}
                onChange={(e) => setReturnFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes or instructions"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewReturnDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createReturnMutation.isPending}
              >
                {createReturnMutation.isPending ? 'Creating...' : 'Create Return Authorization'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}