import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenants, tenantUsers } from '../../shared/tenant-schema';
import { eq, and } from 'drizzle-orm';

// Extend Express Request to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        subdomain: string;
        status: string;
        planId: number | null;
        settings: any;
        maxUsers: number;
        storageLimit: number;
        apiCallsLimit: number;
      };
      tenantUser?: {
        id: string;
        role: string;
        permissions: any;
      };
    }
  }
}

/**
 * Middleware to identify and validate tenant from subdomain or custom domain
 */
export const identifyTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let tenantIdentifier: string | null = null;
    
    // Get tenant from subdomain (e.g., acme.yourdomain.com)
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    // Skip tenant identification for main domain, API docs, or health checks
    if (subdomain === 'www' || subdomain === 'api' || subdomain === 'app' || 
        req.path.startsWith('/health') || req.path.startsWith('/docs')) {
      return next();
    }
    
    // Check if it's a custom domain or subdomain
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(
        eq(tenants.subdomain, subdomain)
      )
      .limit(1);
    
    if (!tenant) {
      // Try to find by custom domain
      const [customDomainTenant] = await db
        .select()
        .from(tenants)
        .where(
          eq(tenants.customDomain, host)
        )
        .limit(1);
        
      if (customDomainTenant) {
        req.tenant = customDomainTenant;
      } else {
        return res.status(404).json({ 
          error: 'Tenant not found',
          message: 'No organization found for this domain'
        });
      }
    } else {
      req.tenant = tenant;
    }
    
    // Check tenant status
    if (req.tenant.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended',
        message: 'This account has been temporarily suspended. Please contact support.'
      });
    }
    
    if (req.tenant.status === 'expired') {
      return res.status(402).json({ 
        error: 'Subscription expired',
        message: 'This account\'s subscription has expired. Please update your billing information.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Tenant identification error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Unable to identify organization'
    });
  }
};

/**
 * Middleware to ensure request has valid tenant context
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(400).json({ 
      error: 'No tenant context',
      message: 'This request requires a valid organization context'
    });
  }
  next();
};

/**
 * Middleware to check tenant user permissions
 */
export const checkTenantUserPermission = (requiredRole?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenant || !req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
      }
      
      // Get tenant user relationship
      const [tenantUser] = await db
        .select()
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, req.tenant.id),
            eq(tenantUsers.userId, req.user.id),
            eq(tenantUsers.isActive, true)
          )
        )
        .limit(1);
      
      if (!tenantUser) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You don\'t have access to this organization'
        });
      }
      
      req.tenantUser = tenantUser;
      
      // Check role requirements
      if (requiredRole) {
        const roleHierarchy = ['readonly', 'user', 'manager', 'admin'];
        const userRoleLevel = roleHierarchy.indexOf(tenantUser.role);
        const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);
        
        if (userRoleLevel < requiredRoleLevel) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            message: `This action requires ${requiredRole} role or higher`
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Tenant user permission check error:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: 'Unable to verify permissions'
      });
    }
  };
};

/**
 * Middleware to track API usage for billing
 */
export const trackApiUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.tenant && req.path.startsWith('/api/')) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      // Update usage tracking (implement with proper atomic operations in production)
      await db.execute(`
        INSERT INTO tenant_usage (tenant_id, month, api_calls)
        VALUES ('${req.tenant.id}', '${currentMonth}', 1)
        ON CONFLICT (tenant_id, month)
        DO UPDATE SET 
          api_calls = tenant_usage.api_calls + 1,
          updated_at = NOW()
      `);
      
      // Check API limits (optional - implement rate limiting)
      // You can add rate limiting logic here based on tenant plan
    }
    
    next();
  } catch (error) {
    console.error('API usage tracking error:', error);
    // Don't fail the request if usage tracking fails
    next();
  }
};

/**
 * Middleware to add tenant context to database queries
 */
export const addTenantContext = (req: Request, res: Response, next: NextFunction) => {
  if (req.tenant) {
    // Add tenant ID to request context for database queries
    req.query.tenantId = req.tenant.id;
  }
  next();
};

export default {
  identifyTenant,
  requireTenant,
  checkTenantUserPermission,
  trackApiUsage,
  addTenantContext
};