import { pgTable, serial, text, timestamp, integer, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";
import { contacts } from "./schema";
import { leads } from "./schema";

// Enums
export const campaignTypeEnum = pgEnum("campaign_type", [
  "email", 
  "social", 
  "sms", 
  "push", 
  "webinar", 
  "ad"
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft", 
  "scheduled", 
  "active", 
  "paused", 
  "completed", 
  "cancelled"
]);

export const workflowStatusEnum = pgEnum("workflow_status", [
  "draft", 
  "active", 
  "paused", 
  "completed", 
  "archived"
]);

export const workflowTriggerTypeEnum = pgEnum("workflow_trigger_type", [
  "segment", 
  "form_submission", 
  "page_visit", 
  "custom_event", 
  "api", 
  "manual"
]);

export const nodeTypeEnum = pgEnum("node_type", [
  "trigger", 
  "email", 
  "delay", 
  "condition", 
  "action", 
  "webhook", 
  "goal", 
  "split", 
  "cta"
]);

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  previewText: text("preview_text"),
  content: jsonb("content").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  category: text("category"),
  tags: text("tags").array(),
  thumbnail: text("thumbnail")
});

// Audience Segments
export const audienceSegments = pgTable("audience_segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  conditions: jsonb("conditions").notNull().default([]),
  matchType: text("match_type").notNull().default("all"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  contactCount: integer("contact_count").default(0),
  lastUpdated: timestamp("last_updated"),
  isActive: boolean("is_active").default(true)
});

// Marketing Campaigns
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: campaignTypeEnum("type").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  content: jsonb("content").notNull().default({}),
  segmentId: integer("segment_id").references(() => audienceSegments.id),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  stats: jsonb("stats").default({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0
  }),
  settings: jsonb("settings").default({
    trackOpens: true,
    trackClicks: true,
    personalizeContent: true
  })
});

// Marketing Automation Workflows
export const marketingWorkflows = pgTable("marketing_workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: workflowStatusEnum("status").notNull().default("draft"),
  triggerType: workflowTriggerTypeEnum("trigger_type").notNull(),
  nodes: jsonb("nodes").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  createdBy: integer("created_by").references(() => users.id),
  settings: jsonb("settings").default({
    allowReEnrollment: false,
    suppressFromOtherWorkflows: false,
    businessHoursOnly: false
  }),
  stats: jsonb("stats").default({
    activeContacts: 0,
    completedContacts: 0,
    conversionRate: 0
  })
});

// Campaign Engagement
export const campaignEngagements = pgTable("campaign_engagements", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  status: text("status").notNull().default("pending"), // pending, sent, delivered, opened, clicked, bounced
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  clickedUrl: text("clicked_url"),
  deviceInfo: jsonb("device_info"),
  location: jsonb("location"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Workflow Enrollments
export const workflowEnrollments = pgTable("workflow_enrollments", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => marketingWorkflows.id).notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  leadId: integer("lead_id").references(() => leads.id),
  status: text("status").notNull().default("active"), // active, completed, exited
  currentNodeId: text("current_node_id"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  exitedAt: timestamp("exited_at"),
  exitReason: text("exit_reason")
});

// Zod schemas for insertions
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true });
export const insertAudienceSegmentSchema = createInsertSchema(audienceSegments).omit({ id: true });
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({ id: true });
export const insertMarketingWorkflowSchema = createInsertSchema(marketingWorkflows).omit({ id: true });
export const insertCampaignEngagementSchema = createInsertSchema(campaignEngagements).omit({ id: true });
export const insertWorkflowEnrollmentSchema = createInsertSchema(workflowEnrollments).omit({ id: true });

// TypeScript types
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type AudienceSegment = typeof audienceSegments.$inferSelect;
export type InsertAudienceSegment = z.infer<typeof insertAudienceSegmentSchema>;

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type MarketingWorkflow = typeof marketingWorkflows.$inferSelect;
export type InsertMarketingWorkflow = z.infer<typeof insertMarketingWorkflowSchema>;

export type CampaignEngagement = typeof campaignEngagements.$inferSelect;
export type InsertCampaignEngagement = z.infer<typeof insertCampaignEngagementSchema>;

export type WorkflowEnrollment = typeof workflowEnrollments.$inferSelect;
export type InsertWorkflowEnrollment = z.infer<typeof insertWorkflowEnrollmentSchema>;