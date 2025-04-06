import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, date, numeric, jsonb, uuid } from "drizzle-orm/pg-core";
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
export const permissionActionEnum = pgEnum('permission_action', ['view', 'create', 'update', 'delete', 'export', 'import', 'assign']);
export const socialPlatformEnum = pgEnum('social_platform', ['Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'WhatsApp', 'Email', 'Messenger', 'Other']);
export const messageStatusEnum = pgEnum('message_status', ['Unread', 'Read', 'Replied', 'Archived']);
export const apiProviderEnum = pgEnum('api_provider', ['OpenAI', 'Stripe', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other']);
export const communicationChannelEnum = pgEnum('communication_channel', ['Email', 'WhatsApp', 'SMS', 'Phone', 'Messenger', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Other']);
export const communicationDirectionEnum = pgEnum('communication_direction', ['Inbound', 'Outbound']);
export const communicationStatusEnum = pgEnum('communication_status', ['Unread', 'Read', 'Replied', 'Archived']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded']);
export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', ['Purchase', 'Sale', 'Adjustment', 'Return', 'Transfer']);
export const paymentMethodEnum = pgEnum('payment_method', ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal', 'Other']);
export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['Draft', 'Sent', 'Received', 'Cancelled', 'Partially Received']);

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
  email: text("email"),
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
  type: text("type"), // Added account type field
  numberOfEmployees: integer("number_of_employees"), // Added for better UI display
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
  sender: text("sender").notNull(), // 'system' or 'user'
  recipient: text("recipient").notNull(), // 'system' or 'user'
  message: text("message").notNull(),
  attachments: jsonb("attachments"), // Array of attachment objects
  metadata: jsonb("metadata"), // Platform-specific metadata
  status: messageStatusEnum("status").default("Unread"),
  // We only use created_at for timestamps, not sent_at
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
  // Note: targetAudience is currently in metrics json
  integrationId: integer("integration_id"),
  metrics: jsonb("metrics"), // Performance metrics including target audience data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isActive: boolean("is_active").default(true),
});

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  key: text("key").notNull(),
  secret: text("secret"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
});

// Workflows
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  entityType: text("entity_type").notNull(), // 'lead', 'contact', 'opportunity', etc.
  entityFilter: jsonb("entity_filter"), // JSON condition to trigger workflow
  actions: jsonb("actions").notNull(), // Array of actions to perform
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  version: integer("version").default(1),
  settings: jsonb("settings"), // Configuration options
});

// Communications
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  channel: communicationChannelEnum("channel").notNull(),
  direction: communicationDirectionEnum("direction").notNull(),
  content: text("content").notNull(),
  status: communicationStatusEnum("status").default("Unread"),
  sentAt: timestamp("sent_at").notNull(),
  receivedAt: timestamp("received_at"),
  attachments: jsonb("attachments"), // Array of attachment objects
  metadata: jsonb("metadata"), // Platform-specific metadata
  createdAt: timestamp("created_at").defaultNow(),
  ownerId: integer("owner_id").references(() => users.id),
  contactType: text("contact_type"), // 'lead' or 'customer'
});

// Forward declaration for self-references
const productCategoriesRef = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
});

// Product Categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id").references((): typeof productCategoriesRef.id => productCategoriesRef.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  image: text("image"), // URL or path to category image
  attributes: jsonb("attributes"), // Custom attributes for the category
  ownerId: integer("owner_id").references(() => users.id),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  price: numeric("price").notNull(),
  cost: numeric("cost"),
  categoryId: integer("category_id").references(() => productCategories.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  inStock: boolean("in_stock").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  reorderLevel: integer("reorder_level").default(5),
  attributes: jsonb("attributes"), // Additional product properties
  images: text("images").array(), // Array of image URLs
  taxable: boolean("taxable").default(true),
  taxRate: numeric("tax_rate"),
  ownerId: integer("owner_id").references(() => users.id),
  weight: numeric("weight"), // In kg
  dimensions: jsonb("dimensions"), // {length, width, height} in cm
  barcode: text("barcode"),
  tags: text("tags").array(),
});

