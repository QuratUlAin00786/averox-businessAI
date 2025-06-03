import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for accounting
export const accountingTransactionType = pgEnum("accounting_transaction_type", ['income', 'expense', 'transfer']);
export const accountingAccountType = pgEnum("accounting_account_type", ['asset', 'liability', 'equity', 'revenue', 'expense']);
export const accountingCategoryType = pgEnum("accounting_category_type", ['income', 'expense']);

// Accounting transactions table
export const accountingTransactions = pgTable("accounting_transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: accountingTransactionType("type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  categoryId: integer("category_id"),
  accountId: integer("account_id").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  tags: jsonb("tags").default([]),
  contactId: integer("contact_id"),
  attachments: jsonb("attachments").default([]),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accounting accounts table
export const accountingAccounts = pgTable("accounting_accounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  type: accountingAccountType("type").notNull(),
  subType: varchar("sub_type", { length: 100 }),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default('0'),
  currency: varchar("currency", { length: 3 }).notNull().default('USD'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accounting categories table
export const accountingCategories = pgTable("accounting_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  type: accountingCategoryType("type").notNull(),
  parentId: integer("parent_id"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertAccountingTransactionSchema = createInsertSchema(accountingTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountingAccountSchema = createInsertSchema(accountingAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountingCategorySchema = createInsertSchema(accountingCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type AccountingTransaction = typeof accountingTransactions.$inferSelect;
export type InsertAccountingTransaction = z.infer<typeof insertAccountingTransactionSchema>;

export type AccountingAccount = typeof accountingAccounts.$inferSelect;
export type InsertAccountingAccount = z.infer<typeof insertAccountingAccountSchema>;

export type AccountingCategory = typeof accountingCategories.$inferSelect;
export type InsertAccountingCategory = z.infer<typeof insertAccountingCategorySchema>;