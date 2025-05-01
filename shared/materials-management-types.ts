/**
 * Type definitions for the Materials Management module
 * These types reflect the enhanced SAP-level capabilities added to Averox
 */
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import {
  // MRP tables
  mrp_runs,
  material_requirements,
  material_forecasts,
  
  // Warehouse management tables
  storage_bins,
  storage_bin_contents,
  
  // Batch and lot management tables
  batch_lots,
  material_reservations,
  
  // Vendor management tables
  vendors,
  vendor_ratings,
  vendor_contracts,
  vendor_products,
  
  // Material valuation and pricing tables
  material_valuations,
  price_lists,
  price_list_items,
  
  // Returns management tables
  return_authorizations,
  return_items,
  
  // Global trade compliance tables
  trade_compliance,
  
  // Enums
  material_valuation_method,
  storage_bin_type,
  warehouse_process_type,
  lot_status,
  vendor_rating_category,
  putaway_strategy,
  picking_strategy
} from './manufacturing-schema';

// MRP (Material Requirements Planning) Types
export type MrpRun = typeof mrp_runs.$inferSelect;
export const insertMrpRunSchema = createInsertSchema(mrp_runs, {
  planning_horizon_start: z.coerce.date(),
  planning_horizon_end: z.coerce.date(),
}).omit({ id: true });
export type InsertMrpRun = z.infer<typeof insertMrpRunSchema>;

export type MaterialRequirement = typeof material_requirements.$inferSelect;
export const insertMaterialRequirementSchema = createInsertSchema(material_requirements, {
  due_date: z.coerce.date(),
  planned_start_date: z.coerce.date().optional(),
  planned_release_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertMaterialRequirement = z.infer<typeof insertMaterialRequirementSchema>;

export type MaterialForecast = typeof material_forecasts.$inferSelect;
export const insertMaterialForecastSchema = createInsertSchema(material_forecasts, {
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  approval_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertMaterialForecast = z.infer<typeof insertMaterialForecastSchema>;

// Warehouse Management Types
export type StorageBin = typeof storage_bins.$inferSelect;
export const insertStorageBinSchema = createInsertSchema(storage_bins, {
  last_inventory_check: z.coerce.date().optional(),
  last_cycle_count: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertStorageBin = z.infer<typeof insertStorageBinSchema>;

export type StorageBinContent = typeof storage_bin_contents.$inferSelect;
export const insertStorageBinContentSchema = createInsertSchema(storage_bin_contents, {
  expiration_date: z.coerce.date().optional(),
  production_date: z.coerce.date().optional(),
  last_movement_date: z.coerce.date().optional(),
  last_count_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertStorageBinContent = z.infer<typeof insertStorageBinContentSchema>;

// Batch and Lot Management Types
export type BatchLot = typeof batch_lots.$inferSelect;
export const insertBatchLotSchema = createInsertSchema(batch_lots, {
  manufacture_date: z.coerce.date().optional(),
  expiration_date: z.coerce.date().optional(),
  receipt_date: z.coerce.date().optional(),
  quarantine_until: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertBatchLot = z.infer<typeof insertBatchLotSchema>;

export type MaterialReservation = typeof material_reservations.$inferSelect;
export const insertMaterialReservationSchema = createInsertSchema(material_reservations, {
  expiration_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertMaterialReservation = z.infer<typeof insertMaterialReservationSchema>;

// Vendor Management Types
export type Vendor = typeof vendors.$inferSelect;
export const insertVendorSchema = createInsertSchema(vendors, {
  evaluation_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type VendorRating = typeof vendor_ratings.$inferSelect;
export const insertVendorRatingSchema = createInsertSchema(vendor_ratings, {
  rating_date: z.coerce.date().optional(),
  evaluation_period_start: z.coerce.date().optional(),
  evaluation_period_end: z.coerce.date().optional(),
  followup_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertVendorRating = z.infer<typeof insertVendorRatingSchema>;

export type VendorContract = typeof vendor_contracts.$inferSelect;
export const insertVendorContractSchema = createInsertSchema(vendor_contracts, {
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional(),
  approval_date: z.coerce.date().optional(),
  signed_date: z.coerce.date().optional(),
  next_review_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertVendorContract = z.infer<typeof insertVendorContractSchema>;

export type VendorProduct = typeof vendor_products.$inferSelect;
export const insertVendorProductSchema = createInsertSchema(vendor_products, {
  last_purchase_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;

// Material Valuation and Pricing Types
export type MaterialValuation = typeof material_valuations.$inferSelect;
export const insertMaterialValuationSchema = createInsertSchema(material_valuations, {
  valuation_date: z.coerce.date().optional(),
  gl_posting_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertMaterialValuation = z.infer<typeof insertMaterialValuationSchema>;

export type PriceList = typeof price_lists.$inferSelect;
export const insertPriceListSchema = createInsertSchema(price_lists, {
  effective_from: z.coerce.date().optional(),
  effective_to: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertPriceList = z.infer<typeof insertPriceListSchema>;

export type PriceListItem = typeof price_list_items.$inferSelect;
export const insertPriceListItemSchema = createInsertSchema(price_list_items, {
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertPriceListItem = z.infer<typeof insertPriceListItemSchema>;

// Returns Management Types
export type ReturnAuthorization = typeof return_authorizations.$inferSelect;
export const insertReturnAuthorizationSchema = createInsertSchema(return_authorizations, {
  approval_date: z.coerce.date().optional(),
  expected_return_date: z.coerce.date().optional(),
  actual_return_date: z.coerce.date().optional(),
  resolution_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertReturnAuthorization = z.infer<typeof insertReturnAuthorizationSchema>;

export type ReturnItem = typeof return_items.$inferSelect;
export const insertReturnItemSchema = createInsertSchema(return_items, {
  quality_check_date: z.coerce.date().optional(),
}).omit({ id: true });
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;

// Global Trade Compliance Types
export type TradeCompliance = typeof trade_compliance.$inferSelect;
export const insertTradeComplianceSchema = createInsertSchema(trade_compliance).omit({ id: true });
export type InsertTradeCompliance = z.infer<typeof insertTradeComplianceSchema>;

// Enum Types
export type MaterialValuationMethod = typeof material_valuation_method.enumValues[number];
export type StorageBinType = typeof storage_bin_type.enumValues[number];
export type WarehouseProcessType = typeof warehouse_process_type.enumValues[number];
export type LotStatus = typeof lot_status.enumValues[number];
export type VendorRatingCategory = typeof vendor_rating_category.enumValues[number];
export type PutawayStrategy = typeof putaway_strategy.enumValues[number];
export type PickingStrategy = typeof picking_strategy.enumValues[number];