import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Package, 
  PlusCircle, 
  Search, 
  ArrowUpDown, 
  ArrowDownUp,
  Layers,
  Box,
  Tag,
  FileEdit,
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  ChevronLeft,
  CalendarIcon,
  Settings,
  DollarSign,
  Truck,
  ShoppingCart,
  LayoutGrid,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { formatCurrency, formatDate } from "@/lib/utils";

// Product Detail View Component
interface ProductDetailViewProps {
  productId: number;
  onBack: () => void;
}

function ProductDetailView({ productId, onBack }: ProductDetailViewProps) {
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={16} />
          Back to Products
        </Button>
        <h2 className="text-2xl font-bold">Product Details</h2>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
        </div>
      ) : product ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription>SKU: {product.sku}</CardDescription>
                </div>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-muted-foreground">
                  {product.description || "No description provided"}
                </p>
              </div>
              
              {product.attributes && (
                <div>
                  <h3 className="font-semibold mb-1">Product Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium mr-2">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setLocation(`/inventory/products/${product.id}/edit`)}
                className="flex items-center gap-2"
              >
                <FileEdit size={16} /> Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation(`/inventory/products/${product.id}/history`)}
                className="flex items-center gap-2"
              >
                <ArrowDownUp size={16} /> View History
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign size={18} className="text-muted-foreground mr-2" />
                    <span>Price</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(product.price)}</span>
                </div>
                
                {product.cost && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Settings size={18} className="text-muted-foreground mr-2" />
                      <span>Cost</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(product.cost)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Package size={18} className="text-muted-foreground mr-2" />
                    <span>Stock Level</span>
                  </div>
                  <Badge variant={product.stockLevel > 10 ? "default" : product.stockLevel > 0 ? "secondary" : "destructive"}>
                    {product.stockLevel || 0}
                  </Badge>
                </div>
                
                {product.reorderLevel && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Truck size={18} className="text-muted-foreground mr-2" />
                      <span>Reorder At</span>
                    </div>
                    <span className="font-semibold">{product.reorderLevel}</span>
                  </div>
                )}
                
                {product.taxable && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign size={18} className="text-muted-foreground mr-2" />
                      <span>Tax Rate</span>
                    </div>
                    <span className="font-semibold">{product.taxRate || 0}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.categoryName && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Tag size={18} className="text-muted-foreground mr-2" />
                      <span>Category</span>
                    </div>
                    <span className="font-semibold">{product.categoryName}</span>
                  </div>
                )}
                
                {product.barcode && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <LayoutGrid size={18} className="text-muted-foreground mr-2" />
                      <span>Barcode</span>
                    </div>
                    <span className="font-semibold">{product.barcode}</span>
                  </div>
                )}
                
                {product.weight && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ShoppingCart size={18} className="text-muted-foreground mr-2" />
                      <span>Weight</span>
                    </div>
                    <span className="font-semibold">{product.weight} kg</span>
                  </div>
                )}
                
                {product.dimensions && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Box size={18} className="text-muted-foreground mr-2" />
                      <span>Dimensions</span>
                    </div>
                    <span className="font-semibold">{product.dimensions}</span>
                  </div>
                )}
                
                {product.createdAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CalendarIcon size={18} className="text-muted-foreground mr-2" />
                      <span>Created</span>
                    </div>
                    <span className="font-semibold">{formatDate(product.createdAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Button 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setLocation(`/inventory/transactions/new?productId=${product.id}`)}
            >
              <ArrowDownUp size={16} /> Record Transaction
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <Package size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Product Not Found</h3>
          <p className="text-muted-foreground text-center mb-4">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Back to Products
          </Button>
        </div>
      )}
    </div>
  );
}

// Product History View Component
interface ProductHistoryViewProps {
  productId: number;
  onBack: () => void;
}

