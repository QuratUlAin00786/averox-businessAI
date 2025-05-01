import { relations } from 'drizzle-orm';
import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products, users, inventoryTransactions } from './schema';

// Enums
export const production_order_status = pgEnum('production_order_status', [
  'Draft', 'Scheduled', 'InProgress', 'Completed', 'OnHold', 'Cancelled'
]);

export const production_priority = pgEnum('production_priority', [
  'Critical', 'High', 'Medium', 'Low'
]);

export const quality_inspection_result = pgEnum('quality_inspection_result', [
  'Pass', 'Fail', 'PendingReview', 'Acceptable', 'Rework'
]);

export const maintenance_type = pgEnum('maintenance_type', [
  'Preventive', 'Corrective', 'Predictive', 'Condition-Based'
]);

export const maintenance_status = pgEnum('maintenance_status', [
  'Scheduled', 'InProgress', 'Completed', 'Deferred', 'Cancelled'
]);

export const equipment_status = pgEnum('equipment_status', [
  'Operational', 'UnderMaintenance', 'Idle', 'Decommissioned', 'Faulty'
]);

export const work_center_status = pgEnum('work_center_status', [
  'Active', 'Inactive', 'AtCapacity', 'UnderMaintenance'
]);

export const manufacturing_type = pgEnum('manufacturing_type', [
  'Discrete', 'Process', 'Repetitive', 'Batch', 'Lean', 'Custom'
]);

export const material_type = pgEnum('material_type', [
  'RawMaterial', 'Intermediate', 'FinishedGood', 'Packaging', 'Consumable', 'Spare'
]);

export const unit_of_measure = pgEnum('unit_of_measure', [
  'Each', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'SquareMeter', 'CubicMeter', 'Hour', 'Minute', 'Ton', 'Dozen'
]);

// New enums for enhanced materials management
export const material_valuation_method = pgEnum('material_valuation_method', [
  'FIFO', 'LIFO', 'MovingAverage', 'StandardCost', 'BatchSpecific'
]);

export const storage_bin_type = pgEnum('storage_bin_type', [
  'Standard', 'Bulk', 'Hazardous', 'Refrigerated', 'HighValue', 'RawMaterial', 'FinishedGoods', 'ReturnArea', 'QualityInspection', 'Staging', 'PickingArea', 'ShippingArea'
]);

export const warehouse_process_type = pgEnum('warehouse_process_type', [
  'Putaway', 'Picking', 'Transfer', 'Replenishment', 'CycleCounting', 'Receiving', 'Shipping', 'CrossDocking', 'Kitting', 'WaveProcess'
]);

export const lot_status = pgEnum('lot_status', [
  'Available', 'Reserved', 'OnHold', 'InTransit', 'Quarantine', 'Rejected', 'Consumed', 'Expired'
]);

export const vendor_rating_category = pgEnum('vendor_rating_category', [
  'Delivery', 'Quality', 'Price', 'Service', 'Sustainability', 'Innovation', 'Compliance', 'Overall'
]);

export const putaway_strategy = pgEnum('putaway_strategy', [
  'FixedBin', 'EmptierFirst', 'FIFO', 'LIFO', 'NearestBin', 'ZoneBased', 'ProductGroup', 'Chaotic'
]);

export const picking_strategy = pgEnum('picking_strategy', [
  'FIFO', 'FEFO', 'LIFO', 'BatchSequence', 'ZoneWave', 'Discrete', 'Cluster', 'Batch'
]);

// Advanced MRP Tables
export const mrp_runs = pgTable('mrp_runs', {
  id: serial('id').primaryKey(),
  run_name: text('run_name').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  planning_horizon_start: timestamp('planning_horizon_start').notNull(),
  planning_horizon_end: timestamp('planning_horizon_end').notNull(),
  status: text('status').default('InProgress'),
  parameters: jsonb('parameters'),
  completion_time: timestamp('completion_time'),
  notes: text('notes'),
  simulation_mode: boolean('simulation_mode').default(false),
  log_details: text('log_details'),
  warehouse_id: integer('warehouse_id'), // can be null for all warehouses
  product_categories: text('product_categories').array(),
  included_products: integer('included_products').array(),
  excluded_products: integer('excluded_products').array(),
  consider_safety_stock: boolean('consider_safety_stock').default(true),
  consider_lead_times: boolean('consider_lead_times').default(true),
  consider_current_inventory: boolean('consider_current_inventory').default(true),
  consider_capacity_constraints: boolean('consider_capacity_constraints').default(false),
  consider_batch_sizes: boolean('consider_batch_sizes').default(true)
});

export const mrpRunsRelations = relations(mrp_runs, ({ one, many }) => ({
  creator: one(users, {
    fields: [mrp_runs.created_by],
    references: [users.id],
  }),
  warehouse: one(warehouses, {
    fields: [mrp_runs.warehouse_id],
    references: [warehouses.id],
  }),
  materialsRequirements: many(material_requirements)
}));

