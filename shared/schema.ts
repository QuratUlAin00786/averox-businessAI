import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, date, numeric, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export manufacturing module components
export * from './manufacturing-schema';

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
export const notificationTypeEnum = pgEnum('notification_type', ['task', 'meeting', 'opportunity', 'lead', 'system', 'message']);
export const apiProviderEnum = pgEnum('api_provider', ['OpenAI', 'Stripe', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other']);
export const communicationChannelEnum = pgEnum('communication_channel', ['Email', 'WhatsApp', 'SMS', 'Phone', 'Messenger', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Other']);
export const communicationDirectionEnum = pgEnum('communication_direction', ['Inbound', 'Outbound']);
export const communicationStatusEnum = pgEnum('communication_status', ['Unread', 'Read', 'Replied', 'Archived']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded']);
export const inventoryTransactionTypeEnum = pgEnum('inventory_transaction_type', ['Purchase', 'Sale', 'Adjustment', 'Return', 'Transfer', 'Production', 'Consumption', 'QualityReject', 'ScrapDisposal', 'IntakeForProduction', 'ProductionOutput']);

// Manufacturing Module Enums
export const productionOrderStatusEnum = pgEnum('production_order_status', ['Draft', 'Scheduled', 'InProgress', 'Completed', 'OnHold', 'Cancelled']);
export const productionPriorityEnum = pgEnum('production_priority', ['Critical', 'High', 'Medium', 'Low']);
export const qualityInspectionResultEnum = pgEnum('quality_inspection_result', ['Pass', 'Fail', 'PendingReview', 'Acceptable', 'Rework']);
export const maintenanceTypeEnum = pgEnum('maintenance_type', ['Preventive', 'Corrective', 'Predictive', 'Condition-Based']);
export const maintenanceStatusEnum = pgEnum('maintenance_status', ['Scheduled', 'InProgress', 'Completed', 'Deferred', 'Cancelled']);
export const equipmentStatusEnum = pgEnum('equipment_status', ['Operational', 'UnderMaintenance', 'Idle', 'Decommissioned', 'Faulty']);
export const workCenterStatusEnum = pgEnum('work_center_status', ['Active', 'Inactive', 'AtCapacity', 'UnderMaintenance']);
export const manufacturingTypeEnum = pgEnum('manufacturing_type', ['Discrete', 'Process', 'Repetitive', 'Batch', 'Lean', 'Custom']);
export const materialTypeEnum = pgEnum('material_type', ['RawMaterial', 'Intermediate', 'FinishedGood', 'Packaging', 'Consumable', 'Spare']);
export const unitOfMeasureEnum = pgEnum('unit_of_measure', ['Each', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'SquareMeter', 'CubicMeter', 'Hour', 'Minute', 'Ton', 'Dozen']);
export const paymentMethodEnum = pgEnum('payment_method', ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal', 'Other']);
export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['Draft', 'Sent', 'Received', 'Cancelled', 'Partially Received']);
export const proposalStatusEnum = pgEnum('proposal_status', ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Revoked']);
export const proposalElementTypeEnum = pgEnum('proposal_element_type', ['Header', 'Text', 'Image', 'Table', 'List', 'Quote', 'ProductList', 'Signature', 'PageBreak', 'Custom']);

// Custom Fields
export const customFieldTypeEnum = pgEnum('custom_field_type', ['Text', 'Number', 'Date', 'Boolean', 'Dropdown', 'MultiSelect', 'Email', 'Phone', 'URL', 'TextArea', 'Currency']);

// Users
// System settings table for global and user configuration
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  settingKey: text("setting_key").notNull(),
  settingValue: jsonb("setting_value").notNull(),
  scope: text("scope").default("user"), // 'user' or 'global'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;

// Define the menu visibility interface
export interface MenuVisibilitySettings {
  contacts: boolean;
  accounts: boolean;
  leads: boolean;
  opportunities: boolean;
  calendar: boolean;
  tasks: boolean;
  communicationCenter: boolean;
  accounting: boolean;
  inventory: boolean;
  manufacturing: boolean;
  supportTickets: boolean;
  ecommerce: boolean;
  ecommerceStore: boolean;
  reports: boolean;
  intelligence: boolean;
  workflows: boolean;
  subscriptions: boolean;
  training: boolean;
}

// Define dashboard widget preferences
export interface DashboardPreferences {
  // Graph and chart preferences
  showSalesPipeline: boolean;
  showRecentActivities: boolean;
  showTasks: boolean;
  showEvents: boolean;
  
  // Stat preferences
  showLeadsStats: boolean;
  showConversionStats: boolean;
  showRevenueStats: boolean;
  showOpportunitiesStats: boolean;
  
  // Graph type preferences
  pipelineChartType: 'pie' | 'bar' | 'funnel';
  revenueChartType: 'line' | 'bar' | 'area';
  leadsChartType: 'line' | 'bar' | 'area';
  
  // Time range preferences
  defaultTimeRange: 'week' | 'month' | 'quarter' | 'year';
  
  // AI insights preferences
  showAIInsights: boolean;
  aiInsightTypes: ('leads' | 'opportunities' | 'customers' | 'revenue' | 'all')[];
  aiInsightsCount: number;
}

// Define the system settings interface used throughout the application
export interface SystemSettings {
  menuVisibility: MenuVisibilitySettings;
  dashboardPreferences: DashboardPreferences;
  // Other system settings can be added here
}

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
  // Location fields
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  // Other fields
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

// Notifications table for system and user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").default("system"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  link: text("link"),
  relatedToType: text("related_to_type"), // Which entity this notification is related to
  relatedToId: integer("related_to_id"), // ID of the related entity
});

// Relations are handled at query time

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Direct messages between users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  urgent: boolean("urgent").default(false),
});

// Relations are handled at query time

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

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
  // Fields for relating messages to different entities
  relatedToType: text("related_to_type"), // 'account', 'opportunity', etc.
  relatedToId: integer("related_to_id"), // ID of the related entity
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
  additionalFields: jsonb("additional_fields"), // For service-specific fields like TWILIO_PHONE_NUMBER
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  // Added userId to track which subscriber owns this key
  userId: integer("user_id").references(() => users.id).notNull(),
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

// Custom Fields Definition
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  type: customFieldTypeEnum("type").notNull(),
  entityType: text("entity_type").notNull(), // 'contact', 'account', 'lead', 'opportunity', etc.
  options: jsonb("options"), // For dropdown and multi-select types
  isRequired: boolean("is_required").default(false),
  defaultValue: text("default_value"),
  placeholder: text("placeholder"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false), // System fields can't be deleted
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  validationRules: jsonb("validation_rules"), // JSON with validation rule config
  showInList: boolean("show_in_list").default(false), // Show in list views
  showInDetail: boolean("show_in_detail").default(true), // Show in detail views
  showInForm: boolean("show_in_form").default(true), // Show in forms
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type CustomField = typeof customFields.$inferSelect;

// Custom Field Values
export const customFieldValues = pgTable("custom_field_values", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").references(() => customFields.id).notNull(),
  entityId: integer("entity_id").notNull(), // ID of the entity (contact, account, etc.)
  entityType: text("entity_type").notNull(), // 'contact', 'account', 'lead', 'opportunity', etc.
  value: text("value"), // String representation of the value
  textValue: text("text_value"), // For text or long text
  numberValue: numeric("number_value"), // For numeric fields
  dateValue: timestamp("date_value"), // For date/time
  booleanValue: boolean("boolean_value"), // For checkboxes
  arrayValue: jsonb("array_value"), // For multi-select
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCustomFieldValueSchema = createInsertSchema(customFieldValues).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCustomFieldValue = z.infer<typeof insertCustomFieldValueSchema>;
export type CustomFieldValue = typeof customFieldValues.$inferSelect;

// Custom Field Groups (for organizing fields on forms)
export const customFieldGroups = pgTable("custom_field_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  entityType: text("entity_type").notNull(), // 'contact', 'account', 'lead', 'opportunity', etc.
  label: text("label").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCustomFieldGroupSchema = createInsertSchema(customFieldGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCustomFieldGroup = z.infer<typeof insertCustomFieldGroupSchema>;
export type CustomFieldGroup = typeof customFieldGroups.$inferSelect;

// Custom Field to Group mapping
export const customFieldGroupMapping = pgTable("custom_field_group_mapping", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").references(() => customFields.id).notNull(),
  groupId: integer("group_id").references(() => customFieldGroups.id).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomFieldGroupMappingSchema = createInsertSchema(customFieldGroupMapping).omit({
  id: true,
  createdAt: true
});

export type InsertCustomFieldGroupMapping = z.infer<typeof insertCustomFieldGroupMappingSchema>;
export type CustomFieldGroupMapping = typeof customFieldGroupMapping.$inferSelect;

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

// Note: Insert schema for communications is defined later in the file
export type Communication = typeof communications.$inferSelect;

// Proposal Templates
export const proposalTemplates = pgTable("proposal_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  content: jsonb("content").notNull(), // JSON structure for template layout and sections
  thumbnail: text("thumbnail"), // URL or path to template thumbnail
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isActive: boolean("is_active").default(true),
  category: text("category").default("General"), // E.g., "Sales", "Service", "General", etc.
  tags: text("tags").array(),
});

// Proposals
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  status: proposalStatusEnum("status").default("Draft"),
  content: jsonb("content").notNull(), // JSON structure for proposal content
  templateId: integer("template_id").references(() => proposalTemplates.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  sentAt: timestamp("sent_at"),
  expiresAt: timestamp("expires_at"),
  acceptedAt: timestamp("accepted_at"),
  rejectedAt: timestamp("rejected_at"),
  totalAmount: numeric("total_amount"),
  currency: text("currency").default("USD"),
  versionNumber: integer("version_number").default(1),
  previousVersionId: integer("previous_version_id").references((): any => proposals.id),
  settings: jsonb("settings"), // Configuration options like page size, fonts, colors
  metadata: jsonb("metadata"), // Additional data like view count, time spent viewing
});

// Proposal Elements (for saved custom blocks/components)
export const proposalElements = pgTable("proposal_elements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  elementType: proposalElementTypeEnum("element_type").notNull(),
  content: jsonb("content").notNull(), // JSON structure for element content
  proposalId: integer("proposal_id").references(() => proposals.id).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  isGlobal: boolean("is_global").default(false), // If true, available to all users
  isActive: boolean("is_active").default(true),
  category: text("category").default("General"),
  thumbnail: text("thumbnail"), // URL or path to element thumbnail
});

// Proposal Collaborators
export const proposalCollaborators = pgTable("proposal_collaborators", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposals.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("Editor"), // "Editor", "Viewer", "Approver"
  addedBy: integer("added_by").references(() => users.id),
  addedAt: timestamp("added_at").defaultNow(),
  lastAccessed: timestamp("last_accessed"),
  notifications: boolean("notifications").default(true),
});

// Proposal Comments
export const proposalComments = pgTable("proposal_comments", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposals.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  elementPath: text("element_path"), // JSON path to the commented element
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  resolved: boolean("resolved").default(false),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  parentId: integer("parent_id").references((): any => proposalComments.id), // For threaded comments
});

// Proposal Activity
export const proposalActivities = pgTable("proposal_activities", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposals.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(), // "created", "edited", "commented", "sent", "viewed", "accepted", "rejected"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"), // Additional information like client IP, device, etc.
});

