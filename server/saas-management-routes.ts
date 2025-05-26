import type { Express } from "express";
import { db } from "./db";
import { eq, desc, sql, and, count, sum } from "drizzle-orm";
import { 
  tenants, 
  tenantUsers, 
  subscriptionPlans,
  tenantSubscriptions 
} from "../shared/tenant-schema";
import { users, subscriptionPackages } from "../shared/schema";
import { tenantService } from "./tenant-service";

export function setupSaaSManagementRoutes(app: Express) {
  console.log('🏢 Setting up SaaS management dashboard routes...');

  // Get SaaS platform statistics
  app.get('/api/saas/stats', async (req, res) => {
    try {
      // Get tenant counts by status
      const tenantStats = await db
        .select({
          status: tenants.status,
          count: count()
        })
        .from(tenants)
        .groupBy(tenants.status);

      const totalTenants = tenantStats.reduce((acc, stat) => acc + stat.count, 0);
      const activeTenants = tenantStats.find(s => s.status === 'active')?.count || 0;
      const trialTenants = tenantStats.find(s => s.status === 'trial')?.count || 0;

      // Calculate total users across all tenants
      const totalUsersResult = await db
        .select({ count: count() })
        .from(tenantUsers);
      const totalUsers = totalUsersResult[0]?.count || 0;

      // Calculate revenue from subscription packages
      const revenueData = await db
        .select({
          price: subscriptionPackages.price,
          tenantCount: count()
        })
        .from(tenants)
        .leftJoin(tenantUsers, and(
          eq(tenantUsers.tenantId, tenants.id),
          eq(tenantUsers.isOwner, true)
        ))
        .leftJoin(users, eq(users.id, tenantUsers.userId))
        .leftJoin(subscriptionPackages, eq(subscriptionPackages.id, users.packageId))
        .where(eq(tenants.status, 'active'))
        .groupBy(subscriptionPackages.price);

      const totalRevenue = revenueData.reduce((acc, item) => {
        const price = parseFloat(item.price || '0');
        return acc + (price * (item.tenantCount || 0));
      }, 0);

      const avgRevenuePerTenant = totalTenants > 0 ? totalRevenue / totalTenants : 0;

      // Mock growth and churn rates (in real app, calculate from historical data)
      const growthRate = 12.5; // 12.5% monthly growth
      const churnRate = 2.1;   // 2.1% monthly churn

      const stats = {
        total_tenants: totalTenants,
        active_tenants: activeTenants,
        trial_tenants: trialTenants,
        total_revenue: totalRevenue,
        total_users: totalUsers,
        avg_revenue_per_tenant: avgRevenuePerTenant,
        growth_rate: growthRate,
        churn_rate: churnRate
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching SaaS stats:', error);
      res.status(500).json({ error: 'Failed to fetch SaaS statistics' });
    }
  });

  // Get all tenants with detailed information
  app.get('/api/saas/tenants', async (req, res) => {
    try {
      const tenantsData = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          subdomain: tenants.subdomain,
          status: tenants.status,
          billing_email: tenants.billingEmail,
          max_users: tenants.maxUsers,
          storage_limit: tenants.storageLimit,
          api_calls_limit: tenants.apiCallsLimit,
          trial_ends_at: tenants.trialEndsAt,
          created_at: tenants.createdAt,
          admin_name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          admin_email: users.email,
          plan_name: subscriptionPackages.name,
          plan_price: subscriptionPackages.price,
          user_count: sql<number>`COUNT(DISTINCT ${tenantUsers.userId})`
        })
        .from(tenants)
        .leftJoin(tenantUsers, and(
          eq(tenantUsers.tenantId, tenants.id),
          eq(tenantUsers.isOwner, true)
        ))
        .leftJoin(users, eq(users.id, tenantUsers.userId))
        .leftJoin(subscriptionPackages, eq(subscriptionPackages.id, users.packageId))
        .leftJoin(tenantUsers.as('all_users'), eq(tenantUsers.tenantId, tenants.id))
        .groupBy(
          tenants.id,
          tenants.name,
          tenants.subdomain,
          tenants.status,
          tenants.billingEmail,
          tenants.maxUsers,
          tenants.storageLimit,
          tenants.apiCallsLimit,
          tenants.trialEndsAt,
          tenants.createdAt,
          users.firstName,
          users.lastName,
          users.email,
          subscriptionPackages.name,
          subscriptionPackages.price
        )
        .orderBy(desc(tenants.createdAt));

      // Transform data to include calculated fields
      const enrichedTenants = tenantsData.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        billing_email: tenant.billing_email,
        max_users: tenant.max_users || 10,
        storage_limit: tenant.storage_limit || 5,
        api_calls_limit: tenant.api_calls_limit || 10000,
        trial_ends_at: tenant.trial_ends_at,
        created_at: tenant.created_at,
        admin_name: tenant.admin_name || 'Unknown',
        admin_email: tenant.admin_email || 'unknown@example.com',
        current_plan: tenant.plan_name || 'Starter',
        monthly_revenue: parseFloat(tenant.plan_price || '29.99'),
        user_count: tenant.user_count || 1,
        storage_used: Math.floor(Math.random() * (tenant.storage_limit || 5)), // Mock data
        api_calls_used: Math.floor(Math.random() * (tenant.api_calls_limit || 10000)) // Mock data
      }));

      res.json(enrichedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  // Create new tenant
  app.post('/api/saas/tenants', async (req, res) => {
    try {
      const {
        name,
        subdomain,
        billing_email,
        admin_first_name,
        admin_last_name,
        admin_email,
        plan_id
      } = req.body;

      // Validate required fields
      if (!name || !subdomain || !billing_email || !admin_first_name || !admin_last_name || !admin_email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if subdomain is available
      const existingTenant = await tenantService.getTenantByDomain(subdomain);
      if (existingTenant) {
        return res.status(400).json({ error: 'Subdomain already exists' });
      }

      // Get subscription package details
      const subscriptionPackage = plan_id 
        ? await db.select().from(subscriptionPackages).where(eq(subscriptionPackages.id, parseInt(plan_id))).limit(1)
        : null;

      const selectedPackage = subscriptionPackage?.[0];

      // Create tenant and admin user
      const { tenant, adminUser } = await tenantService.createTenant(
        {
          name,
          subdomain,
          billingEmail: billing_email
        },
        {
          firstName: admin_first_name,
          lastName: admin_last_name,
          email: admin_email,
          password: 'TempPassword123!' // In production, generate secure password and send via email
        }
      );

      // Update user with subscription package if selected
      if (selectedPackage) {
        await db
          .update(users)
          .set({ packageId: selectedPackage.id })
          .where(eq(users.id, adminUser.id));
      }

      res.status(201).json({
        message: 'Tenant created successfully',
        tenant,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName
        }
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ error: 'Failed to create tenant' });
    }
  });

  // Update tenant status
  app.put('/api/saas/tenants/:id/status', async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);
      const { status } = req.body;

      if (!['active', 'trial', 'suspended', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await db
        .update(tenants)
        .set({ 
          status: status as any,
          updatedAt: new Date()
        })
        .where(eq(tenants.id, tenantId));

      res.json({ message: 'Tenant status updated successfully' });
    } catch (error) {
      console.error('Error updating tenant status:', error);
      res.status(500).json({ error: 'Failed to update tenant status' });
    }
  });

  // Get tenant details
  app.get('/api/saas/tenants/:id', async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);

      const tenantData = await db
        .select({
          id: tenants.id,
          name: tenants.name,
          subdomain: tenants.subdomain,
          status: tenants.status,
          billing_email: tenants.billingEmail,
          max_users: tenants.maxUsers,
          storage_limit: tenants.storageLimit,
          api_calls_limit: tenants.apiCallsLimit,
          trial_ends_at: tenants.trialEndsAt,
          created_at: tenants.createdAt,
          admin_name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          admin_email: users.email,
          plan_name: subscriptionPackages.name
        })
        .from(tenants)
        .leftJoin(tenantUsers, and(
          eq(tenantUsers.tenantId, tenants.id),
          eq(tenantUsers.isOwner, true)
        ))
        .leftJoin(users, eq(users.id, tenantUsers.userId))
        .leftJoin(subscriptionPackages, eq(subscriptionPackages.id, users.packageId))
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (!tenantData.length) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Get usage statistics
      const userCount = await db
        .select({ count: count() })
        .from(tenantUsers)
        .where(eq(tenantUsers.tenantId, tenantId));

      const tenant = tenantData[0];
      const enrichedTenant = {
        ...tenant,
        user_count: userCount[0]?.count || 0,
        storage_used: Math.floor(Math.random() * (tenant.storage_limit || 5)), // Mock data
        api_calls_used: Math.floor(Math.random() * (tenant.api_calls_limit || 10000)) // Mock data
      };

      res.json(enrichedTenant);
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      res.status(500).json({ error: 'Failed to fetch tenant details' });
    }
  });

  // Delete tenant (with confirmation)
  app.delete('/api/saas/tenants/:id', async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);
      const { confirm } = req.query;

      if (confirm !== 'true') {
        return res.status(400).json({ 
          error: 'Tenant deletion requires confirmation',
          message: 'Add ?confirm=true to delete this tenant permanently'
        });
      }

      // Check if tenant exists
      const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
      if (!tenant.length) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Delete tenant (cascade will handle related records)
      await db.delete(tenants).where(eq(tenants.id, tenantId));

      res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      res.status(500).json({ error: 'Failed to delete tenant' });
    }
  });

  // Get platform usage overview
  app.get('/api/saas/usage', async (req, res) => {
    try {
      // Calculate total usage across all tenants
      const totalUsers = await db
        .select({ count: count() })
        .from(tenantUsers);

      const totalStorage = await db
        .select({ 
          total: sum(tenants.storageLimit)
        })
        .from(tenants)
        .where(eq(tenants.status, 'active'));

      const usage = {
        total_users: totalUsers[0]?.count || 0,
        total_storage_allocated: totalStorage[0]?.total || 0,
        total_storage_used: Math.floor((totalStorage[0]?.total || 0) * 0.3), // Mock 30% usage
        platform_uptime: 99.9,
        last_updated: new Date().toISOString()
      };

      res.json(usage);
    } catch (error) {
      console.error('Error fetching platform usage:', error);
      res.status(500).json({ error: 'Failed to fetch platform usage' });
    }
  });

  console.log('✅ SaaS management dashboard routes configured successfully');
}