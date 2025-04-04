import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, date, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const leadStatusEnum = pgEnum('lead_status', ['New', 'Qualified', 'Contacted', 'Not Interested', 'Converted']);
export const opportunityStageEnum = pgEnum('opportunity_stage', ['Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing']);
export const taskPriorityEnum = pgEnum('task_priority', ['High', 'Medium', 'Normal']);
export const taskStatusEnum = pgEnum('task_status', ['Not Started', 'In Progress', 'Completed', 'Deferred']);
export const eventTypeEnum = pgEnum('event_type', ['Meeting', 'Call', 'Demonstration', 'Follow-up', 'Other']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['Active', 'Pending', 'Expired', 'Canceled', 'Trial']);
export const userRoleEnum = pgEnum('user_role', ['Admin', 'Manager', 'User', 'ReadOnly']);
export const socialPlatformEnum = pgEnum('social_platform', ['Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'WhatsApp', 'Email', 'Messenger', 'Other']);
export const messageStatusEnum = pgEnum('message_status', ['Unread', 'Read', 'Replied', 'Archived']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  role: text("role").default("User"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Stripe integration fields
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  
  // Account management
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  company: text("company"),
  packageId: integer("package_id"),
});

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  accountId: integer("account_id").references(() => accounts.id),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
});

// Accounts (Companies)
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  phone: text("phone"),
  billingAddress: text("billing_address"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  billingCountry: text("billing_country"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  annualRevenue: numeric("annual_revenue"),
  employeeCount: integer("employee_count"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
});

// Leads
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  title: text("title"),
  status: leadStatusEnum("status").default("New"),
  source: text("source"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  notes: text("notes"),
  isConverted: boolean("is_converted").default(false),
  convertedToContactId: integer("converted_to_contact_id").references(() => contacts.id),
  convertedToAccountId: integer("converted_to_account_id").references(() => accounts.id),
  convertedToOpportunityId: integer("converted_to_opportunity_id").references(() => opportunities.id),
});

// Opportunities (Deals)
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  stage: opportunityStageEnum("stage").default("Lead Generation"),
  amount: numeric("amount"),
  expectedCloseDate: date("expected_close_date"),
  probability: integer("probability"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  notes: text("notes"),
  isClosed: boolean("is_closed").default(false),
  isWon: boolean("is_won").default(false),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date"),
  priority: taskPriorityEnum("priority").default("Normal"),
  status: taskStatusEnum("status").default("Not Started"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  relatedToType: text("related_to_type"), // 'contact', 'account', 'lead', 'opportunity'
  relatedToId: integer("related_to_id"),
  isReminder: boolean("is_reminder").default(false),
  reminderDate: timestamp("reminder_date"),
});

// Events (Calendar items)
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location"),
  locationType: text("location_type").default("physical"), // 'physical' or 'virtual'
  eventType: eventTypeEnum("event_type").default("Meeting"),
  status: text("status").default("Confirmed"), // 'Confirmed', 'Tentative', 'Cancelled'
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  isAllDay: boolean("is_all_day").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringRule: text("recurring_rule"),
});

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  detail: text("detail"),
  relatedToType: text("related_to_type"), // 'contact', 'account', 'lead', 'opportunity', 'task', 'event'
  relatedToId: integer("related_to_id"),
  createdAt: timestamp("created_at").defaultNow(),
  icon: text("icon").default("added"), // 'added', 'completed', 'commented', 'scheduled'
});

// Subscription Packages
export const subscriptionPackages = pgTable("subscription_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  interval: text("interval").notNull(), // 'monthly', 'yearly'
  stripePriceId: text("stripe_price_id"),
  features: text("features").array(),
  maxUsers: integer("max_users").notNull(),
  maxContacts: integer("max_contacts").notNull(),
  maxStorage: integer("max_storage").notNull(), // in GB
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions (stores current and historical subscription information)
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  packageId: integer("package_id").references(() => subscriptionPackages.id).notNull(),
  status: subscriptionStatusEnum("status").default("Pending"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  canceledAt: timestamp("canceled_at"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  trialEndsAt: timestamp("trial_ends_at"),
});

// Social Media Integrations
export const socialIntegrations = pgTable("social_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: socialPlatformEnum("platform").notNull(),
  name: text("name").notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  settings: jsonb("settings"), // Replaced config with settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isActive: boolean("is_active").default(true),
});

// Social Media Messages
export const socialMessages = pgTable("social_messages", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => socialIntegrations.id).notNull(),
  externalId: text("external_id").notNull(), // ID from external platform
  leadId: integer("lead_id").references(() => leads.id),
  contactId: integer("contact_id").references(() => contacts.id),
  direction: text("direction").notNull(), // 'inbound' or 'outbound'
  content: text("content").notNull(),
  attachments: jsonb("attachments"), // Array of attachment objects
  metadata: jsonb("metadata"), // Platform-specific metadata
  status: messageStatusEnum("status").default("Unread"),
  sentAt: timestamp("sent_at").notNull(),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

// Lead Source Tracking
export const leadSources = pgTable("lead_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  platform: socialPlatformEnum("platform"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Social Media Campaigns
export const socialCampaigns = pgTable("social_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  platform: socialPlatformEnum("platform").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("Draft"), // Draft, Active, Paused, Completed
  ownerId: integer("owner_id").references(() => users.id),
  content: text("content"),
  targetAudience: jsonb("target_audience"),
  metrics: jsonb("metrics"), // Performance metrics
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isActive: boolean("is_active").default(true),
});

// Schema validation for inserts
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  avatar: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  isConverted: true,
  convertedToContactId: true,
  convertedToAccountId: true,
  convertedToOpportunityId: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  isClosed: true,
  isWon: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  reminderDate: z.string().nullable().optional()
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date())
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPackageSchema = createInsertSchema(subscriptionPackages).omit({
  id: true,
  createdAt: true,
}).extend({
  // Ensure price is always a string
  price: z.string(),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.string().or(z.date())
});

// Social media integration schemas
export const insertSocialIntegrationSchema = createInsertSchema(socialIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMessageSchema = createInsertSchema(socialMessages).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSourceSchema = createInsertSchema(leadSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialCampaignSchema = createInsertSchema(socialCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertSubscriptionPackage = z.infer<typeof insertSubscriptionPackageSchema>;
export type SubscriptionPackage = typeof subscriptionPackages.$inferSelect;

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

export type InsertSocialIntegration = z.infer<typeof insertSocialIntegrationSchema>;
export type SocialIntegration = typeof socialIntegrations.$inferSelect;

export type InsertSocialMessage = z.infer<typeof insertSocialMessageSchema>;
export type SocialMessage = typeof socialMessages.$inferSelect;

export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;
export type LeadSource = typeof leadSources.$inferSelect;

export type InsertSocialCampaign = z.infer<typeof insertSocialCampaignSchema>;
export type SocialCampaign = typeof socialCampaigns.$inferSelect;