export const material_requirements = pgTable('material_requirements', {
  id: serial('id').primaryKey(),
  mrp_run_id: integer('mrp_run_id').notNull().references(() => mrp_runs.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  required_quantity: numeric('required_quantity').notNull(),
  available_quantity: numeric('available_quantity'),
  net_requirement: numeric('net_requirement'),
  planned_order_quantity: numeric('planned_order_quantity'),
  due_date: timestamp('due_date').notNull(),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  source_type: text('source_type'), // CustomerOrder, ForecastedDemand, MinimumStockLevel, etc.
  source_id: integer('source_id'), // ID of the source order, forecast entry, etc.
  parent_product_id: integer('parent_product_id').references(() => products.id), // For multi-level MRP
  parent_bom_id: integer('parent_bom_id').references(() => bill_of_materials.id), // BOM ID that needs this component
  action_type: text('action_type'), // MakeToBuy, BuyToStock, MakeToOrder, etc.
  planned_start_date: timestamp('planned_start_date'),
  planned_release_date: timestamp('planned_release_date'),
  action_status: text('action_status').default('Planned'),
  converted_to_po_id: integer('converted_to_po_id'), // If converted to a purchase order
  converted_to_prod_id: integer('converted_to_prod_id'), // If converted to a production order
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  priority: integer('priority').default(5),
  notes: text('notes'),
  lot_size: numeric('lot_size'),
  action_message: text('action_message'),
  lead_time_days: integer('lead_time_days'),
  safety_stock_level: numeric('safety_stock_level'),
  economic_order_quantity: numeric('economic_order_quantity'),
  level_number: integer('level_number').default(0) // multi-level mrp level
});

export const materialRequirementsRelations = relations(material_requirements, ({ one }) => ({
  mrpRun: one(mrp_runs, {
    fields: [material_requirements.mrp_run_id],
    references: [mrp_runs.id],
  }),
  product: one(products, {
    fields: [material_requirements.product_id],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [material_requirements.warehouse_id],
    references: [warehouses.id],
  }),
  parentProduct: one(products, {
    fields: [material_requirements.parent_product_id],
    references: [products.id],
  }),
  parentBom: one(bill_of_materials, {
    fields: [material_requirements.parent_bom_id],
    references: [bill_of_materials.id],
  })
}));

export const material_forecasts = pgTable('material_forecasts', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => products.id),
  forecast_period: text('forecast_period').notNull(), // e.g., "2025-01", "2025-Q1", etc.
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  forecast_type: text('forecast_type').default('Sales'), // Sales, Production, Consumption, etc.
  confidence_level: numeric('confidence_level'),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  is_approved: boolean('is_approved').default(false),
  approved_by: integer('approved_by').references(() => users.id),
  approval_date: timestamp('approval_date'),
  category: text('category'),
  notes: text('notes'),
  source: text('source').default('Manual'), // Manual, AlgorithmicForecast, Historical, etc.
  method: text('method'), // MovingAverage, ExponentialSmoothing, MachineLearning, etc.
  external_reference: text('external_reference')
});

export const materialForecastsRelations = relations(material_forecasts, ({ one }) => ({
  product: one(products, {
    fields: [material_forecasts.product_id],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [material_forecasts.warehouse_id],
    references: [warehouses.id],
  }),
  creator: one(users, {
    fields: [material_forecasts.created_by],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [material_forecasts.approved_by],
    references: [users.id],
  })
}));

// Tables
export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zip: text('zip'),
  country: text('country'),
  contact_person: text('contact_person'),
  contact_phone: text('contact_phone'),
  contact_email: text('contact_email'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  owner_id: integer('owner_id').references(() => users.id),
  parent_warehouse_id: integer('parent_warehouse_id').references(() => warehouses.id),
  capacity: numeric('capacity'),
  utilization_rate: numeric('utilization_rate'),
  is_manufacturing: boolean('is_manufacturing').default(false)
});

export const warehousesRelations = relations(warehouses, ({ one, many }) => ({
  owner: one(users, {
    fields: [warehouses.owner_id],
    references: [users.id],
  }),
  parent: one(warehouses, {
    fields: [warehouses.parent_warehouse_id],
    references: [warehouses.id],
  }),
  zones: many(warehouse_zones),
  work_centers: many(work_centers)
}));

export const warehouse_zones = pgTable('warehouse_zones', {
  id: serial('id').primaryKey(),
  warehouse_id: integer('warehouse_id').notNull().references(() => warehouses.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  zone_type: text('zone_type').notNull(),
  capacity: numeric('capacity'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
});

export const warehouseZonesRelations = relations(warehouse_zones, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [warehouse_zones.warehouse_id],
    references: [warehouses.id],
  }),
  storageBins: many(storage_bins)
}));

// SAP-style storage location and bin management
export const storage_bins = pgTable('storage_bins', {
  id: serial('id').primaryKey(),
  warehouse_id: integer('warehouse_id').notNull().references(() => warehouses.id),
  zone_id: integer('zone_id').references(() => warehouse_zones.id),
  bin_code: text('bin_code').notNull(),
  aisle: text('aisle'),
  rack: text('rack'),
  level: text('level'),
  position: text('position'),
  bin_type: storage_bin_type('bin_type').default('Standard'),
  capacity: numeric('capacity'),
  available_capacity: numeric('available_capacity'),
  is_active: boolean('is_active').default(true),
  is_blocked: boolean('is_blocked').default(false),
  block_reason: text('block_reason'),
  max_weight: numeric('max_weight'),
  current_weight: numeric('current_weight'),
  height: numeric('height'),
  width: numeric('width'),
  depth: numeric('depth'),
  special_handling_notes: text('special_handling_notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  last_inventory_check: timestamp('last_inventory_check'),
  rfid_tag: text('rfid_tag'),
  putaway_sequence: integer('putaway_sequence'),
  picking_sequence: integer('picking_sequence'),
  is_mixing_allowed: boolean('is_mixing_allowed').default(false),
  bin_barcode: text('bin_barcode'),
  last_cycle_count: timestamp('last_cycle_count')
});

export const storageBinsRelations = relations(storage_bins, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [storage_bins.warehouse_id],
    references: [warehouses.id],
  }),
  zone: one(warehouse_zones, {
    fields: [storage_bins.zone_id],
    references: [warehouse_zones.id],
  }),
  binContents: many(storage_bin_contents),
  materialReservations: many(material_reservations)
}));

