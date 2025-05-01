import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { formatCurrency, formatDate } from '@/lib/formatters';

interface ReturnAuthorization {
  id: number;
  returnNumber: string;
  customerId: number;
  customerName: string;
  status: string;
  createdAt: string;
  receiptDate: string;
  totalValue: number;
  currency: string;
  reason: string;
  notes: string;
  items: ReturnItem[];
}

interface ReturnItem {
  id: number;
  returnId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  condition: string;
  dispositionStatus: string;
  notes: string;
}

export default function ReturnsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // Simulate fetching returns data from API
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

  // Filter returns based on tab and search term
  const filteredReturns = returns.filter(returnAuth => {
    const matchesStatus = 
      (activeTab === 'pending' && ['Pending', 'In Transit', 'Approved'].includes(returnAuth.status)) ||
      (activeTab === 'received' && ['Received', 'Inspecting'].includes(returnAuth.status)) ||
      (activeTab === 'processed' && ['Processed', 'Refunded', 'Restocked', 'Scrapped'].includes(returnAuth.status)) ||
      (activeTab === 'all');
      
    const matchesSearch = 
      searchTerm === '' || 
      returnAuth.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnAuth.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
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
              <Button size="sm">
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
                    <TableCell className="font-medium">{returnAuth.returnNumber}</TableCell>
                    <TableCell>{returnAuth.customerName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(returnAuth.status)}>
                        {returnAuth.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(returnAuth.createdAt)}</TableCell>
                    <TableCell>{returnAuth.receiptDate ? formatDate(returnAuth.receiptDate) : 'Pending'}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(returnAuth.totalValue, returnAuth.currency)}
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
    </div>
  );
}