// Forward declaration for self-references
const productCategoriesRef = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
});

// Product Categories
export const productCategoriesTable = pgTable("product_categories", {
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
  categoryId: integer("category_id").references(() => productCategoriesTable.id),
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
  materialType: materialTypeEnum("material_type"), // For manufacturing classification
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure"), // Unit for measurements
  leadTime: integer("lead_time"), // Manufacturing lead time in days
  isBillOfMaterial: boolean("is_bill_of_material").default(false), // Whether this is a BOM
  isManufactured: boolean("is_manufactured").default(false), // Whether this product is manufactured in-house
  defaultWarehouseId: integer("default_warehouse_id"), // Default warehouse for storage
  qualityInspectionRequired: boolean("quality_inspection_required").default(false), // Whether QC is required
  technicalSpecifications: jsonb("technical_specifications"), // Technical product specifications
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

// Forward declare teams for self-reference
const teamsRef = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Team assignment management
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.id),
  parentTeamId: integer("parent_team_id").references((): typeof teamsRef.id => teamsRef.id),
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
  referenceType: text("reference_type"), // 'sale', 'purchase', 'adjustment', 'production', etc.
  referenceId: integer("reference_id"), // ID of the sale, purchase, production order etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  unitCost: numeric("unit_cost"), // Unit cost at time of transaction
  location: text("location"), // Warehouse or location identifier
  batchId: text("batch_id"), // For batch tracking
  expiryDate: date("expiry_date"), // For perishable items
  serialNumber: text("serial_number"), // For serialized inventory
  workCenterId: integer("work_center_id"), // Reference to manufacturing work center
  qualityInspectionId: integer("quality_inspection_id"), // Reference to quality inspection
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

// Proposal schemas
export const insertProposalTemplateSchema = createInsertSchema(proposalTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  acceptedAt: true,
  rejectedAt: true,
}).extend({
  expiresAt: z.string().or(z.date()).optional().nullable()
});

