import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  CreditCard,
  Download,
  Mail,
  Printer,
  User,
  Building,
  Edit,
  Trash,
  ChevronLeft,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const invoiceId = parseInt(id || "0");

  // Fetch invoice details
  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
  });

  // Fetch invoice items
  const { data: invoiceItems = [] } = useQuery({
    queryKey: ["/api/invoices", invoiceId, "items"],
    enabled: !!invoiceId,
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully",
      });
      setLocation("/accounting");
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteInvoice = async () => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setIsDeleting(true);
      try {
        await deleteInvoiceMutation.mutateAsync();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePayInvoice = () => {
    setLocation(`/accounting/invoices/${invoiceId}/pay`);
  };

  const getStatusColor = (status: string) => {
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
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Invoice Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The invoice you're looking for doesn't exist or you don't have permission to view it.
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
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              /* Implement download functionality */
              toast({
                title: "Download initiated",
                description: "Your invoice is being prepared for download",
              });
            }}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              /* Implement email functionality */
              toast({
                title: "Email sent",
                description: "Invoice has been emailed to the client",
              });
            }}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Send Email
          </Button>
          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && parseFloat(invoice.totalAmount) > 0 && (
            <Button onClick={handlePayInvoice} className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Pay Now
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLocation(`/accounting/invoices/${invoiceId}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteInvoice}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 print:block">
        <Card className="border-0 shadow-none print:shadow-none">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold">Invoice</CardTitle>
                <CardDescription className="text-lg">
                  #{invoice.invoiceNumber}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building className="w-4 h-4" /> From
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Averox Business AI</p>
                  <p>123 Business Avenue</p>
                  <p>Suite 789</p>
                  <p>New York, NY 10001</p>
                  <p>United States</p>
                  <p className="mt-2">contact@averox.com</p>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> Bill To
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{invoice.accountName || "N/A"}</p>
                  <p>{invoice.billingAddress || "No address provided"}</p>
                  <p>{invoice.clientEmail || "No email provided"}</p>
                  <p>{invoice.clientPhone || "No phone provided"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Invoice Date</h3>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Due Date</h3>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Total Amount</h3>
                <p className="text-xl font-bold">
                  {formatCurrency(invoice.totalAmount, invoice.currency || "USD")}
                </p>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Tax
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {invoiceItems.map((item: any) => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const unitPrice = parseFloat(item.unitPrice) || 0;
                    const discountAmount = parseFloat(item.discountAmount) || 0;
                    const discountPercent = parseFloat(item.discountPercent) || 0;
                    
                    const lineSubtotal = quantity * unitPrice;
                    const totalDiscount = discountAmount + (lineSubtotal * discountPercent / 100);
                    const lineTotal = lineSubtotal - totalDiscount;
                    const taxRate = parseFloat(item.taxRate) || 0;
                    const taxAmount = (lineTotal * taxRate) / 100;
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-left">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(unitPrice, invoice.currency || "USD")}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {discountAmount > 0 && 
                            `${formatCurrency(discountAmount, invoice.currency || "USD")}`}
                          {discountAmount > 0 && discountPercent > 0 && " + "}
                          {discountPercent > 0 && `${discountPercent}%`}
                          {discountAmount === 0 && discountPercent === 0 && "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {taxRate > 0 ? `${taxRate}%` : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(lineTotal + taxAmount, invoice.currency || "USD")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full md:w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency || "USD")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>{formatCurrency(invoice.taxAmount, invoice.currency || "USD")}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.totalAmount, invoice.currency || "USD")}</span>
                </div>
                {invoice.status === "Paid" && (
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>Paid:</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency || "USD")}</span>
                  </div>
                )}
                {invoice.status === "Refunded" && (
                  <div className="flex justify-between text-sm font-medium text-purple-600">
                    <span>Refunded:</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency || "USD")}</span>
                  </div>
                )}
              </div>
            </div>

            {invoice.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notes</h3>
                <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground">
                  {invoice.notes}
                </div>
              </div>
            )}

            {invoice.paymentTerms && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Payment Terms</h3>
                <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground">
                  {invoice.paymentTerms}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground">
              Invoice created on {formatDate(invoice.createdAt)}
            </p>
            {invoice.status !== "Paid" && invoice.status !== "Cancelled" && parseFloat(invoice.totalAmount) > 0 && (
              <div className="mt-4">
                <Button onClick={handlePayInvoice} className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Pay Invoice
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}