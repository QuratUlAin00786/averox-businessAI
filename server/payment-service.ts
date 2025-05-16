import Stripe from 'stripe';
import { apiKeys } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from './db';

// Payment processor types
export type PaymentProcessor = 'stripe' | 'paypal' | 'square' | 'authorize' | 'braintree';

// Payment method types
export type PaymentMethodType = 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'subscription' | 'invoice';

// Payment intent data interface
export interface PaymentIntentData {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  customerId?: string;
  paymentMethodId?: string;
  receiptEmail?: string;
  statementDescriptor?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
}

// Subscription data interface
export interface SubscriptionData {
  customerId: string;
  priceId: string;
  quantity?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  billingCycleAnchor?: Date;
  prorationBehavior?: 'create_prorations' | 'none';
  paymentBehavior?: 'default_incomplete' | 'default_incomplete';
}

// Get Stripe client from API keys
async function getStripeClient(): Promise<Stripe> {
  try {
    // Find Stripe API key
    const [stripeKey] = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.provider, 'Stripe'))
      .where(eq(apiKeys.isActive, true));
    
    if (!stripeKey) {
      throw new Error('No active Stripe API key found');
    }
    
    // Extract credentials from API key
    const apiKey = stripeKey.key;
    
    if (!apiKey) {
      throw new Error('Invalid Stripe credentials');
    }
    
    // Create and return Stripe client
    return new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
  } catch (error) {
    console.error('Error initializing Stripe client:', error);
    throw new Error('Could not initialize Stripe client');
  }
}

// Create a payment intent with Stripe
export async function createStripePaymentIntent(data: PaymentIntentData) {
  try {
    const stripe = await getStripeClient();
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency,
      description: data.description,
      metadata: data.metadata,
      receipt_email: data.receiptEmail,
      customer: data.customerId,
      payment_method: data.paymentMethodId,
      statement_descriptor: data.statementDescriptor?.substring(0, 22), // Max 22 chars
      setup_future_usage: data.setupFutureUsage,
    });
    
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error: any) {
    console.error('Error creating Stripe payment intent:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment intent',
    };
  }
}

// Create a Stripe customer
export async function createStripeCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  try {
    const stripe = await getStripeClient();
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error: any) {
    console.error('Error creating Stripe customer:', error);
    return {
      success: false,
      error: error.message || 'Failed to create customer',
    };
  }
}

// Create a Stripe subscription
export async function createStripeSubscription(data: SubscriptionData) {
  try {
    const stripe = await getStripeClient();
    
    const subscription = await stripe.subscriptions.create({
      customer: data.customerId,
      items: [
        {
          price: data.priceId,
          quantity: data.quantity || 1,
        },
      ],
      trial_period_days: data.trialPeriodDays,
      metadata: data.metadata,
      billing_cycle_anchor: data.billingCycleAnchor ? Math.floor(data.billingCycleAnchor.getTime() / 1000) : undefined,
      proration_behavior: data.prorationBehavior,
      payment_behavior: data.paymentBehavior as any,
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Check if we have a pending payment that requires confirmation
    let clientSecret = null;
    if (
      subscription.latest_invoice &&
      typeof subscription.latest_invoice !== 'string' &&
      subscription.latest_invoice.payment_intent &&
      typeof subscription.latest_invoice.payment_intent !== 'string'
    ) {
      clientSecret = subscription.latest_invoice.payment_intent.client_secret;
    }
    
    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
    };
  } catch (error: any) {
    console.error('Error creating Stripe subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subscription',
    };
  }
}

// Cancel a Stripe subscription
export async function cancelStripeSubscription(subscriptionId: string, immediateCancel: boolean = false) {
  try {
    const stripe = await getStripeClient();
    
    if (immediateCancel) {
      // Cancel immediately
      const canceled = await stripe.subscriptions.cancel(subscriptionId);
      return {
        success: true,
        status: canceled.status,
      };
    } else {
      // Cancel at period end
      const canceled = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return {
        success: true,
        status: canceled.status,
        cancelAt: new Date(canceled.cancel_at * 1000),
      };
    }
  } catch (error: any) {
    console.error('Error canceling Stripe subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription',
    };
  }
}

// Create a setup intent for saving payment methods
export async function createStripeSetupIntent(customerId: string, paymentMethodTypes?: string[]) {
  try {
    const stripe = await getStripeClient();
    
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: paymentMethodTypes || ['card'],
    });
    
    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      id: setupIntent.id,
    };
  } catch (error: any) {
    console.error('Error creating Stripe setup intent:', error);
    return {
      success: false,
      error: error.message || 'Failed to create setup intent',
    };
  }
}

