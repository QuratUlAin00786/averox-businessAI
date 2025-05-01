import { relations } from 'drizzle-orm';
import { pgTable, serial, text, date, timestamp, integer, numeric, boolean, pgEnum, json, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Material Management Enums
export const materialType = pgEnum('material_type', [
  'Raw Material',
  'Component',
  'Packaging Material',
  'Consumable',
  'Finished Good',
  'Semi-Finished Good',
  'Byproduct',
  'Waste',
  'Spare Part'
]);

export const storageLocationType = pgEnum('storage_location_type', [
  'Warehouse', 
  'Area', 
  'Zone', 
  'Bin', 
  'Shelf', 
  'Rack', 
  'Cell'
]);

export const storageUnitType = pgEnum('storage_unit_type', [
  'Small',
  'Medium',
  'Large',
  'Extra Large',
  'Pallet',
  'Bulk'
]);

export const valuationMethod = pgEnum('valuation_method', [
  'FIFO',
  'LIFO',
  'Moving Average',
  'Standard Cost',
  'Specific Identification'
]);

export const batchStatus = pgEnum('batch_status', [
  'Available',
  'Reserved',
  'On Hold',
  'In QA',
  'Rejected',
  'Consumed',
  'Expired',
  'Recalled'
]);

export const vendorStatus = pgEnum('vendor_status', [
  'Active',
  'Inactive',
  'On Hold',
  'Pending Approval',
  'Blacklisted'
]);

export const vendorContractType = pgEnum('vendor_contract_type', [
  'Supply',
  'Service',
  'Maintenance',
  'Framework',
  'Consignment',
  'Distribution'
]);

// Materials Management Tables
export const materials = pgTable('materials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  type: materialType('type').notNull(),
  uom: text('uom').notNull(), // Unit of Measure
  price: numeric('price').default('0'),
  leadTime: integer('lead_time'), // in days
  reorderPoint: numeric('reorder_point'),
  eoq: numeric('eoq'), // Economic Order Quantity
  safetyStock: numeric('safety_stock'),
  minStock: numeric('min_stock'),
  maxStock: numeric('max_stock'),
  defaultLocationId: integer('default_location_id'),
  defaultValuationMethod: valuationMethod('default_valuation_method'),
  isActive: boolean('is_active').default(true),
  trackByBatch: boolean('track_by_batch').default(false),
  trackBySerial: boolean('track_by_serial').default(false),
  shelfLife: integer('shelf_life'), // in days
  technicalSpecifications: json('technical_specifications'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
  categoryId: integer('category_id'),
  taxable: boolean('taxable').default(false),
  attributes: json('attributes')
});

export const materialCategories = pgTable('material_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  parentId: integer('parent_id'),
  isActive: boolean('is_active').default(true),
  attributes: json('attributes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const storageLocations = pgTable('storage_locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: storageLocationType('type').notNull(),
  parentId: integer('parent_id'),
  description: text('description'),
  address: text('address'),
  capacity: numeric('capacity'),
  capacityUom: text('capacity_uom'),
  isActive: boolean('is_active').default(true),
  attributes: json('attributes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  status: vendorStatus('status').default('Active'),
  paymentTerms: text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  website: text('website'),
  notes: text('notes'),
  qualityRating: numeric('quality_rating'),
  deliveryRating: numeric('delivery_rating'),
  priceRating: numeric('price_rating'),
  categoryId: integer('category_id'),
  attributes: json('attributes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const vendorContracts = pgTable('vendor_contracts', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').notNull(),
  contractNumber: varchar('contract_number', { length: 50 }).notNull().unique(),
  type: vendorContractType('type').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  isActive: boolean('is_active').default(true),
  terms: text('terms'),
  notes: text('notes'),
  attachmentUrl: text('attachment_url'),
  autoRenew: boolean('auto_renew').default(false),
  notificationDays: integer('notification_days'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const vendorProducts = pgTable('vendor_products', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').notNull(),
  materialId: integer('material_id').notNull(),
  vendorProductCode: varchar('vendor_product_code', { length: 100 }),
  vendorProductName: text('vendor_product_name'),
  price: numeric('price').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  leadTime: integer('lead_time'), // in days
  minOrderQty: numeric('min_order_qty'),
  isPreferred: boolean('is_preferred').default(false),
  notes: text('notes'),
  lastPurchaseDate: date('last_purchase_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const batchLots = pgTable('batch_lots', {
  id: serial('id').primaryKey(),
  batchNumber: varchar('batch_number', { length: 100 }).notNull().unique(),
  materialId: integer('material_id').notNull(),
  quantity: numeric('quantity').notNull(),
  remainingQuantity: numeric('remaining_quantity').notNull(),
  uom: text('uom').notNull(),
  status: batchStatus('status').default('Available'),
  manufacturingDate: date('manufacturing_date'),
  expirationDate: date('expiration_date'),
  receivedDate: date('received_date'),
  cost: numeric('cost'),
  locationId: integer('location_id'),
  vendorId: integer('vendor_id'),
  purchaseOrderNumber: text('purchase_order_number'),
  qualityStatus: text('quality_status'),
  attributes: json('attributes'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const materialValuations = pgTable('material_valuations', {
  id: serial('id').primaryKey(),
  materialId: integer('material_id').notNull(),
  valuationMethod: valuationMethod('valuation_method').notNull(),
  valuationDate: date('valuation_date').notNull(),
  unitValue: numeric('unit_value').notNull(),
  totalValue: numeric('total_value').notNull(),
  quantity: numeric('quantity').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  calculationDetails: json('calculation_details'),
  periodId: integer('period_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const materialValuationMethods = pgTable('material_valuation_methods', {
  id: serial('id').primaryKey(),
  name: valuationMethod('name').notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  defaultForMaterialTypes: json('default_for_material_types'), // Array of material types
  calculationLogic: text('calculation_logic'),
  lastCalculated: timestamp('last_calculated'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

// Materials Requirements Planning (MRP) tables
export const mrpForecasts = pgTable('mrp_forecasts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: text('status').default('Draft'),
  creationMethod: text('creation_method').default('Manual'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by')
});

export const mrpForecastItems = pgTable('mrp_forecast_items', {
  id: serial('id').primaryKey(),
  forecastId: integer('forecast_id').notNull(),
  materialId: integer('material_id').notNull(),
  quantity: numeric('quantity').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  confidence: numeric('confidence'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const materialRequirements = pgTable('material_requirements', {
  id: serial('id').primaryKey(),
  materialId: integer('material_id').notNull(),
  requirementDate: date('requirement_date').notNull(),
  quantity: numeric('quantity').notNull(),
  source: text('source').notNull(), // Sales Order, Forecast, etc.
  sourceId: integer('source_id'), // Reference to the source record
  priority: text('priority').default('Normal'),
  status: text('status').default('Planned'),
  fulfilled: boolean('fulfilled').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Relations
export const materialsRelations = relations(materials, ({ one, many }) => ({
  category: one(materialCategories, {
    fields: [materials.categoryId],
    references: [materialCategories.id]
  }),
  defaultLocation: one(storageLocations, {
    fields: [materials.defaultLocationId],
    references: [storageLocations.id]
  }),
  batches: many(batchLots),
  valuations: many(materialValuations),
  vendorProducts: many(vendorProducts)
}));

export const materialCategoriesRelations = relations(materialCategories, ({ one, many }) => ({
  parent: one(materialCategories, {
    fields: [materialCategories.parentId],
    references: [materialCategories.id]
  }),
  children: many(materialCategories),
  materials: many(materials)
}));

export const storageLocationsRelations = relations(storageLocations, ({ one, many }) => ({
  parent: one(storageLocations, {
    fields: [storageLocations.parentId],
    references: [storageLocations.id]
  }),
  children: many(storageLocations),
  materials: many(materials, { relationName: 'defaultLocation' }),
  batches: many(batchLots)
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  contracts: many(vendorContracts),
  products: many(vendorProducts),
  batches: many(batchLots)
}));

export const vendorContractsRelations = relations(vendorContracts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorContracts.vendorId],
    references: [vendors.id]
  })
}));

export const vendorProductsRelations = relations(vendorProducts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorProducts.vendorId],
    references: [vendors.id]
  }),
  material: one(materials, {
    fields: [vendorProducts.materialId],
    references: [materials.id]
  })
}));

export const batchLotsRelations = relations(batchLots, ({ one }) => ({
  material: one(materials, {
    fields: [batchLots.materialId],
    references: [materials.id]
  }),
  location: one(storageLocations, {
    fields: [batchLots.locationId],
    references: [storageLocations.id]
  }),
  vendor: one(vendors, {
    fields: [batchLots.vendorId],
    references: [vendors.id]
  })
}));

export const materialValuationsRelations = relations(materialValuations, ({ one }) => ({
  material: one(materials, {
    fields: [materialValuations.materialId],
    references: [materials.id]
  })
}));

export const mrpForecastsRelations = relations(mrpForecasts, ({ many }) => ({
  items: many(mrpForecastItems)
}));

export const mrpForecastItemsRelations = relations(mrpForecastItems, ({ one }) => ({
  forecast: one(mrpForecasts, {
    fields: [mrpForecastItems.forecastId],
    references: [mrpForecasts.id]
  }),
  material: one(materials, {
    fields: [mrpForecastItems.materialId],
    references: [materials.id]
  })
}));

export const materialRequirementsRelations = relations(materialRequirements, ({ one }) => ({
  material: one(materials, {
    fields: [materialRequirements.materialId],
    references: [materials.id]
  })
}));

// Zod Schemas for Inserts
export const insertMaterialSchema = createInsertSchema(materials).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export const insertMaterialCategorySchema = createInsertSchema(materialCategories).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMaterialCategory = z.infer<typeof insertMaterialCategorySchema>;
export type MaterialCategory = typeof materialCategories.$inferSelect;

export const insertStorageLocationSchema = createInsertSchema(storageLocations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertStorageLocation = z.infer<typeof insertStorageLocationSchema>;
export type StorageLocation = typeof storageLocations.$inferSelect;

export const insertVendorSchema = createInsertSchema(vendors).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export const insertVendorContractSchema = createInsertSchema(vendorContracts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertVendorContract = z.infer<typeof insertVendorContractSchema>;
export type VendorContract = typeof vendorContracts.$inferSelect;

export const insertVendorProductSchema = createInsertSchema(vendorProducts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;
export type VendorProduct = typeof vendorProducts.$inferSelect;

export const insertBatchLotSchema = createInsertSchema(batchLots).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertBatchLot = z.infer<typeof insertBatchLotSchema>;
export type BatchLot = typeof batchLots.$inferSelect;

export const insertMaterialValuationSchema = createInsertSchema(materialValuations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMaterialValuation = z.infer<typeof insertMaterialValuationSchema>;
export type MaterialValuation = typeof materialValuations.$inferSelect;

export const insertMaterialValuationMethodSchema = createInsertSchema(materialValuationMethods).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMaterialValuationMethod = z.infer<typeof insertMaterialValuationMethodSchema>;
export type MaterialValuationMethod = typeof materialValuationMethods.$inferSelect;

export const insertMrpForecastSchema = createInsertSchema(mrpForecasts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMrpForecast = z.infer<typeof insertMrpForecastSchema>;
export type MrpForecast = typeof mrpForecasts.$inferSelect;

export const insertMrpForecastItemSchema = createInsertSchema(mrpForecastItems).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMrpForecastItem = z.infer<typeof insertMrpForecastItemSchema>;
export type MrpForecastItem = typeof mrpForecastItems.$inferSelect;

export const insertMaterialRequirementSchema = createInsertSchema(materialRequirements).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertMaterialRequirement = z.infer<typeof insertMaterialRequirementSchema>;
export type MaterialRequirement = typeof materialRequirements.$inferSelect;