export const insertProposalElementSchema = createInsertSchema(proposalElements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProposalCollaboratorSchema = createInsertSchema(proposalCollaborators).omit({
  id: true,
  addedAt: true,
  lastAccessed: true,
});

export const insertProposalCommentSchema = createInsertSchema(proposalComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertProposalActivitySchema = createInsertSchema(proposalActivities).omit({
  id: true,
  createdAt: true,
});

// Product and Inventory schemas
export const insertProductCategorySchema = createInsertSchema(productCategoriesTable).omit({
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

// Proposal types
export type InsertProposalTemplate = z.infer<typeof insertProposalTemplateSchema>;
export type ProposalTemplate = typeof proposalTemplates.$inferSelect;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export type InsertProposalElement = z.infer<typeof insertProposalElementSchema>;
export type ProposalElement = typeof proposalElements.$inferSelect;

export type InsertProposalCollaborator = z.infer<typeof insertProposalCollaboratorSchema>;
export type ProposalCollaborator = typeof proposalCollaborators.$inferSelect;

export type InsertProposalComment = z.infer<typeof insertProposalCommentSchema>;
export type ProposalComment = typeof proposalComments.$inferSelect;

export type InsertProposalActivity = z.infer<typeof insertProposalActivitySchema>;
export type ProposalActivity = typeof proposalActivities.$inferSelect;

// Manufacturing Module Tables

// Warehouses
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  ownerId: integer("owner_id").references(() => users.id),
  parentWarehouseId: integer("parent_warehouse_id").references((): any => warehouses.id),
  capacity: numeric("capacity"), // in cubic meters
  utilizationRate: numeric("utilization_rate"), // percentage of capacity used
  isManufacturing: boolean("is_manufacturing").default(false), // Whether manufacturing happens here
});

// Warehouse Zones/Sections
export const warehouseZones = pgTable("warehouse_zones", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  zoneType: text("zone_type").notNull(), // 'storage', 'receiving', 'shipping', 'production', 'quality', etc.
  capacity: numeric("capacity"), // in cubic meters
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Work Centers (Manufacturing Machines/Cells/Lines)
export const workCenters = pgTable("work_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  status: workCenterStatusEnum("status").default("Active"),
  hourlyRate: numeric("hourly_rate"), // Cost per hour for the work center
  capacity: numeric("capacity"), // Units per hour or appropriate measure
  setupTime: numeric("setup_time"), // Average setup time in minutes
  operatingHours: jsonb("operating_hours"), // JSON with operating schedule
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  maintenanceSchedule: jsonb("maintenance_schedule"), // Maintenance schedule info
  equipmentList: text("equipment_list").array(), // List of equipment in this work center
  departmentId: integer("department_id"), // Optional department reference
  industryType: text("industry_type"), // 'pharmaceutical', 'textile', 'cement', etc.
});

// Bill of Materials (BOM)
export const billOfMaterials = pgTable("bill_of_materials", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(), // Finished good
  name: text("name").notNull(),
  version: text("version").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: date("approval_date"),
  manufacturingType: manufacturingTypeEnum("manufacturing_type").default("Discrete"),
  isDefault: boolean("is_default").default(false), // Whether this is the default BOM for the product
  totalCost: numeric("total_cost"), // Calculated total cost of all components
  notes: text("notes"),
  revisionNotes: text("revision_notes"), // Notes about version changes
  yield: numeric("yield").default("100"), // Expected yield percentage
});

// BOM Items (Components in a BOM)
export const bomItems = pgTable("bom_items", {
  id: serial("id").primaryKey(),
  bomId: integer("bom_id").references(() => billOfMaterials.id).notNull(),
  componentId: integer("component_id").references(() => products.id).notNull(), // Component product
  quantity: numeric("quantity").notNull(),
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure").notNull(),
  position: integer("position").default(0), // Position in the manufacturing process
  isSubAssembly: boolean("is_sub_assembly").default(false), // Whether this component is itself a sub-assembly
  scrapRate: numeric("scrap_rate").default("0"), // Expected percentage of scrap
  notes: text("notes"),
  isOptional: boolean("is_optional").default(false), // Whether component is optional
  substitutes: jsonb("substitutes"), // Potential substitute components
  operation: text("operation"), // Manufacturing operation for this component
  workCenterId: integer("work_center_id").references(() => workCenters.id), // Work center where component is used
});

// Routing (Manufacturing Process Steps)
export const routings = pgTable("routings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  productId: integer("product_id").references(() => products.id), // Product this routing is for
  bomId: integer("bom_id").references(() => billOfMaterials.id), // Associated BOM
  version: text("version").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: date("approval_date"),
  totalStandardHours: numeric("total_standard_hours"), // Total standard time for all operations
  isDefault: boolean("is_default").default(false), // Default routing for the product
});

