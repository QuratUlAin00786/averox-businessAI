import { Router } from 'express';
import {
  createStripePaymentIntent,
  createStripeCustomer,
  createStripeSubscription,
  cancelStripeSubscription,
  createStripeSetupIntent,
  listStripePaymentMethods,
  updateStripePaymentMethod,
  setDefaultStripePaymentMethod,
  deleteStripePaymentMethod,
  createStripeRefund,
  getStripePaymentIntent,
  createStripeInvoice
} from './payment-service';
import { isAuthenticated, isAdmin } from './middleware/auth';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const paymentRouter = Router();

// Secure all payment routes
paymentRouter.use(isAuthenticated);

// Create a payment intent
paymentRouter.post('/intent', async (req, res) => {
  try {
    const { amount, currency, description, metadata, customerId, paymentMethodId, receiptEmail } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await createStripePaymentIntent({
      amount,
      currency,
      description,
      metadata,
      customerId,
      paymentMethodId,
      receiptEmail,
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment intent', error: error.message });
  }
});

// Create a customer
paymentRouter.post('/customer', async (req, res) => {
  try {
    const { email, name, metadata } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await createStripeCustomer(email, name, metadata);
    
    // If customer was created successfully and user is authenticated, store the customer ID in the user record
    if (result.success && req.user) {
      await db.update(users)
        .set({ stripeCustomerId: result.customerId })
        .where(eq(users.id, req.user.id));
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer', error: error.message });
  }
});

// Create a subscription
paymentRouter.post('/subscription', async (req, res) => {
  try {
    const { customerId, priceId, quantity, trialPeriodDays, metadata } = req.body;
    
    if (!customerId || !priceId) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await createStripeSubscription({
      customerId,
      priceId,
      quantity,
      trialPeriodDays,
      metadata,
      paymentBehavior: 'default_incomplete'
    });
    
    // If subscription was created successfully and user is authenticated, store the subscription ID in the user record
    if (result.success && req.user && result.subscriptionId) {
      await db.update(users)
        .set({ stripeSubscriptionId: result.subscriptionId })
        .where(eq(users.id, req.user.id));
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to create subscription', error: error.message });
  }
});

// Cancel a subscription
paymentRouter.post('/subscription/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediate } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'Missing subscription ID' });
    }
    
    // Check if user is authorized to cancel this subscription
    if (req.user.stripeSubscriptionId !== subscriptionId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this subscription' });
    }
    
    const result = await cancelStripeSubscription(subscriptionId, immediate);
    
    // If subscription was canceled successfully, update the user record
    if (result.success && req.user && req.user.stripeSubscriptionId === subscriptionId) {
      // Only clear the subscription ID if canceled immediately
      if (immediate) {
        await db.update(users)
          .set({ stripeSubscriptionId: null })
          .where(eq(users.id, req.user.id));
      }
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription', error: error.message });
  }
});

// Create a setup intent for saving payment methods
paymentRouter.post('/setup-intent', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Missing customer ID' });
    }
    
    const result = await createStripeSetupIntent(customerId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ success: false, message: 'Failed to create setup intent', error: error.message });
  }
});

// List payment methods for a customer
paymentRouter.get('/payment-methods/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { type } = req.query;
    
    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Missing customer ID' });
    }
    
    // Check if user is authorized to view this customer's payment methods
    if (req.user.stripeCustomerId !== customerId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view payment methods for this customer' });
    }
    
    const result = await listStripePaymentMethods(customerId, type as string);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error listing payment methods:', error);
    res.status(500).json({ success: false, message: 'Failed to list payment methods', error: error.message });
  }
});

// Update payment method
paymentRouter.patch('/payment-method/:paymentMethodId', async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const { billingDetails } = req.body;
    
    if (!paymentMethodId || !billingDetails) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    // We would need additional checks to verify ownership of the payment method
    
    const result = await updateStripePaymentMethod(paymentMethodId, billingDetails);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment method', error: error.message });
  }
});

// Set default payment method
paymentRouter.post('/payment-method/:paymentMethodId/default', async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const { customerId } = req.body;
    
    if (!paymentMethodId || !customerId) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    // Check if user is authorized to modify this customer's payment methods
    if (req.user.stripeCustomerId !== customerId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify payment methods for this customer' });
    }
    
    const result = await setDefaultStripePaymentMethod(customerId, paymentMethodId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to set default payment method', error: error.message });
  }
});

// Delete payment method
paymentRouter.delete('/payment-method/:paymentMethodId', async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    
    if (!paymentMethodId) {
      return res.status(400).json({ success: false, message: 'Missing payment method ID' });
    }
    
    // We would need additional checks to verify ownership of the payment method
    
    const result = await deleteStripePaymentMethod(paymentMethodId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ success: false, message: 'Failed to delete payment method', error: error.message });
  }
});

// Create a refund
paymentRouter.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Missing payment intent ID' });
    }
    
    const result = await createStripeRefund(paymentIntentId, amount);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating refund:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund', error: error.message });
  }
});

// Get payment intent details
paymentRouter.get('/intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Missing payment intent ID' });
    }
    
    const result = await getStripePaymentIntent(paymentIntentId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment intent', error: error.message });
  }
});

// Create an invoice for a customer
paymentRouter.post('/invoice', async (req, res) => {
  try {
    const { customerId, items, description, daysUntilDue, autoAdvance } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    
    const result = await createStripeInvoice(customerId, items, description, daysUntilDue, autoAdvance);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
  }
});

// Admin-only routes
paymentRouter.use(isAdmin);

// Get or create a customer for current user
paymentRouter.post('/admin/customer-for-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing user ID' });
    }
    
    // Get user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // If user already has a Stripe customer ID, return it
    if (user.stripeCustomerId) {
      return res.json({
        success: true,
        customerId: user.stripeCustomerId,
        existing: true
      });
    }
    
    // Otherwise, create a new customer
    const result = await createStripeCustomer(
      user.email || `user-${user.id}@example.com`,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      { userId: user.id.toString() }
    );
    
    // If customer was created successfully, update the user record
    if (result.success && result.customerId) {
      await db.update(users)
        .set({ stripeCustomerId: result.customerId })
        .where(eq(users.id, user.id));
    }
    
    res.json({
      ...result,
      existing: false
    });
  } catch (error: any) {
    console.error('Error creating customer for user:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer for user', error: error.message });
  }
});

export default paymentRouter;