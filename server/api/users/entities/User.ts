/**
 * @file User entity
 * @description Database schema definition for users
 */

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table definition
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

// Create schema for insert operations (excluding auto-generated fields)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = Partial<InsertUser>;