// Routing Operations (Steps in a Routing)
export const routingOperations = pgTable("routing_operations", {
  id: serial("id").primaryKey(),
  routingId: integer("routing_id").references(() => routings.id).notNull(),
  sequence: integer("sequence").notNull(), // Order in the routing
  name: text("name").notNull(),
  description: text("description"),
  workCenterId: integer("work_center_id").references(() => workCenters.id).notNull(),
  setupTime: numeric("setup_time"), // Setup time in minutes
  runTime: numeric("run_time"), // Run time per unit in minutes
  queueTime: numeric("queue_time"), // Queue time in minutes
  waitTime: numeric("wait_time"), // Wait time in minutes
  instructions: text("instructions"), // Detailed work instructions
  qualityCheckRequired: boolean("quality_check_required").default(false),
  inputMaterials: jsonb("input_materials"), // Materials needed at this operation
  outputProducts: jsonb("output_products"), // Products/by-products produced at this operation
});

// Production Orders
export const productionOrders = pgTable("production_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  productId: integer("product_id").references(() => products.id).notNull(),
  bomId: integer("bom_id").references(() => billOfMaterials.id),
  routingId: integer("routing_id").references(() => routings.id),
  quantity: numeric("quantity").notNull(),
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure").notNull(),
  status: productionOrderStatusEnum("status").default("Draft"),
  priority: productionPriorityEnum("priority").default("Medium"),
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  notes: text("notes"),
  completedQuantity: numeric("completed_quantity").default("0"),
  rejectedQuantity: numeric("rejected_quantity").default("0"),
  salesOrderId: integer("sales_order_id"), // Optional reference to sales order
  batchNumber: text("batch_number"), // Batch/lot number for traceability
  industryType: text("industry_type"), // 'pharmaceutical', 'textile', 'cement', etc.
});

