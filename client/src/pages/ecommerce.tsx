import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart4, 
  Box, 
  ChevronRight, 
  Copy, 
  Download, 
  ExternalLink, 
  Filter, 
  Globe, 
  LineChart, 
  MoreHorizontal, 
  Package, 
  PieChart, 
  RefreshCw, 
  Search, 
  Settings, 
  ShoppingBag, 
  ShoppingCart, 
  StoreIcon, 
  Tag, 
  Truck, 
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Real database-driven interfaces
interface EcommerceStore {
  id: number;
  name: string;
  domain: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  status: 'active' | 'pending' | 'disconnected';
  connectedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface EcommerceProduct {
  id: number;
  storeId: number;
  externalId: string;
  title: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface EcommerceOrder {
  id: number;
  storeId: number;
  externalId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  items: number;
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export default function EcommercePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    domain: '',
    platform: 'shopify' as const,
    apiKey: '',
    apiSecret: ''
  });

  // Real API queries
  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['/api/ecommerce/stores'],
    queryFn: () => apiRequest('GET', '/api/ecommerce/stores'),
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/ecommerce/products', selectedStore],
    queryFn: () => apiRequest('GET', `/api/ecommerce/products${selectedStore ? `?storeId=${selectedStore}` : ''}`),
    enabled: !!selectedStore || stores.length > 0
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/ecommerce/orders', selectedStore],
    queryFn: () => apiRequest('GET', `/api/ecommerce/orders${selectedStore ? `?storeId=${selectedStore}` : ''}`),
    enabled: !!selectedStore || stores.length > 0
  });

  const { data: analytics = null, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/ecommerce/analytics', selectedStore],
    queryFn: () => apiRequest('GET', `/api/ecommerce/analytics${selectedStore ? `?storeId=${selectedStore}` : ''}`),
    enabled: !!selectedStore || stores.length > 0
  });

  // Mutations for store operations
  const connectStoreMutation = useMutation({
    mutationFn: (storeData: typeof newStoreData) => 
      apiRequest('POST', '/api/ecommerce/stores', storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ecommerce/stores'] });
      setIsConnectDialogOpen(false);
      setNewStoreData({ name: '', domain: '', platform: 'shopify', apiKey: '', apiSecret: '' });
      toast({
        title: "Store Connected",
        description: "Your e-commerce store has been successfully connected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect store. Please check your credentials.",
        variant: "destructive",
      });
    }
  });

  const syncStoreMutation = useMutation({
    mutationFn: (storeId: number) => 
      apiRequest('POST', `/api/ecommerce/stores/${storeId}/sync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ecommerce/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ecommerce/orders'] });
      toast({
        title: "Sync Complete",
        description: "Store data has been synchronized successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync store data.",
        variant: "destructive",
      });
    }
  });

  const handleConnectStore = () => {
    if (!newStoreData.name || !newStoreData.domain) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    connectStoreMutation.mutate(newStoreData);
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to access e-commerce features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">E-commerce Integration</h1>
          <p className="text-muted-foreground">
            Connect and manage your online stores
          </p>
        </div>
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <StoreIcon className="mr-2 h-4 w-4" />
              Connect Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect E-commerce Store</DialogTitle>
              <DialogDescription>
                Connect your e-commerce platform to sync products and orders.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  placeholder="My Store"
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="storeDomain">Store Domain</Label>
                <Input
                  id="storeDomain"
                  placeholder="mystore.myshopify.com"
                  value={newStoreData.domain}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={newStoreData.platform} 
                  onValueChange={(value: any) => setNewStoreData(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="magento">Magento</SelectItem>
                    <SelectItem value="custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Your API key"
                  value={newStoreData.apiKey}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Your API secret"
                  value={newStoreData.apiSecret}
                  onChange={(e) => setNewStoreData(prev => ({ ...prev, apiSecret: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConnectStore} disabled={connectStoreMutation.isPending}>
                {connectStoreMutation.isPending ? 'Connecting...' : 'Connect Store'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingStores ? (
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </div>
      ) : stores.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stores Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first e-commerce store to start managing products and orders.
            </p>
            <Button onClick={() => setIsConnectDialogOpen(true)}>
              Connect Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store: EcommerceStore) => (
                <Card key={store.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {store.name}
                    </CardTitle>
                    <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                      {store.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-2">
                      {store.domain}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Platform: {store.platform}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Connected: {new Date(store.connectedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => syncStoreMutation.mutate(store.id)}
                      disabled={syncStoreMutation.isPending}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Data
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage your e-commerce products across all connected stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No products found. Sync your stores to import products.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Store</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: EcommerceProduct) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.title}
                          </TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.inventory}</TableCell>
                          <TableCell>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {stores.find(s => s.id === product.storeId)?.name || 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  Monitor and manage orders from all connected stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No orders found. Sync your stores to import orders.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Store</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: EcommerceOrder) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {stores.find(s => s.id === order.storeId)?.name || 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>E-commerce Analytics</CardTitle>
                <CardDescription>
                  Performance metrics across all your stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="h-64 bg-muted animate-pulse rounded" />
                ) : analytics ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <BarChart4 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${analytics.totalRevenue?.toLocaleString() || '0'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics.totalOrders?.toLocaleString() || '0'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analytics.activeProducts?.toLocaleString() || '0'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${analytics.averageOrderValue?.toFixed(2) || '0.00'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No analytics data available. Connect and sync stores to view metrics.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}