import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for marketing
export const marketingCampaignType = pgEnum("marketing_campaign_type", ['email', 'sms', 'social', 'automation']);
export const marketingCampaignStatus = pgEnum("marketing_campaign_status", ['active', 'paused', 'completed', 'draft', 'scheduled']);
export const marketingAutomationStatus = pgEnum("marketing_automation_status", ['active', 'paused', 'draft']);
export const marketingTriggerType = pgEnum("marketing_trigger_type", ['lead_created', 'contact_added', 'opportunity_stage', 'date_based']);

// Marketing campaigns table
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  type: marketingCampaignType("type").notNull(),
  status: marketingCampaignStatus("status").notNull().default('draft'),
  recipientCount: integer("recipient_count").notNull().default(0),
  sentCount: integer("sent_count").notNull().default(0),
  openedCount: integer("opened_count").notNull().default(0),
  clickedCount: integer("clicked_count").notNull().default(0),
  conversionCount: integer("conversion_count").notNull().default(0),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Marketing automations table
export const marketingAutomations = pgTable("marketing_automations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  status: marketingAutomationStatus("status").notNull().default('draft'),
  triggerType: marketingTriggerType("trigger_type").notNull(),
  contactCount: integer("contact_count").notNull().default(0),
  steps: integer("steps").notNull().default(1),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).notNull().default('0'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketingAutomationSchema = createInsertSchema(marketingAutomations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type MarketingAutomation = typeof marketingAutomations.$inferSelect;
export type InsertMarketingAutomation = z.infer<typeof insertMarketingAutomationSchema>;