// Production Order Operations
export const productionOrderOperations = pgTable("production_order_operations", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").references(() => productionOrders.id).notNull(),
  routingOperationId: integer("routing_operation_id").references(() => routingOperations.id),
  sequence: integer("sequence").notNull(),
  workCenterId: integer("work_center_id").references(() => workCenters.id).notNull(),
  status: text("status").default("Not Started"),
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  setupTime: numeric("setup_time"), // Actual setup time
  runTime: numeric("run_time"), // Actual run time
  completedQuantity: numeric("completed_quantity").default("0"),
  rejectedQuantity: numeric("rejected_quantity").default("0"),
  operatorNotes: text("operator_notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
});

// Material Consumption for Production
export const materialConsumptions = pgTable("material_consumptions", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").references(() => productionOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  operationId: integer("operation_id").references(() => productionOrderOperations.id),
  quantity: numeric("quantity").notNull(),
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  batchNumber: text("batch_number"),
  createdBy: integer("created_by").references(() => users.id),
  notes: text("notes"),
  inventoryTransactionId: integer("inventory_transaction_id").references(() => inventoryTransactions.id),
  isBackflushed: boolean("is_backflushed").default(false), // Whether materials were automatically consumed
});

// Quality Inspections
export const qualityInspections = pgTable("quality_inspections", {
  id: serial("id").primaryKey(),
  referenceType: text("reference_type").notNull(), // 'production_order', 'purchase_order', 'inventory'
  referenceId: integer("reference_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  inspectionDate: timestamp("inspection_date").defaultNow(),
  inspectedBy: integer("inspected_by").references(() => users.id),
  result: qualityInspectionResultEnum("result").notNull(),
  quantity: numeric("quantity").notNull(),
  quantityPassed: numeric("quantity_passed"),
  quantityFailed: numeric("quantity_failed"),
  notes: text("notes"),
  batchNumber: text("batch_number"),
  checklistData: jsonb("checklist_data"), // Checklist data in JSON format
  attachments: text("attachments").array(), // Attachments like images, documents
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  operationId: integer("operation_id").references(() => productionOrderOperations.id),
});

// Quality Parameters
export const qualityParameters = pgTable("quality_parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  productId: integer("product_id").references(() => products.id), // For product-specific parameters
  parameterType: text("parameter_type").notNull(), // 'numeric', 'boolean', 'text', etc.
  uom: text("uom"), // Unit of measure
  minimumValue: text("minimum_value"), // Minimum acceptable value (for numeric)
  maximumValue: text("maximum_value"), // Maximum acceptable value (for numeric)
  targetValue: text("target_value"), // Target value
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  industryType: text("industry_type"), // 'pharmaceutical', 'textile', 'cement', etc.
});

// Quality Inspection Results
export const qualityInspectionResults = pgTable("quality_inspection_results", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").references(() => qualityInspections.id).notNull(),
  parameterId: integer("parameter_id").references(() => qualityParameters.id).notNull(),
  value: text("value").notNull(), // Actual measured value
  isPassed: boolean("is_passed").notNull(), // Whether this parameter passed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Equipment
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  workCenterId: integer("work_center_id").references(() => workCenters.id),
  status: equipmentStatusEnum("status").default("Operational"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: date("purchase_date"),
  warrantyExpiryDate: date("warranty_expiry_date"),
  lastMaintenanceDate: date("last_maintenance_date"),
  nextMaintenanceDate: date("next_maintenance_date"),
  maintenanceFrequency: integer("maintenance_frequency"), // In days
  specifications: jsonb("specifications"), // Technical specifications
  operatingProcedure: text("operating_procedure"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  location: text("location"),
  capacityPerHour: numeric("capacity_per_hour"), // Production capacity
  powerConsumption: numeric("power_consumption"), // Power usage
  industryType: text("industry_type"), // 'pharmaceutical', 'textile', 'cement', etc.
});

// Maintenance Requests
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").references(() => equipment.id).notNull(),
  requestType: maintenanceTypeEnum("request_type").default("Corrective"),
  status: maintenanceStatusEnum("status").default("Scheduled"),
  priority: productionPriorityEnum("priority").default("Medium"),
  description: text("description").notNull(),
  requestedBy: integer("requested_by").references(() => users.id).notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  requestDate: timestamp("request_date").defaultNow(),
  scheduledDate: timestamp("scheduled_date"),
  completionDate: timestamp("completion_date"),
  notes: text("notes"),
  resolutionDetails: text("resolution_details"),
  partsUsed: jsonb("parts_used"), // Parts used in the maintenance
  downtime: numeric("downtime"), // Downtime in hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Manufacturing Shifts
export const manufacturingShifts = pgTable("manufacturing_shifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(), // Start time in 24-hour format (HH:MM)
  endTime: text("end_time").notNull(), // End time in 24-hour format (HH:MM)
  workCenterId: integer("work_center_id").references(() => workCenters.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  daysOfWeek: text("days_of_week").array(), // Days when shift is active
  isActive: boolean("is_active").default(true),
  supervisorId: integer("supervisor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  breakTimes: jsonb("break_times"), // Break schedule
  capacityFactor: numeric("capacity_factor").default("1"), // Capacity multiplier for this shift
});

// Shift Assignments
export const shiftAssignments = pgTable("shift_assignments", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").references(() => manufacturingShifts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workCenterId: integer("work_center_id").references(() => workCenters.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
});

// Industry-specific tables

// Pharmaceutical Industry
export const pharmaManufacturing = pgTable("pharma_manufacturing", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").references(() => productionOrders.id).notNull(),
  regulatoryBatchNumber: text("regulatory_batch_number").notNull(),
  expiryDate: date("expiry_date").notNull(),
  manufacturingDate: date("manufacturing_date").notNull(),
  sterility: boolean("sterility").default(false),
  containsControlledSubstances: boolean("contains_controlled_substances").default(false),
  storageConditions: text("storage_conditions"),
  regulatoryApprovals: jsonb("regulatory_approvals"), // FDA, EMA, etc. approvals
  stabilityTestingRequired: boolean("stability_testing_required").default(false),
  analyticalTesting: jsonb("analytical_testing"), // Testing data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
});

