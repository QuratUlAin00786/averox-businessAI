import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

// Mock data structures
interface ShopifyStore {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'pending' | 'disconnected';
  connectedAt: string;
  products: number;
  orders: number;
  customers: number;
}

interface Product {
  id: string;
  title: string;
  sku: string;
  price: number;
  inventory: number;
  status: 'active' | 'draft' | 'archived';
  store: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  total: number;
  items: number;
  createdAt: string;
  store: string;
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface SalesSummary {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  conversionRate: string;
}

// Mock data
const mockStores: ShopifyStore[] = [
  {
    id: '1',
    name: 'AVEROX Main Store',
    url: 'https://averox-main.myshopify.com',
    status: 'active',
    connectedAt: '2025-01-15T10:30:00Z',
    products: 142,
    orders: 2358,
    customers: 1879
  },
  {
    id: '2',
    name: 'AVEROX Wholesale',
    url: 'https://averox-wholesale.myshopify.com',
    status: 'active',
    connectedAt: '2025-02-20T14:25:00Z',
    products: 87,
    orders: 463,
    customers: 124
  },
  {
    id: '3',
    name: 'AVEROX Test Store',
    url: 'https://averox-test.myshopify.com',
    status: 'disconnected',
    connectedAt: '2025-03-05T09:15:00Z',
    products: 35,
    orders: 0,
    customers: 0
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Enterprise CRM Software License',
    sku: 'SW-CRM-ENT-001',
    price: 1299.99,
    inventory: 999,
    status: 'active',
    store: 'AVEROX Main Store',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-15T14:30:00Z',
    image: 'https://placehold.co/80x80'
  },
  {
    id: '2',
    title: 'Professional CRM Software License',
    sku: 'SW-CRM-PRO-001',
    price: 699.99,
    inventory: 999,
    status: 'active',
    store: 'AVEROX Main Store',
    createdAt: '2025-03-01T10:05:00Z',
    updatedAt: '2025-03-15T14:35:00Z',
    image: 'https://placehold.co/80x80'
  },
  {
    id: '3',
    title: 'Basic CRM Software License',
    sku: 'SW-CRM-BAS-001',
    price: 299.99,
    inventory: 999,
    status: 'active',
    store: 'AVEROX Main Store',
    createdAt: '2025-03-01T10:10:00Z',
    updatedAt: '2025-03-15T14:40:00Z',
    image: 'https://placehold.co/80x80'
  },
  {
    id: '4',
    title: 'Premium Support Package - Annual',
    sku: 'SUP-PREM-ANN',
    price: 499.99,
    inventory: 999,
    status: 'active',
    store: 'AVEROX Main Store',
    createdAt: '2025-03-02T09:00:00Z',
    updatedAt: '2025-03-15T14:45:00Z'
  },
  {
    id: '5',
    title: 'Basic Support Package - Annual',
    sku: 'SUP-BAS-ANN',
    price: 199.99,
    inventory: 999,
    status: 'active',
    store: 'AVEROX Main Store',
    createdAt: '2025-03-02T09:05:00Z',
    updatedAt: '2025-03-15T14:50:00Z'
  },
  {
    id: '6',
    title: 'CRM Implementation Services',
    sku: 'SVC-IMP-001',
    price: 2999.99,
    inventory: 100,
    status: 'active',
    store: 'AVEROX Main Store',
    createdAt: '2025-03-03T11:00:00Z',
    updatedAt: '2025-03-15T14:55:00Z'
  },
  {
    id: '7',
    title: 'Enterprise CRM Software License - Bulk',
    sku: 'SW-CRM-ENT-BULK',
    price: 9999.99,
    inventory: 50,
    status: 'active',
    store: 'AVEROX Wholesale',
    createdAt: '2025-03-04T10:00:00Z',
    updatedAt: '2025-03-16T12:30:00Z'
  }
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#10045',
    customer: {
      id: '101',
      name: 'Acme Corporation',
      email: 'purchasing@acme.com'
    },
    status: 'completed',
    total: 6999.97,
    items: 3,
    createdAt: '2025-04-01T10:30:00Z',
    store: 'AVEROX Main Store',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'paid'
  },
  {
    id: '2',
    orderNumber: '#10046',
    customer: {
      id: '102',
      name: 'Global Industries Ltd',
      email: 'tech@globalind.com'
    },
    status: 'processing',
    total: 3299.97,
    items: 2,
    createdAt: '2025-04-01T14:45:00Z',
    store: 'AVEROX Main Store',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'paid'
  },
  {
    id: '3',
    orderNumber: '#10047',
    customer: {
      id: '103',
      name: 'Tech Solutions Inc',
      email: 'orders@techsolutions.com'
    },
    status: 'pending',
    total: 1299.99,
    items: 1,
    createdAt: '2025-04-02T09:15:00Z',
    store: 'AVEROX Main Store',
    fulfillmentStatus: 'unfulfilled',
    paymentStatus: 'pending'
  },
  {
    id: '4',
    orderNumber: '#10048',
    customer: {
      id: '104',
      name: 'City Government',
      email: 'it@citygovernment.gov'
    },
    status: 'completed',
    total: 3499.98,
    items: 2,
    createdAt: '2025-04-02T15:20:00Z',
    store: 'AVEROX Main Store',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'paid'
  },
  {
    id: '5',
    orderNumber: '#W2012',
    customer: {
      id: '105',
      name: 'Enterprise Systems LLC',
      email: 'procurement@enterprisesys.com'
    },
    status: 'completed',
    total: 29999.97,
    items: 3,
    createdAt: '2025-04-03T11:10:00Z',
    store: 'AVEROX Wholesale',
    fulfillmentStatus: 'fulfilled',
    paymentStatus: 'paid'
  }
];

