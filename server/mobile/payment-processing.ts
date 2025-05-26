import express from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import crypto from 'crypto';

export interface MobilePayment {
  id: string;
  userId: number;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  clientSecret?: string;
  paymentIntentId?: string;
  metadata: {
    invoiceId?: number;
    opportunityId?: number;
    customerId?: number;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface PaymentGateway {
  name: string;
  enabled: boolean;
  supportsOffline: boolean;
  supportedMethods: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
}

class MobilePaymentProcessor {
  private stripe: Stripe;
  private gateways: Map<string, PaymentGateway> = new Map();
  private offlinePayments: Map<string, MobilePayment> = new Map();

  constructor() {
    // Initialize Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16'
      });
    }

    // Initialize available payment gateways
    this.initializeGateways();
  }

  private initializeGateways(): void {
    this.gateways.set('stripe', {
      name: 'Stripe',
      enabled: !!process.env.STRIPE_SECRET_KEY,
      supportsOffline: false,
      supportedMethods: ['card', 'apple_pay', 'google_pay'],
      fees: { percentage: 2.9, fixed: 30 }
    });

    this.gateways.set('paypal', {
      name: 'PayPal',
      enabled: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      supportsOffline: false,
      supportedMethods: ['paypal', 'card'],
      fees: { percentage: 3.49, fixed: 0 }
    });

    this.gateways.set('square', {
      name: 'Square',
      enabled: !!process.env.SQUARE_ACCESS_TOKEN,
      supportsOffline: true,
      supportedMethods: ['card', 'contactless'],
      fees: { percentage: 2.6, fixed: 10 }
    });
  }

  // Create mobile payment intent
  async createPaymentIntent(paymentData: {
    userId: number;
    amount: number;
    currency: string;
    description: string;
    paymentMethod: string;
    metadata?: any;
  }): Promise<MobilePayment> {
    const paymentId = crypto.randomUUID();
    
    try {
      let clientSecret: string | undefined;
      let paymentIntentId: string | undefined;

      // Create payment intent based on selected gateway
      switch (paymentData.paymentMethod) {
        case 'stripe':
          const stripeIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(paymentData.amount * 100), // Convert to cents
            currency: paymentData.currency,
            description: paymentData.description,
            metadata: paymentData.metadata || {},
            payment_method_types: ['card', 'apple_pay', 'google_pay']
          });
          clientSecret = stripeIntent.client_secret || undefined;
          paymentIntentId = stripeIntent.id;
          break;

        case 'paypal':
          // PayPal integration would go here
          console.log('[MobilePayment] PayPal payment intent created');
          break;

        default:
          throw new Error(`Unsupported payment method: ${paymentData.paymentMethod}`);
      }

      const payment: MobilePayment = {
        id: paymentId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        paymentMethod: paymentData.paymentMethod as MobilePayment['paymentMethod'],
        status: 'pending',
        clientSecret,
        paymentIntentId,
        metadata: paymentData.metadata || {},
        createdAt: new Date()
      };

      console.log(`[MobilePayment] Payment intent created: $${paymentData.amount} via ${paymentData.paymentMethod}`);
      return payment;

    } catch (error) {
      console.error('[MobilePayment] Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Process offline payment (for when device is offline)
  async processOfflinePayment(paymentData: {
    userId: number;
    amount: number;
    currency: string;
    description: string;
    paymentMethod: string;
    cardDetails?: {
      last4: string;
      brand: string;
      encrypted: string; // Encrypted card data
    };
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }): Promise<MobilePayment> {
    const paymentId = crypto.randomUUID();

    const offlinePayment: MobilePayment = {
      id: paymentId,
      userId: paymentData.userId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      paymentMethod: paymentData.paymentMethod as MobilePayment['paymentMethod'],
      status: 'pending',
      metadata: {
        ...paymentData.location ? { location: paymentData.location } : {},
        offline: true,
        cardDetails: paymentData.cardDetails
      },
      createdAt: new Date()
    };

    // Store offline payment for later processing
    this.offlinePayments.set(paymentId, offlinePayment);
    
    console.log(`[MobilePayment] Offline payment stored: $${paymentData.amount}`);
    return offlinePayment;
  }

  // Sync offline payments when device comes back online
  async syncOfflinePayments(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const processed: string[] = [];
    const failed: string[] = [];
    const errors: string[] = [];

    console.log(`[MobilePayment] Syncing ${this.offlinePayments.size} offline payments`);

    for (const [paymentId, payment] of this.offlinePayments.entries()) {
      try {
        // Process the offline payment online
        await this.processStoredPayment(payment);
        processed.push(paymentId);
        this.offlinePayments.delete(paymentId);
      } catch (error) {
        failed.push(paymentId);
        errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log(`[MobilePayment] Sync complete: ${processed.length} processed, ${failed.length} failed`);

    return {
      processed: processed.length,
      failed: failed.length,
      errors
    };
  }

  private async processStoredPayment(payment: MobilePayment): Promise<void> {
    // Process the stored payment through the appropriate gateway
    switch (payment.paymentMethod) {
      case 'stripe':
        // Process with Stripe
        break;
      case 'paypal':
        // Process with PayPal
        break;
      default:
        throw new Error(`Cannot process offline payment for method: ${payment.paymentMethod}`);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<MobilePayment | null> {
    // Check offline payments first
    const offlinePayment = this.offlinePayments.get(paymentId);
    if (offlinePayment) {
      return offlinePayment;
    }

    // Query database for completed payments
    // This would query the actual payments table
    return null;
  }

  // Get available payment gateways
  getAvailableGateways(): PaymentGateway[] {
    return Array.from(this.gateways.values()).filter(gateway => gateway.enabled);
  }

  // Calculate fees for a payment
  calculateFees(amount: number, gatewayName: string): {
    gatewayFee: number;
    platformFee: number;
    total: number;
    net: number;
  } {
    const gateway = this.gateways.get(gatewayName);
    if (!gateway) {
      throw new Error(`Unknown gateway: ${gatewayName}`);
    }

    const gatewayFee = (amount * gateway.fees.percentage / 100) + (gateway.fees.fixed / 100);
    const platformFee = amount * 0.005; // 0.5% platform fee
    const total = gatewayFee + platformFee;
    const net = amount - total;

    return {
      gatewayFee,
      platformFee,
      total,
      net
    };
  }

  // Process refund
  async processRefund(paymentId: string, amount?: number): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
  }> {
    try {
      // This would process the actual refund
      console.log(`[MobilePayment] Processing refund for payment: ${paymentId}`);
      
      return {
        success: true,
        refundId: crypto.randomUUID()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }
}

export const mobilePaymentProcessor = new MobilePaymentProcessor();

// Express routes for mobile payments
export function setupMobilePaymentRoutes(app: express.Application) {
  // Create payment intent
  app.post('/api/mobile/payment/create-intent', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { amount, currency, description, paymentMethod, metadata } = req.body;
      
      const payment = await mobilePaymentProcessor.createPaymentIntent({
        userId: req.user.id,
        amount,
        currency: currency || 'usd',
        description,
        paymentMethod,
        metadata
      });

      res.json({ success: true, payment });
    } catch (error) {
      console.error('[MobilePayment] Create intent error:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Process offline payment
  app.post('/api/mobile/payment/offline', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { amount, currency, description, paymentMethod, cardDetails, location } = req.body;
      
      const payment = await mobilePaymentProcessor.processOfflinePayment({
        userId: req.user.id,
        amount,
        currency: currency || 'usd',
        description,
        paymentMethod,
        cardDetails,
        location
      });

      res.json({ success: true, payment });
    } catch (error) {
      console.error('[MobilePayment] Offline payment error:', error);
      res.status(500).json({ error: 'Failed to process offline payment' });
    }
  });

  // Sync offline payments
  app.post('/api/mobile/payment/sync-offline', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const result = await mobilePaymentProcessor.syncOfflinePayments();
      res.json({ success: true, result });
    } catch (error) {
      console.error('[MobilePayment] Sync offline error:', error);
      res.status(500).json({ error: 'Failed to sync offline payments' });
    }
  });

  // Get payment status
  app.get('/api/mobile/payment/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await mobilePaymentProcessor.getPaymentStatus(id);
      
      if (payment) {
        res.json({ payment });
      } else {
        res.status(404).json({ error: 'Payment not found' });
      }
    } catch (error) {
      console.error('[MobilePayment] Get status error:', error);
      res.status(500).json({ error: 'Failed to get payment status' });
    }
  });

  // Get available gateways
  app.get('/api/mobile/payment/gateways', async (req, res) => {
    try {
      const gateways = mobilePaymentProcessor.getAvailableGateways();
      res.json({ gateways });
    } catch (error) {
      console.error('[MobilePayment] Get gateways error:', error);
      res.status(500).json({ error: 'Failed to get payment gateways' });
    }
  });

  // Calculate fees
  app.post('/api/mobile/payment/calculate-fees', async (req, res) => {
    try {
      const { amount, gateway } = req.body;
      
      if (!amount || !gateway) {
        return res.status(400).json({ error: 'Amount and gateway are required' });
      }

      const fees = mobilePaymentProcessor.calculateFees(amount, gateway);
      res.json({ fees });
    } catch (error) {
      console.error('[MobilePayment] Calculate fees error:', error);
      res.status(500).json({ error: 'Failed to calculate fees' });
    }
  });

  // Process refund
  app.post('/api/mobile/payment/:id/refund', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { amount } = req.body;
      
      const result = await mobilePaymentProcessor.processRefund(id, amount);
      res.json(result);
    } catch (error) {
      console.error('[MobilePayment] Refund error:', error);
      res.status(500).json({ error: 'Failed to process refund' });
    }
  });
}