// Textile Industry
export const textileManufacturing = pgTable("textile_manufacturing", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").references(() => productionOrders.id).notNull(),
  fiberType: text("fiber_type").notNull(), // Cotton, polyester, etc.
  dyeingMethod: text("dyeing_method"),
  colorCode: text("color_code"),
  patternCode: text("pattern_code"),
  gsm: numeric("gsm"), // Grams per square meter
  finishingProcess: text("finishing_process"),
  textureDetails: text("texture_details"),
  yarnCount: text("yarn_count"),
  fabricWidth: numeric("fabric_width"),
  shrinkagePercentage: numeric("shrinkage_percentage"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
});

// Cement Industry
export const cementManufacturing = pgTable("cement_manufacturing", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").references(() => productionOrders.id).notNull(),
  cementType: text("cement_type").notNull(), // Portland, Masonry, etc.
  strengthClass: text("strength_class"), // 32.5, 42.5, 52.5 MPa
  composition: jsonb("composition"), // Detailed composition percentages
  settingTime: numeric("setting_time"), // In minutes
  clinkerFactor: numeric("clinker_factor"), // Amount of clinker
  additives: jsonb("additives"), // Additives used
  packagingType: text("packaging_type"), // Bulk, bag, etc.
  qualityStandard: text("quality_standard"), // ASTM, EN, etc.
  moisture: numeric("moisture"), // Moisture percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
});

// Manufacturing cost tracking
export const manufacturingCosts = pgTable("manufacturing_costs", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").references(() => productionOrders.id).notNull(),
  materialCost: numeric("material_cost").default("0"),
  laborCost: numeric("labor_cost").default("0"),
  overheadCost: numeric("overhead_cost").default("0"),
  setupCost: numeric("setup_cost").default("0"),
  energyCost: numeric("energy_cost").default("0"),
  additionalCosts: jsonb("additional_costs"), // Other specific costs
  totalCost: numeric("total_cost").default("0"),
  costPerUnit: numeric("cost_per_unit").default("0"),
  currency: text("currency").default("USD"),
  costingDate: timestamp("costing_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  isActual: boolean("is_actual").default(false), // Whether costs are actual or estimated
});

// Manufacturing Formulas (for process manufacturing)
export const manufacturingFormulas = pgTable("manufacturing_formulas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  version: text("version").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  batchSize: numeric("batch_size").notNull(),
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure").notNull(),
  instructions: text("instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: date("approval_date"),
  industryType: text("industry_type"), // 'pharmaceutical', 'chemical', etc.
  yield: numeric("yield").default("100"), // Expected yield percentage
  isDefault: boolean("is_default").default(false), // Default formula for the product
});

// Formula Ingredients
export const formulaIngredients = pgTable("formula_ingredients", {
  id: serial("id").primaryKey(),
  formulaId: integer("formula_id").references(() => manufacturingFormulas.id).notNull(),
  materialId: integer("material_id").references(() => products.id).notNull(),
  quantity: numeric("quantity").notNull(),
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure").notNull(),
  sequence: integer("sequence").default(0),
  notes: text("notes"),
  isOptional: boolean("is_optional").default(false),
  substitutes: jsonb("substitutes"), // Possible substitutes
  function: text("function"), // Function of this ingredient
  criticalMaterial: boolean("critical_material").default(false), // Whether material is critical
});

