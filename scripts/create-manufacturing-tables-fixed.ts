/**
 * This script adds enhanced Materials Management features to the Averox database
 * in the correct order to handle dependencies between tables
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';
import * as manufacturingSchema from '../shared/manufacturing-schema';
import ws from 'ws';

// Fix for the WebSocket connection issue
neonConfig.webSocketConstructor = ws;

dotenv.config();

async function createManufacturingTablesInOrder() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { ...schema, ...manufacturingSchema } });

  try {
    console.log('Creating enum types...');
    try {
      await pool.query(`
        -- Create all enum types first
        CREATE TYPE IF NOT EXISTS material_valuation_method AS ENUM (
          'FIFO', 'LIFO', 'MovingAverage', 'StandardCost', 'BatchSpecific'
        );
        
        CREATE TYPE IF NOT EXISTS storage_bin_type AS ENUM (
          'Standard', 'Bulk', 'Hazardous', 'Refrigerated', 'HighValue', 'RawMaterial',
          'FinishedGoods', 'ReturnArea', 'QualityInspection', 'Staging', 'PickingArea', 'ShippingArea'
        );
        
        CREATE TYPE IF NOT EXISTS warehouse_process_type AS ENUM (
          'Putaway', 'Picking', 'Transfer', 'Replenishment', 'CycleCounting',
          'Receiving', 'Shipping', 'CrossDocking', 'Kitting', 'WaveProcess'
        );
        
        CREATE TYPE IF NOT EXISTS lot_status AS ENUM (
          'Available', 'Reserved', 'OnHold', 'InTransit', 'Quarantine',
          'Rejected', 'Consumed', 'Expired'
        );
        
        CREATE TYPE IF NOT EXISTS vendor_rating_category AS ENUM (
          'Delivery', 'Quality', 'Price', 'Service', 'Sustainability',
          'Innovation', 'Compliance', 'Overall'
        );
        
        CREATE TYPE IF NOT EXISTS putaway_strategy AS ENUM (
          'FixedBin', 'EmptierFirst', 'FIFO', 'LIFO', 'NearestBin',
          'ZoneBased', 'ProductGroup', 'Chaotic'
        );
        
        CREATE TYPE IF NOT EXISTS picking_strategy AS ENUM (
          'FIFO', 'FEFO', 'LIFO', 'BatchSequence', 'ZoneWave',
          'Discrete', 'Cluster', 'Batch'
        );
      `);
      console.log('Created all enum types successfully');
    } catch (error) {
      console.error('Error creating enum types:', error.message);
    }

    console.log('Creating warehouse management tables first...');
    try {
      await pool.query(`
        -- Create base warehouse tables first
        CREATE TABLE IF NOT EXISTS warehouses (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL UNIQUE,
          description TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip TEXT,
          country TEXT,
          contact_person TEXT,
          contact_phone TEXT,
          contact_email TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          owner_id INTEGER REFERENCES users(id),
          parent_warehouse_id INTEGER,
          capacity NUMERIC,
          utilization_rate NUMERIC,
          is_manufacturing BOOLEAN DEFAULT FALSE
        );
        
        -- Add self-reference after warehouse table is created
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'warehouses_parent_warehouse_id_fkey'
          ) THEN
            ALTER TABLE warehouses
            ADD CONSTRAINT warehouses_parent_warehouse_id_fkey
            FOREIGN KEY (parent_warehouse_id) REFERENCES warehouses(id);
          END IF;
        END $$;
        
        -- Warehouse zones
        CREATE TABLE IF NOT EXISTS warehouse_zones (
          id SERIAL PRIMARY KEY,
          warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          description TEXT,
          zone_type TEXT NOT NULL,
          capacity NUMERIC,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP
        );
        
        -- Storage bins
        CREATE TABLE IF NOT EXISTS storage_bins (
          id SERIAL PRIMARY KEY,
          warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
          zone_id INTEGER REFERENCES warehouse_zones(id),
          bin_code TEXT NOT NULL,
          aisle TEXT,
          rack TEXT,
          level TEXT,
          position TEXT,
          bin_type storage_bin_type DEFAULT 'Standard',
          capacity NUMERIC,
          available_capacity NUMERIC,
          is_active BOOLEAN DEFAULT TRUE,
          is_blocked BOOLEAN DEFAULT FALSE,
          block_reason TEXT,
          max_weight NUMERIC,
          current_weight NUMERIC,
          height NUMERIC,
          width NUMERIC,
          depth NUMERIC,
          special_handling_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          last_inventory_check TIMESTAMP,
          rfid_tag TEXT,
          putaway_sequence INTEGER,
          picking_sequence INTEGER,
          is_mixing_allowed BOOLEAN DEFAULT FALSE,
          bin_barcode TEXT,
          last_cycle_count TIMESTAMP
        );
      `);
      console.log('Created warehouse management tables');
    } catch (error) {
      console.error('Error creating warehouse management tables:', error.message);
    }

    console.log('Creating manufacturing and equipment tables...');
    try {
      await pool.query(`
        -- Create work centers
        CREATE TABLE IF NOT EXISTS work_centers (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL UNIQUE,
          description TEXT,
          warehouse_id INTEGER REFERENCES warehouses(id),
          status TEXT DEFAULT 'Active',
          hourly_rate NUMERIC,
          capacity NUMERIC,
          setup_time NUMERIC,
          operating_hours JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          maintenance_schedule JSONB,
          equipment_list TEXT[],
          department_id INTEGER,
          industry_type TEXT
        );
        
        -- Equipment
        CREATE TABLE IF NOT EXISTS equipment (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          description TEXT,
          type TEXT,
          status TEXT DEFAULT 'Operational',
          work_center_id INTEGER REFERENCES work_centers(id),
          acquisition_date TIMESTAMP,
          installation_date TIMESTAMP,
          warranty_expiry_date TIMESTAMP,
          manufacturer TEXT,
          model TEXT,
          serial_number TEXT,
          capacity NUMERIC,
          operating_cost NUMERIC,
          maintenance_frequency INTEGER,
          last_maintenance_date TIMESTAMP,
          next_maintenance_date TIMESTAMP,
          technical_specs JSONB,
          dimensions JSONB,
          location TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
        );
      `);
      console.log('Created manufacturing equipment tables');
    } catch (error) {
      console.error('Error creating manufacturing equipment tables:', error.message);
    }

    console.log('Creating production tables...');
    try {
      await pool.query(`
        -- Bill of Materials
        CREATE TABLE IF NOT EXISTS bill_of_materials (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          name TEXT NOT NULL,
          version TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          approved_by INTEGER REFERENCES users(id),
          approval_date DATE,
          manufacturing_type TEXT DEFAULT 'Discrete',
          is_default BOOLEAN DEFAULT FALSE,
          total_cost NUMERIC,
          notes TEXT,
          revision_notes TEXT,
          yield NUMERIC DEFAULT '100'
        );
        
        -- BOM Items
        CREATE TABLE IF NOT EXISTS bom_items (
          id SERIAL PRIMARY KEY,
          bom_id INTEGER NOT NULL REFERENCES bill_of_materials(id),
          component_id INTEGER NOT NULL REFERENCES products(id),
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          position INTEGER DEFAULT 0,
          is_sub_assembly BOOLEAN DEFAULT FALSE,
          scrap_rate NUMERIC DEFAULT 0,
          notes TEXT,
          is_optional BOOLEAN DEFAULT FALSE,
          substitutes JSONB,
          operation TEXT,
          work_center_id INTEGER REFERENCES work_centers(id)
        );
        
        -- Routings
        CREATE TABLE IF NOT EXISTS routings (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          product_id INTEGER REFERENCES products(id),
          bom_id INTEGER REFERENCES bill_of_materials(id),
          version TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          approved_by INTEGER REFERENCES users(id),
          approval_date DATE,
          total_standard_hours NUMERIC,
          is_default BOOLEAN DEFAULT FALSE
        );
        
        -- Routing Operations
        CREATE TABLE IF NOT EXISTS routing_operations (
          id SERIAL PRIMARY KEY,
          routing_id INTEGER NOT NULL REFERENCES routings(id),
          sequence INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          work_center_id INTEGER NOT NULL REFERENCES work_centers(id),
          setup_time NUMERIC,
          run_time NUMERIC,
          queue_time NUMERIC,
          wait_time NUMERIC,
          instructions TEXT,
          quality_check_required BOOLEAN DEFAULT FALSE,
          input_materials JSONB,
          output_products JSONB
        );
        
        -- Production Orders
        CREATE TABLE IF NOT EXISTS production_orders (
          id SERIAL PRIMARY KEY,
          order_number TEXT NOT NULL UNIQUE,
          product_id INTEGER NOT NULL REFERENCES products(id),
          bom_id INTEGER REFERENCES bill_of_materials(id),
          routing_id INTEGER REFERENCES routings(id),
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          status TEXT DEFAULT 'Draft',
          priority TEXT DEFAULT 'Medium',
          planned_start_date TIMESTAMP,
          planned_end_date TIMESTAMP,
          actual_start_date TIMESTAMP,
          actual_end_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          assigned_to INTEGER REFERENCES users(id),
          warehouse_id INTEGER REFERENCES warehouses(id),
          total_cost NUMERIC,
          custom_fields JSONB,
          batch_number TEXT,
          notes TEXT
        );
      `);
      console.log('Created production tables');
    } catch (error) {
      console.error('Error creating production tables:', error.message);
    }

    console.log('Creating batch lot management tables...');
    try {
      await pool.query(`
        -- Batch Lots
        CREATE TABLE IF NOT EXISTS batch_lots (
          id SERIAL PRIMARY KEY,
          lot_number TEXT NOT NULL,
          batch_number TEXT,
          product_id INTEGER NOT NULL REFERENCES products(id),
          vendor_id INTEGER,
          purchase_order_id INTEGER,
          production_order_id INTEGER REFERENCES production_orders(id),
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          status TEXT DEFAULT 'Available',
          manufacture_date TIMESTAMP,
          expiration_date TIMESTAMP,
          receipt_date TIMESTAMP,
          quality_status TEXT DEFAULT 'Pending',
          is_quarantine BOOLEAN DEFAULT FALSE,
          quarantine_reason TEXT,
          quarantine_until TIMESTAMP,
          parent_lot_id INTEGER,
          cost NUMERIC,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          certificates JSONB,
          country_of_origin TEXT,
          customs_info JSONB,
          notes TEXT
        );
        
        -- Add self-reference after batch_lots table is created
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'batch_lots_parent_lot_id_fkey'
          ) THEN
            ALTER TABLE batch_lots
            ADD CONSTRAINT batch_lots_parent_lot_id_fkey
            FOREIGN KEY (parent_lot_id) REFERENCES batch_lots(id);
          END IF;
        END $$;
        
        -- Storage Bin Contents
        CREATE TABLE IF NOT EXISTS storage_bin_contents (
          id SERIAL PRIMARY KEY,
          bin_id INTEGER NOT NULL REFERENCES storage_bins(id),
          product_id INTEGER NOT NULL REFERENCES products(id),
          batch_lot_id INTEGER REFERENCES batch_lots(id),
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          expiration_date TIMESTAMP,
          quality_status TEXT,
          owner_id INTEGER REFERENCES users(id),
          production_date TIMESTAMP,
          status TEXT DEFAULT 'Available',
          last_movement_date TIMESTAMP,
          last_count_date TIMESTAMP,
          valuation NUMERIC
        );
      `);
      console.log('Created batch lot management tables');
    } catch (error) {
      console.error('Error creating batch lot management tables:', error.message);
    }

    console.log('Creating vendor management tables...');
    try {
      await pool.query(`
        -- Vendors
        CREATE TABLE IF NOT EXISTS vendors (
          id SERIAL PRIMARY KEY,
          vendor_code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          legal_name TEXT,
          tax_id TEXT,
          vendor_type TEXT NOT NULL,
          status TEXT DEFAULT 'Active',
          rating INTEGER,
          address TEXT,
          city TEXT,
          state TEXT,
          postal_code TEXT,
          country TEXT,
          phone TEXT,
          email TEXT,
          website TEXT,
          payment_terms TEXT,
          contact_person TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          currency TEXT DEFAULT 'USD',
          credit_limit NUMERIC,
          account_manager_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          vat_number TEXT,
          is_approved BOOLEAN DEFAULT FALSE,
          is_preferred BOOLEAN DEFAULT FALSE,
          payment_method TEXT,
          bank_details JSONB,
          evaluation_date TIMESTAMP,
          evaluation_score NUMERIC,
          certification_info JSONB,
          sustainability_rating INTEGER,
          financial_stability_rating INTEGER,
          legal_documents JSONB,
          notes TEXT,
          additional_fields JSONB,
          incoterms TEXT,
          lead_time_days INTEGER,
          minimum_order_value NUMERIC,
          on_time_delivery_rate NUMERIC,
          quality_rejection_rate NUMERIC
        );
        
        -- Vendor Ratings
        CREATE TABLE IF NOT EXISTS vendor_ratings (
          id SERIAL PRIMARY KEY,
          vendor_id INTEGER NOT NULL REFERENCES vendors(id),
          category vendor_rating_category NOT NULL,
          rating NUMERIC NOT NULL,
          rating_date TIMESTAMP DEFAULT NOW(),
          evaluated_by INTEGER REFERENCES users(id),
          notes TEXT,
          evaluation_period_start TIMESTAMP,
          evaluation_period_end TIMESTAMP,
          raw_score NUMERIC,
          weight NUMERIC DEFAULT '1',
          supporting_documents JSONB,
          improvement_plan TEXT,
          followup_date TIMESTAMP
        );
        
        -- Vendor Contracts
        CREATE TABLE IF NOT EXISTS vendor_contracts (
          id SERIAL PRIMARY KEY,
          vendor_id INTEGER NOT NULL REFERENCES vendors(id),
          contract_number TEXT NOT NULL,
          contract_type TEXT NOT NULL,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP,
          auto_renew BOOLEAN DEFAULT FALSE,
          status TEXT DEFAULT 'Draft',
          payment_terms TEXT,
          terms_conditions TEXT,
          attachments JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id),
          approved_by INTEGER REFERENCES users(id),
          approval_date TIMESTAMP,
          total_value NUMERIC,
          currency TEXT DEFAULT 'USD',
          signed_date TIMESTAMP,
          termination_notice_days INTEGER,
          price_adjustment_terms TEXT,
          next_review_date TIMESTAMP,
          penalty_clauses JSONB,
          performance_targets JSONB,
          legal_notes TEXT,
          contract_template_id INTEGER
        );
        
        -- Vendor Products
        CREATE TABLE IF NOT EXISTS vendor_products (
          id SERIAL PRIMARY KEY,
          vendor_id INTEGER NOT NULL REFERENCES vendors(id),
          product_id INTEGER NOT NULL REFERENCES products(id),
          vendor_product_code TEXT,
          vendor_product_name TEXT,
          unit_price NUMERIC,
          currency TEXT DEFAULT 'USD',
          minimum_order_quantity NUMERIC,
          lead_time_days INTEGER,
          is_preferred BOOLEAN DEFAULT FALSE,
          last_purchase_date TIMESTAMP,
          last_purchase_price NUMERIC,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          price_breaks JSONB,
          uom_conversion JSONB,
          quality_specs JSONB,
          alternative_products JSONB,
          certification_requirements TEXT,
          packaging_specs JSONB,
          is_consignment BOOLEAN DEFAULT FALSE,
          is_default_source BOOLEAN DEFAULT FALSE,
          allocation_percentage NUMERIC
        );
      `);
      console.log('Created vendor management tables');
    } catch (error) {
      console.error('Error creating vendor management tables:', error.message);
    }

    console.log('Creating MRP tables...');
    try {
      await pool.query(`
        -- MRP Runs
        CREATE TABLE IF NOT EXISTS mrp_runs (
          id SERIAL PRIMARY KEY,
          run_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id),
          planning_horizon_start TIMESTAMP NOT NULL,
          planning_horizon_end TIMESTAMP NOT NULL,
          status TEXT DEFAULT 'InProgress',
          parameters JSONB,
          completion_time TIMESTAMP,
          notes TEXT,
          simulation_mode BOOLEAN DEFAULT FALSE,
          log_details TEXT,
          warehouse_id INTEGER REFERENCES warehouses(id),
          product_categories TEXT[],
          included_products INTEGER[],
          excluded_products INTEGER[],
          consider_safety_stock BOOLEAN DEFAULT TRUE,
          consider_lead_times BOOLEAN DEFAULT TRUE,
          consider_current_inventory BOOLEAN DEFAULT TRUE,
          consider_capacity_constraints BOOLEAN DEFAULT FALSE,
          consider_batch_sizes BOOLEAN DEFAULT TRUE
        );
        
        -- Material Requirements
        CREATE TABLE IF NOT EXISTS material_requirements (
          id SERIAL PRIMARY KEY,
          mrp_run_id INTEGER NOT NULL REFERENCES mrp_runs(id),
          product_id INTEGER NOT NULL REFERENCES products(id),
          required_quantity NUMERIC NOT NULL,
          available_quantity NUMERIC,
          net_requirement NUMERIC,
          planned_order_quantity NUMERIC,
          due_date TIMESTAMP NOT NULL,
          warehouse_id INTEGER REFERENCES warehouses(id),
          source_type TEXT,
          source_id INTEGER,
          parent_product_id INTEGER REFERENCES products(id),
          parent_bom_id INTEGER REFERENCES bill_of_materials(id),
          action_type TEXT,
          planned_start_date TIMESTAMP,
          planned_release_date TIMESTAMP,
          action_status TEXT DEFAULT 'Planned',
          converted_to_po_id INTEGER,
          converted_to_prod_id INTEGER,
          unit_of_measure TEXT NOT NULL,
          priority INTEGER DEFAULT 5,
          notes TEXT,
          lot_size NUMERIC,
          action_message TEXT,
          lead_time_days INTEGER,
          safety_stock_level NUMERIC,
          economic_order_quantity NUMERIC,
          level_number INTEGER DEFAULT 0
        );
        
        -- Material Forecasts
        CREATE TABLE IF NOT EXISTS material_forecasts (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          forecast_period TEXT NOT NULL,
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          warehouse_id INTEGER REFERENCES warehouses(id),
          forecast_type TEXT DEFAULT 'Sales',
          confidence_level NUMERIC,
          created_at TIMESTAMP DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id),
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          is_approved BOOLEAN DEFAULT FALSE,
          approved_by INTEGER REFERENCES users(id),
          approval_date TIMESTAMP,
          category TEXT,
          notes TEXT,
          source TEXT DEFAULT 'Manual',
          method TEXT,
          external_reference TEXT
        );
        
        -- Material Reservations
        CREATE TABLE IF NOT EXISTS material_reservations (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          bin_id INTEGER REFERENCES storage_bins(id),
          batch_lot_id INTEGER REFERENCES batch_lots(id),
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          reservation_type TEXT NOT NULL,
          reference_id INTEGER,
          reference_type TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id),
          expiration_date TIMESTAMP,
          status TEXT DEFAULT 'Active',
          notes TEXT,
          priority INTEGER DEFAULT 5
        );
      `);
      console.log('Created MRP tables');
    } catch (error) {
      console.error('Error creating MRP tables:', error.message);
    }

    console.log('Creating material valuation and pricing tables...');
    try {
      await pool.query(`
        -- Material Valuations
        CREATE TABLE IF NOT EXISTS material_valuations (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          warehouse_id INTEGER REFERENCES warehouses(id),
          valuation_method material_valuation_method NOT NULL,
          value_per_unit NUMERIC NOT NULL,
          currency TEXT DEFAULT 'USD',
          valuation_date TIMESTAMP DEFAULT NOW(),
          updated_by INTEGER REFERENCES users(id),
          is_active BOOLEAN DEFAULT TRUE,
          previous_value_per_unit NUMERIC,
          change_reason TEXT,
          batch_lot_id INTEGER REFERENCES batch_lots(id),
          accounting_period TEXT,
          is_posted_to_gl BOOLEAN DEFAULT FALSE,
          gl_account TEXT,
          gl_posting_date TIMESTAMP,
          gl_posting_reference TEXT
        );
        
        -- Price Lists
        CREATE TABLE IF NOT EXISTS price_lists (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          currency TEXT DEFAULT 'USD',
          effective_from TIMESTAMP,
          effective_to TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id),
          updated_at TIMESTAMP,
          customer_category TEXT,
          vendor_category TEXT,
          price_basis TEXT,
          price_calculation_method TEXT,
          markup_percentage NUMERIC,
          price_list_type TEXT,
          priority INTEGER DEFAULT 10,
          notes TEXT
        );
        
        -- Price List Items
        CREATE TABLE IF NOT EXISTS price_list_items (
          id SERIAL PRIMARY KEY,
          price_list_id INTEGER NOT NULL REFERENCES price_lists(id),
          product_id INTEGER NOT NULL REFERENCES products(id),
          price NUMERIC NOT NULL,
          min_quantity NUMERIC DEFAULT '1',
          max_quantity NUMERIC,
          unit_of_measure TEXT NOT NULL,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          discount_percentage NUMERIC,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
        );
      `);
      console.log('Created material valuation and pricing tables');
    } catch (error) {
      console.error('Error creating material valuation and pricing tables:', error.message);
    }

    console.log('Creating returns management tables...');
    try {
      await pool.query(`
        -- Return Authorizations
        CREATE TABLE IF NOT EXISTS return_authorizations (
          id SERIAL PRIMARY KEY,
          rma_number TEXT NOT NULL UNIQUE,
          customer_id INTEGER,
          vendor_id INTEGER REFERENCES vendors(id),
          return_type TEXT NOT NULL,
          status TEXT DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT NOW(),
          created_by INTEGER REFERENCES users(id),
          approved_by INTEGER REFERENCES users(id),
          approval_date TIMESTAMP,
          expected_return_date TIMESTAMP,
          actual_return_date TIMESTAMP,
          source_document_type TEXT,
          source_document_id INTEGER,
          return_reason TEXT,
          notes TEXT,
          shipping_method TEXT,
          shipping_tracking TEXT,
          quality_check_required BOOLEAN DEFAULT TRUE,
          resolution TEXT,
          resolution_date TIMESTAMP,
          return_address TEXT
        );
        
        -- Return Items
        CREATE TABLE IF NOT EXISTS return_items (
          id SERIAL PRIMARY KEY,
          return_id INTEGER NOT NULL REFERENCES return_authorizations(id),
          product_id INTEGER NOT NULL REFERENCES products(id),
          batch_lot_id INTEGER REFERENCES batch_lots(id),
          quantity NUMERIC NOT NULL,
          unit_of_measure TEXT NOT NULL,
          return_reason TEXT,
          condition TEXT,
          status TEXT DEFAULT 'Pending',
          quality_check_status TEXT,
          quality_check_date TIMESTAMP,
          quality_check_by INTEGER REFERENCES users(id),
          quality_check_notes TEXT,
          disposition TEXT,
          value NUMERIC,
          restocking_fee NUMERIC,
          source_item_id INTEGER,
          return_location_id INTEGER REFERENCES storage_bins(id),
          notes TEXT
        );
      `);
      console.log('Created returns management tables');
    } catch (error) {
      console.error('Error creating returns management tables:', error.message);
    }

    console.log('Creating global trade compliance tables...');
    try {
      await pool.query(`
        -- Trade Compliance
        CREATE TABLE IF NOT EXISTS trade_compliance (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id),
          country_of_origin TEXT,
          hs_code TEXT,
          eccn TEXT,
          is_dual_use BOOLEAN DEFAULT FALSE,
          restricted_countries TEXT[],
          export_license_required BOOLEAN DEFAULT FALSE,
          import_license_required BOOLEAN DEFAULT FALSE,
          classification_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id),
          updated_by INTEGER REFERENCES users(id),
          license_documents JSONB,
          commodity_code TEXT,
          preference_criteria TEXT,
          producer_statement TEXT,
          certificate_of_origin JSONB,
          hazmat_class TEXT,
          un_number TEXT,
          import_duties NUMERIC,
          export_restrictions JSONB,
          documentation_requirements JSONB
        );
      `);
      console.log('Created global trade compliance tables');
    } catch (error) {
      console.error('Error creating global trade compliance tables:', error.message);
    }

    console.log('Creating industry-specific manufacturing tables...');
    try {
      await pool.query(`
        -- Industry specific tables
        -- Pharmaceutical manufacturing
        CREATE TABLE IF NOT EXISTS pharma_manufacturing (
          id SERIAL PRIMARY KEY,
          production_order_id INTEGER NOT NULL REFERENCES production_orders(id),
          regulatory_approval TEXT,
          sterilization_method TEXT,
          clean_room_requirements TEXT,
          controlled_substances BOOLEAN DEFAULT FALSE,
          temperature_requirements TEXT,
          humidity_requirements TEXT,
          pressure_requirements TEXT,
          contamination_controls TEXT,
          api_concentration NUMERIC,
          dissolution_profile JSONB,
          stability_tests JSONB,
          packaging_requirements TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
        );
        
        -- Textile manufacturing
        CREATE TABLE IF NOT EXISTS textile_manufacturing (
          id SERIAL PRIMARY KEY,
          production_order_id INTEGER NOT NULL REFERENCES production_orders(id),
          fabric_type TEXT,
          dye_lot TEXT,
          color_code TEXT,
          pattern TEXT,
          gsm NUMERIC,
          width NUMERIC,
          shrinkage_percentage NUMERIC,
          finishing_process TEXT,
          colorfast_rating INTEGER,
          washing_instructions TEXT,
          yarn_count TEXT,
          weave_type TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
        );
        
        -- Cement manufacturing
        CREATE TABLE IF NOT EXISTS cement_manufacturing (
          id SERIAL PRIMARY KEY,
          production_order_id INTEGER NOT NULL REFERENCES production_orders(id),
          cement_type TEXT,
          strength_class TEXT,
          early_strength NUMERIC,
          setting_time NUMERIC,
          fineness NUMERIC,
          sulfate_resistance TEXT,
          clinker_content NUMERIC,
          additive_content JSONB,
          wc_ratio NUMERIC,
          alkali_content NUMERIC,
          free_lime_content NUMERIC,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
        );
      `);
      console.log('Created industry-specific manufacturing tables');
    } catch (error) {
      console.error('Error creating industry-specific manufacturing tables:', error.message);
    }

    console.log('All SAP-level materials management features have been added successfully!');
  } catch (error) {
    console.error('Error adding materials management features:', error);
  } finally {
    await pool.end();
  }
}

// Run the main function
createManufacturingTablesInOrder()
  .then(() => {
    console.log('Materials management enhancement completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to enhance materials management:', error);
    process.exit(1);
  });