export const storage_bin_contents = pgTable('storage_bin_contents', {
  id: serial('id').primaryKey(),
  bin_id: integer('bin_id').notNull().references(() => storage_bins.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  batch_lot_id: integer('batch_lot_id').references(() => batch_lots.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  expiration_date: timestamp('expiration_date'),
  quality_status: text('quality_status'),
  owner_id: integer('owner_id').references(() => users.id),
  production_date: timestamp('production_date'),
  status: text('status').default('Available'),
  last_movement_date: timestamp('last_movement_date'),
  last_count_date: timestamp('last_count_date'),
  valuation: numeric('valuation')
});

export const storageBinContentsRelations = relations(storage_bin_contents, ({ one }) => ({
  bin: one(storage_bins, {
    fields: [storage_bin_contents.bin_id],
    references: [storage_bins.id],
  }),
  product: one(products, {
    fields: [storage_bin_contents.product_id],
    references: [products.id],
  }),
  batchLot: one(batch_lots, {
    fields: [storage_bin_contents.batch_lot_id],
    references: [batch_lots.id],
  }),
  owner: one(users, {
    fields: [storage_bin_contents.owner_id],
    references: [users.id],
  })
}));

// Batch and lot management
export const batch_lots = pgTable('batch_lots', {
  id: serial('id').primaryKey(),
  lot_number: text('lot_number').notNull(),
  batch_number: text('batch_number'),
  product_id: integer('product_id').notNull().references(() => products.id),
  vendor_id: integer('vendor_id'),
  purchase_order_id: integer('purchase_order_id'),
  production_order_id: integer('production_order_id').references(() => production_orders.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  status: lot_status('status').default('Available'),
  manufacture_date: timestamp('manufacture_date'),
  expiration_date: timestamp('expiration_date'),
  receipt_date: timestamp('receipt_date'),
  quality_status: text('quality_status').default('Pending'),
  is_quarantine: boolean('is_quarantine').default(false),
  quarantine_reason: text('quarantine_reason'),
  quarantine_until: timestamp('quarantine_until'),
  parent_lot_id: integer('parent_lot_id').references(() => batch_lots.id),
  cost: numeric('cost'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  certificates: jsonb('certificates'),
  country_of_origin: text('country_of_origin'),
  customs_info: jsonb('customs_info'),
  notes: text('notes')
});

export const batchLotsRelations = relations(batch_lots, ({ one, many }) => ({
  product: one(products, {
    fields: [batch_lots.product_id],
    references: [products.id],
  }),
  productionOrder: one(production_orders, {
    fields: [batch_lots.production_order_id],
    references: [production_orders.id],
  }),
  parentLot: one(batch_lots, {
    fields: [batch_lots.parent_lot_id],
    references: [batch_lots.id],
  }),
  creator: one(users, {
    fields: [batch_lots.created_by],
    references: [users.id],
  }),
  binContents: many(storage_bin_contents),
  childLots: many(batch_lots, { relationName: 'parent_child_lots' })
}));

// Advanced Vendor Management (SAP-style supplier management system)
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  vendor_code: text('vendor_code').notNull().unique(),
  name: text('name').notNull(),
  legal_name: text('legal_name'),
  tax_id: text('tax_id'),
  vendor_type: text('vendor_type').notNull(), // Manufacturer, Distributor, Service Provider, etc.
  status: text('status').default('Active'),
  rating: integer('rating'), // 1-5 star rating
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postal_code: text('postal_code'),
  country: text('country'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  payment_terms: text('payment_terms'),
  contact_person: text('contact_person'),
  contact_email: text('contact_email'),
  contact_phone: text('contact_phone'),
  currency: text('currency').default('USD'),
  credit_limit: numeric('credit_limit'),
  account_manager_id: integer('account_manager_id').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  vat_number: text('vat_number'),
  is_approved: boolean('is_approved').default(false),
  is_preferred: boolean('is_preferred').default(false),
  payment_method: text('payment_method'),
  bank_details: jsonb('bank_details'),
  evaluation_date: timestamp('evaluation_date'),
  evaluation_score: numeric('evaluation_score'),
  certification_info: jsonb('certification_info'),
  sustainability_rating: integer('sustainability_rating'), // 1-5
  financial_stability_rating: integer('financial_stability_rating'), // 1-5
  legal_documents: jsonb('legal_documents'),
  notes: text('notes'),
  additional_fields: jsonb('additional_fields'),
  incoterms: text('incoterms'), // FOB, CIF, EXW, etc.
  lead_time_days: integer('lead_time_days'),
  minimum_order_value: numeric('minimum_order_value'),
  on_time_delivery_rate: numeric('on_time_delivery_rate'),
  quality_rejection_rate: numeric('quality_rejection_rate')
});

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  accountManager: one(users, {
    fields: [vendors.account_manager_id],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [vendors.created_by],
    references: [users.id],
  }),
  vendorRatings: many(vendor_ratings),
  vendorContracts: many(vendor_contracts),
  vendorProducts: many(vendor_products)
}));

export const vendor_ratings = pgTable('vendor_ratings', {
  id: serial('id').primaryKey(),
  vendor_id: integer('vendor_id').notNull().references(() => vendors.id),
  category: vendor_rating_category('category').notNull(),
  rating: numeric('rating').notNull(), // 1-100 scale
  rating_date: timestamp('rating_date').defaultNow(),
  evaluated_by: integer('evaluated_by').references(() => users.id),
  notes: text('notes'),
  evaluation_period_start: timestamp('evaluation_period_start'),
  evaluation_period_end: timestamp('evaluation_period_end'),
  raw_score: numeric('raw_score'),
  weight: numeric('weight').default('1'),
  supporting_documents: jsonb('supporting_documents'),
  improvement_plan: text('improvement_plan'),
  followup_date: timestamp('followup_date')
});

export const vendorRatingsRelations = relations(vendor_ratings, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendor_ratings.vendor_id],
    references: [vendors.id],
  }),
  evaluator: one(users, {
    fields: [vendor_ratings.evaluated_by],
    references: [users.id],
  })
}));

export const vendor_contracts = pgTable('vendor_contracts', {
  id: serial('id').primaryKey(),
  vendor_id: integer('vendor_id').notNull().references(() => vendors.id),
  contract_number: text('contract_number').notNull(),
  contract_type: text('contract_type').notNull(), // Framework, Spot Purchase, Service Level, etc.
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date'),
  auto_renew: boolean('auto_renew').default(false),
  status: text('status').default('Draft'),
  payment_terms: text('payment_terms'),
  terms_conditions: text('terms_conditions'),
  attachments: jsonb('attachments'),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  approved_by: integer('approved_by').references(() => users.id),
  approval_date: timestamp('approval_date'),
  total_value: numeric('total_value'),
  currency: text('currency').default('USD'),
  signed_date: timestamp('signed_date'),
  termination_notice_days: integer('termination_notice_days'),
  price_adjustment_terms: text('price_adjustment_terms'),
  next_review_date: timestamp('next_review_date'),
  penalty_clauses: jsonb('penalty_clauses'),
  performance_targets: jsonb('performance_targets'),
  legal_notes: text('legal_notes'),
  contract_template_id: integer('contract_template_id')
});

export const vendorContractsRelations = relations(vendor_contracts, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [vendor_contracts.vendor_id],
    references: [vendors.id],
  }),
  creator: one(users, {
    fields: [vendor_contracts.created_by],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [vendor_contracts.approved_by],
    references: [users.id],
  })
}));