// Insertion schemas for manufacturing module
export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWarehouseZoneSchema = createInsertSchema(warehouseZones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkCenterSchema = createInsertSchema(workCenters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillOfMaterialsSchema = createInsertSchema(billOfMaterials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvalDate: true,
}).extend({
  approvalDate: z.string().or(z.date()).nullable().optional(),
});

export const insertBomItemSchema = createInsertSchema(bomItems).omit({
  id: true,
});

export const insertRoutingSchema = createInsertSchema(routings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvalDate: true,
}).extend({
  approvalDate: z.string().or(z.date()).nullable().optional(),
});

export const insertRoutingOperationSchema = createInsertSchema(routingOperations).omit({
  id: true,
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  actualStartDate: true,
  actualEndDate: true,
  plannedStartDate: true,
  plannedEndDate: true,
}).extend({
  plannedStartDate: z.string().or(z.date()).nullable().optional(),
  plannedEndDate: z.string().or(z.date()).nullable().optional(),
  actualStartDate: z.string().or(z.date()).nullable().optional(),
  actualEndDate: z.string().or(z.date()).nullable().optional(),
});

export const insertProductionOrderOperationSchema = createInsertSchema(productionOrderOperations).omit({
  id: true,
  actualStartDate: true,
  actualEndDate: true,
  plannedStartDate: true,
  plannedEndDate: true,
}).extend({
  plannedStartDate: z.string().or(z.date()).nullable().optional(),
  plannedEndDate: z.string().or(z.date()).nullable().optional(),
  actualStartDate: z.string().or(z.date()).nullable().optional(),
  actualEndDate: z.string().or(z.date()).nullable().optional(),
});

export const insertMaterialConsumptionSchema = createInsertSchema(materialConsumptions).omit({
  id: true,
  transactionDate: true,
}).extend({
  transactionDate: z.string().or(z.date()).nullable().optional(),
});

export const insertQualityInspectionSchema = createInsertSchema(qualityInspections).omit({
  id: true,
  inspectionDate: true,
}).extend({
  inspectionDate: z.string().or(z.date()).nullable().optional(),
});

export const insertQualityParameterSchema = createInsertSchema(qualityParameters).omit({
  id: true,
  createdAt: true,
});

export const insertQualityInspectionResultSchema = createInsertSchema(qualityInspectionResults).omit({
  id: true,
  createdAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  purchaseDate: true,
  warrantyExpiryDate: true,
  lastMaintenanceDate: true,
  nextMaintenanceDate: true,
}).extend({
  purchaseDate: z.string().or(z.date()).nullable().optional(),
  warrantyExpiryDate: z.string().or(z.date()).nullable().optional(),
  lastMaintenanceDate: z.string().or(z.date()).nullable().optional(),
  nextMaintenanceDate: z.string().or(z.date()).nullable().optional(),
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestDate: true,
  scheduledDate: true,
  completionDate: true,
}).extend({
  requestDate: z.string().or(z.date()).nullable().optional(),
  scheduledDate: z.string().or(z.date()).nullable().optional(),
  completionDate: z.string().or(z.date()).nullable().optional(),
});

export const insertManufacturingShiftSchema = createInsertSchema(manufacturingShifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftAssignmentSchema = createInsertSchema(shiftAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
});

// Types for Manufacturing Module
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

export type InsertWarehouseZone = z.infer<typeof insertWarehouseZoneSchema>;
export type WarehouseZone = typeof warehouseZones.$inferSelect;

export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;
export type WorkCenter = typeof workCenters.$inferSelect;

export type InsertBillOfMaterials = z.infer<typeof insertBillOfMaterialsSchema>;
export type BillOfMaterials = typeof billOfMaterials.$inferSelect;

export type InsertBomItem = z.infer<typeof insertBomItemSchema>;
export type BomItem = typeof bomItems.$inferSelect;

export type InsertRouting = z.infer<typeof insertRoutingSchema>;
export type Routing = typeof routings.$inferSelect;

export type InsertRoutingOperation = z.infer<typeof insertRoutingOperationSchema>;
export type RoutingOperation = typeof routingOperations.$inferSelect;

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;

export type InsertProductionOrderOperation = z.infer<typeof insertProductionOrderOperationSchema>;
export type ProductionOrderOperation = typeof productionOrderOperations.$inferSelect;

export type InsertMaterialConsumption = z.infer<typeof insertMaterialConsumptionSchema>;
export type MaterialConsumption = typeof materialConsumptions.$inferSelect;

export type InsertQualityInspection = z.infer<typeof insertQualityInspectionSchema>;
export type QualityInspection = typeof qualityInspections.$inferSelect;

export type InsertQualityParameter = z.infer<typeof insertQualityParameterSchema>;
export type QualityParameter = typeof qualityParameters.$inferSelect;

export type InsertQualityInspectionResult = z.infer<typeof insertQualityInspectionResultSchema>;
export type QualityInspectionResult = typeof qualityInspectionResults.$inferSelect;

