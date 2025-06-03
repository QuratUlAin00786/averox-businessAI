import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for e-commerce
export const ecommercePlatform = pgEnum("ecommerce_platform", ['shopify', 'woocommerce', 'magento', 'custom']);
export const ecommerceStoreStatus = pgEnum("ecommerce_store_status", ['active', 'pending', 'disconnected']);
export const ecommerceProductStatus = pgEnum("ecommerce_product_status", ['active', 'draft', 'archived']);
export const ecommerceOrderStatus = pgEnum("ecommerce_order_status", ['pending', 'processing', 'completed', 'cancelled', 'refunded']);
export const ecommerceFulfillmentStatus = pgEnum("ecommerce_fulfillment_status", ['unfulfilled', 'partial', 'fulfilled']);
export const ecommercePaymentStatus = pgEnum("ecommerce_payment_status", ['paid', 'pending', 'refunded']);

// E-commerce stores table
export const ecommerceStores = pgTable("ecommerce_stores", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  platform: ecommercePlatform("platform").notNull(),
  status: ecommerceStoreStatus("status").notNull().default('pending'),
  apiKey: text("api_key"), // Encrypted
  apiSecret: text("api_secret"), // Encrypted
  connectedAt: timestamp("connected_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// E-commerce products table
export const ecommerceProducts = pgTable("ecommerce_products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer("store_id").notNull().references(() => ecommerceStores.id, { onDelete: 'cascade' }),
  externalId: varchar("external_id", { length: 255 }).notNull(), // ID from external platform
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  inventory: integer("inventory").notNull().default(0),
  status: ecommerceProductStatus("status").notNull().default('active'),
  images: jsonb("images").default([]), // Array of image URLs
  categories: jsonb("categories").default([]), // Array of category names
  tags: jsonb("tags").default([]), // Array of tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// E-commerce orders table
export const ecommerceOrders = pgTable("ecommerce_orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer("store_id").notNull().references(() => ecommerceStores.id, { onDelete: 'cascade' }),
  externalId: varchar("external_id", { length: 255 }).notNull(), // ID from external platform
  orderNumber: varchar("order_number", { length: 255 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  status: ecommerceOrderStatus("status").notNull().default('pending'),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default('0'),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull().default('0'),
  items: integer("items").notNull(),
  fulfillmentStatus: ecommerceFulfillmentStatus("fulfillment_status").notNull().default('unfulfilled'),
  paymentStatus: ecommercePaymentStatus("payment_status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertEcommerceStoreSchema = createInsertSchema(ecommerceStores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEcommerceProductSchema = createInsertSchema(ecommerceProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEcommerceOrderSchema = createInsertSchema(ecommerceOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type EcommerceStore = typeof ecommerceStores.$inferSelect;
export type InsertEcommerceStore = z.infer<typeof insertEcommerceStoreSchema>;

export type EcommerceProduct = typeof ecommerceProducts.$inferSelect;
export type InsertEcommerceProduct = z.infer<typeof insertEcommerceProductSchema>;

export type EcommerceOrder = typeof ecommerceOrders.$inferSelect;
export type InsertEcommerceOrder = z.infer<typeof insertEcommerceOrderSchema>;