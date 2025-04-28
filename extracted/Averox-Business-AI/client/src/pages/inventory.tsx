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

type InventoryPageProps = {
  subPath?: string;
};

export default function InventoryPage({ subPath }: InventoryPageProps = {}) {
  const [activeTab, setActiveTab] = useState("products");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const filteredProducts = products?.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
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
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} /> Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowUpDown size={16} /> Sort
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={16} /> Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag size={16} /> Categories
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <ArrowDownUp size={16} /> Transactions
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <Layers size={16} /> Inventory Summary
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
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedProductId(null);
                    setViewMode('list');
                    setLocation('/inventory');
                  }}
                  className="mb-4"
                >
                  Back to Products
                </Button>
                <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
                {/* Product edit form will be added here */}
              </div>
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
                ) : filteredProducts?.length > 0 ? (
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
                    {filteredProducts.map((product) => (
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
      </div>
  );
}