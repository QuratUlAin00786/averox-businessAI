import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CardDescription, CardTitle } from '@/components/ui/card';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  invoiceId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function PaymentFormInner({ clientSecret, amount, invoiceId, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/accounting/invoices/${invoiceId}/confirmation`,
          // Could store metadata about the invoice here if needed
          payment_method_data: {
            billing_details: {
              // Optional billing details
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful',
          description: 'Your payment has been processed successfully.',
        });
        
        // Update the invoice status to "Paid"
        try {
          const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Paid' }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update invoice status');
          }
          
          if (onSuccess) onSuccess();
        } catch (updateError) {
          console.error('Error updating invoice status:', updateError);
          toast({
            title: 'Warning',
            description: 'Payment successful, but failed to update invoice status.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment processing error',
        description: 'There was a problem processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Please provide your payment details to process the payment of ${(amount / 100).toFixed(2)}
        </CardDescription>
        <PaymentElement />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  // We need to use the Elements provider outside of this component

  return (
    <PaymentFormInner {...props} />
  );
}