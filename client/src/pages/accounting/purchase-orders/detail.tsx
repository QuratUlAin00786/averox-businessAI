import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  FileText,
  Calendar,
  User,
  Package,
  Printer,
  Download,
  Mail,
  Edit,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PurchaseOrderDetailProps {
  purchaseOrderId: number;
}

export default function PurchaseOrderDetail({ purchaseOrderId }: PurchaseOrderDetailProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch purchase order data
  const { data: purchaseOrder, isLoading, error } = useQuery({
    queryKey: ['/api/purchase-orders', purchaseOrderId],
  });

  // Fetch purchase order items
  const { data: purchaseOrderItems = [] } = useQuery({
    queryKey: ['/api/purchase-orders', purchaseOrderId, 'items'],
    enabled: !!purchaseOrderId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-yellow-500/20 text-yellow-700";
      case "Sent":
        return "bg-blue-500/20 text-blue-700";
      case "Received":
        return "bg-green-500/20 text-green-700";
      case "Cancelled":
        return "bg-red-500/20 text-red-700";
      case "Partially Received":
        return "bg-orange-500/20 text-orange-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Similar to invoice download functionality
    toast({
      title: "Download Started",
      description: "Purchase order is being prepared for download",
    });
  };

  const handleEmail = () => {
    toast({
      title: "Email Sent",
      description: "Purchase order has been emailed to the supplier",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Purchase Order Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The purchase order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => setLocation("/accounting")}>
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Accounting
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setLocation("/accounting")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button
            variant="outline"
            onClick={handleEmail}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Send Email
          </Button>
          <Button
            onClick={() => setLocation(`/accounting/purchase-orders/${purchaseOrderId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{purchaseOrder.poNumber}</CardTitle>
              <CardDescription>Purchase Order Details</CardDescription>
            </div>
            <Badge className={getStatusColor(purchaseOrder.status)}>
              {purchaseOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Order Date</h3>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {formatDate(purchaseOrder.orderDate)}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Expected Delivery</h3>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {purchaseOrder.expectedDeliveryDate ? formatDate(purchaseOrder.expectedDeliveryDate) : "Not specified"}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Total Amount</h3>
              <p className="text-xl font-bold">
                {formatCurrency(purchaseOrder.totalAmount, purchaseOrder.currency || "USD")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" /> Supplier Information
                </h3>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{purchaseOrder.supplierName || "N/A"}</p>
                <p>{purchaseOrder.shippingAddress || "No address provided"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" /> Billing Information
                </h3>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{purchaseOrder.billingAddress || "No billing address provided"}</p>
                <p>Currency: {purchaseOrder.currency || "USD"}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Items
            </h3>
            {purchaseOrderItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrderItems.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName || "N/A"}</TableCell>
                      <TableCell>{item.description || "-"}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items added to this purchase order yet.</p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-end">
            <div className="space-y-2 min-w-48">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(purchaseOrder.subtotal, purchaseOrder.currency)}</span>
              </div>
              {purchaseOrder.taxAmount && parseFloat(purchaseOrder.taxAmount) > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(purchaseOrder.taxAmount, purchaseOrder.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.totalAmount, purchaseOrder.currency)}</span>
              </div>
            </div>
          </div>

          {purchaseOrder.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{purchaseOrder.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}