// List payment methods for a customer
export async function listStripePaymentMethods(customerId: string, type: string = 'card') {
  try {
    const stripe = await getStripeClient();
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type as any,
    });
    
    return {
      success: true,
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.type === 'card' ? {
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        } : undefined,
        billingDetails: pm.billing_details,
        isDefault: pm.metadata?.is_default === 'true',
      })),
    };
  } catch (error: any) {
    console.error('Error listing Stripe payment methods:', error);
    return {
      success: false,
      error: error.message || 'Failed to list payment methods',
    };
  }
}

// Update payment method
export async function updateStripePaymentMethod(paymentMethodId: string, billingDetails: any) {
  try {
    const stripe = await getStripeClient();
    
    const updated = await stripe.paymentMethods.update(paymentMethodId, {
      billing_details: billingDetails,
    });
    
    return {
      success: true,
      paymentMethod: {
        id: updated.id,
        type: updated.type,
        billingDetails: updated.billing_details,
      },
    };
  } catch (error: any) {
    console.error('Error updating Stripe payment method:', error);
    return {
      success: false,
      error: error.message || 'Failed to update payment method',
    };
  }
}

// Set default payment method
export async function setDefaultStripePaymentMethod(customerId: string, paymentMethodId: string) {
  try {
    const stripe = await getStripeClient();
    
    // Update customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Update payment method's metadata to mark as default
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    // Update all payment methods' metadata
    for (const pm of paymentMethods.data) {
      await stripe.paymentMethods.update(pm.id, {
        metadata: {
          is_default: pm.id === paymentMethodId ? 'true' : 'false',
        },
      });
    }
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error setting default Stripe payment method:', error);
    return {
      success: false,
      error: error.message || 'Failed to set default payment method',
    };
  }
}

// Delete payment method
export async function deleteStripePaymentMethod(paymentMethodId: string) {
  try {
    const stripe = await getStripeClient();
    
    await stripe.paymentMethods.detach(paymentMethodId);
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error deleting Stripe payment method:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete payment method',
    };
  }
}

// Create a refund
export async function createStripeRefund(paymentIntentId: string, amount?: number) {
  try {
    const stripe = await getStripeClient();
    
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if partial refund
    });
    
    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert from cents
      status: refund.status,
    };
  } catch (error: any) {
    console.error('Error creating Stripe refund:', error);
    return {
      success: false,
      error: error.message || 'Failed to process refund',
    };
  }
}

// Get payment intent details
export async function getStripePaymentIntent(paymentIntentId: string) {
  try {
    const stripe = await getStripeClient();
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge', 'payment_method'],
    });
    
    return {
      success: true,
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customerId: paymentIntent.customer,
      paymentMethodId: paymentIntent.payment_method,
      created: new Date(paymentIntent.created * 1000),
      metadata: paymentIntent.metadata,
    };
  } catch (error: any) {
    console.error('Error retrieving Stripe payment intent:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve payment intent',
    };
  }
}

// Create an invoice for a customer
export async function createStripeInvoice(
  customerId: string,
  items: Array<{ priceId: string; quantity: number }>,
  description?: string,
  daysUntilDue?: number,
  autoAdvance: boolean = true
) {
  try {
    const stripe = await getStripeClient();
    
    // First create invoice items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        price: item.priceId,
        quantity: item.quantity,
      });
    }
    
    // Then create and finalize the invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      description,
      days_until_due: daysUntilDue,
      auto_advance: autoAdvance,
    });
    
    // Finalize the invoice if auto_advance is false
    let finalInvoice = invoice;
    if (!autoAdvance) {
      finalInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    }
    
    return {
      success: true,
      invoiceId: finalInvoice.id,
      amount: finalInvoice.total / 100, // Convert from cents
      status: finalInvoice.status,
      hosted_invoice_url: finalInvoice.hosted_invoice_url,
    };
  } catch (error: any) {
    console.error('Error creating Stripe invoice:', error);
    return {
      success: false,
      error: error.message || 'Failed to create invoice',
    };
  }
}

// PayPal integration would go here

// Authorize.net integration would go here

// Square integration would go here

// Braintree integration would go here