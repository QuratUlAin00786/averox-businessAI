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
async function getStripeClient() {
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

    // Extract additional fields for configuration
    const additionalFields = stripeKey.additionalFields as Record<string, any> || {};
    
    // Update usage statistics
    await db.update(apiKeys)
      .set({
        usageCount: (stripeKey.usageCount || 0) + 1,
        lastUsed: new Date()
      })
      .where(eq(apiKeys.id, stripeKey.id));
    
    // Create Stripe client
    const client = new Stripe(apiKey, {
      apiVersion: '2025-04-30.basil',
    });
    
    // Return both the client and additional configuration
    return {
      client,
      config: {
        additionalFields,
        webhookSecret: additionalFields.webhookSecret,
        allowedPaymentMethods: additionalFields.allowedPaymentMethods || ['card']
      }
    };
  } catch (error: any) {
    console.error('Error initializing Stripe client:', error);
    throw new Error('Could not initialize Stripe client: ' + (error.message || 'Unknown error'));
  }
}

// Create a payment intent with Stripe
export async function createStripePaymentIntent(data: PaymentIntentData) {
  try {
    const stripeData = await getStripeClient();
    const { client, config } = stripeData;
    
    // Validate allowed payment methods if configured
    if (data.paymentMethodId && config.allowedPaymentMethods && config.allowedPaymentMethods.length > 0) {
      const paymentMethod = 'card'; // Default to card
      if (!config.allowedPaymentMethods.includes(paymentMethod)) {
        throw new Error(`Payment method ${paymentMethod} is not allowed. Allowed methods: ${config.allowedPaymentMethods.join(', ')}`);
      }
    }
    
    const paymentIntent = await client.paymentIntents.create({
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const customer = await client.customers.create({
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const subscription = await client.subscriptions.create({
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
    
    // Access payment intent data safely with proper type handling
    if (subscription.latest_invoice) {
      // Get the invoice object, handling the case where it might be an ID string or expanded object
      const invoice = typeof subscription.latest_invoice === 'string' 
        ? await client.invoices.retrieve(subscription.latest_invoice)
        : subscription.latest_invoice;
        
      // Get payment intent from invoice using a safer approach
      // The invoice.payment_intent property is not properly typed in some versions
      const paymentIntentData = (invoice as any).payment_intent;
      
      if (paymentIntentData) {
        const paymentIntentId = typeof paymentIntentData === 'string'
          ? paymentIntentData
          : paymentIntentData.id;
          
        // Retrieve the full payment intent to get the client secret
        if (paymentIntentId) {
          const paymentIntent = await client.paymentIntents.retrieve(paymentIntentId);
          clientSecret = paymentIntent.client_secret;
        }
      }
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    if (immediateCancel) {
      // Cancel immediately
      const canceled = await client.subscriptions.cancel(subscriptionId);
      return {
        success: true,
        status: canceled.status,
      };
    } else {
      // Cancel at period end
      const canceled = await client.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      
      // Calculate cancelAt date safely
      const cancelAtDate = canceled.cancel_at 
        ? new Date(canceled.cancel_at * 1000) 
        : undefined;
        
      return {
        success: true,
        status: canceled.status,
        cancelAt: cancelAtDate,
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const setupIntent = await client.setupIntents.create({
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const paymentMethods = await client.paymentMethods.list({
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const updated = await client.paymentMethods.update(paymentMethodId, {
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    // Update customer's default payment method
    await client.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Update payment method's metadata to mark as default
    const paymentMethods = await client.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    // Update all payment methods' metadata
    for (const pm of paymentMethods.data) {
      await client.paymentMethods.update(pm.id, {
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    await client.paymentMethods.detach(paymentMethodId);
    
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const refund = await client.refunds.create({
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    const paymentIntent = await client.paymentIntents.retrieve(paymentIntentId, {
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
    const stripeData = await getStripeClient();
    const { client } = stripeData;
    
    // First create invoice items
    for (const item of items) {
      // For each item, we need different parameters depending on whether we have a price ID
      const params: any = {
        customer: customerId,
        quantity: item.quantity
      };
      
      // Add either price or price_data based on the provided price ID format
      if (item.priceId.startsWith('price_')) {
        params.price = item.priceId;
      } else {
        // Create a custom price for non-standard price IDs
        params.unit_amount = 1000; // Example $10.00 (in cents)
        params.currency = 'usd';   // Default to USD, can be made configurable
        params.description = `Invoice item (${item.priceId})`;
      }
      
      await client.invoiceItems.create(params);
    }
    
    // Then create and finalize the invoice
    const invoice = await client.invoices.create({
      customer: customerId,
      description,
      days_until_due: daysUntilDue,
      auto_advance: autoAdvance,
    });
    
    // Finalize the invoice if auto_advance is false
    let finalInvoice = invoice;
    if (!autoAdvance && invoice.id) {
      finalInvoice = await client.invoices.finalizeInvoice(invoice.id);
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