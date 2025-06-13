import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Package, User, FileText } from "lucide-react";

interface TransactionDetailProps {
  transactionId: string;
}

export default function TransactionDetail({ transactionId }: TransactionDetailProps) {
  const [, setLocation] = useLocation();
  const id = parseInt(transactionId);

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['/api/inventory-transactions', id],
    queryFn: async () => {
      const response = await fetch(`/api/inventory-transactions/${id}`);
      if (!response.ok) {
        throw new Error('Transaction not found');
      }
      return response.json();
    },
  });

  const { data: product } = useQuery({
    queryKey: ['/api/products', transaction?.productId],
    queryFn: async () => {
      if (!transaction?.productId) return null;
      const response = await fetch(`/api/products/${transaction.productId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!transaction?.productId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Transaction Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The requested transaction could not be found.
              </p>
              <Button onClick={() => setLocation("/inventory")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Purchase': return 'bg-green-100 text-green-800';
      case 'Sale': return 'bg-red-100 text-red-800';
      case 'Transfer': return 'bg-blue-100 text-blue-800';
      case 'Adjustment': return 'bg-yellow-100 text-yellow-800';
      case 'Return': return 'bg-purple-100 text-purple-800';
      case 'ProductionOutput': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatQuantity = (quantity: string | number, type: string) => {
    const qty = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    const sign = ['Sale', 'Transfer'].includes(type) && qty > 0 ? '-' : '+';
    return `${sign}${qty}`;
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/inventory")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <CardTitle>Transaction Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transaction Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">#{transaction.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge className={getTransactionTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">
                    {formatQuantity(transaction.quantity, transaction.type)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{transaction.createdByName || "System"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Information</h3>
              
              {product ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product Name:</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${product.price}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>Product information not available</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transaction.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{transaction.location}</p>
                </div>
              )}
              
              {transaction.unitCost && (
                <div>
                  <span className="text-muted-foreground">Unit Cost:</span>
                  <p className="font-medium">${transaction.unitCost}</p>
                </div>
              )}
              
              {transaction.batchId && (
                <div>
                  <span className="text-muted-foreground">Batch ID:</span>
                  <p className="font-medium">{transaction.batchId}</p>
                </div>
              )}
              
              {transaction.serialNumber && (
                <div>
                  <span className="text-muted-foreground">Serial Number:</span>
                  <p className="font-medium">{transaction.serialNumber}</p>
                </div>
              )}
              
              {transaction.expiryDate && (
                <div>
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <p className="font-medium">{new Date(transaction.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {transaction.referenceId && (
                <div>
                  <span className="text-muted-foreground">Reference ID:</span>
                  <p className="font-medium">{transaction.referenceId}</p>
                </div>
              )}
            </div>
            
            {transaction.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1 p-3 bg-muted rounded-md">{transaction.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}