const mockSalesSummary: SalesSummary[] = [
  {
    period: 'Today',
    revenue: 4799.96,
    orders: 2,
    averageOrderValue: 2399.98,
    conversionRate: '3.2%'
  },
  {
    period: 'Yesterday',
    revenue: 3499.98,
    orders: 1,
    averageOrderValue: 3499.98,
    conversionRate: '2.8%'
  },
  {
    period: 'Last 7 days',
    revenue: 45799.87,
    orders: 17,
    averageOrderValue: 2694.11,
    conversionRate: '3.5%'
  },
  {
    period: 'Last 30 days',
    revenue: 189456.72,
    orders: 68,
    averageOrderValue: 2786.13,
    conversionRate: '3.7%'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'disconnected':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-purple-100 text-purple-800';
    case 'unfulfilled':
      return 'bg-yellow-100 text-yellow-800';
    case 'partial':
      return 'bg-blue-100 text-blue-800';
    case 'fulfilled':
      return 'bg-green-100 text-green-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ConnectStoreDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const { toast } = useToast();
  
  const handleConnect = () => {
    if (!storeName || !storeUrl) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would initiate the Shopify OAuth flow
    toast({
      title: "Connection initiated",
      description: "You will be redirected to Shopify to authorize this connection.",
    });
    
    // Reset form fields
    setStoreName('');
    setStoreUrl('');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Shopify Store</DialogTitle>
          <DialogDescription>
            Connect your Shopify store to manage products, orders, and customers directly from AVEROX CRM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="store-name" className="text-right">
              Store Name
            </Label>
            <Input
              id="store-name"
              placeholder="My Shopify Store"
              className="col-span-3"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="store-url" className="text-right">
              Store URL
            </Label>
            <div className="col-span-3 flex items-center">
              <span className="mr-2">https://</span>
              <Input
                id="store-url"
                placeholder="mystore.myshopify.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sync-settings" className="text-right">
              Auto-sync
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="sync-settings" defaultChecked />
              <Label htmlFor="sync-settings">Sync data every 15 minutes</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConnect}>Connect Store</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SyncSettingsDialog = ({ open, onOpenChange, store }: { open: boolean, onOpenChange: (open: boolean) => void, store: ShopifyStore | null }) => {
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    // In a real implementation, this would save the sync settings
    toast({
      title: "Settings saved",
      description: "Your synchronization settings have been updated.",
    });
    
    onOpenChange(false);
  };
  
  if (!store) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sync Settings for {store.name}</DialogTitle>
          <DialogDescription>
            Configure how your Shopify store data is synchronized with AVEROX CRM.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automatic Sync</h4>
                <p className="text-sm text-gray-500">Sync data automatically at regular intervals</p>
              </div>
              <Switch id="auto-sync" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sync-interval">Sync Interval</Label>
              <Select defaultValue="15">
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                  <SelectItem value="360">Every 6 hours</SelectItem>
                  <SelectItem value="720">Every 12 hours</SelectItem>
                  <SelectItem value="1440">Once a day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Sync Data Types</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-products">Products</Label>
                <Switch id="sync-products" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-orders">Orders</Label>
                <Switch id="sync-orders" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-customers">Customers</Label>
                <Switch id="sync-customers" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sync-inventory">Inventory</Label>
                <Switch id="sync-inventory" defaultChecked />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Map Shopify Customers to AVEROX</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="map-customers">Create/update AVEROX contacts</Label>
                <Switch id="map-customers" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="map-orders">Create activities for new orders</Label>
                <Switch id="map-orders" defaultChecked />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priceRangeFilter: { min: string; max: string };
  setPriceRangeFilter: (range: { min: string; max: string }) => void;
}

function FilterDialog({ 
  open, 
  onOpenChange, 
  statusFilter, 
  setStatusFilter, 
  priceRangeFilter, 
  setPriceRangeFilter 
}: FilterDialogProps) {
  const handleApplyFilters = () => {
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setPriceRangeFilter({ min: '', max: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Products</DialogTitle>
          <DialogDescription>
            Set filters to refine your product search results.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Price Range</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceRangeFilter.min}
                  onChange={(e) => setPriceRangeFilter({ ...priceRangeFilter, min: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceRangeFilter.max}
                  onChange={(e) => setPriceRangeFilter({ ...priceRangeFilter, max: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EcommercePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStore, setSelectedStore] = useState<ShopifyStore | null>(null);
  const [isConnectStoreDialogOpen, setIsConnectStoreDialogOpen] = useState(false);
  const [isSyncSettingsDialogOpen, setIsSyncSettingsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('all-stores');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState({ min: '', max: '' });
  const { user } = useAuth();
  const { toast } = useToast();
  
  // These would be actual API queries in a real implementation
  // const { data: stores = [], isLoading: isLoadingStores } = useQuery({
  //   queryKey: ['/api/ecommerce/stores'],
  //   queryFn: () => fetch('/api/ecommerce/stores').then(res => res.json()),
  // });
  // const { data: products = [], isLoading: isLoadingProducts } = useQuery({
  //   queryKey: ['/api/ecommerce/products'],
  //   queryFn: () => fetch('/api/ecommerce/products').then(res => res.json()),
  // });
  // const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
  //   queryKey: ['/api/ecommerce/orders'],
  //   queryFn: () => fetch('/api/ecommerce/orders').then(res => res.json()),
  // });
  // const { data: salesSummary = [], isLoading: isLoadingSales } = useQuery({
  //   queryKey: ['/api/ecommerce/sales-summary'],
  //   queryFn: () => fetch('/api/ecommerce/sales-summary').then(res => res.json()),
  // });
  
  // Using mock data for now
  const stores = mockStores;
  const products = mockProducts;
  const orders = mockOrders;
  const salesSummary = mockSalesSummary;
  const isLoadingStores = false;
  const isLoadingProducts = false;
  const isLoadingOrders = false;
  const isLoadingSales = false;
  
  const activeStores = stores.filter(store => store.status === 'active');
  
  // Filter products based on search query and selected store
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStore = selectedStoreFilter === 'all-stores' || 
      product.store === stores.find(store => store.id === selectedStoreFilter)?.name;
    
    const matchesStatus = statusFilter === 'all' || 
      product.status === statusFilter;
    
    const matchesPriceRange = (!priceRangeFilter.min || product.price >= parseFloat(priceRangeFilter.min)) &&
      (!priceRangeFilter.max || product.price <= parseFloat(priceRangeFilter.max));
    
    return matchesSearch && matchesStore && matchesStatus && matchesPriceRange;
  });
  
  const handleSyncStore = (store: ShopifyStore) => {
    toast({
      title: "Sync started",
      description: `Syncing data from ${store.name}. This may take a few minutes.`,
    });
  };

  const handleExportProducts = () => {
    const csvHeaders = ['Product Name', 'SKU', 'Price', 'Inventory', 'Status', 'Store'];
    const csvData = filteredProducts.map(product => [
      product.title,
      product.sku,
      `$${product.price.toFixed(2)}`,
      product.inventory.toString(),
      product.status,
      product.store
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Export complete",
      description: "Products have been exported to CSV file.",
    });
  };

  const handleExportOrders = () => {
    const csvHeaders = ['Order Number', 'Customer Name', 'Customer Email', 'Status', 'Total', 'Store', 'Date'];
    const csvData = orders.map(order => [
      order.orderNumber,
      order.customer.name,
      order.customer.email,
      order.status,
      `$${order.total.toFixed(2)}`,
      order.store,
      new Date(order.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Export complete",
      description: "Orders have been exported to CSV file.",
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">E-commerce Manager</h1>
          <p className="text-muted-foreground">Manage your Shopify stores, products, and orders</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsConnectStoreDialogOpen(true)}
          >
            <Globe className="mr-2 h-4 w-4" /> Connect Store
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {salesSummary.map((summary, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{summary.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {summary.orders} orders • ${summary.averageOrderValue.toFixed(2)} avg
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your store</CardDescription>
                </div>
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => setActiveTab('orders')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{order.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{order.store}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {activeTab === 'overview' && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="link" size="sm" onClick={() => setActiveTab('orders')}>
                      View all orders <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Connected Stores</CardTitle>
                <CardDescription>
                  {activeStores.length} of {stores.length} stores active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store.id} className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                          {store.url}
                        </div>
                        <Badge variant="outline" className={getStatusColor(store.status)}>
                          {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { 
                          setSelectedStore(store);
                          handleSyncStore(store);
                        }}
                        disabled={store.status !== 'active'}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {activeTab === 'overview' && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="link" size="sm" onClick={() => setActiveTab('stores')}>
                      Manage stores <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sales Trends</CardTitle>
                  <CardDescription>Daily revenue for the past 30 days</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[150px] h-8">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full flex items-center justify-center">
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <LineChart className="h-16 w-16 mb-2" />
                    <p>Chart visualization would appear here.</p>
                    <p className="text-sm">Showing daily revenue trends over time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 3).map((product, index) => (
                    <div key={product.id} className="flex items-center">
                      <div className="flex-shrink-0 mr-3 font-bold text-muted-foreground w-5 text-center">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.title}</div>
                        <div className="text-sm text-muted-foreground">${product.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {activeTab === 'overview' && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="link" size="sm" onClick={() => setActiveTab('products')}>
                      View all products <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your products across all stores</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      type="search" 
                      placeholder="Search products..." 
                      className="pl-8" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setIsFilterDialogOpen(true)}>
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Select value={selectedStoreFilter} onValueChange={setSelectedStoreFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All stores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-stores">All stores</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingProducts ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {searchQuery || selectedStoreFilter !== 'all-stores' 
                          ? 'No products found matching your search criteria.' 
                          : 'No products found. Connect a Shopify store to import products.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.title} 
                                className="h-10 w-10 rounded-md mr-3 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div className="font-medium">{product.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.inventory}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(product.status)}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.store}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit product</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View in Shopify</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>View and manage orders from your Shopify stores</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="Search orders..." className="pl-8" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOrders ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No orders found. Connect a Shopify store to import orders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">{order.items} items</div>
                        </TableCell>
                        <TableCell>
                          <div>{order.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.fulfillmentStatus)}>
                            {order.fulfillmentStatus.charAt(0).toUpperCase() + order.fulfillmentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(order.paymentStatus)}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Create activity</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View in Shopify</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Connected Stores</CardTitle>
                  <CardDescription>Manage your Shopify store connections</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnectStoreDialogOpen(true)}
                >
                  <Globe className="mr-2 h-4 w-4" /> Connect New Store
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Connected Since</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStores ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading stores...
                      </TableCell>
                    </TableRow>
                  ) : stores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No stores connected. Connect your first Shopify store to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div className="font-medium">{store.name}</div>
                          <div className="text-sm text-muted-foreground">{store.url}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(store.status)}>
                            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{store.products}</TableCell>
                        <TableCell>{store.orders}</TableCell>
                        <TableCell>{store.customers}</TableCell>
                        <TableCell>
                          {new Date(store.connectedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setSelectedStore(store);
                                handleSyncStore(store);
                              }}
                              disabled={store.status !== 'active'}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedStore(store);
                                setIsSyncSettingsDialogOpen(true);
                              }}
                              disabled={store.status !== 'active'}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integration Guide</CardTitle>
                <CardDescription>Learn how to use the Shopify integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <StoreIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Connect Your Store</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the OAuth flow to securely connect your Shopify store.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <RefreshCw className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sync Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync products, orders, and customers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3 flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Map Customers</h4>
                      <p className="text-sm text-muted-foreground">
                        Convert Shopify customers to AVEROX contacts automatically.
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="text-sm p-0">
                    View full documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sync Status</CardTitle>
                <CardDescription>Latest synchronization status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stores
                    .filter(store => store.status === 'active')
                    .map((store) => (
                      <div key={store.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{store.name}</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Success
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last sync: Today, 10:15 AM
                        </div>
                        <div className="text-sm">
                          <span className="text-green-600">✓</span> 142 products
                          <span className="mx-2">•</span>
                          <span className="text-green-600">✓</span> 58 orders
                          <span className="mx-2">•</span>
                          <span className="text-green-600">✓</span> 45 customers
                        </div>
                      </div>
                    ))}
                  <Button variant="link" className="text-sm p-0">
                    View sync history
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Export</CardTitle>
                <CardDescription>Export e-commerce data to CSV</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportProducts}>
                    <Download className="mr-2 h-4 w-4" /> Export Products
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleExportOrders}>
                    <Download className="mr-2 h-4 w-4" /> Export Orders
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" /> Export Customers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" /> Export Sales Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <ConnectStoreDialog 
        open={isConnectStoreDialogOpen} 
        onOpenChange={setIsConnectStoreDialogOpen}
      />
      
      <SyncSettingsDialog 
        open={isSyncSettingsDialogOpen} 
        onOpenChange={setIsSyncSettingsDialogOpen}
        store={selectedStore}
      />
      
      <FilterDialog 
        open={isFilterDialogOpen} 
        onOpenChange={setIsFilterDialogOpen}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priceRangeFilter={priceRangeFilter}
        setPriceRangeFilter={setPriceRangeFilter}
      />
    </div>
  );
}