export const vendor_products = pgTable('vendor_products', {
  id: serial('id').primaryKey(),
  vendor_id: integer('vendor_id').notNull().references(() => vendors.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  vendor_product_code: text('vendor_product_code'),
  vendor_product_name: text('vendor_product_name'),
  unit_price: numeric('unit_price'),
  currency: text('currency').default('USD'),
  minimum_order_quantity: numeric('minimum_order_quantity'),
  lead_time_days: integer('lead_time_days'),
  is_preferred: boolean('is_preferred').default(false),
  last_purchase_date: timestamp('last_purchase_date'),
  last_purchase_price: numeric('last_purchase_price'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  price_breaks: jsonb('price_breaks'), // Quantity discount thresholds
  uom_conversion: jsonb('uom_conversion'), // Vendor to internal UOM conversion
  quality_specs: jsonb('quality_specs'),
  alternative_products: jsonb('alternative_products'),
  certification_requirements: text('certification_requirements'),
  packaging_specs: jsonb('packaging_specs'),
  is_consignment: boolean('is_consignment').default(false),
  is_default_source: boolean('is_default_source').default(false),
  allocation_percentage: numeric('allocation_percentage')
});

export const vendorProductsRelations = relations(vendor_products, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendor_products.vendor_id],
    references: [vendors.id],
  }),
  product: one(products, {
    fields: [vendor_products.product_id],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [vendor_products.created_by],
    references: [users.id],
  })
}));

// Material Valuation Management (SAP-style multi-valuation methods)
export const material_valuations = pgTable('material_valuations', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => products.id),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  valuation_method: material_valuation_method('valuation_method').notNull(),
  value_per_unit: numeric('value_per_unit').notNull(),
  currency: text('currency').default('USD'),
  valuation_date: timestamp('valuation_date').defaultNow(),
  updated_by: integer('updated_by').references(() => users.id),
  is_active: boolean('is_active').default(true),
  previous_value_per_unit: numeric('previous_value_per_unit'),
  change_reason: text('change_reason'),
  batch_lot_id: integer('batch_lot_id').references(() => batch_lots.id),
  accounting_period: text('accounting_period'),
  is_posted_to_gl: boolean('is_posted_to_gl').default(false),
  gl_account: text('gl_account'),
  gl_posting_date: timestamp('gl_posting_date'),
  gl_posting_reference: text('gl_posting_reference')
});

export const materialValuationsRelations = relations(material_valuations, ({ one }) => ({
  product: one(products, {
    fields: [material_valuations.product_id],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [material_valuations.warehouse_id],
    references: [warehouses.id],
  }),
  updater: one(users, {
    fields: [material_valuations.updated_by],
    references: [users.id],
  }),
  batchLot: one(batch_lots, {
    fields: [material_valuations.batch_lot_id],
    references: [batch_lots.id],
  })
}));

export const price_lists = pgTable('price_lists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  currency: text('currency').default('USD'),
  effective_from: timestamp('effective_from'),
  effective_to: timestamp('effective_to'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  updated_at: timestamp('updated_at'),
  customer_category: text('customer_category'),
  vendor_category: text('vendor_category'),
  price_basis: text('price_basis'), // StandardCost, LastPurchasePrice, etc.
  price_calculation_method: text('price_calculation_method'), // Fixed, CostPlusMarkup, etc.
  markup_percentage: numeric('markup_percentage'),
  price_list_type: text('price_list_type'), // Purchase, Sales, Transfer, etc.
  priority: integer('priority').default(10),
  notes: text('notes')
});

export const priceListsRelations = relations(price_lists, ({ one, many }) => ({
  creator: one(users, {
    fields: [price_lists.created_by],
    references: [users.id],
  }),
  priceListItems: many(price_list_items)
}));

export const price_list_items = pgTable('price_list_items', {
  id: serial('id').primaryKey(),
  price_list_id: integer('price_list_id').notNull().references(() => price_lists.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  price: numeric('price').notNull(),
  min_quantity: numeric('min_quantity').default('1'),
  max_quantity: numeric('max_quantity'),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  is_active: boolean('is_active').default(true),
  discount_percentage: numeric('discount_percentage'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id)
});

export const priceListItemsRelations = relations(price_list_items, ({ one }) => ({
  priceList: one(price_lists, {
    fields: [price_list_items.price_list_id],
    references: [price_lists.id],
  }),
  product: one(products, {
    fields: [price_list_items.product_id],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [price_list_items.created_by],
    references: [users.id],
  })
}));

// Returns Management
export const return_authorizations = pgTable('return_authorizations', {
  id: serial('id').primaryKey(),
  rma_number: text('rma_number').notNull().unique(),
  customer_id: integer('customer_id'),
  vendor_id: integer('vendor_id').references(() => vendors.id),
  return_type: text('return_type').notNull(), // CustomerReturn, VendorReturn
  status: text('status').default('Pending'),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  approved_by: integer('approved_by').references(() => users.id),
  approval_date: timestamp('approval_date'),
  expected_return_date: timestamp('expected_return_date'),
  actual_return_date: timestamp('actual_return_date'),
  source_document_type: text('source_document_type'), // SalesOrder, PurchaseOrder, etc.
  source_document_id: integer('source_document_id'),
  return_reason: text('return_reason'),
  notes: text('notes'),
  shipping_method: text('shipping_method'),
  shipping_tracking: text('shipping_tracking'),
  quality_check_required: boolean('quality_check_required').default(true),
  resolution: text('resolution'), // Refund, Replace, Repair, Credit, Reject
  resolution_date: timestamp('resolution_date'),
  return_address: text('return_address')
});

export const returnAuthorizationsRelations = relations(return_authorizations, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [return_authorizations.vendor_id],
    references: [vendors.id],
  }),
  creator: one(users, {
    fields: [return_authorizations.created_by],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [return_authorizations.approved_by],
    references: [users.id],
  }),
  returnItems: many(return_items)
}));