export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;

export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;

export type InsertManufacturingShift = z.infer<typeof insertManufacturingShiftSchema>;
export type ManufacturingShift = typeof manufacturingShifts.$inferSelect;

export type InsertShiftAssignment = z.infer<typeof insertShiftAssignmentSchema>;
export type ShiftAssignment = typeof shiftAssignments.$inferSelect;

// Product and Inventory types
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategoriesTable.$inferSelect;

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

// Support Ticket System Schema
export const ticketPriorities = pgEnum('ticket_priority', ['low', 'medium', 'high', 'critical']);
export const ticketStatuses = pgEnum('ticket_status', ['open', 'in_progress', 'waiting_on_customer', 'waiting_on_third_party', 'resolved', 'closed']);
export const ticketTypes = pgEnum('ticket_type', ['technical', 'billing', 'feature_request', 'general_inquiry', 'bug_report']);

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  customerId: integer('customer_id').references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  status: ticketStatuses('status').default('open').notNull(),
  priority: ticketPriorities('priority').default('medium').notNull(),
  type: ticketTypes('type').default('general_inquiry').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
  dueDate: timestamp('due_date'),
  isInternal: boolean('is_internal').default(false),
});

export const ticketComments = pgTable('ticket_comments', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => supportTickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  comment: text('comment').notNull(),
  isInternal: boolean('is_internal').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ticketAttachments = pgTable('ticket_attachments', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => supportTickets.id).notNull(),
  commentId: integer('comment_id').references(() => ticketComments.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  contentType: text('content_type').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// E-commerce Integration Schema (Shopify)
export const shopifyStores = pgTable('shopify_stores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  storeName: text('store_name').notNull(),
  domain: text('domain').notNull(),
  accessToken: text('access_token'),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  isActive: boolean('is_active').default(true),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shopifyProductCategoryEnum = pgEnum('shopify_product_category', [
  'clothing', 'electronics', 'home_goods', 'food', 'beauty', 'books', 'sports', 'other'
]);

export const shopifyProducts = pgTable('shopify_products', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => shopifyStores.id).notNull(),
  productId: text('product_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  inventoryQuantity: integer('inventory_quantity'),
  sku: text('sku'),
  productType: text('product_type'),
  category: shopifyProductCategoryEnum('category').default('other'),
  vendor: text('vendor'),
  imageUrl: text('image_url'),
  productUrl: text('product_url'),
  tags: text('tags'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shopifyCustomers = pgTable('shopify_customers', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => shopifyStores.id).notNull(),
  customerId: text('customer_id').notNull(),
  email: text('email'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  ordersCount: integer('orders_count').default(0),
  totalSpent: numeric('total_spent', { precision: 10, scale: 2 }).default('0'),
  averoxContactId: integer('averox_contact_id').references(() => contacts.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderStatuses = pgEnum('order_status', [
  'pending', 'processing', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'
]);

export const shopifyOrders = pgTable('shopify_orders', {
  id: serial('id').primaryKey(),
  storeId: integer('store_id').references(() => shopifyStores.id).notNull(),
  orderId: text('order_id').notNull(),
  customerId: integer('customer_id').references(() => shopifyCustomers.id),
  orderNumber: text('order_number').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  subtotalPrice: numeric('subtotal_price', { precision: 10, scale: 2 }),
  totalTax: numeric('total_tax', { precision: 10, scale: 2 }),
  totalShipping: numeric('total_shipping', { precision: 10, scale: 2 }),
  totalDiscounts: numeric('total_discounts', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  status: orderStatuses('status').default('pending').notNull(),
  financialStatus: text('financial_status'),
  fulfillmentStatus: text('fulfillment_status'),
  paymentMethod: text('payment_method'),
  shippingMethod: text('shipping_method'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Create insert schemas for the new tables
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});

export const insertTicketAttachmentSchema = createInsertSchema(ticketAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertShopifyStoreSchema = createInsertSchema(shopifyStores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShopifyProductSchema = createInsertSchema(shopifyProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShopifyCustomerSchema = createInsertSchema(shopifyCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShopifyOrderSchema = createInsertSchema(shopifyOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define types for the new tables
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;

export type InsertTicketAttachment = z.infer<typeof insertTicketAttachmentSchema>;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;

export type InsertShopifyStore = z.infer<typeof insertShopifyStoreSchema>;
export type ShopifyStore = typeof shopifyStores.$inferSelect;

export type InsertShopifyProduct = z.infer<typeof insertShopifyProductSchema>;
export type ShopifyProduct = typeof shopifyProducts.$inferSelect;

export type InsertShopifyCustomer = z.infer<typeof insertShopifyCustomerSchema>;
export type ShopifyCustomer = typeof shopifyCustomers.$inferSelect;

export type InsertShopifyOrder = z.infer<typeof insertShopifyOrderSchema>;
export type ShopifyOrder = typeof shopifyOrders.$inferSelect;
