import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Creating manufacturing module enums...');
    
    // Create enums first
    const createEnumsSQL = `
      CREATE TYPE IF NOT EXISTS production_order_status AS ENUM ('Draft', 'Scheduled', 'InProgress', 'Completed', 'OnHold', 'Cancelled');
      CREATE TYPE IF NOT EXISTS production_priority AS ENUM ('Critical', 'High', 'Medium', 'Low');
      CREATE TYPE IF NOT EXISTS quality_inspection_result AS ENUM ('Pass', 'Fail', 'PendingReview', 'Acceptable', 'Rework');
      CREATE TYPE IF NOT EXISTS maintenance_type AS ENUM ('Preventive', 'Corrective', 'Predictive', 'Condition-Based');
      CREATE TYPE IF NOT EXISTS maintenance_status AS ENUM ('Scheduled', 'InProgress', 'Completed', 'Deferred', 'Cancelled');
      CREATE TYPE IF NOT EXISTS equipment_status AS ENUM ('Operational', 'UnderMaintenance', 'Idle', 'Decommissioned', 'Faulty');
      CREATE TYPE IF NOT EXISTS work_center_status AS ENUM ('Active', 'Inactive', 'AtCapacity', 'UnderMaintenance');
      CREATE TYPE IF NOT EXISTS manufacturing_type AS ENUM ('Discrete', 'Process', 'Repetitive', 'Batch', 'Lean', 'Custom');
      CREATE TYPE IF NOT EXISTS material_type AS ENUM ('RawMaterial', 'Intermediate', 'FinishedGood', 'Packaging', 'Consumable', 'Spare');
      CREATE TYPE IF NOT EXISTS unit_of_measure AS ENUM ('Each', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'SquareMeter', 'CubicMeter', 'Hour', 'Minute', 'Ton', 'Dozen');
    `;
    
    await pool.query(createEnumsSQL);
    console.log('Enums created successfully');
    
    // Extend inventory_transaction_type enum
    try {
      await pool.query(`
        ALTER TYPE inventory_transaction_type ADD VALUE IF NOT EXISTS 'Production';
        ALTER TYPE inventory_transaction_type ADD VALUE IF NOT EXISTS 'Consumption';
        ALTER TYPE inventory_transaction_type ADD VALUE IF NOT EXISTS 'QualityReject';
        ALTER TYPE inventory_transaction_type ADD VALUE IF NOT EXISTS 'ScrapDisposal';
        ALTER TYPE inventory_transaction_type ADD VALUE IF NOT EXISTS 'IntakeForProduction';
        ALTER TYPE inventory_transaction_type ADD VALUE IF NOT EXISTS 'ProductionOutput';
      `);
      console.log('Extended inventory_transaction_type enum successfully');
    } catch (error) {
      console.log('Could not extend inventory_transaction_type enum, may already include these values:', error.message);
    }
    
    // Create warehouses table
    const createWarehousesSQL = `
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
        parent_warehouse_id INTEGER REFERENCES warehouses(id),
        capacity NUMERIC,
        utilization_rate NUMERIC,
        is_manufacturing BOOLEAN DEFAULT FALSE
      );
    `;
    
    await pool.query(createWarehousesSQL);
    console.log('Warehouses table created successfully');
    
    // Create warehouse_zones table
    const createWarehouseZonesSQL = `
      CREATE TABLE IF NOT EXISTS warehouse_zones (
        id SERIAL PRIMARY KEY,
        warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        zone_type TEXT NOT NULL,
        capacity NUMERIC,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `;
    
    await pool.query(createWarehouseZonesSQL);
    console.log('Warehouse zones table created successfully');
    
    // Create work_centers table
    const createWorkCentersSQL = `
      CREATE TABLE IF NOT EXISTS work_centers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        warehouse_id INTEGER REFERENCES warehouses(id),
        status work_center_status DEFAULT 'Active',
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
    `;
    
    await pool.query(createWorkCentersSQL);
    console.log('Work centers table created successfully');

    // Create bill_of_materials table
    const createBOMSQL = `
      CREATE TABLE IF NOT EXISTS bill_of_materials (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        approved_by INTEGER REFERENCES users(id),
        approval_date DATE,
        manufacturing_type manufacturing_type DEFAULT 'Discrete',
        is_default BOOLEAN DEFAULT FALSE,
        total_cost NUMERIC,
        notes TEXT,
        revision_notes TEXT,
        yield NUMERIC DEFAULT 100
      );
    `;
    
    await pool.query(createBOMSQL);
    console.log('Bill of materials table created successfully');

    // Create bom_items table
    const createBOMItemsSQL = `
      CREATE TABLE IF NOT EXISTS bom_items (
        id SERIAL PRIMARY KEY,
        bom_id INTEGER REFERENCES bill_of_materials(id) NOT NULL,
        component_id INTEGER REFERENCES products(id) NOT NULL,
        quantity NUMERIC NOT NULL,
        unit_of_measure unit_of_measure NOT NULL,
        position INTEGER DEFAULT 0,
        is_sub_assembly BOOLEAN DEFAULT FALSE,
        scrap_rate NUMERIC DEFAULT 0,
        notes TEXT,
        is_optional BOOLEAN DEFAULT FALSE,
        substitutes JSONB,
        operation TEXT,
        work_center_id INTEGER REFERENCES work_centers(id)
      );
    `;
    
    await pool.query(createBOMItemsSQL);
    console.log('BOM items table created successfully');

    // Create routings table
    const createRoutingsSQL = `
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
    `;
    
    await pool.query(createRoutingsSQL);
    console.log('Routings table created successfully');

    // Create routing_operations table
    const createRoutingOperationsSQL = `
      CREATE TABLE IF NOT EXISTS routing_operations (
        id SERIAL PRIMARY KEY,
        routing_id INTEGER REFERENCES routings(id) NOT NULL,
        sequence INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        work_center_id INTEGER REFERENCES work_centers(id) NOT NULL,
        setup_time NUMERIC,
        run_time NUMERIC,
        queue_time NUMERIC,
        wait_time NUMERIC,
        instructions TEXT,
        quality_check_required BOOLEAN DEFAULT FALSE,
        input_materials JSONB,
        output_products JSONB
      );
    `;
    
    await pool.query(createRoutingOperationsSQL);
    console.log('Routing operations table created successfully');

    // Create production_orders table
    const createProductionOrdersSQL = `
      CREATE TABLE IF NOT EXISTS production_orders (
        id SERIAL PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        bom_id INTEGER REFERENCES bill_of_materials(id),
        routing_id INTEGER REFERENCES routings(id),
        quantity NUMERIC NOT NULL,
        unit_of_measure unit_of_measure NOT NULL,
        status production_order_status DEFAULT 'Draft',
        priority production_priority DEFAULT 'Medium',
        planned_start_date TIMESTAMP,
        planned_end_date TIMESTAMP,
        actual_start_date TIMESTAMP,
        actual_end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        warehouse_id INTEGER REFERENCES warehouses(id),
        notes TEXT,
        completed_quantity NUMERIC DEFAULT 0,
        rejected_quantity NUMERIC DEFAULT 0,
        sales_order_id INTEGER,
        batch_number TEXT,
        industry_type TEXT
      );
    `;
    
    await pool.query(createProductionOrdersSQL);
    console.log('Production orders table created successfully');

    // Create production_order_operations table
    const createProductionOrderOperationsSQL = `
      CREATE TABLE IF NOT EXISTS production_order_operations (
        id SERIAL PRIMARY KEY,
        production_order_id INTEGER REFERENCES production_orders(id) NOT NULL,
        routing_operation_id INTEGER REFERENCES routing_operations(id),
        sequence INTEGER NOT NULL,
        work_center_id INTEGER REFERENCES work_centers(id) NOT NULL,
        status TEXT DEFAULT 'Not Started',
        planned_start_date TIMESTAMP,
        planned_end_date TIMESTAMP,
        actual_start_date TIMESTAMP,
        actual_end_date TIMESTAMP,
        setup_time NUMERIC,
        run_time NUMERIC,
        completed_quantity NUMERIC DEFAULT 0,
        rejected_quantity NUMERIC DEFAULT 0,
        operator_notes TEXT,
        assigned_to INTEGER REFERENCES users(id)
      );
    `;
    
    await pool.query(createProductionOrderOperationsSQL);
    console.log('Production order operations table created successfully');

    // Create additional manufacturing tables
    const createRemainingTablesSQL = `
      CREATE TABLE IF NOT EXISTS material_consumptions (
        id SERIAL PRIMARY KEY,
        production_order_id INTEGER REFERENCES production_orders(id) NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        operation_id INTEGER REFERENCES production_order_operations(id),
        quantity NUMERIC NOT NULL,
        unit_of_measure unit_of_measure NOT NULL,
        transaction_date TIMESTAMP DEFAULT NOW(),
        warehouse_id INTEGER REFERENCES warehouses(id),
        batch_number TEXT,
        created_by INTEGER REFERENCES users(id),
        notes TEXT,
        inventory_transaction_id INTEGER REFERENCES inventory_transactions(id),
        is_backflushed BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS quality_inspections (
        id SERIAL PRIMARY KEY,
        reference_type TEXT NOT NULL,
        reference_id INTEGER NOT NULL,
        product_id INTEGER REFERENCES products(id) NOT NULL,
        inspection_date TIMESTAMP DEFAULT NOW(),
        inspected_by INTEGER REFERENCES users(id),
        result quality_inspection_result NOT NULL,
        quantity NUMERIC NOT NULL,
        quantity_passed NUMERIC,
        quantity_failed NUMERIC,
        notes TEXT,
        batch_number TEXT,
        checklist_data JSONB,
        attachments TEXT[],
        warehouse_id INTEGER REFERENCES warehouses(id),
        operation_id INTEGER REFERENCES production_order_operations(id)
      );

      CREATE TABLE IF NOT EXISTS quality_parameters (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        product_id INTEGER REFERENCES products(id),
        parameter_type TEXT NOT NULL,
        uom TEXT,
        minimum_value TEXT,
        maximum_value TEXT,
        target_value TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        industry_type TEXT
      );

      CREATE TABLE IF NOT EXISTS quality_inspection_results (
        id SERIAL PRIMARY KEY,
        inspection_id INTEGER REFERENCES quality_inspections(id) NOT NULL,
        parameter_id INTEGER REFERENCES quality_parameters(id) NOT NULL,
        value TEXT NOT NULL,
        is_passed BOOLEAN NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        work_center_id INTEGER REFERENCES work_centers(id),
        status equipment_status DEFAULT 'Operational',
        manufacturer TEXT,
        model TEXT,
        serial_number TEXT,
        purchase_date DATE,
        warranty_expiry_date DATE,
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        maintenance_frequency INTEGER,
        specifications JSONB,
        operating_procedure TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        location TEXT,
        capacity_per_hour NUMERIC,
        power_consumption NUMERIC,
        industry_type TEXT
      );

      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER REFERENCES equipment(id) NOT NULL,
        request_type maintenance_type DEFAULT 'Corrective',
        status maintenance_status DEFAULT 'Scheduled',
        priority production_priority DEFAULT 'Medium',
        description TEXT NOT NULL,
        requested_by INTEGER REFERENCES users(id) NOT NULL,
        assigned_to INTEGER REFERENCES users(id),
        request_date TIMESTAMP DEFAULT NOW(),
        scheduled_date TIMESTAMP,
        completion_date TIMESTAMP,
        notes TEXT,
        resolution_details TEXT,
        parts_used JSONB,
        downtime NUMERIC,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS manufacturing_shifts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        work_center_id INTEGER REFERENCES work_centers(id),
        warehouse_id INTEGER REFERENCES warehouses(id),
        days_of_week TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        supervisor_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        break_times JSONB,
        capacity_factor NUMERIC DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS shift_assignments (
        id SERIAL PRIMARY KEY,
        shift_id INTEGER REFERENCES manufacturing_shifts(id) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        work_center_id INTEGER REFERENCES work_centers(id),
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS manufacturing_costs (
        id SERIAL PRIMARY KEY,
        production_order_id INTEGER REFERENCES production_orders(id) NOT NULL,
        material_cost NUMERIC DEFAULT 0,
        labor_cost NUMERIC DEFAULT 0,
        overhead_cost NUMERIC DEFAULT 0,
        setup_cost NUMERIC DEFAULT 0,
        energy_cost NUMERIC DEFAULT 0,
        additional_costs JSONB,
        total_cost NUMERIC DEFAULT 0,
        cost_per_unit NUMERIC DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        costing_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        is_actual BOOLEAN DEFAULT FALSE
      );
    `;
    
    await pool.query(createRemainingTablesSQL);
    console.log('Additional manufacturing tables created successfully');

    // Create industry-specific tables
    const createIndustryTablesSQL = `
      CREATE TABLE IF NOT EXISTS pharma_manufacturing (
        id SERIAL PRIMARY KEY,
        production_order_id INTEGER REFERENCES production_orders(id) NOT NULL,
        regulatory_batch_number TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        manufacturing_date DATE NOT NULL,
        sterility BOOLEAN DEFAULT FALSE,
        contains_controlled_substances BOOLEAN DEFAULT FALSE,
        storage_conditions TEXT,
        regulatory_approvals JSONB,
        stability_testing_required BOOLEAN DEFAULT FALSE,
        analytical_testing JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS textile_manufacturing (
        id SERIAL PRIMARY KEY,
        production_order_id INTEGER REFERENCES production_orders(id) NOT NULL,
        fiber_type TEXT NOT NULL,
        dyeing_method TEXT,
        color_code TEXT,
        pattern_code TEXT,
        gsm NUMERIC,
        finishing_process TEXT,
        texture_details TEXT,
        yarn_count TEXT,
        fabric_width NUMERIC,
        shrinkage_percentage NUMERIC,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS cement_manufacturing (
        id SERIAL PRIMARY KEY,
        production_order_id INTEGER REFERENCES production_orders(id) NOT NULL,
        cement_type TEXT NOT NULL,
        strength_class TEXT,
        composition JSONB,
        setting_time NUMERIC,
        clinker_factor NUMERIC,
        additives JSONB,
        packaging_type TEXT,
        quality_standard TEXT,
        moisture NUMERIC,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );
    `;
    
    await pool.query(createIndustryTablesSQL);
    console.log('Industry-specific tables created successfully');

    console.log('All manufacturing module tables created successfully');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

main();