export const return_items = pgTable('return_items', {
  id: serial('id').primaryKey(),
  return_id: integer('return_id').notNull().references(() => return_authorizations.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  batch_lot_id: integer('batch_lot_id').references(() => batch_lots.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  return_reason: text('return_reason'),
  condition: text('condition'), // New, Used, Damaged, Defective, etc.
  status: text('status').default('Pending'),
  quality_check_status: text('quality_check_status'),
  quality_check_date: timestamp('quality_check_date'),
  quality_check_by: integer('quality_check_by').references(() => users.id),
  quality_check_notes: text('quality_check_notes'),
  disposition: text('disposition'), // ReturnToStock, Scrap, Rework, etc.
  value: numeric('value'),
  restocking_fee: numeric('restocking_fee'),
  source_item_id: integer('source_item_id'),
  return_location_id: integer('return_location_id').references(() => storage_bins.id),
  notes: text('notes')
});

export const returnItemsRelations = relations(return_items, ({ one }) => ({
  returnAuthorization: one(return_authorizations, {
    fields: [return_items.return_id],
    references: [return_authorizations.id],
  }),
  product: one(products, {
    fields: [return_items.product_id],
    references: [products.id],
  }),
  batchLot: one(batch_lots, {
    fields: [return_items.batch_lot_id],
    references: [batch_lots.id],
  }),
  qualityChecker: one(users, {
    fields: [return_items.quality_check_by],
    references: [users.id],
  }),
  returnLocation: one(storage_bins, {
    fields: [return_items.return_location_id],
    references: [storage_bins.id],
  })
}));

// Global Trade & Compliance
export const trade_compliance = pgTable('trade_compliance', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').references(() => products.id),
  country_of_origin: text('country_of_origin'),
  hs_code: text('hs_code'), // Harmonized System code
  eccn: text('eccn'), // Export Control Classification Number
  is_dual_use: boolean('is_dual_use').default(false),
  restricted_countries: text('restricted_countries').array(),
  export_license_required: boolean('export_license_required').default(false),
  import_license_required: boolean('import_license_required').default(false),
  classification_notes: text('classification_notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  updated_by: integer('updated_by').references(() => users.id),
  license_documents: jsonb('license_documents'),
  commodity_code: text('commodity_code'),
  preference_criteria: text('preference_criteria'),
  producer_statement: text('producer_statement'),
  certificate_of_origin: jsonb('certificate_of_origin'),
  hazmat_class: text('hazmat_class'),
  un_number: text('un_number'),
  import_duties: numeric('import_duties'),
  export_restrictions: jsonb('export_restrictions'),
  documentation_requirements: jsonb('documentation_requirements')
});

export const tradeComplianceRelations = relations(trade_compliance, ({ one }) => ({
  product: one(products, {
    fields: [trade_compliance.product_id],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [trade_compliance.created_by],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [trade_compliance.updated_by],
    references: [users.id],
  })
}));

// Material reservations
export const material_reservations = pgTable('material_reservations', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => products.id),
  bin_id: integer('bin_id').references(() => storage_bins.id),
  batch_lot_id: integer('batch_lot_id').references(() => batch_lots.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  reservation_type: text('reservation_type').notNull(), // Production, Sales, Transfer, etc.
  reference_id: integer('reference_id'), // Production order ID, sales order ID, etc.
  reference_type: text('reference_type'), // "ProductionOrder", "SalesOrder", etc.
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  expiration_date: timestamp('expiration_date'),
  status: text('status').default('Active'),
  notes: text('notes'),
  priority: integer('priority').default(5)
});

export const materialReservationsRelations = relations(material_reservations, ({ one }) => ({
  product: one(products, {
    fields: [material_reservations.product_id],
    references: [products.id],
  }),
  bin: one(storage_bins, {
    fields: [material_reservations.bin_id],
    references: [storage_bins.id],
  }),
  batchLot: one(batch_lots, {
    fields: [material_reservations.batch_lot_id],
    references: [batch_lots.id],
  }),
  creator: one(users, {
    fields: [material_reservations.created_by],
    references: [users.id],
  })
}));

export const work_centers = pgTable('work_centers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  status: work_center_status('status').default('Active'),
  hourly_rate: numeric('hourly_rate'),
  capacity: numeric('capacity'),
  setup_time: numeric('setup_time'),
  operating_hours: jsonb('operating_hours'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  maintenance_schedule: jsonb('maintenance_schedule'),
  equipment_list: text('equipment_list').array(),
  department_id: integer('department_id'),
  industry_type: text('industry_type')
});

export const workCentersRelations = relations(work_centers, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [work_centers.warehouse_id],
    references: [warehouses.id],
  }),
  routingOperations: many(routing_operations),
  equipment: many(equipment)
}));

export const bill_of_materials = pgTable('bill_of_materials', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => products.id),
  name: text('name').notNull(),
  version: text('version').notNull(),
  is_active: boolean('is_active').default(true),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  approved_by: integer('approved_by').references(() => users.id),
  approval_date: date('approval_date'),
  manufacturing_type: manufacturing_type('manufacturing_type').default('Discrete'),
  is_default: boolean('is_default').default(false),
  total_cost: numeric('total_cost'),
  notes: text('notes'),
  revision_notes: text('revision_notes'),
  yield: numeric('yield').default('100')
});

export const bomRelations = relations(bill_of_materials, ({ one, many }) => ({
  product: one(products, {
    fields: [bill_of_materials.product_id],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [bill_of_materials.created_by],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [bill_of_materials.approved_by],
    references: [users.id],
  }),
  bomItems: many(bom_items),
  routings: many(routings),
  productionOrders: many(production_orders)
}));

export const bom_items = pgTable('bom_items', {
  id: serial('id').primaryKey(),
  bom_id: integer('bom_id').notNull().references(() => bill_of_materials.id),
  component_id: integer('component_id').notNull().references(() => products.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  position: integer('position').default(0),
  is_sub_assembly: boolean('is_sub_assembly').default(false),
  scrap_rate: numeric('scrap_rate').default(0),
  notes: text('notes'),
  is_optional: boolean('is_optional').default(false),
  substitutes: jsonb('substitutes'),
  operation: text('operation'),
  work_center_id: integer('work_center_id').references(() => work_centers.id)
});

export const bomItemsRelations = relations(bom_items, ({ one }) => ({
  bom: one(bill_of_materials, {
    fields: [bom_items.bom_id],
    references: [bill_of_materials.id],
  }),
  component: one(products, {
    fields: [bom_items.component_id],
    references: [products.id],
  }),
  workCenter: one(work_centers, {
    fields: [bom_items.work_center_id],
    references: [work_centers.id],
  })
}));

export const routings = pgTable('routings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  product_id: integer('product_id').references(() => products.id),
  bom_id: integer('bom_id').references(() => bill_of_materials.id),
  version: text('version').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  approved_by: integer('approved_by').references(() => users.id),
  approval_date: date('approval_date'),
  total_standard_hours: numeric('total_standard_hours'),
  is_default: boolean('is_default').default(false)
});