function ProductHistoryView({ productId, onBack }: ProductHistoryViewProps) {
  const { data: product } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });
  
  const { data: history, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}/inventory-history`],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={16} />
          Back to Products
        </Button>
        <h2 className="text-2xl font-bold">Inventory History</h2>
      </div>
      
      {product && (
        <div className="flex items-center bg-muted/20 p-4 rounded-lg">
          <Package size={24} className="text-muted-foreground mr-4" />
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-muted-foreground">SKU: {product.sku} | Current Stock: {product.stockLevel || 0}</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      ) : history && history.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        transaction.type === "Purchase" || transaction.type === "Return" ? "default" :
                        transaction.type === "Sale" ? "destructive" : 
                        "secondary"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={transaction.type === "Sale" ? "text-red-600" : "text-green-600"}>
                      {transaction.type === "Sale" ? "-" : "+"}
                      {transaction.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.referenceNumber || "—"}
                  </TableCell>
                  <TableCell>
                    {transaction.notes || "—"}
                  </TableCell>
                  <TableCell>
                    {transaction.createdByUser || "System"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
          <ArrowDownUp size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Transaction History</h3>
          <p className="text-muted-foreground text-center mb-4">
            There are no recorded transactions for this product yet.
          </p>
          <Button 
            onClick={() => setLocation(`/inventory/transactions/new?productId=${productId}`)}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} /> Record Transaction
          </Button>
        </div>
      )}
    </div>
  );
}

// Product Edit View Component
interface ProductEditViewProps {
  productId: number;
  onBack: () => void;
  onSaved: () => void;
}

function ProductEditView({ productId, onBack, onSaved }: ProductEditViewProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${productId}`],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/product-categories'],
  });

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    categoryId: '',
    stockQuantity: '',
    reorderLevel: '',
    barcode: '',
    weight: '',
    isActive: true,
    taxable: true,
    taxRate: ''
  });

  // Update form data when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || '',
        cost: product.cost || '',
        categoryId: product.categoryId?.toString() || 'none',
        stockQuantity: product.stockQuantity?.toString() || '',
        reorderLevel: product.reorderLevel?.toString() || '',
        barcode: product.barcode || '',
        weight: product.weight || '',
        isActive: product.isActive ?? true,
        taxable: product.taxable ?? true,
        taxRate: product.taxRate?.toString() || ''
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        ...formData,
        price: formData.price || '0',
        cost: formData.cost || '0',
        categoryId: formData.categoryId && formData.categoryId !== 'none' ? parseInt(formData.categoryId) : null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
        weight: parseFloat(formData.weight) || null,
        taxRate: parseFloat(formData.taxRate) || null
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "Product Updated",
          description: "The product has been successfully updated.",
        });
        onSaved();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ChevronLeft size={16} />
            Back to Products
          </Button>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={16} />
          Back to Products
        </Button>
        <h2 className="text-2xl font-bold">Edit Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode"
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active Product</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="taxable"
                  checked={formData.taxable}
                  onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="taxable">Taxable</Label>
              </div>
            </div>
            
            {formData.taxable && (
              <div className="w-48">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <FileEdit size={16} />
                Update Product
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

type InventoryPageProps = {
  subPath?: string;
};

export default function InventoryPage({ subPath }: InventoryPageProps = {}) {
  const [activeTab, setActiveTab] = useState("products");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter state management
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  
  // Sort state management
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Retrieve single product details if ID is provided
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit' | 'history'>('list');
  
  // Handle subPath for specific routes
  useEffect(() => {
    if (subPath) {
      const pathParts = subPath.split('/');
      if (pathParts.length >= 1) {
        // Set the active tab based on the first part of the path
        if (pathParts[0] === 'products') {
          setActiveTab('products');
          if (pathParts.length >= 2 && !isNaN(parseInt(pathParts[1]))) {
            setSelectedProductId(parseInt(pathParts[1]));
            if (pathParts.length >= 3) {
              if (pathParts[2] === 'edit') {
                setViewMode('edit');
              } else if (pathParts[2] === 'history') {
                setViewMode('history');
              }
            } else {
              setViewMode('detail');
            }
          } else {
            setViewMode('list');
          }
        } else if (pathParts[0] === 'categories') {
          setActiveTab('categories');
        } else if (pathParts[0] === 'transactions') {
          setActiveTab('transactions');
        } else if (pathParts[0] === 'status') {
          setActiveTab('status');
        }
      }
    }
  }, [subPath]);

  const { 
    data: products, 
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({ 
    queryKey: ['/api/products'], 
    enabled: activeTab === "products" 
  });

  const { 
    data: categories, 
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({ 
    queryKey: ['/api/product-categories'], 
    enabled: activeTab === "categories" 
  });

  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery({ 
    queryKey: ['/api/inventory-transactions'], 
    enabled: activeTab === "transactions" 
  });

  const { 
    data: summary, 
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useQuery({ 
    queryKey: ['/api/inventory-summary'], 
    enabled: activeTab === "summary" 
  });

  if (productsError || categoriesError || transactionsError || summaryError) {
    toast({
      title: "Error loading inventory data",
      description: "Could not load inventory data. Please try again.",
      variant: "destructive",
    });
  }

  const filteredAndSortedProducts = products?.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active" && !product.isActive) return false;
      if (statusFilter === "inactive" && product.isActive) return false;
    }

    // Stock filter
    if (stockFilter !== "all") {
      const stockQuantity = product.stockQuantity || 0;
      if (stockFilter === "in-stock" && stockQuantity <= 0) return false;
      if (stockFilter === "low-stock" && (stockQuantity > product.reorderLevel || stockQuantity <= 0)) return false;
      if (stockFilter === "out-of-stock" && stockQuantity > 0) return false;
    }

    // Price range filter
    if (priceRangeFilter !== "all") {
      const price = parseFloat(product.price);
      if (priceRangeFilter === "under-50" && price >= 50) return false;
      if (priceRangeFilter === "50-100" && (price < 50 || price >= 100)) return false;
      if (priceRangeFilter === "100-500" && (price < 100 || price >= 500)) return false;
      if (priceRangeFilter === "over-500" && price < 500) return false;
    }

    return true;
  })?.sort((a, b) => {
    // Sort logic
    let comparison = 0;
    
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "sku":
        comparison = a.sku.localeCompare(b.sku);
        break;
      case "price":
        comparison = parseFloat(a.price) - parseFloat(b.price);
        break;
      case "stock":
        comparison = (a.stockQuantity || 0) - (b.stockQuantity || 0);
        break;
      case "status":
        comparison = (a.isActive === b.isActive) ? 0 : (a.isActive ? -1 : 1);
        break;
      case "created":
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage your product inventory, stock levels, and transactions
            </p>
          </div>

          <div className="flex gap-2">
            {activeTab === "products" && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <Filter size={16} /> Filter
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsSortDialogOpen(true)}
            >
              <ArrowUpDown size={16} /> Sort
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 overflow-x-auto">
            <TabsTrigger value="products" className="flex items-center gap-2 whitespace-nowrap">
              <Package size={16} /> Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2 whitespace-nowrap">
              <Tag size={16} /> Categories
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2 whitespace-nowrap">
              <ArrowDownUp size={16} /> Transactions
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2 whitespace-nowrap">
              <Settings size={16} /> Status
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2 whitespace-nowrap">
              <Layers size={16} /> Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {selectedProductId && viewMode === 'detail' ? (
              <ProductDetailView 
                productId={selectedProductId} 
                onBack={() => {
                  setSelectedProductId(null);
                  setViewMode('list');
                  setLocation('/inventory');
                }}
              />
            ) : selectedProductId && viewMode === 'history' ? (
              <ProductHistoryView 
                productId={selectedProductId} 
                onBack={() => {
                  setSelectedProductId(null);
                  setViewMode('list');
                  setLocation('/inventory');
                }}
              />
            ) : selectedProductId && viewMode === 'edit' ? (
              <ProductEditView 
                productId={selectedProductId} 
                onBack={() => {
                  setSelectedProductId(null);
                  setViewMode('list');
                  setLocation('/inventory');
                }}
                onSaved={() => {
                  setSelectedProductId(null);
                  setViewMode('list');
                  setLocation('/inventory');
                }}
              />
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-semibold">Products</h2>
                  <Button onClick={() => setLocation("/inventory/products/new")} className="flex items-center gap-2">
                    <PlusCircle size={16} /> Add Product
                  </Button>
                </div>

                {isLoadingProducts ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className="h-16">
                              <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-4 py-1">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : filteredAndSortedProducts?.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.categoryName || 'Uncategorized'}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <Badge variant={product.stockLevel > 10 ? "default" : product.stockLevel > 0 ? "secondary" : "destructive"}>
                            {product.stockLevel || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setLocation(`/inventory/products/${product.id}`)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setLocation(`/inventory/products/${product.id}/edit`)}
                                className="cursor-pointer"
                              >
                                <FileEdit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setLocation(`/inventory/products/${product.id}/history`)}
                                className="cursor-pointer"
                              >
                                <ArrowDownUp className="mr-2 h-4 w-4" /> History
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={() => {
                                  toast({
                                    title: "Delete product",
                                    description: "Are you sure you want to delete this product?",
                                    variant: "destructive",
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <Search size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No products match your search query "{searchQuery}".
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <Package size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't added any products yet. Add your first product to get started.
                </p>
                <Button 
                  onClick={() => setLocation("/inventory/products/new")}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} /> Add Product
                </Button>
              </div>
            )}
          </>
          )}
          </TabsContent>

          <TabsContent value="categories">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Product Categories</h2>
              <Button onClick={() => setLocation("/inventory/categories/new")} className="flex items-center gap-2">
                <PlusCircle size={16} /> Add Category
              </Button>
            </div>

            {isLoadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : categories?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        {category.productCount || 0} products
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        {category.description || 'No description'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setLocation(`/inventory/categories/${category.id}/edit`)}
                        className="flex items-center gap-1"
                      >
                        <FileEdit size={14} /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLocation(`/inventory/categories/${category.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Eye size={14} /> View Products
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <Tag size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Categories Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't created any product categories yet. Create your first category to better organize your products.
                </p>
                <Button 
                  onClick={() => setLocation("/inventory/categories/new")}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} /> Add Category
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Inventory Transactions</h2>
              <Button onClick={() => setLocation("/inventory/transactions/new")} className="flex items-center gap-2">
                <PlusCircle size={16} /> New Transaction
              </Button>
            </div>

            {isLoadingTransactions ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="h-16">
                          <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-4 py-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : transactions?.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {transaction.productName}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.type === "Purchase" || transaction.type === "Return" ? "default" :
                              transaction.type === "Sale" ? "destructive" : 
                              "secondary"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={transaction.type === "Sale" ? "text-red-600" : "text-green-600"}>
                            {transaction.type === "Sale" ? "-" : "+"}
                            {transaction.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          {transaction.referenceId ? (
                            <Link 
                              href={`/inventory/transactions/${transaction.referenceId}`}
                              className="text-blue-600 hover:underline"
                            >
                              {transaction.referenceNumber || transaction.referenceId}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{transaction.createdByName || "System"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/inventory/transactions/${transaction.id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye size={14} /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <ArrowDownUp size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't recorded any inventory transactions yet. Create your first transaction to track inventory movements.
                </p>
                <Button 
                  onClick={() => setLocation("/inventory/transactions/new")}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} /> New Transaction
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="status">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Inventory Status</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <FileEdit size={16} /> Export Status Report
              </Button>
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{products.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {products.filter(p => p.isActive).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.stockQuantity <= p.reorderLevel).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.stockQuantity === 0).length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-semibold mb-3">Stock Status Overview</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Reorder Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const stockLevel = product.stockQuantity || 0;
                        const reorderLevel = product.reorderLevel || 0;
                        const isLowStock = stockLevel <= reorderLevel && stockLevel > 0;
                        const isOutOfStock = stockLevel === 0;
                        const isGoodStock = stockLevel > reorderLevel;
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>
                              <Badge variant={
                                isOutOfStock ? "destructive" : 
                                isLowStock ? "secondary" : 
                                "default"
                              }>
                                {stockLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>{reorderLevel}</TableCell>
                            <TableCell>
                              <Badge variant={
                                isOutOfStock ? "destructive" : 
                                isLowStock ? "secondary" : 
                                "default"
                              }>
                                {isOutOfStock ? "Out of Stock" : 
                                 isLowStock ? "Low Stock" : 
                                 "Good Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {product.updatedAt ? formatDate(product.updatedAt) : formatDate(product.createdAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/inventory/products/${product.id}`)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye size={14} /> View
                                </Button>
                                {(isLowStock || isOutOfStock) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLocation(`/inventory/transactions/new?productId=${product.id}&type=Purchase`)}
                                    className="flex items-center gap-1"
                                  >
                                    <PlusCircle size={14} /> Restock
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <Package size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Products Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add products to your inventory to see their status here.
                </p>
                <Button 
                  onClick={() => setLocation("/inventory/products/new")}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} /> Add Product
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Inventory Summary</h2>
              <Button variant="outline" className="flex items-center gap-2">
                <FileEdit size={16} /> Export Report
              </Button>
            </div>

            {isLoadingSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : summary ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{summary.totalProducts || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalValue || 0)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-yellow-600">{summary.lowStockCount || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Out of Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">{summary.outOfStockCount || 0}</p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-semibold mb-3">Low Stock Alerts</h3>
                {summary.lowStockItems?.length > 0 ? (
                  <div className="rounded-md border mb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Reorder Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.lowStockItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>
                              <Badge variant={item.stockLevel === 0 ? "destructive" : "secondary"}>
                                {item.stockLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.reorderLevel}</TableCell>
                            <TableCell>
                              <Badge variant={item.stockLevel === 0 ? "destructive" : "secondary"}>
                                {item.stockLevel === 0 ? "Out of Stock" : "Low Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/inventory/reorder/${item.id}`)}
                                className="flex items-center gap-1"
                              >
                                <PlusCircle size={14} /> Reorder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center text-center p-4">
                        <p className="text-muted-foreground">No low stock items at the moment.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
                {summary.topSellingProducts?.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Units Sold</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.topSellingProducts.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>{item.stockLevel}</TableCell>
                            <TableCell>{item.unitsSold}</TableCell>
                            <TableCell>{formatCurrency(item.revenue)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/inventory/products/${item.id}`)}
                                className="flex items-center gap-1"
                              >
                                <Eye size={14} /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center text-center p-4">
                        <p className="text-muted-foreground">No sales data available yet.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                <Layers size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Inventory Data</h3>
                <p className="text-muted-foreground text-center mb-4">
                  There's no inventory data available yet. Add products and record transactions to see inventory summary.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setLocation("/inventory/products/new")}
                    className="flex items-center gap-2"
                  >
                    <Package size={16} /> Add Products
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/inventory/transactions/new")}
                    className="flex items-center gap-2"
                  >
                    <ArrowDownUp size={16} /> Record Transaction
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Filter Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Products</DialogTitle>
              <DialogDescription>
                Apply filters to narrow down your product list
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Level</label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Price Ranges</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-500">$100 - $500</SelectItem>
                    <SelectItem value="over-500">Over $500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter("all");
                    setStockFilter("all");
                    setPriceRangeFilter("all");
                    toast({
                      title: "Filters Cleared",
                      description: "All filters have been reset",
                    });
                  }}
                >
                  Clear All
                </Button>
                <Button onClick={() => {
                  setIsFilterDialogOpen(false);
                  toast({
                    title: "Filters Applied",
                    description: "Product list has been filtered successfully",
                  });
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sort Dialog */}
        <Dialog open={isSortDialogOpen} onOpenChange={setIsSortDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Sort Products
              </DialogTitle>
              <DialogDescription>
                Choose how you want to sort the product list
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Product Name</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="stockLevel">Stock Level</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select value={sortDirection} onValueChange={setSortDirection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending (A-Z, Low to High)</SelectItem>
                    <SelectItem value="desc">Descending (Z-A, High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSortField("name");
                    setSortDirection("asc");
                    toast({
                      title: "Sort Reset",
                      description: "Sort options have been reset to default",
                    });
                  }}
                >
                  Reset
                </Button>
                <Button onClick={() => {
                  setIsSortDialogOpen(false);
                  toast({
                    title: "Sort Applied",
                    description: `Products sorted by ${sortField} in ${sortDirection === 'asc' ? 'ascending' : 'descending'} order`,
                  });
                }}>
                  Apply Sort
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
}