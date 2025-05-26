import { Request, Response } from 'express';
import { db } from './db';
import { tenantService } from './tenant-service';
import { 
  insertTenantSchema, 
  insertSubscriptionPlanSchema,
  insertTenantInvitationSchema 
} from '../shared/tenant-schema';
import { 
  identifyTenant, 
  requireTenant, 
  checkTenantUserPermission 
} from './middleware/tenant-middleware';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Public tenant registration endpoint
 */
export const registerTenant = async (req: Request, res: Response) => {
  try {
    const validatedData = insertTenantSchema.parse(req.body.tenant);
    const adminData = req.body.admin;

    // Validate admin data
    if (!adminData.email || !adminData.password || !adminData.firstName || !adminData.lastName) {
      return res.status(400).json({
        error: 'Missing required admin user data',
        message: 'Admin email, password, first name, and last name are required'
      });
    }

    // Check if subdomain is available
    const existingTenant = await tenantService.getTenantByDomain(validatedData.subdomain);
    if (existingTenant) {
      return res.status(409).json({
        error: 'Subdomain unavailable',
        message: 'This subdomain is already taken'
      });
    }

    // Create tenant with admin user
    const { tenant, adminUser } = await tenantService.createTenant(validatedData, adminData);

    // Create Stripe customer for billing
    const stripeCustomer = await stripe.customers.create({
      email: adminData.email,
      name: `${adminData.firstName} ${adminData.lastName}`,
      metadata: {
        tenantId: tenant.id,
        userId: adminUser.id.toString()
      }
    });

    res.status(201).json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt
      },
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName
      },
      stripeCustomerId: stripeCustomer.id
    });
  } catch (error) {
    console.error('Tenant registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create your organization'
    });
  }
};

/**
 * Get current tenant information
 */
export const getCurrentTenant = [
  identifyTenant,
  requireTenant,
  async (req: Request, res: Response) => {
    try {
      const subscription = await tenantService.getTenantSubscription(req.tenant!.id);
      const limits = await tenantService.checkTenantLimits(req.tenant!.id);

      res.json({
        tenant: req.tenant,
        subscription,
        limits
      });
    } catch (error) {
      console.error('Get tenant error:', error);
      res.status(500).json({
        error: 'Unable to fetch organization data'
      });
    }
  }
];

/**
 * Update tenant settings
 */
export const updateTenantSettings = [
  identifyTenant,
  requireTenant,
  checkTenantUserPermission('admin'),
  async (req: Request, res: Response) => {
    try {
      await tenantService.updateTenantSettings(req.tenant!.id, req.body.settings);
      
      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Update tenant settings error:', error);
      res.status(500).json({
        error: 'Unable to update settings'
      });
    }
  }
];

/**
 * Get tenant users
 */
export const getTenantUsers = [
  identifyTenant,
  requireTenant,
  checkTenantUserPermission('manager'),
  async (req: Request, res: Response) => {
    try {
      const users = await tenantService.getTenantUsers(req.tenant!.id);
      res.json(users);
    } catch (error) {
      console.error('Get tenant users error:', error);
      res.status(500).json({
        error: 'Unable to fetch users'
      });
    }
  }
];

/**
 * Invite user to tenant
 */
export const inviteUserToTenant = [
  identifyTenant,
  requireTenant,
  checkTenantUserPermission('admin'),
  async (req: Request, res: Response) => {
    try {
      const { email, role } = insertTenantInvitationSchema.parse(req.body);
      
      // Check user limits
      const limits = await tenantService.checkTenantLimits(req.tenant!.id);
      if (limits.users.exceeded) {
        return res.status(403).json({
          error: 'User limit exceeded',
          message: 'Your plan allows a maximum of ' + limits.users.limit + ' users'
        });
      }

      const token = await tenantService.inviteUserToTenant(
        req.tenant!.id,
        email,
        role,
        req.tenantUser!.id
      );

      // TODO: Send invitation email with token
      // await emailService.sendInvitation(email, token, req.tenant);

      res.json({
        success: true,
        message: 'Invitation sent successfully',
        invitationUrl: `https://${req.tenant!.subdomain}.yourdomain.com/accept-invitation?token=${token}`
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(500).json({
        error: 'Unable to send invitation'
      });
    }
  }
];

/**
 * Accept invitation
 */
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { firstName, lastName, password } = req.body;

    const { tenant, user } = await tenantService.acceptInvitation(token, {
      firstName,
      lastName,
      password
    });

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(400).json({
      error: 'Unable to accept invitation',
      message: error instanceof Error ? error.message : 'Invalid invitation'
    });
  }
};

/**
 * Get subscription plans
 */
export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const plans = await tenantService.getSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      error: 'Unable to fetch subscription plans'
    });
  }
};

/**
 * Create subscription for tenant
 */
export const createTenantSubscription = [
  identifyTenant,
  requireTenant,
  checkTenantUserPermission('admin'),
  async (req: Request, res: Response) => {
    try {
      const { planId, paymentMethodId } = req.body;

      // Get plan details
      const plans = await tenantService.getSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(400).json({
          error: 'Invalid plan',
          message: 'Selected plan not found'
        });
      }

      // Create or get Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: req.user.email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
        metadata: {
          tenantId: req.tenant!.id
        }
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: plan.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        success: true,
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        error: 'Unable to create subscription'
      });
    }
  }
];

/**
 * Get tenant analytics
 */
export const getTenantAnalytics = [
  identifyTenant,
  requireTenant,
  checkTenantUserPermission('manager'),
  async (req: Request, res: Response) => {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const analytics = await tenantService.getTenantAnalytics(req.tenant!.id, months);
      
      res.json(analytics);
    } catch (error) {
      console.error('Get tenant analytics error:', error);
      res.status(500).json({
        error: 'Unable to fetch analytics'
      });
    }
  }
];

/**
 * Check subdomain availability
 */
export const checkSubdomainAvailability = async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;
    
    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.length < 3 || subdomain.length > 63) {
      return res.json({
        available: false,
        message: 'Subdomain must be 3-63 characters long and contain only lowercase letters, numbers, and hyphens'
      });
    }

    // Check reserved subdomains
    const reserved = ['www', 'api', 'app', 'admin', 'support', 'mail', 'ftp', 'blog'];
    if (reserved.includes(subdomain)) {
      return res.json({
        available: false,
        message: 'This subdomain is reserved'
      });
    }

    const existingTenant = await tenantService.getTenantByDomain(subdomain);
    
    res.json({
      available: !existingTenant,
      message: existingTenant ? 'This subdomain is already taken' : 'Subdomain is available'
    });
  } catch (error) {
    console.error('Check subdomain availability error:', error);
    res.status(500).json({
      error: 'Unable to check subdomain availability'
    });
  }
};