export const routingsRelations = relations(routings, ({ one, many }) => ({
  product: one(products, {
    fields: [routings.product_id],
    references: [products.id],
  }),
  bom: one(bill_of_materials, {
    fields: [routings.bom_id],
    references: [bill_of_materials.id],
  }),
  creator: one(users, {
    fields: [routings.created_by],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [routings.approved_by],
    references: [users.id],
  }),
  operations: many(routing_operations),
  productionOrders: many(production_orders)
}));

export const routing_operations = pgTable('routing_operations', {
  id: serial('id').primaryKey(),
  routing_id: integer('routing_id').notNull().references(() => routings.id),
  sequence: integer('sequence').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  work_center_id: integer('work_center_id').notNull().references(() => work_centers.id),
  setup_time: numeric('setup_time'),
  run_time: numeric('run_time'),
  queue_time: numeric('queue_time'),
  wait_time: numeric('wait_time'),
  instructions: text('instructions'),
  quality_check_required: boolean('quality_check_required').default(false),
  input_materials: jsonb('input_materials'),
  output_products: jsonb('output_products')
});

export const routingOperationsRelations = relations(routing_operations, ({ one, many }) => ({
  routing: one(routings, {
    fields: [routing_operations.routing_id],
    references: [routings.id],
  }),
  workCenter: one(work_centers, {
    fields: [routing_operations.work_center_id],
    references: [work_centers.id],
  }),
  productionOrderOperations: many(production_order_operations)
}));

export const production_orders = pgTable('production_orders', {
  id: serial('id').primaryKey(),
  order_number: text('order_number').notNull().unique(),
  product_id: integer('product_id').notNull().references(() => products.id),
  bom_id: integer('bom_id').references(() => bill_of_materials.id),
  routing_id: integer('routing_id').references(() => routings.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  status: production_order_status('status').default('Draft'),
  priority: production_priority('priority').default('Medium'),
  planned_start_date: timestamp('planned_start_date'),
  planned_end_date: timestamp('planned_end_date'),
  actual_start_date: timestamp('actual_start_date'),
  actual_end_date: timestamp('actual_end_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  notes: text('notes'),
  completed_quantity: numeric('completed_quantity').default(0),
  rejected_quantity: numeric('rejected_quantity').default(0),
  sales_order_id: integer('sales_order_id'),
  batch_number: text('batch_number'),
  industry_type: text('industry_type')
});

export const productionOrdersRelations = relations(production_orders, ({ one, many }) => ({
  product: one(products, {
    fields: [production_orders.product_id],
    references: [products.id],
  }),
  bom: one(bill_of_materials, {
    fields: [production_orders.bom_id],
    references: [bill_of_materials.id],
  }),
  routing: one(routings, {
    fields: [production_orders.routing_id],
    references: [routings.id],
  }),
  creator: one(users, {
    fields: [production_orders.created_by],
    references: [users.id],
  }),
  warehouse: one(warehouses, {
    fields: [production_orders.warehouse_id],
    references: [warehouses.id],
  }),
  operations: many(production_order_operations),
  materialConsumptions: many(material_consumptions),
  qualityInspections: many(quality_inspections),
  manufacturingCosts: many(manufacturing_costs),
  // Industry-specific tables
  pharmaManufacturing: one(pharma_manufacturing, {
    fields: [production_orders.id],
    references: [pharma_manufacturing.production_order_id],
  }),
  textileManufacturing: one(textile_manufacturing, {
    fields: [production_orders.id],
    references: [textile_manufacturing.production_order_id],
  }),
  cementManufacturing: one(cement_manufacturing, {
    fields: [production_orders.id],
    references: [cement_manufacturing.production_order_id],
  })
}));

export const production_order_operations = pgTable('production_order_operations', {
  id: serial('id').primaryKey(),
  production_order_id: integer('production_order_id').notNull().references(() => production_orders.id),
  routing_operation_id: integer('routing_operation_id').references(() => routing_operations.id),
  sequence: integer('sequence').notNull(),
  work_center_id: integer('work_center_id').notNull().references(() => work_centers.id),
  status: text('status').default('Not Started'),
  planned_start_date: timestamp('planned_start_date'),
  planned_end_date: timestamp('planned_end_date'),
  actual_start_date: timestamp('actual_start_date'),
  actual_end_date: timestamp('actual_end_date'),
  setup_time: numeric('setup_time'),
  run_time: numeric('run_time'),
  completed_quantity: numeric('completed_quantity').default(0),
  rejected_quantity: numeric('rejected_quantity').default(0),
  operator_notes: text('operator_notes'),
  assigned_to: integer('assigned_to').references(() => users.id)
});

export const productionOrderOperationsRelations = relations(production_order_operations, ({ one, many }) => ({
  productionOrder: one(production_orders, {
    fields: [production_order_operations.production_order_id],
    references: [production_orders.id],
  }),
  routingOperation: one(routing_operations, {
    fields: [production_order_operations.routing_operation_id],
    references: [routing_operations.id],
  }),
  workCenter: one(work_centers, {
    fields: [production_order_operations.work_center_id],
    references: [work_centers.id],
  }),
  assignedUser: one(users, {
    fields: [production_order_operations.assigned_to],
    references: [users.id],
  }),
  materialConsumptions: many(material_consumptions),
  qualityInspections: many(quality_inspections)
}));

export const material_consumptions = pgTable('material_consumptions', {
  id: serial('id').primaryKey(),
  production_order_id: integer('production_order_id').notNull().references(() => production_orders.id),
  product_id: integer('product_id').notNull().references(() => products.id),
  operation_id: integer('operation_id').references(() => production_order_operations.id),
  quantity: numeric('quantity').notNull(),
  unit_of_measure: unit_of_measure('unit_of_measure').notNull(),
  transaction_date: timestamp('transaction_date').defaultNow(),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  batch_number: text('batch_number'),
  created_by: integer('created_by').references(() => users.id),
  notes: text('notes'),
  inventory_transaction_id: integer('inventory_transaction_id').references(() => inventoryTransactions.id),
  is_backflushed: boolean('is_backflushed').default(false)
});

export const materialConsumptionsRelations = relations(material_consumptions, ({ one }) => ({
  productionOrder: one(production_orders, {
    fields: [material_consumptions.production_order_id],
    references: [production_orders.id],
  }),
  product: one(products, {
    fields: [material_consumptions.product_id],
    references: [products.id],
  }),
  operation: one(production_order_operations, {
    fields: [material_consumptions.operation_id],
    references: [production_order_operations.id],
  }),
  warehouse: one(warehouses, {
    fields: [material_consumptions.warehouse_id],
    references: [warehouses.id],
  }),
  creator: one(users, {
    fields: [material_consumptions.created_by],
    references: [users.id],
  }),
  inventoryTransaction: one(inventoryTransactions, {
    fields: [material_consumptions.inventory_transaction_id],
    references: [inventoryTransactions.id],
  })
}));

export const quality_inspections = pgTable('quality_inspections', {
  id: serial('id').primaryKey(),
  reference_type: text('reference_type').notNull(),
  reference_id: integer('reference_id').notNull(),
  product_id: integer('product_id').notNull().references(() => products.id),
  inspection_date: timestamp('inspection_date').defaultNow(),
  inspected_by: integer('inspected_by').references(() => users.id),
  result: quality_inspection_result('result').notNull(),
  quantity: numeric('quantity').notNull(),
  quantity_passed: numeric('quantity_passed'),
  quantity_failed: numeric('quantity_failed'),
  notes: text('notes'),
  batch_number: text('batch_number'),
  checklist_data: jsonb('checklist_data'),
  attachments: text('attachments').array(),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  operation_id: integer('operation_id').references(() => production_order_operations.id)
});

export const qualityInspectionsRelations = relations(quality_inspections, ({ one, many }) => ({
  product: one(products, {
    fields: [quality_inspections.product_id],
    references: [products.id],
  }),
  inspector: one(users, {
    fields: [quality_inspections.inspected_by],
    references: [users.id],
  }),
  warehouse: one(warehouses, {
    fields: [quality_inspections.warehouse_id],
    references: [warehouses.id],
  }),
  operation: one(production_order_operations, {
    fields: [quality_inspections.operation_id],
    references: [production_order_operations.id],
  }),
  results: many(quality_inspection_results)
}));

export const quality_parameters = pgTable('quality_parameters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  product_id: integer('product_id').references(() => products.id),
  parameter_type: text('parameter_type').notNull(),
  uom: text('uom'),
  minimum_value: text('minimum_value'),
  maximum_value: text('maximum_value'),
  target_value: text('target_value'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id),
  industry_type: text('industry_type')
});

export const qualityParametersRelations = relations(quality_parameters, ({ one, many }) => ({
  product: one(products, {
    fields: [quality_parameters.product_id],
    references: [products.id],
  }),
  creator: one(users, {
    fields: [quality_parameters.created_by],
    references: [users.id],
  }),
  inspectionResults: many(quality_inspection_results)
}));

export const quality_inspection_results = pgTable('quality_inspection_results', {
  id: serial('id').primaryKey(),
  inspection_id: integer('inspection_id').notNull().references(() => quality_inspections.id),
  parameter_id: integer('parameter_id').notNull().references(() => quality_parameters.id),
  value: text('value').notNull(),
  is_passed: boolean('is_passed').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  created_by: integer('created_by').references(() => users.id)
});

export const qualityInspectionResultsRelations = relations(quality_inspection_results, ({ one }) => ({
  inspection: one(quality_inspections, {
    fields: [quality_inspection_results.inspection_id],
    references: [quality_inspections.id],
  }),
  parameter: one(quality_parameters, {
    fields: [quality_inspection_results.parameter_id],
    references: [quality_parameters.id],
  }),
  creator: one(users, {
    fields: [quality_inspection_results.created_by],
    references: [users.id],
  })
}));

export const equipment = pgTable('equipment', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  work_center_id: integer('work_center_id').references(() => work_centers.id),
  status: equipment_status('status').default('Operational'),
  manufacturer: text('manufacturer'),
  model: text('model'),
  serial_number: text('serial_number'),
  purchase_date: date('purchase_date'),
  warranty_expiry_date: date('warranty_expiry_date'),
  last_maintenance_date: date('last_maintenance_date'),
  next_maintenance_date: date('next_maintenance_date'),
  maintenance_frequency: integer('maintenance_frequency'),
  specifications: jsonb('specifications'),
  operating_procedure: text('operating_procedure'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  location: text('location'),
  capacity_per_hour: numeric('capacity_per_hour'),
  power_consumption: numeric('power_consumption'),
  industry_type: text('industry_type')
});

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  workCenter: one(work_centers, {
    fields: [equipment.work_center_id],
    references: [work_centers.id],
  }),
  creator: one(users, {
    fields: [equipment.created_by],
    references: [users.id],
  }),
  maintenanceRequests: many(maintenance_requests)
}));