// Inventory Transactions
// Permission Module
export const modulePermissions = pgTable("module_permissions", {
  id: serial("id").primaryKey(),
  moduleName: text("module_name").notNull(), // 'contacts', 'accounts', 'leads', 'opportunities', 'tasks', etc.
  displayName: text("display_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  order: integer("order").default(0),
  icon: text("icon"),
});

// Role Permissions
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: userRoleEnum("role").notNull(),
  moduleId: integer("module_id").references(() => modulePermissions.id).notNull(),
  action: permissionActionEnum("action").notNull(),
  isAllowed: boolean("is_allowed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// User-specific permissions that override role-based permissions
export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modulePermissions.id).notNull(),
  action: permissionActionEnum("action").notNull(),
  isAllowed: boolean("is_allowed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Team assignment management
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: integer("leader_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isActive: boolean("is_active").default(true),
});

// Team members
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("Member"), // 'Leader', 'Member'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Assignment records
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'lead', 'contact', 'account', 'opportunity'
  entityId: integer("entity_id").notNull(),
  assignedToType: text("assigned_to_type").notNull(), // 'user' or 'team'
  assignedToId: integer("assigned_to_id").notNull(),
  assignedById: integer("assigned_by_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  type: inventoryTransactionTypeEnum("type").notNull(),
  referenceType: text("reference_type"), // 'sale', 'purchase', 'adjustment', etc.
  referenceId: integer("reference_id"), // ID of the sale, purchase, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  unitCost: numeric("unit_cost"), // Unit cost at time of transaction
  location: text("location"), // Warehouse or location identifier
  batchId: text("batch_id"), // For batch tracking
  expiryDate: date("expiry_date"), // For perishable items
  serialNumber: text("serial_number"), // For serialized inventory
});

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: invoiceStatusEnum("status").default("Draft"),
  subtotal: numeric("subtotal").notNull(),
  taxAmount: numeric("tax_amount").notNull(),
  discountAmount: numeric("discount_amount").default("0"),
  totalAmount: numeric("total_amount").notNull(),
  notes: text("notes"),
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  ownerId: integer("owner_id").references(() => users.id),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentDate: date("payment_date"),
  paymentReference: text("payment_reference"),
  currency: text("currency").default("USD"),
});

// Invoice Line Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  taxRate: numeric("tax_rate"),
  taxAmount: numeric("tax_amount"),
  discountPercent: numeric("discount_percent"),
  discountAmount: numeric("discount_amount"),
  lineTotal: numeric("line_total").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: integer("supplier_id").references(() => accounts.id).notNull(),
  status: purchaseOrderStatusEnum("status").default("Draft"),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  deliveryDate: date("delivery_date"),
  subtotal: numeric("subtotal").notNull(),
  taxAmount: numeric("tax_amount"),
  totalAmount: numeric("total_amount").notNull(),
  notes: text("notes"),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: date("approval_date"),
  currency: text("currency").default("USD"),
});

// Purchase Order Line Items
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull(),
  receivedQuantity: numeric("received_quantity").default("0"),
  unitPrice: numeric("unit_price").notNull(),
  taxAmount: numeric("tax_amount"),
  lineTotal: numeric("line_total").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
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

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  lastUsed: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
}).extend({
  sentAt: z.string().or(z.date()),
  receivedAt: z.string().or(z.date()).nullable().optional(),
});

// Product and Inventory schemas
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

// Invoice schemas
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  paymentDate: z.string().or(z.date()).nullable().optional(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

// Purchase order schemas
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  orderDate: z.string().or(z.date()),
  expectedDeliveryDate: z.string().or(z.date()).nullable().optional(),
  deliveryDate: z.string().or(z.date()).nullable().optional(),
  approvalDate: z.string().or(z.date()).nullable().optional(),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
}).extend({
  expectedDeliveryDate: z.string().or(z.date()).nullable().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

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

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;

// Product and Inventory types
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

// Invoice types
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Purchase order types
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

// Permission and team types
export const insertModulePermissionSchema = createInsertSchema(modulePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  assignedAt: true,
});

export type InsertModulePermission = z.infer<typeof insertModulePermissionSchema>;
export type ModulePermission = typeof modulePermissions.$inferSelect;

export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;

export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type UserPermission = typeof userPermissions.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
