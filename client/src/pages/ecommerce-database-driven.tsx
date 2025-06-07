import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart4, 
  Box, 
  LineChart, 
  Package, 
  PieChart, 
  RefreshCw, 
  Search, 
  ShoppingBag, 
  ShoppingCart, 
  StoreIcon, 
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Database-driven data structures
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  status: 'active' | 'draft' | 'archived';
  category: string;
  dateCreated: string;
  dateModified: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}

interface StoreStats {
  revenue: {
    today: number;
    yesterday: number;
    week: number;
    month: number;
  };
  orders: {
    today: number;
    yesterday: number;
    pending: number;
  };
  customers: {
    total: number;
    new: {
      today: number;
      week: number;
    }
  };
  products: {
    total: number;
    outOfStock: number;
  };
}

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'draft':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Dashboard tab content
const DashboardTabContent = ({ stats }: { stats: StoreStats | null }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading store statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.today)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.revenue.today > stats.revenue.yesterday ? (
                <span className="text-green-600">+{formatCurrency(stats.revenue.today - stats.revenue.yesterday)}</span>
              ) : (
                <span className="text-red-600">-{formatCurrency(stats.revenue.yesterday - stats.revenue.today)}</span>
              )} from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.today}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.orders.today >= stats.orders.yesterday ? (
                <span className="text-green-600">+{stats.orders.today - stats.orders.yesterday}</span>
              ) : (
                <span className="text-red-600">-{stats.orders.yesterday - stats.orders.today}</span>
              )} from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requiring attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers.new.today}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+{stats.customers.new.week}</span> this week
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <LineChart className="h-16 w-16" />
              <p className="ml-4">Connect your e-commerce platform to view revenue charts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Store overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Products:</span>
                <span className="font-medium">{stats.products.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Out of Stock:</span>
                <span className="font-medium">{stats.products.outOfStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Customers:</span>
                <span className="font-medium">{stats.customers.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Products tab content
const ProductsTabContent = ({ products }: { products: Product[] }) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Products Found</h3>
          <p className="text-muted-foreground text-center">
            Connect your e-commerce platform to sync your product catalog.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8 w-[300px]" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {product.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.inventory}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(product.dateModified).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Orders tab content
const OrdersTabContent = ({ orders }: { orders: Order[] }) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          <p className="text-muted-foreground text-center">
            Connect your e-commerce platform to view and manage orders.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>View and manage customer orders</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function EcommerceStorePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Database queries for real data
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/ecommerce/products'],
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/ecommerce/orders'],
  });

  const { data: storeStats = null, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/ecommerce/stats'],
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the e-commerce store.</p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingProducts || isLoadingOrders || isLoadingStats;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">E-commerce Store</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <StoreIcon className="mr-2 h-4 w-4" />
            Connect Store
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart4 className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders ({orders.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DashboardTabContent stats={storeStats} />
          )}
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ProductsTabContent products={products} />
          )}
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          {isLoadingOrders ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <OrdersTabContent orders={orders} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}