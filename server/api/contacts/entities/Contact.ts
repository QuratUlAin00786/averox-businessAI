/**
 * @file Contact entity
 * @description Database schema definition for contacts
 */

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../../users/entities/User";
import { accounts } from "../../accounts/entities/Account";

// Contact table definition
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

// Create schema for insert operations (excluding auto-generated fields)
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type UpdateContact = Partial<InsertContact>;