import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  ShoppingBag, 
  DollarSign, 
  CreditCard, 
  PlusCircle, 
  Package,
  ArrowUpDown,
  CalendarClock,
  Filter,
  Check,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

import { formatCurrency, formatDate } from "@/lib/utils";
import InvoiceDetail from "./accounting/invoices/detail";
import PurchaseOrderDetail from "./accounting/purchase-orders/detail";

type AccountingPageProps = {
  subPath?: string;
};

export default function AccountingPage({ subPath }: AccountingPageProps = {}) {
  const [activeTab, setActiveTab] = useState("invoices");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [entityId, setEntityId] = useState<number | null>(null);
  
  // Filter states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    minAmount: '',
    maxAmount: '',
    account: ''
  });
  
  // Date range states
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
    field: 'createdAt' | 'dueDate' | 'issueDate';
  }>({
    startDate: undefined,
    endDate: undefined,
    field: 'createdAt'
  });
  
  // Sort states
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({
    field: 'createdAt',
    direction: 'desc'
  });
  
  // Handle subPath for specific routes
  useEffect(() => {
    if (subPath) {
      const pathParts = subPath.split('/');
      if (pathParts.length >= 1) {
        // Set the active tab based on the first part of the path
        if (pathParts[0] === 'invoices') {
          setActiveTab('invoices');
          if (pathParts.length >= 2 && !isNaN(parseInt(pathParts[1]))) {
            setViewMode('detail');
            setEntityId(parseInt(pathParts[1]));
          } else {
            setViewMode('list');
            setEntityId(null);
          }
        } else if (pathParts[0] === 'purchase-orders') {
          setActiveTab('purchase-orders');
          if (pathParts.length >= 2 && !isNaN(parseInt(pathParts[1]))) {
            setViewMode('detail');
            setEntityId(parseInt(pathParts[1]));
          } else {
            setViewMode('list');
            setEntityId(null);
          }
        }
      }
    } else {
      setViewMode('list');
      setEntityId(null);
    }
  }, [subPath]);

  const { 
    data: invoices, 
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({ 
    queryKey: ['/api/invoices'], 
    enabled: activeTab === "invoices" 
  });

  const { 
    data: purchaseOrders, 
    isLoading: isLoadingPurchaseOrders,
    error: purchaseOrdersError,
  } = useQuery({ 
    queryKey: ['/api/purchase-orders'], 
    enabled: activeTab === "purchase-orders" 
  });

  useEffect(() => {
    if (invoicesError) {
      toast({
        title: "Error loading invoices",
        description: "Could not load invoices data. Please try again.",
        variant: "destructive",
      });
    }
    if (purchaseOrdersError) {
      toast({
        title: "Error loading purchase orders",
        description: "Could not load purchase orders data. Please try again.",
        variant: "destructive",
      });
    }
  }, [invoicesError, purchaseOrdersError, toast]);

  // Apply filters to invoice or purchase order data
  const applyFilters = (data) => {
    if (!data) return [];
    
    let filteredData = [...data];
    
    // Apply status filter if selected
    if (filters.status.length > 0) {
      filteredData = filteredData.filter(item => filters.status.includes(item.status));
    }
    
    // Apply amount range filters if provided
    if (filters.minAmount && !isNaN(parseFloat(filters.minAmount))) {
      filteredData = filteredData.filter(item => 
        parseFloat(item.totalAmount) >= parseFloat(filters.minAmount)
      );
    }
    
    if (filters.maxAmount && !isNaN(parseFloat(filters.maxAmount))) {
      filteredData = filteredData.filter(item => 
        parseFloat(item.totalAmount) <= parseFloat(filters.maxAmount)
      );
    }
    
    // Apply account filter if provided
    if (filters.account && filters.account.trim() !== '') {
      filteredData = filteredData.filter(item => 
        item.accountName && item.accountName.toLowerCase().includes(filters.account.toLowerCase())
      );
    }
    
    // Apply date range filter if provided
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item[dateRange.field]);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    // Apply sorting
    filteredData.sort((a, b) => {
      // Handle numeric fields
      if (['totalAmount', 'subtotal', 'taxAmount'].includes(sortOption.field)) {
        const aValue = parseFloat(a[sortOption.field] || '0');
        const bValue = parseFloat(b[sortOption.field] || '0');
        
        return sortOption.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      } 
      // Handle date fields
      else if (['createdAt', 'dueDate', 'issueDate', 'orderDate'].includes(sortOption.field)) {
        const aDate = new Date(a[sortOption.field] || 0);
        const bDate = new Date(b[sortOption.field] || 0);
        
        return sortOption.direction === 'asc' 
          ? aDate.getTime() - bDate.getTime() 
          : bDate.getTime() - aDate.getTime();
      } 
      // Handle string fields
      else {
        const aValue = String(a[sortOption.field] || '');
        const bValue = String(b[sortOption.field] || '');
        
        return sortOption.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
    });
    
    return filteredData;
  };
  
  // Get filtered data for the current active tab
  const getFilteredData = () => {
    if (activeTab === 'invoices') {
      return applyFilters(invoices);
    } else if (activeTab === 'purchase-orders') {
      return applyFilters(purchaseOrders);
    }
    return [];
  };
  
  // Handle filter apply
  const handleApplyFilter = () => {
    setFilterDialogOpen(false);
    // No need to fetch data again as we're filtering client-side
  };
  
  // Handle date range apply
  const handleApplyDateRange = () => {
    setDateRangeOpen(false);
    // No need to fetch data again as we're filtering client-side
  };
  
  // Handle sort apply
  const handleApplySort = () => {
    setSortOpen(false);
    // No need to fetch data again as we're sorting client-side
  };
  
  // Get invoice or PO status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Draft":
        return "bg-yellow-500/20 text-yellow-700";
      case "Sent":
        return "bg-blue-500/20 text-blue-700";
      case "Paid":
        return "bg-green-500/20 text-green-700";
      case "Overdue":
        return "bg-red-500/20 text-red-700";
      case "Cancelled":
        return "bg-gray-500/20 text-gray-700";
      case "Refunded":
        return "bg-purple-500/20 text-purple-700";
      case "Received":
        return "bg-green-500/20 text-green-700";
      case "Partially Received":
        return "bg-blue-500/20 text-blue-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  // If viewing detail mode, render the appropriate detail component
  if (viewMode === 'detail' && entityId) {
    if (activeTab === 'invoices') {
      // Pass the invoiceId to the InvoiceDetail component
      return <InvoiceDetail />;
    }
    if (activeTab === 'purchase-orders') {
      return <PurchaseOrderDetail purchaseOrderId={entityId} />;
    }
  }

  // Otherwise, render the main accounting page with lists
  return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-muted-foreground">
              Manage your invoices, purchase orders, and financial transactions
            </p>
          </div>
          <div className="flex gap-2">
            {/* Filter Dialog */}
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} /> Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Options</DialogTitle>
                  <DialogDescription>
                    Filter transactions by status, amount, or account
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`status-${status}`} 
                            checked={filters.status.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters({
                                  ...filters,
                                  status: [...filters.status, status]
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  status: filters.status.filter(s => s !== status)
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`status-${status}`}>{status}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="minAmount">Min Amount</Label>
                      <Input
                        id="minAmount"
                        placeholder="0.00"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="maxAmount">Max Amount</Label>
                      <Input
                        id="maxAmount"
                        placeholder="0.00"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="account">Account</Label>
                    <Input
                      id="account"
                      placeholder="Account name"
                      value={filters.account}
                      onChange={(e) => setFilters({ ...filters, account: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters({
                        status: [],
                        minAmount: '',
                        maxAmount: '',
                        account: ''
                      });
                      setFilterDialogOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleApplyFilter}>Apply Filter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Date Range Dialog */}
            <Dialog open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarClock size={16} /> Date Range
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Set Date Range</DialogTitle>
                  <DialogDescription>
                    Filter by date period
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="dateField">Date Field</Label>
                    <Select
                      value={dateRange.field}
                      onValueChange={(value) => setDateRange({
                        ...dateRange,
                        field: value as 'createdAt' | 'dueDate' | 'issueDate'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="issueDate">Issue Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left font-normal"
                          >
                            {dateRange.startDate ? (
                              format(dateRange.startDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateRange.startDate}
                            onSelect={(date) => setDateRange({...dateRange, startDate: date})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start text-left font-normal"
                          >
                            {dateRange.endDate ? (
                              format(dateRange.endDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateRange.endDate}
                            onSelect={(date) => setDateRange({...dateRange, endDate: date})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDateRange({
                        startDate: undefined,
                        endDate: undefined,
                        field: 'createdAt'
                      });
                      setDateRangeOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleApplyDateRange}>Apply</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Sort Dialog */}
            <Dialog open={sortOpen} onOpenChange={setSortOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowUpDown size={16} /> Sort
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Sort Options</DialogTitle>
                  <DialogDescription>
                    Sort transactions by field and direction
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="sortField">Sort Field</Label>
                    <Select
                      value={sortOption.field}
                      onValueChange={(value) => setSortOption({...sortOption, field: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="invoiceNumber">Invoice Number</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="totalAmount">Total Amount</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="sortDirection">Sort Direction</Label>
                    <Select
                      value={sortOption.direction}
                      onValueChange={(value) => setSortOption({
                        ...sortOption,
                        direction: value as 'asc' | 'desc'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSortOption({
                        field: 'createdAt',
                        direction: 'desc'
                      });
                      setSortOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleApplySort}>Apply</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText size={16} /> Invoices
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="flex items-center gap-2">
              <ShoppingBag size={16} /> Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <DollarSign size={16} /> Financial Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Invoices</h2>
              <Button onClick={() => setLocation("/accounting/invoices/new")} className="flex items-center gap-2">
                <PlusCircle size={16} /> Create Invoice
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingInvoices ? (
                // Loading skeleton
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-gray-200 rounded-t-lg" />
                    <CardContent className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : getFilteredData()?.length > 0 ? (
                getFilteredData().map((invoice) => (
                  <Link key={invoice.id} href={`/accounting/invoices/${invoice.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">{invoice.invoiceNumber}</CardTitle>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {invoice.accountName || "No account name"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Due Date:</span>
                          <span>{formatDate(invoice.dueDate)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="w-full flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Created: {formatDate(invoice.createdAt)}
                          </span>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                  <FileText size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Invoices Found</h3>
                  {(filters.status.length > 0 || filters.minAmount || filters.maxAmount || filters.account || 
                    (dateRange.startDate && dateRange.endDate)) ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center">
                        No invoices match your current filter criteria.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setFilters({
                            status: [],
                            minAmount: '',
                            maxAmount: '',
                            account: ''
                          });
                          setDateRange({
                            startDate: undefined,
                            endDate: undefined,
                            field: 'createdAt'
                          });
                          setSortOption({
                            field: 'createdAt',
                            direction: 'desc'
                          });
                        }}
                        className="flex items-center gap-2"
                      >
                        <X size={16} /> Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground text-center mb-4">
                        You haven't created any invoices yet. Create your first invoice to get started.
                      </p>
                      <Button 
                        onClick={() => setLocation("/accounting/invoices/new")}
                        className="flex items-center gap-2"
                      >
                        <PlusCircle size={16} /> Create Invoice
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="purchase-orders">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Purchase Orders</h2>
              <Button onClick={() => setLocation("/accounting/purchase-orders/new")} className="flex items-center gap-2">
                <PlusCircle size={16} /> Create Purchase Order
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingPurchaseOrders ? (
                // Loading skeleton
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-gray-200 rounded-t-lg" />
                    <CardContent className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : getFilteredData()?.length > 0 ? (
                getFilteredData().map((po) => (
                  <Card key={po.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium">{po.poNumber}</CardTitle>
                        <Badge className={getStatusColor(po.status)}>
                          {po.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {po.supplierName || "No supplier name"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">{formatCurrency(po.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span>{formatDate(po.orderDate)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="w-full flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Created: {formatDate(po.createdAt)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/accounting/purchase-orders/${po.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                  <ShoppingBag size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Purchase Orders Found</h3>
                  {(filters.status.length > 0 || filters.minAmount || filters.maxAmount || filters.account || 
                    (dateRange.startDate && dateRange.endDate)) ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center">
                        No purchase orders match your current filter criteria.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setFilters({
                            status: [],
                            minAmount: '',
                            maxAmount: '',
                            account: ''
                          });
                          setDateRange({
                            startDate: undefined,
                            endDate: undefined,
                            field: 'createdAt'
                          });
                          setSortOption({
                            field: 'createdAt',
                            direction: 'desc'
                          });
                        }}
                        className="flex items-center gap-2"
                      >
                        <X size={16} /> Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-muted-foreground text-center mb-4">
                        You haven't created any purchase orders yet. Create your first purchase order to get started.
                      </p>
                      <Button 
                        onClick={() => setLocation("/accounting/purchase-orders/new")}
                        className="flex items-center gap-2"
                      >
                        <PlusCircle size={16} /> Create Purchase Order
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Financial Reports</h2>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setLocation("/accounting/reports/export")}
              >
                <FileText size={16} /> Export Reports
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={18} /> Revenue Overview
                  </CardTitle>
                  <CardDescription>Summary of your revenue for current period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-medium">$24,500.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Outstanding Invoices</span>
                      <span className="font-medium">$6,320.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Overdue Invoices</span>
                      <span className="font-medium text-red-600">$1,250.00</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation("/accounting/reports/revenue")}
                  >
                    View Detailed Report
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag size={18} /> Expenses Overview
                  </CardTitle>
                  <CardDescription>Summary of your expenses for current period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Expenses</span>
                      <span className="font-medium">$18,650.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pending Payments</span>
                      <span className="font-medium">$5,120.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Profit Margin</span>
                      <span className="font-medium text-green-600">23.9%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation("/accounting/reports/expenses")}
                  >
                    View Detailed Report
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={18} /> Profit & Loss Overview
                  </CardTitle>
                  <CardDescription>Summary of your financial performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-medium">$24,500.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Expenses</span>
                      <span className="font-medium">$18,650.00</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Net Profit</span>
                      <span className="font-medium text-green-600">$5,850.00</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation("/accounting/reports/profit-loss")}
                  >
                    View Detailed Report
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={18} /> Recent Transactions
                  </CardTitle>
                  <CardDescription>Your most recent financial transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {i % 2 === 0 ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <DollarSign size={18} className="text-green-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <ShoppingBag size={18} className="text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{i % 2 === 0 ? "Invoice Payment" : "Purchase Order"}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(new Date(2025, 3, i + 1))}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${i % 2 === 0 ? "text-green-600" : "text-red-600"}`}>
                            {i % 2 === 0 ? "+" : "-"}${(1000 + i * 250).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {i % 2 === 0 ? "Acme Corp" : "Office Supplies Inc"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation("/accounting/transactions")}
                  >
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}