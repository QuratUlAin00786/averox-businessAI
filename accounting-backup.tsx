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
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { formatCurrency, formatDate } from "@/lib/utils";

type AccountingPageProps = {
  subPath?: string;
};

export default function AccountingPage({ subPath }: AccountingPageProps = {}) {
  const [activeTab, setActiveTab] = useState("invoices");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Handle subPath for specific routes
  useEffect(() => {
    if (subPath) {
      const pathParts = subPath.split('/');
      if (pathParts.length >= 1) {
        // Set the active tab based on the first part of the path
        if (pathParts[0] === 'invoices') {
          setActiveTab('invoices');
        } else if (pathParts[0] === 'purchase-orders') {
          setActiveTab('purchase-orders');
        }
      }
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
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} /> Filter
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarClock size={16} /> Date Range
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowUpDown size={16} /> Sort
            </Button>
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
              ) : invoices?.length > 0 ? (
                invoices.map((invoice) => (
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
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't created any invoices yet. Create your first invoice to get started.
                  </p>
                  <Button 
                    onClick={() => setLocation("/accounting/invoices/new")}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle size={16} /> Create Invoice
                  </Button>
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
              ) : purchaseOrders?.length > 0 ? (
                purchaseOrders.map((po) => (
                  <Link key={po.id} href={`/accounting/purchase-orders/${po.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/10">
                  <ShoppingBag size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Purchase Orders Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't created any purchase orders yet. Create your first purchase order to get started.
                  </p>
                  <Button 
                    onClick={() => setLocation("/accounting/purchase-orders/new")}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle size={16} /> Create Purchase Order
                  </Button>
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
                  <Button variant="outline" className="w-full">View Detailed Report</Button>
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
                  <Button variant="outline" className="w-full">View Detailed Report</Button>
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
                  <Button variant="outline" className="w-full">View All Transactions</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}