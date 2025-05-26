import { db } from './db';
import { 
  tenants, 
  subscriptionPlans, 
  tenantSubscriptions, 
  tenantUsers, 
  tenantInvitations,
  tenantUsage,
  type Tenant,
  type InsertTenant,
  type TenantSubscription,
  type TenantUser,
  type InsertTenantUser,
  type InsertTenantInvitation
} from '../shared/tenant-schema';
import { users } from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export class TenantService {
  /**
   * Create a new tenant with admin user
   */
  async createTenant(tenantData: InsertTenant, adminUserData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<{ tenant: Tenant; adminUser: any }> {
    return await db.transaction(async (tx) => {
      // Create tenant
      const [tenant] = await tx
        .insert(tenants)
        .values({
          ...tenantData,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        })
        .returning();

      // Create admin user
      const hashedPassword = await bcrypt.hash(adminUserData.password, 12);
      const [adminUser] = await tx
        .insert(users)
        .values({
          email: adminUserData.email,
          firstName: adminUserData.firstName,
          lastName: adminUserData.lastName,
          password: hashedPassword,
          role: 'Admin',
          isActive: true,
          isVerified: true,
        })
        .returning();

      // Link admin user to tenant
      const [tenantUser] = await tx
        .insert(tenantUsers)
        .values({
          tenantId: tenant.id,
          userId: adminUser.id,
          role: 'admin',
          isActive: true,
          joinedAt: new Date(),
        })
        .returning();

      // Update tenant with admin user ID
      await tx
        .update(tenants)
        .set({ adminUserId: adminUser.id })
        .where(eq(tenants.id, tenant.id));

      // Initialize usage tracking
      const currentMonth = new Date().toISOString().slice(0, 7);
      await tx
        .insert(tenantUsage)
        .values({
          tenantId: tenant.id,
          month: currentMonth,
          userCount: 1,
        });

      return { tenant, adminUser };
    });
  }

  /**
   * Get tenant by subdomain or custom domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, domain))
      .limit(1);

    if (tenant) return tenant;

    // Try custom domain
    const [customDomainTenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.customDomain, domain))
      .limit(1);

    return customDomainTenant || null;
  }

  /**
   * Get tenant subscription details
   */
  async getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
    const [subscription] = await db
      .select()
      .from(tenantSubscriptions)
      .where(eq(tenantSubscriptions.tenantId, tenantId))
      .orderBy(desc(tenantSubscriptions.createdAt))
      .limit(1);

    return subscription || null;
  }

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans() {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);
  }

  /**
   * Add user to tenant
   */
  async addUserToTenant(tenantId: string, userId: number, role: string = 'user'): Promise<TenantUser> {
    const [tenantUser] = await db
      .insert(tenantUsers)
      .values({
        tenantId,
        userId,
        role,
        isActive: true,
        joinedAt: new Date(),
      })
      .returning();

    // Update user count in usage tracking
    const currentMonth = new Date().toISOString().slice(0, 7);
    await db
      .insert(tenantUsage)
      .values({
        tenantId,
        month: currentMonth,
        userCount: 1,
      })
      .onConflictDoUpdate({
        target: [tenantUsage.tenantId, tenantUsage.month],
        set: {
          userCount: sql`${tenantUsage.userCount} + 1`,
          updatedAt: new Date(),
        },
      });

    return tenantUser;
  }

  /**
   * Invite user to tenant
   */
  async inviteUserToTenant(
    tenantId: string, 
    email: string, 
    role: string, 
    invitedBy: string
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db
      .insert(tenantInvitations)
      .values({
        tenantId,
        email,
        role,
        invitedBy,
        token,
        expiresAt,
      });

    return token;
  }

  /**
   * Accept tenant invitation
   */
  async acceptInvitation(token: string, userData: {
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<{ tenant: Tenant; user: any }> {
    return await db.transaction(async (tx) => {
      // Get invitation
      const [invitation] = await tx
        .select()
        .from(tenantInvitations)
        .where(and(
          eq(tenantInvitations.token, token),
          eq(tenantInvitations.status, 'pending')
        ))
        .limit(1);

      if (!invitation) {
        throw new Error('Invalid or expired invitation');
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Get tenant
      const [tenant] = await tx
        .select()
        .from(tenants)
        .where(eq(tenants.id, invitation.tenantId))
        .limit(1);

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check if user already exists
      let [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, invitation.email))
        .limit(1);

      let user;
      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        [user] = await tx
          .insert(users)
          .values({
            email: invitation.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: hashedPassword,
            role: 'User',
            isActive: true,
            isVerified: true,
          })
          .returning();
      }

      // Add user to tenant
      await tx
        .insert(tenantUsers)
        .values({
          tenantId: invitation.tenantId,
          userId: user.id,
          role: invitation.role,
          isActive: true,
          joinedAt: new Date(),
          invitedBy: invitation.invitedBy,
        });

      // Update invitation status
      await tx
        .update(tenantInvitations)
        .set({ status: 'accepted' })
        .where(eq(tenantInvitations.id, invitation.id));

      return { tenant, user };
    });
  }

  /**
   * Get tenant users
   */
  async getTenantUsers(tenantId: string) {
    return await db
      .select({
        id: tenantUsers.id,
        role: tenantUsers.role,
        isActive: tenantUsers.isActive,
        joinedAt: tenantUsers.joinedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.avatar,
        },
      })
      .from(tenantUsers)
      .innerJoin(users, eq(tenantUsers.userId, users.id))
      .where(eq(tenantUsers.tenantId, tenantId));
  }

  /**
   * Check tenant limits
   */
  async checkTenantLimits(tenantId: string): Promise<{
    users: { current: number; limit: number; exceeded: boolean };
    storage: { current: number; limit: number; exceeded: boolean };
    apiCalls: { current: number; limit: number; exceeded: boolean };
  }> {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [usage] = await db
      .select()
      .from(tenantUsage)
      .where(and(
        eq(tenantUsage.tenantId, tenantId),
        eq(tenantUsage.month, currentMonth)
      ))
      .limit(1);

    const currentUsage = usage || {
      userCount: 0,
      storageUsed: 0,
      apiCalls: 0,
    };

    return {
      users: {
        current: currentUsage.userCount,
        limit: tenant.maxUsers,
        exceeded: currentUsage.userCount >= tenant.maxUsers,
      },
      storage: {
        current: currentUsage.storageUsed,
        limit: tenant.storageLimit,
        exceeded: currentUsage.storageUsed >= tenant.storageLimit,
      },
      apiCalls: {
        current: currentUsage.apiCalls,
        limit: tenant.apiCallsLimit,
        exceeded: currentUsage.apiCalls >= tenant.apiCallsLimit,
      },
    };
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(tenantId: string, settings: any) {
    await db
      .update(tenants)
      .set({ 
        settings,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));
  }

  /**
   * Get tenant analytics
   */
  async getTenantAnalytics(tenantId: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const usage = await db
      .select()
      .from(tenantUsage)
      .where(and(
        eq(tenantUsage.tenantId, tenantId),
        sql`${tenantUsage.month} >= ${startDate.toISOString().slice(0, 7)}`
      ))
      .orderBy(tenantUsage.month);

    return usage;
  }
}

export const tenantService = new TenantService();