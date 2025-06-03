import { pgTable, text, integer, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Support ticket enums
export const ticketStatus = pgEnum("ticket_status", ['Open', 'In Progress', 'Resolved', 'Closed']);
export const ticketPriority = pgEnum("ticket_priority", ['Low', 'Medium', 'High', 'Critical']);

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: ticketStatus("status").notNull().default('Open'),
  priority: ticketPriority("priority").notNull().default('Medium'),
  category: varchar("category", { length: 100 }).notNull(),
  userId: integer("user_id").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Ticket messages table
export const ticketMessages = pgTable("ticket_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  ticketId: integer("ticket_id").notNull(),
  message: text("message").notNull(),
  isAgent: integer("is_agent").notNull().default(0), // 0 for user, 1 for agent
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;