export const maintenance_requests = pgTable('maintenance_requests', {
  id: serial('id').primaryKey(),
  equipment_id: integer('equipment_id').notNull().references(() => equipment.id),
  request_type: maintenance_type('request_type').default('Corrective'),
  status: maintenance_status('status').default('Scheduled'),
  priority: production_priority('priority').default('Medium'),
  description: text('description').notNull(),
  requested_by: integer('requested_by').notNull().references(() => users.id),
  assigned_to: integer('assigned_to').references(() => users.id),
  request_date: timestamp('request_date').defaultNow(),
  scheduled_date: timestamp('scheduled_date'),
  completion_date: timestamp('completion_date'),
  notes: text('notes'),
  resolution_details: text('resolution_details'),
  parts_used: jsonb('parts_used'),
  downtime: numeric('downtime'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
});

export const maintenanceRequestsRelations = relations(maintenance_requests, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenance_requests.equipment_id],
    references: [equipment.id],
  }),
  requester: one(users, {
    fields: [maintenance_requests.requested_by],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [maintenance_requests.assigned_to],
    references: [users.id],
  })
}));

export const manufacturing_shifts = pgTable('manufacturing_shifts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  work_center_id: integer('work_center_id').references(() => work_centers.id),
  warehouse_id: integer('warehouse_id').references(() => warehouses.id),
  days_of_week: text('days_of_week').array(),
  is_active: boolean('is_active').default(true),
  supervisor_id: integer('supervisor_id').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  break_times: jsonb('break_times'),
  capacity_factor: numeric('capacity_factor').default(1)
});

export const manufacturingShiftsRelations = relations(manufacturing_shifts, ({ one, many }) => ({
  workCenter: one(work_centers, {
    fields: [manufacturing_shifts.work_center_id],
    references: [work_centers.id],
  }),
  warehouse: one(warehouses, {
    fields: [manufacturing_shifts.warehouse_id],
    references: [warehouses.id],
  }),
  supervisor: one(users, {
    fields: [manufacturing_shifts.supervisor_id],
    references: [users.id],
  }),
  assignments: many(shift_assignments)
}));

