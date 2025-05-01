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

export const warehouseZonesRelations = relations(warehouse_zones, ({ one }) => ({
  warehouse: one(warehouses, {
    fields: [warehouse_zones.warehouse_id],
    references: [warehouses.id],
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