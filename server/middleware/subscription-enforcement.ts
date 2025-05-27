import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { subscriptionPackages, users, contacts, leads } from '../../shared/schema';
import { eq, count, and } from 'drizzle-orm';

// Extend Request type to include tenant and subscription info
declare global {
  namespace Express {
    interface Request {
      tenant?: any;
      subscription?: any;
    }
  }
}

/**
 * Middleware to fetch and attach subscription details to request
 */
export const attachSubscriptionInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.tenant && req.tenant.planId) {
      // Get tenant's subscription package details
      const [subscription] = await db
        .select()
        .from(subscriptionPackages)
        .where(eq(subscriptionPackages.id, req.tenant.planId));

      if (subscription) {
        req.subscription = subscription;
      }
    }
    next();
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    next();
  }
};

/**
 * Check if tenant has reached user limit
 */
export const checkUserLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.subscription || !req.tenant) {
      return next();
    }

    // Count current users (simplified for current schema)
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    if (userCount.count >= req.subscription.maxUsers) {
      return res.status(403).json({
        error: 'User limit exceeded',
        message: `Your ${req.subscription.name} plan allows up to ${req.subscription.maxUsers} users. Please upgrade to add more users.`,
        currentUsers: userCount.count,
        maxUsers: req.subscription.maxUsers,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking user limit:', error);
    res.status(500).json({ error: 'Failed to validate user limit' });
  }
};

/**
 * Check if tenant has reached contact limit
 */
export const checkContactLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.subscription || !req.tenant) {
      return next();
    }

    // Count current contacts (simplified for current schema)
    const [contactCount] = await db
      .select({ count: count() })
      .from(contacts);

    if (contactCount.count >= req.subscription.maxContacts) {
      return res.status(403).json({
        error: 'Contact limit exceeded',
        message: `Your ${req.subscription.name} plan allows up to ${req.subscription.maxContacts} contacts. Please upgrade to add more contacts.`,
        currentContacts: contactCount.count,
        maxContacts: req.subscription.maxContacts,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking contact limit:', error);
    res.status(500).json({ error: 'Failed to validate contact limit' });
  }
};

/**
 * Check if tenant has access to specific feature
 */
export const requireFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.subscription) {
        return res.status(403).json({
          error: 'Subscription required',
          message: 'A valid subscription is required to access this feature.'
        });
      }

      // Parse features (could be JSON array or simple array)
      let features: string[] = [];
      if (typeof req.subscription.features === 'string') {
        try {
          features = JSON.parse(req.subscription.features);
        } catch {
          features = [req.subscription.features];
        }
      } else if (Array.isArray(req.subscription.features)) {
        features = req.subscription.features;
      }

      // Define feature requirements by plan
      const featureRequirements: { [key: string]: string[] } = {
        'manufacturing': ['Professional', 'Enterprise'],
        'ai-insights': ['Professional', 'Enterprise'],
        'advanced-reports': ['Professional', 'Enterprise'],
        'workflow-automation': ['Enterprise'],
        'api-access': ['Enterprise'],
        'custom-reports': ['Enterprise'],
        'dedicated-support': ['Enterprise'],
        'ecommerce-store': ['Professional', 'Enterprise'],
        'proposal-generation': ['Professional', 'Enterprise'],
        'inventory-management': ['Professional', 'Enterprise'],
        'materials-management': ['Enterprise'],
        'quality-control': ['Enterprise'],
        'advanced-manufacturing': ['Enterprise']
      };

      const requiredPlans = featureRequirements[featureName];
      if (requiredPlans && !requiredPlans.includes(req.subscription.name)) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `The ${featureName} feature requires a ${requiredPlans.join(' or ')} plan. Your current plan: ${req.subscription.name}`,
          currentPlan: req.subscription.name,
          requiredPlans,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ error: 'Failed to validate feature access' });
    }
  };
};

/**
 * Get usage statistics for tenant
 */
export const getUsageStats = async (tenantId?: string) => {
  try {
    const [userCount] = await db
      .select({ count: count() })
      .from(users);

    const [contactCount] = await db
      .select({ count: count() })
      .from(contacts);

    const [leadCount] = await db
      .select({ count: count() })
      .from(leads);

    return {
      users: userCount.count,
      contacts: contactCount.count,
      leads: leadCount.count,
      storage: 0
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return { users: 0, contacts: 0, leads: 0, storage: 0 };
  }
};

/**
 * Middleware to add usage info to response
 */
export const addUsageInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.tenant && req.subscription) {
      const usage = await getUsageStats(req.tenant.id);
      
      // Add usage info to response headers
      res.set({
        'X-Usage-Users': `${usage.users}/${req.subscription.maxUsers}`,
        'X-Usage-Contacts': `${usage.contacts}/${req.subscription.maxContacts}`,
        'X-Usage-Storage': `${usage.storage}/${req.subscription.maxStorage}GB`,
        'X-Plan-Name': req.subscription.name
      });
    }
    next();
  } catch (error) {
    console.error('Error adding usage info:', error);
    next();
  }
};

export default {
  attachSubscriptionInfo,
  checkUserLimit,
  checkContactLimit,
  requireFeature,
  getUsageStats,
  addUsageInfo
};