export const shift_assignments = pgTable('shift_assignments', {
  id: serial('id').primaryKey(),
  shift_id: integer('shift_id').notNull().references(() => manufacturing_shifts.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  work_center_id: integer('work_center_id').references(() => work_centers.id),
  start_date: date('start_date').notNull(),
  end_date: date('end_date'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id)
});

export const shiftAssignmentsRelations = relations(shift_assignments, ({ one }) => ({
  shift: one(manufacturing_shifts, {
    fields: [shift_assignments.shift_id],
    references: [manufacturing_shifts.id],
  }),
  user: one(users, {
    fields: [shift_assignments.user_id],
    references: [users.id],
  }),
  workCenter: one(work_centers, {
    fields: [shift_assignments.work_center_id],
    references: [work_centers.id],
  }),
  creator: one(users, {
    fields: [shift_assignments.created_by],
    references: [users.id],
  })
}));

export const manufacturing_costs = pgTable('manufacturing_costs', {
  id: serial('id').primaryKey(),
  production_order_id: integer('production_order_id').notNull().references(() => production_orders.id),
  material_cost: numeric('material_cost').default(0),
  labor_cost: numeric('labor_cost').default(0),
  overhead_cost: numeric('overhead_cost').default(0),
  setup_cost: numeric('setup_cost').default(0),
  energy_cost: numeric('energy_cost').default(0),
  additional_costs: jsonb('additional_costs'),
  total_cost: numeric('total_cost').default(0),
  cost_per_unit: numeric('cost_per_unit').default(0),
  currency: text('currency').default('USD'),
  costing_date: timestamp('costing_date').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id),
  is_actual: boolean('is_actual').default(false)
});

export const manufacturingCostsRelations = relations(manufacturing_costs, ({ one }) => ({
  productionOrder: one(production_orders, {
    fields: [manufacturing_costs.production_order_id],
    references: [production_orders.id],
  }),
  creator: one(users, {
    fields: [manufacturing_costs.created_by],
    references: [users.id],
  })
}));

// Industry-specific tables
export const pharma_manufacturing = pgTable('pharma_manufacturing', {
  id: serial('id').primaryKey(),
  production_order_id: integer('production_order_id').notNull().references(() => production_orders.id),
  regulatory_batch_number: text('regulatory_batch_number').notNull(),
  expiry_date: date('expiry_date').notNull(),
  manufacturing_date: date('manufacturing_date').notNull(),
  sterility: boolean('sterility').default(false),
  contains_controlled_substances: boolean('contains_controlled_substances').default(false),
  storage_conditions: text('storage_conditions'),
  regulatory_approvals: jsonb('regulatory_approvals'),
  stability_testing_required: boolean('stability_testing_required').default(false),
  analytical_testing: jsonb('analytical_testing'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id)
});

export const pharmaManufacturingRelations = relations(pharma_manufacturing, ({ one }) => ({
  productionOrder: one(production_orders, {
    fields: [pharma_manufacturing.production_order_id],
    references: [production_orders.id],
  }),
  creator: one(users, {
    fields: [pharma_manufacturing.created_by],
    references: [users.id],
  })
}));

export const textile_manufacturing = pgTable('textile_manufacturing', {
  id: serial('id').primaryKey(),
  production_order_id: integer('production_order_id').notNull().references(() => production_orders.id),
  fiber_type: text('fiber_type').notNull(),
  dyeing_method: text('dyeing_method'),
  color_code: text('color_code'),
  pattern_code: text('pattern_code'),
  gsm: numeric('gsm'),
  finishing_process: text('finishing_process'),
  texture_details: text('texture_details'),
  yarn_count: text('yarn_count'),
  fabric_width: numeric('fabric_width'),
  shrinkage_percentage: numeric('shrinkage_percentage'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id)
});

export const textileManufacturingRelations = relations(textile_manufacturing, ({ one }) => ({
  productionOrder: one(production_orders, {
    fields: [textile_manufacturing.production_order_id],
    references: [production_orders.id],
  }),
  creator: one(users, {
    fields: [textile_manufacturing.created_by],
    references: [users.id],
  })
}));

export const cement_manufacturing = pgTable('cement_manufacturing', {
  id: serial('id').primaryKey(),
  production_order_id: integer('production_order_id').notNull().references(() => production_orders.id),
  cement_type: text('cement_type').notNull(),
  strength_class: text('strength_class'),
  composition: jsonb('composition'),
  setting_time: numeric('setting_time'),
  clinker_factor: numeric('clinker_factor'),
  additives: jsonb('additives'),
  packaging_type: text('packaging_type'),
  quality_standard: text('quality_standard'),
  moisture: numeric('moisture'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
  created_by: integer('created_by').references(() => users.id)
});

export const cementManufacturingRelations = relations(cement_manufacturing, ({ one }) => ({
  productionOrder: one(production_orders, {
    fields: [cement_manufacturing.production_order_id],
    references: [production_orders.id],
  }),
  creator: one(users, {
    fields: [cement_manufacturing.created_by],
    references: [users.id],
  })
}));

// Zod schemas
export const insertWarehouseSchema = createInsertSchema(warehouses, {
  name: z.string().min(3).max(100),
  code: z.string().min(2).max(20),
  description: z.string().max(500).nullable().optional(),
});

export const insertWorkCenterSchema = createInsertSchema(work_centers, {
  name: z.string().min(3).max(100),
  code: z.string().min(2).max(20),
  description: z.string().max(500).nullable().optional(),
});

export const insertBomSchema = createInsertSchema(bill_of_materials, {
  name: z.string().min(3).max(100),
  version: z.string().min(1).max(20),
  description: z.string().max(500).nullable().optional(),
});

export const insertProductionOrderSchema = createInsertSchema(production_orders, {
  order_number: z.string().min(3).max(20),
  quantity: z.number().positive(),
});

// Types
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;

export type WorkCenter = typeof work_centers.$inferSelect;
export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;

export type BillOfMaterials = typeof bill_of_materials.$inferSelect;
export type InsertBillOfMaterials = z.infer<typeof insertBomSchema>;

export type ProductionOrder = typeof production_orders.$inferSelect;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;