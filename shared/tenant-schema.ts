import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  decimal,
  uuid,
  serial,
  index,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Multi-tenant core tables
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  customDomain: varchar("custom_domain", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended, trial, expired
  planId: integer("plan_id").references(() => subscriptionPlans.id),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  settings: jsonb("settings").default({}),
  billingEmail: varchar("billing_email", { length: 255 }),
  adminUserId: uuid("admin_user_id"),
  isActive: boolean("is_active").default(true),
  maxUsers: integer("max_users").default(5),
  storageLimit: integer("storage_limit").default(1000), // MB
  apiCallsLimit: integer("api_calls_limit").default(10000), // per month
}, (table) => [
  index("idx_tenants_subdomain").on(table.subdomain),
  index("idx_tenants_status").on(table.status),
]);

// Subscription plans for SaaS billing
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  billingCycle: varchar("billing_cycle", { length: 20 }).notNull(), // monthly, yearly
  features: jsonb("features").default({}),
  maxUsers: integer("max_users").default(5),
  storageLimit: integer("storage_limit").default(1000), // MB
  apiCallsLimit: integer("api_calls_limit").default(10000),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
});

// Tenant subscriptions
export const tenantSubscriptions = pgTable("tenant_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // active, cancelled, past_due, trialing
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tenant_subscriptions_tenant").on(table.tenantId),
  index("idx_tenant_subscriptions_status").on(table.status),
]);

// Multi-tenant users (extends existing users table)
export const tenantUsers = pgTable("tenant_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"), // admin, manager, user, readonly
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at"),
  invitedBy: uuid("invited_by"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_tenant_user").on(table.tenantId, table.userId),
  index("idx_tenant_users_tenant").on(table.tenantId),
]);

// Tenant invitations
export const tenantInvitations = pgTable("tenant_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  invitedBy: uuid("invited_by").references(() => tenantUsers.id).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_tenant_invitations_token").on(table.token),
  index("idx_tenant_invitations_email").on(table.email),
]);

// Usage tracking for billing and limits
export const tenantUsage = pgTable("tenant_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  userCount: integer("user_count").default(0),
  storageUsed: integer("storage_used").default(0), // MB
  apiCalls: integer("api_calls").default(0),
  emailsSent: integer("emails_sent").default(0),
  recordsCreated: integer("records_created").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_tenant_month").on(table.tenantId, table.month),
  index("idx_tenant_usage_tenant").on(table.tenantId),
]);

// Tenant-specific data isolation helper
export const tenantData = pgTable("tenant_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  dataType: varchar("data_type", { length: 50 }).notNull(), // leads, contacts, accounts, etc.
  recordId: integer("record_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_tenant_data_tenant").on(table.tenantId),
  index("idx_tenant_data_type").on(table.dataType),
  unique("unique_tenant_record").on(table.tenantId, table.dataType, table.recordId),
]);

// Import existing users table reference
import { users } from "./schema";

// Zod schemas for validation
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({
  id: true,
  createdAt: true,
});

export const insertTenantInvitationSchema = createInsertSchema(tenantInvitations).omit({
  id: true,
  createdAt: true,
  token: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = z.infer<typeof insertTenantInvitationSchema>;
export type TenantUsage = typeof tenantUsage.$inferSelect;