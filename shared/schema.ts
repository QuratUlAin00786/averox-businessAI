import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const leadStatusEnum = pgEnum('lead_status', ['New', 'Qualified', 'Contacted', 'Not Interested', 'Converted']);
export const opportunityStageEnum = pgEnum('opportunity_stage', ['Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing']);
export const taskPriorityEnum = pgEnum('task_priority', ['High', 'Medium', 'Normal']);
export const taskStatusEnum = pgEnum('task_status', ['Not Started', 'In Progress', 'Completed', 'Deferred']);
export const eventTypeEnum = pgEnum('event_type', ['Meeting', 'Call', 'Demonstration', 'Follow-up', 'Other']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
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
