import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PaymentForm from '@/components/accounting/PaymentForm';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function InvoicePayment() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const invoiceId = parseInt(id || '0');

  // Fetch invoice details
  const { data: invoice, isLoading: isLoadingInvoice, error: invoiceError } = useQuery({
    queryKey: ['/api/invoices', invoiceId],
    enabled: !!invoiceId,
  });

  // Create payment intent when invoice is loaded
  useEffect(() => {
    if (invoice && invoice.totalAmount !== undefined && !isLoadingInvoice) {
      const amount = parseFloat(invoice.totalAmount);
      
      // Check if amount is valid for payment processing
      if (isNaN(amount) || amount <= 0) {
        console.log('Invoice amount is zero or invalid, skipping payment setup');
        return;
      }

      const createPaymentIntent = async () => {
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: amount,
              invoiceId: invoice.id
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to create payment intent');
          }

          const data = await response.json();
          
          // Handle zero-amount invoices
          if (!data.requiresPayment) {
            toast({
              title: 'No Payment Required',
              description: 'This invoice has a zero amount and does not require payment.',
            });
            setLocation(`/accounting/invoices/${invoiceId}`);
            return;
          }
          
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error('Error creating payment intent:', error);
          toast({
            title: 'Payment Setup Failed',
            description: error instanceof Error ? error.message : 'Unable to initialize payment processing. Please try again.',
            variant: 'destructive',
          });
        }
      };

      createPaymentIntent();
    }
  }, [invoice, isLoadingInvoice, toast]);

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful',
      description: 'Your invoice has been paid successfully.',
    });
    // Redirect to invoice details page
    setLocation(`/accounting/invoices/${invoiceId}`);
  };

  const handleCancel = () => {
    setLocation(`/accounting/invoices/${invoiceId}`);
  };

  if (isLoadingInvoice || !invoice) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (invoiceError) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>Failed to load invoice details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the invoice information. Please try again.</p>
          </CardContent>
          <CardFooter>
            <button
              onClick={() => setLocation('/accounting')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return to Accounting
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (invoice.status === 'Paid') {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-600">Invoice Already Paid</CardTitle>
            <CardDescription>This invoice has already been paid</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Invoice Number:</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span>${parseFloat(invoice.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <button
              onClick={() => setLocation('/accounting')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 w-full"
            >
              Return to Accounting
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check for zero amount invoices
  const invoiceAmount = parseFloat(invoice.totalAmount);
  if (invoiceAmount <= 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-600">No Payment Required</CardTitle>
            <CardDescription>This invoice has no amount due</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Invoice Number:</span>
                <span>{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Due Date:</span>
                <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span>${invoiceAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span>{invoice.status}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                This invoice does not require payment as the total amount is $0.00.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <button
              onClick={() => setLocation('/accounting')}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 w-full"
            >
              Return to Accounting
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Invoice Payment</CardTitle>
          <CardDescription>
            Complete payment for invoice #{invoice.invoiceNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium mb-2">Invoice Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <span>{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${parseFloat(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span>${parseFloat(invoice.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${parseFloat(invoice.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#0f172a',
                    },
                  },
                }}
              >
                <PaymentForm
                  clientSecret={clientSecret}
                  amount={parseFloat(invoice.totalAmount) * 100} // Convert to cents
                  invoiceId={invoiceId}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                />
              </Elements>
            ) : (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Initializing payment...
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}