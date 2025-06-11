import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  Clock,
  Copy, 
  CreditCard,
  Download, 
  Edit,
  ExternalLink, 
  EyeIcon,
  Filter, 
  Globe, 
  ImageIcon,
  LineChart, 
  MoreHorizontal, 
  Package, 
  PieChart, 
  Plus,
  Pencil,
  RefreshCw, 
  Search, 
  Settings, 
  Share2,
  ShoppingBag, 
  ShoppingCart, 
  StoreIcon, 
  Tag, 
  Trash,
  Truck, 
  Upload,
  Users
} from 'lucide-react';

// Mock data structures
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  inventory: number;
  status: 'active' | 'draft' | 'archived';
  category: string;
  tags: string[];
  images: string[];
  featured: boolean;
  dateCreated: string;
  dateModified: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  productCount: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingStatus: 'pending' | 'shipped' | 'delivered' | 'returned';
  total: number;
  items: OrderItem[];
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  shippingMethod: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  options?: Record<string, string>;
}

interface StoreStats {
  revenue: {
    today: number;
    yesterday: number;
    week: number;
    month: number;
    year: number;
  };
  orders: {
    today: number;
    yesterday: number;
    week: number;
    month: number;
    pending: number;
  };
  customers: {
    total: number;
    new: {
      today: number;
      week: number;
      month: number;
    }
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number;
  };
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Enterprise CRM Software License',
    description: 'Full featured CRM solution for enterprise businesses with unlimited users.',
    price: 1299.99,
    inventory: 999,
    status: 'active',
    category: 'Software',
    tags: ['enterprise', 'crm', 'business'],
    images: ['https://placehold.co/400x300'],
    featured: true,
    dateCreated: '2025-03-01T10:00:00Z',
    dateModified: '2025-04-01T14:30:00Z'
  },
  {
    id: '2',
    name: 'Professional CRM Software License',
    description: 'Advanced CRM solution for mid-sized businesses with up to 25 users.',
    price: 699.99,
    discountedPrice: 599.99,
    inventory: 999,
    status: 'active',
    category: 'Software',
    tags: ['professional', 'crm', 'business'],
    images: ['https://placehold.co/400x300'],
    featured: true,
    dateCreated: '2025-03-01T10:05:00Z',
    dateModified: '2025-04-01T14:35:00Z'
  },
  {
    id: '3',
    name: 'Basic CRM Software License',
    description: 'Essential CRM features for small businesses with up to 5 users.',
    price: 299.99,
    inventory: 999,
    status: 'active',
    category: 'Software',
    tags: ['basic', 'crm', 'small business'],
    images: ['https://placehold.co/400x300'],
    featured: false,
    dateCreated: '2025-03-01T10:10:00Z',
    dateModified: '2025-04-01T14:40:00Z'
  },
  {
    id: '4',
    name: 'Premium Support Package - Annual',
    description: '24/7 priority support with dedicated account manager.',
    price: 499.99,
    inventory: 999,
    status: 'active',
    category: 'Services',
    tags: ['support', 'premium', 'service'],
    images: ['https://placehold.co/400x300'],
    featured: false,
    dateCreated: '2025-03-02T09:00:00Z',
    dateModified: '2025-04-01T14:45:00Z'
  },
  {
    id: '5',
    name: 'CRM Implementation Services',
    description: 'Professional implementation and setup of your CRM system.',
    price: 2999.99,
    inventory: 100,
    status: 'active',
    category: 'Services',
    tags: ['implementation', 'setup', 'consulting'],
    images: ['https://placehold.co/400x300'],
    featured: true,
    dateCreated: '2025-03-03T11:00:00Z',
    dateModified: '2025-04-01T14:55:00Z'
  },
  {
    id: '6',
    name: 'CRM Training Course - Basic',
    description: 'Online training course for new CRM users.',
    price: 199.99,
    inventory: 999,
    status: 'draft',
    category: 'Training',
    tags: ['training', 'online', 'basic'],
    images: ['https://placehold.co/400x300'],
    featured: false,
    dateCreated: '2025-03-05T13:00:00Z',
    dateModified: '2025-04-01T15:00:00Z'
  }
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Software',
    description: 'CRM software licenses and subscriptions',
    slug: 'software',
    productCount: 3
  },
  {
    id: '2',
    name: 'Services',
    description: 'Professional services for CRM implementation and support',
    slug: 'services',
    productCount: 2
  },
  {
    id: '3',
    name: 'Training',
    description: 'Training courses and materials for CRM users',
    slug: 'training',
    productCount: 1
  },
  {
    id: '4',
    name: 'Add-ons',
    description: 'Additional modules and extensions for CRM',
    slug: 'add-ons',
    productCount: 0
  }
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#10045',
    customer: {
      id: '101',
      name: 'Acme Corporation',
      email: 'purchasing@acme.com',
      phone: '+1-555-123-4567'
    },
    status: 'completed',
    paymentStatus: 'paid',
    shippingStatus: 'delivered',
    total: 1299.99,
    items: [
      {
        id: '1-1',
        productId: '1',
        productName: 'Enterprise CRM Software License',
        quantity: 1,
        price: 1299.99,
        total: 1299.99
      }
    ],
    createdAt: '2025-04-01T10:30:00Z',
    shippingAddress: {
      street: '123 Business Ave',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    billingAddress: {
      street: '123 Business Ave',
      city: 'Metropolis',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'Credit Card',
    shippingMethod: 'Digital Delivery',
    notes: 'Please send license key to IT department.'
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
    paymentStatus: 'paid',
    shippingStatus: 'pending',
    total: 3299.97,
    items: [
      {
        id: '2-1',
        productId: '2',
        productName: 'Professional CRM Software License',
        quantity: 1,
        price: 699.99,
        total: 699.99
      },
      {
        id: '2-2',
        productId: '4',
        productName: 'Premium Support Package - Annual',
        quantity: 1,
        price: 499.99,
        total: 499.99
      },
      {
        id: '2-3',
        productId: '5',
        productName: 'CRM Implementation Services',
        quantity: 1,
        price: 2099.99,
        total: 2099.99
      }
    ],
    createdAt: '2025-04-02T14:45:00Z',
    shippingAddress: {
      street: '456 Corporate Drive',
      city: 'Business Park',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    paymentMethod: 'Bank Transfer',
    shippingMethod: 'Digital Delivery',
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
    paymentStatus: 'pending',
    shippingStatus: 'pending',
    total: 599.99,
    items: [
      {
        id: '3-1',
        productId: '2',
        productName: 'Professional CRM Software License',
        quantity: 1,
        price: 599.99,
        total: 599.99,
        options: {
          'edition': 'Cloud'
        }
      }
    ],
    createdAt: '2025-04-03T09:15:00Z',
    shippingAddress: {
      street: '789 Tech Blvd',
      city: 'Silicon Valley',
      state: 'CA',
      zipCode: '94024',
      country: 'USA'
    },
    paymentMethod: 'PayPal',
    shippingMethod: 'Digital Delivery',
  }
];

const mockStoreStats: StoreStats = {
  revenue: {
    today: 599.99,
    yesterday: 1299.99,
    week: 5199.95,
    month: 18750.85,
    year: 67500.50
  },
  orders: {
    today: 1,
    yesterday: 1,
    week: 8,
    month: 32,
    pending: 3
  },
  customers: {
    total: 124,
    new: {
      today: 2,
      week: 15,
      month: 42
    }
  },
  products: {
    total: 6,
    outOfStock: 0,
    lowStock: 0
  }
};

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
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'archived':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-purple-100 text-purple-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'returned':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Component for adding/editing a product
const ProductFormDialog = ({ 
  open, 
  onOpenChange, 
  product = null 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  product?: Product | null 
}) => {
  const [productName, setProductName] = useState(product?.name || '');
  const [productDescription, setProductDescription] = useState(product?.description || '');
  const [productPrice, setProductPrice] = useState(product?.price.toString() || '');
  const [productCategory, setProductCategory] = useState(product?.category || '');
  const [productInventory, setProductInventory] = useState(product?.inventory.toString() || '');
  const [productStatus, setProductStatus] = useState<'active' | 'draft' | 'archived'>(product?.status || 'draft');
  const [productFeatured, setProductFeatured] = useState(product?.featured || false);
  
  const { toast } = useToast();
  
  const handleSubmit = () => {
    if (!productName || !productDescription || !productPrice || !productCategory || !productInventory) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: product ? "Product updated" : "Product created",
      description: `${productName} has been ${product ? 'updated' : 'created'} successfully.`,
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product 
              ? 'Update your product information.' 
              : 'Add a new product to your store.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="product-name"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-category">Category <span className="text-red-500">*</span></Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="product-description"
              placeholder="Enter product description"
              rows={4}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price ($) <span className="text-red-500">*</span></Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-inventory">Inventory <span className="text-red-500">*</span></Label>
              <Input
                id="product-inventory"
                type="number"
                min="0"
                placeholder="0"
                value={productInventory}
                onChange={(e) => setProductInventory(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-status">Status</Label>
              <Select 
                value={productStatus} 
                onValueChange={(value: any) => setProductStatus(value as 'active' | 'draft' | 'archived')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox 
                id="product-featured" 
                checked={productFeatured}
                onCheckedChange={(checked) => 
                  setProductFeatured(checked as boolean)
                }
              />
              <Label htmlFor="product-featured">Featured product</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <div className="flex flex-col items-center">
                <ImageIcon className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop product images here, or click to browse
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Dashboard tab content
const DashboardTabContent = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const stats = mockStoreStats;
  const { toast } = useToast();
  
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
              <p className="ml-4">Revenue chart visualization would appear here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProducts
                .filter(p => p.featured)
                .slice(0, 3)
                .map(product => (
                  <div key={product.id} className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-md mr-4 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="text-sm font-medium">
                      42 sold
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your store</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
                View All
              </Button>
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
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => {
                        toast({
                          title: "Order Details",
                          description: `Viewing order ${order.orderNumber} for ${order.customer.name}`,
                        });
                        setActiveTab('orders');
                      }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Products tab content
const ProductsTabContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isProductViewOpen, setIsProductViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [tableKey, setTableKey] = useState(0);
  const { toast } = useToast();
  
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductViewOpen(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const timestamp = Date.now();
    const duplicatedProduct: Product = {
      ...product,
      id: `copy-${timestamp}`,
      name: `${product.name} (Copy)`,
      tags: [...(product.tags || [])],
      images: [...(product.images || [])],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    
    // Update products array with new product
    setProducts(currentProducts => {
      const newProducts = [...currentProducts, duplicatedProduct];
      return newProducts;
    });
    
    // Force table re-render
    setTableKey(prev => prev + 1);
    
    toast({
      title: "Product Duplicated",
      description: `Created: ${duplicatedProduct.name}`,
      variant: "default",
    });
  };

  const handleShareProduct = (product: Product) => {
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    const shareText = `Check out ${product.name} - ${product.description}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl,
      }).then(() => {
        toast({
          title: "Product Shared",
          description: "Product has been shared successfully.",
        });
      }).catch((error) => {
        console.log('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Product link copied to clipboard.",
        });
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link Copied",
          description: "Product link copied to clipboard.",
        });
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });


  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your store products</p>
        </div>
        <Button onClick={() => {
          setSelectedProduct(null);
          setIsProductFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs defaultValue="all" className="w-full" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {mockCategories.map(category => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name} ({category.productCount})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full md:w-auto">
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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card>
        <Table key={tableKey}>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product, index) => (
                <TableRow key={`${product.id}-${index}`}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-md mr-3 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded-md"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(product.status)}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.discountedPrice ? (
                      <div>
                        <span className="font-medium">{formatCurrency(product.discountedPrice)}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatCurrency(product.price)}</span>
                    )}
                  </TableCell>
                  <TableCell>{product.inventory}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewProduct(product)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsProductFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShareProduct(product)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      <ProductFormDialog 
        open={isProductFormOpen} 
        onOpenChange={setIsProductFormOpen} 
        product={selectedProduct}
      />

      {/* Product View Modal */}
      <Dialog open={isProductViewOpen} onOpenChange={setIsProductViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Complete product information and specifications
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="space-y-2 mt-2">
                      <p><strong>Name:</strong> {selectedProduct.name}</p>
                      <p><strong>Category:</strong> {selectedProduct.category}</p>
                      <p><strong>Status:</strong> <Badge variant="outline">{selectedProduct.status}</Badge></p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
                    <div className="space-y-2 mt-2">
                      <p><strong>Price:</strong> {formatCurrency(selectedProduct.price)}</p>
                      {selectedProduct.discountedPrice && (
                        <p><strong>Discounted Price:</strong> {formatCurrency(selectedProduct.discountedPrice)}</p>
                      )}
                      <p><strong>Inventory:</strong> {selectedProduct.inventory} units</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Product Features</h3>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <strong>Featured Product:</strong> 
                        {selectedProduct.featured ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </div>
                      <p><strong>Tags:</strong> {selectedProduct.tags?.join(', ') || 'None'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Dates</h3>
                    <div className="space-y-2 mt-2">
                      <p><strong>Created:</strong> {formatDate(selectedProduct.dateCreated)}</p>
                      <p><strong>Modified:</strong> {formatDate(selectedProduct.dateModified)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="mt-2 p-3 bg-gray-50 rounded-md">{selectedProduct.description}</p>
              </div>
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Product Images</h3>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {selectedProduct.images.map((image, index) => (
                      <div key={index} className="border rounded-md p-2">
                        <img src={image} alt={`Product ${index + 1}`} className="w-full h-20 object-cover rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Orders tab content
const OrdersTabContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isOrderEditOpen, setIsOrderEditOpen] = useState(false);
  const [orders, setOrders] = useState(mockOrders);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleViewOrder = (order: any) => {
    console.log("Opening order details for:", order);
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderEditOpen(true);
  };

  const handleMarkAsShipped = (order: any) => {
    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === order.id 
          ? { ...o, status: 'completed' as const, shippingStatus: 'shipped' as const }
          : o
      )
    );
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Order Shipped",
      description: `Order ${order.orderNumber} has been marked as shipped.`,
    });
  };

  const handleCapturePayment = (order: any) => {
    console.log('Capturing payment for order:', order.id);
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(o => 
        o.id === order.id 
          ? { ...o, paymentStatus: 'paid' as const }
          : o
      );
      console.log('Updated orders:', updatedOrders);
      return updatedOrders;
    });
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Payment Captured",
      description: `Payment for order ${order.orderNumber} has been captured successfully.`,
    });
  };

  const handleMarkAsProcessing = (order: any) => {
    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === order.id 
          ? { ...o, status: 'processing' as const }
          : o
      )
    );
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Order Processing",
      description: `Order ${order.orderNumber} has been marked as processing.`,
    });
  };

  const handleCancelOrder = (order: any) => {
    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === order.id 
          ? { ...o, status: 'cancelled' as const }
          : o
      )
    );
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Order Cancelled",
      description: `Order ${order.orderNumber} has been cancelled.`,
      variant: "destructive",
    });
  };

  const handleExportOrders = () => {
    const csvHeaders = ['Order Number', 'Customer Name', 'Customer Email', 'Date', 'Status', 'Payment Status', 'Total'];
    const csvData = filteredOrders.map(order => [
      order.orderNumber,
      order.customer.name,
      order.customer.email,
      formatDate(order.createdAt),
      order.status.charAt(0).toUpperCase() + order.status.slice(1),
      order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1),
      formatCurrency(order.total)
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
      title: "Export Complete",
      description: "Orders have been exported to CSV file.",
    });
  };

  const handleRefreshOrders = () => {
    setOrders(mockOrders);
    setRefreshKey(prev => prev + 1);
    setSearchQuery('');
    setStatusFilter('all');
    toast({
      title: "Orders Refreshed",
      description: "Order data has been refreshed successfully.",
    });
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportOrders}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefreshOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs defaultValue="all" className="w-full" value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Filter Orders</h4>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                      setShowFilters(false);
                      toast({
                        title: "Filters Cleared",
                        description: "All filters have been reset.",
                      });
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setShowFilters(false);
                      toast({
                        title: "Filters Applied",
                        description: "Orders filtered successfully.",
                      });
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No orders found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map(order => (
                <TableRow key={`${order.id}-${order.status}-${order.paymentStatus}-${refreshKey}`}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.status)} key={`status-${order.id}-${refreshKey}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(order.paymentStatus)} key={`payment-${order.id}-${refreshKey}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditOrder(order)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMarkAsShipped(order)}>
                            <Truck className="h-4 w-4 mr-2" />
                            Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCapturePayment(order)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Capture Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarkAsProcessing(order)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Processing
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleCancelOrder(order)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Complete order information and customer details
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div className="space-y-2 mt-2">
                      <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Order Status</h3>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <strong>Order Status:</strong> 
                        <Badge variant="outline">{selectedOrder.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Payment Status:</strong> 
                        <Badge variant="outline">{selectedOrder.paymentStatus}</Badge>
                      </div>
                      <p><strong>Shipping Status:</strong> {selectedOrder.shippingStatus}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Shipping Address</h3>
                    <div className="space-y-1 mt-2">
                      <p>{selectedOrder.shippingAddress?.street}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                    <div className="space-y-2 mt-2">
                      <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                      <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                      <p><strong>Shipping Method:</strong> {selectedOrder.shippingMethod}</p>
                      <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold">Notes</h3>
                  <p className="mt-2 p-3 bg-gray-50 rounded-md">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Edit Modal */}
      <Dialog open={isOrderEditOpen} onOpenChange={setIsOrderEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Update order status, payment, and shipping information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Order Status</Label>
                  <Select defaultValue={selectedOrder.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <Select defaultValue={selectedOrder.paymentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-status">Shipping Status</Label>
                  <Select defaultValue={selectedOrder.shippingStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking-number">Tracking Number</Label>
                  <Input id="tracking-number" placeholder="Enter tracking number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-notes">Order Notes</Label>
                <Textarea 
                  id="order-notes" 
                  placeholder="Add notes about this order..."
                  defaultValue={selectedOrder.notes}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsOrderEditOpen(false);
              toast({
                title: "Order Updated",
                description: "Order has been successfully updated.",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Settings tab content
const SettingsTabContent = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize settings with saved data or defaults
  const getInitialSettings = () => {
    try {
      const savedSettings = localStorage.getItem('ecommerce_store_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log("Loading initial settings from localStorage:", parsedSettings);
        return parsedSettings;
      }
    } catch (error) {
      console.error("Error loading initial settings:", error);
    }
    
    // Return default settings if no saved settings found
    const defaults = {
      storeName: 'AVEROX Store',
      storeEmail: 'store@averox.com',
      currency: 'USD',
      language: 'en',
      description: 'AVEROX Store - Your one-stop shop for CRM software, support, and services.',
      creditCard: true,
      paypal: true,
      bankTransfer: false,
      digitalDelivery: true,
      standardShipping: true,
      expressShipping: false
    };
    console.log("Using default settings:", defaults);
    return defaults;
  };

  const [settings, setSettings] = useState(getInitialSettings());
  
  // Debug logging for settings changes
  useEffect(() => {
    console.log("Settings state updated:", settings);
  }, [settings]);
  
  const handleSaveSettings = async () => {
    console.log("Save Settings button clicked!");
    console.log("Current settings to save:", settings);
    setIsLoading(true);
    try {
      // Save settings to localStorage for persistence
      localStorage.setItem('ecommerce_store_settings', JSON.stringify(settings));
      console.log("Settings saved to localStorage:", JSON.stringify(settings));
      
      // Verify the save worked
      const savedCheck = localStorage.getItem('ecommerce_store_settings');
      console.log("Verification - settings in localStorage:", savedCheck);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log success
      console.log("Settings saved successfully");
      
      toast({
        title: "Settings Saved",
        description: "Your store settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to saved settings or defaults
    setSettings(getInitialSettings());
    
    toast({
      title: "Changes Cancelled",
      description: "Settings have been reset to previous values.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Store Settings</h2>
        <p className="text-muted-foreground">Configure your online store settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic store information and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input 
                  id="store-name" 
                  value={settings.storeName}
                  onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Store Email</Label>
                <Input 
                  id="store-email" 
                  type="email" 
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-currency">Currency</Label>
                <Select 
                  value={settings.currency} 
                  onValueChange={(value) => setSettings({...settings, currency: value})}
                >
                  <SelectTrigger id="store-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                    <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                    <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-language">Default Language</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => setSettings({...settings, language: value})}
                >
                  <SelectTrigger id="store-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store-description">Store Description</Label>
              <Textarea 
                id="store-description" 
                rows={4} 
                value={settings.description}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Configure payment methods and processors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Credit Card Payments</h4>
                  <p className="text-sm text-muted-foreground">Accept Visa, Mastercard, Amex and more</p>
                </div>
              </div>
              <Switch 
                checked={settings.creditCard} 
                onCheckedChange={(checked) => setSettings({...settings, creditCard: checked})}
                id="payment-cc" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">PayPal</h4>
                  <p className="text-sm text-muted-foreground">Accept payments through PayPal</p>
                </div>
              </div>
              <Switch 
                checked={settings.paypal} 
                onCheckedChange={(checked) => setSettings({...settings, paypal: checked})}
                id="payment-paypal" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Bank Transfer</h4>
                  <p className="text-sm text-muted-foreground">Accept direct bank transfers</p>
                </div>
              </div>
              <Switch 
                checked={settings.bankTransfer} 
                onCheckedChange={(checked) => setSettings({...settings, bankTransfer: checked})}
                id="payment-bank" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Shipping Settings</CardTitle>
          <CardDescription>Configure shipping methods and regions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Digital Products Delivery</h4>
                  <p className="text-sm text-muted-foreground">Email delivery of digital products and licenses</p>
                </div>
              </div>
              <Switch 
                checked={settings.digitalDelivery} 
                onCheckedChange={(checked) => setSettings({...settings, digitalDelivery: checked})}
                id="shipping-digital" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Standard Shipping</h4>
                  <p className="text-sm text-muted-foreground">Physical products delivery (3-5 business days)</p>
                </div>
              </div>
              <Switch 
                checked={settings.standardShipping} 
                onCheckedChange={(checked) => setSettings({...settings, standardShipping: checked})}
                id="shipping-standard" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Express Shipping</h4>
                  <p className="text-sm text-muted-foreground">Expedited delivery (1-2 business days)</p>
                </div>
              </div>
              <Switch 
                checked={settings.expressShipping} 
                onCheckedChange={(checked) => setSettings({...settings, expressShipping: checked})}
                id="shipping-express" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            console.log("Button click event triggered");
            handleSaveSettings();
          }} 
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default function EcommerceStorePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store</h1>
          <p className="text-muted-foreground">
            Manage your AVEROX online store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex" onClick={() => window.open('/store', '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Store
          </Button>
          <Button onClick={() => setActiveTab('settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Store Settings
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:w-auto w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <DashboardTabContent setActiveTab={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="products" className="mt-6">
          <ProductsTabContent />
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <OrdersTabContent />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <SettingsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}