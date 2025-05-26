import express from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { apiKeys } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface ZapierWebhookEvent {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: 'leads' | 'contacts' | 'opportunities' | 'tasks' | 'accounts';
}

export interface ZapierSubscription {
  id: string;
  target_url: string;
  event: string;
  subscription_url: string;
  performance: {
    successful_requests: number;
    failed_requests: number;
    last_success_date: string;
    last_failure_date: string;
  };
}

class ZapierWebhookManager {
  private subscriptions: Map<string, ZapierSubscription> = new Map();
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET || 'averox-zapier-secret';
  }

  // Verify webhook signature from Zapier
  private verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Subscribe to Zapier webhook
  async subscribeWebhook(subscription: Omit<ZapierSubscription, 'id' | 'performance'>): Promise<ZapierSubscription> {
    const id = crypto.randomUUID();
    const newSubscription: ZapierSubscription = {
      ...subscription,
      id,
      performance: {
        successful_requests: 0,
        failed_requests: 0,
        last_success_date: '',
        last_failure_date: ''
      }
    };

    this.subscriptions.set(id, newSubscription);
    console.log(`[Zapier] New subscription registered: ${subscription.event} -> ${subscription.target_url}`);
    
    return newSubscription;
  }

  // Send webhook event to all subscribers
  async sendWebhook(event: ZapierWebhookEvent): Promise<void> {
    const subscribers = Array.from(this.subscriptions.values())
      .filter(sub => sub.event === event.event || sub.event === '*');

    const promises = subscribers.map(async (subscription) => {
      try {
        const payload = JSON.stringify(event);
        const signature = crypto
          .createHmac('sha256', this.webhookSecret)
          .update(payload)
          .digest('hex');

        const response = await fetch(subscription.target_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Zapier-Signature': signature,
            'X-Zapier-Event': event.event,
            'User-Agent': 'Averox-Business-AI/1.0'
          },
          body: payload
        });

        if (response.ok) {
          subscription.performance.successful_requests++;
          subscription.performance.last_success_date = new Date().toISOString();
          console.log(`[Zapier] Webhook sent successfully to ${subscription.target_url}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        subscription.performance.failed_requests++;
        subscription.performance.last_failure_date = new Date().toISOString();
        console.error(`[Zapier] Webhook failed for ${subscription.target_url}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Get subscription statistics
  getSubscriptions(): ZapierSubscription[] {
    return Array.from(this.subscriptions.values());
  }
}

// Export singleton instance
export const zapierWebhooks = new ZapierWebhookManager();

// Express routes for Zapier integration
export function setupZapierRoutes(app: express.Application) {
  // Zapier webhook subscription endpoint
  app.post('/api/zapier/subscribe', async (req, res) => {
    try {
      const { target_url, event, subscription_url } = req.body;
      
      if (!target_url || !event) {
        return res.status(400).json({ error: 'target_url and event are required' });
      }

      const subscription = await zapierWebhooks.subscribeWebhook({
        target_url,
        event,
        subscription_url: subscription_url || ''
      });

      res.json({
        success: true,
        subscription: subscription
      });
    } catch (error) {
      console.error('[Zapier] Subscription error:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Get subscription status
  app.get('/api/zapier/subscriptions', async (req, res) => {
    try {
      const subscriptions = zapierWebhooks.getSubscriptions();
      res.json({ subscriptions });
    } catch (error) {
      console.error('[Zapier] Get subscriptions error:', error);
      res.status(500).json({ error: 'Failed to get subscriptions' });
    }
  });
}

// Helper function to trigger webhooks from other parts of the application
export async function triggerZapierWebhook(event: string, data: any, source: ZapierWebhookEvent['source']) {
  const webhookEvent: ZapierWebhookEvent = {
    id: crypto.randomUUID(),
    event,
    data,
    timestamp: new Date().toISOString(),
    source
  };

  await zapierWebhooks.sendWebhook(webhookEvent);
}