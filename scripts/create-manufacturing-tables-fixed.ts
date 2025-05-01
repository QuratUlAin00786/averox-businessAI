import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

// Configure the WebSocket constructor for NeonDB
neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Creating manufacturing module enums...');
    
    // Create enums one by one
    try {
      console.log('Creating production_order_status enum...');
      await pool.query(`CREATE TYPE production_order_status AS ENUM ('Draft', 'Scheduled', 'InProgress', 'Completed', 'OnHold', 'Cancelled');`);
      console.log('Created production_order_status enum');
    } catch (error) {
      console.log('production_order_status enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating production_priority enum...');
      await pool.query(`CREATE TYPE production_priority AS ENUM ('Critical', 'High', 'Medium', 'Low');`);
      console.log('Created production_priority enum');
    } catch (error) {
      console.log('production_priority enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating quality_inspection_result enum...');
      await pool.query(`CREATE TYPE quality_inspection_result AS ENUM ('Pass', 'Fail', 'PendingReview', 'Acceptable', 'Rework');`);
      console.log('Created quality_inspection_result enum');
    } catch (error) {
      console.log('quality_inspection_result enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating maintenance_type enum...');
      await pool.query(`CREATE TYPE maintenance_type AS ENUM ('Preventive', 'Corrective', 'Predictive', 'Condition-Based');`);
      console.log('Created maintenance_type enum');
    } catch (error) {
      console.log('maintenance_type enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating maintenance_status enum...');
      await pool.query(`CREATE TYPE maintenance_status AS ENUM ('Scheduled', 'InProgress', 'Completed', 'Deferred', 'Cancelled');`);
      console.log('Created maintenance_status enum');
    } catch (error) {
      console.log('maintenance_status enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating equipment_status enum...');
      await pool.query(`CREATE TYPE equipment_status AS ENUM ('Operational', 'UnderMaintenance', 'Idle', 'Decommissioned', 'Faulty');`);
      console.log('Created equipment_status enum');
    } catch (error) {
      console.log('equipment_status enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating work_center_status enum...');
      await pool.query(`CREATE TYPE work_center_status AS ENUM ('Active', 'Inactive', 'AtCapacity', 'UnderMaintenance');`);
      console.log('Created work_center_status enum');
    } catch (error) {
      console.log('work_center_status enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating manufacturing_type enum...');
      await pool.query(`CREATE TYPE manufacturing_type AS ENUM ('Discrete', 'Process', 'Repetitive', 'Batch', 'Lean', 'Custom');`);
      console.log('Created manufacturing_type enum');
    } catch (error) {
      console.log('manufacturing_type enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating material_type enum...');
      await pool.query(`CREATE TYPE material_type AS ENUM ('RawMaterial', 'Intermediate', 'FinishedGood', 'Packaging', 'Consumable', 'Spare');`);
      console.log('Created material_type enum');
    } catch (error) {
      console.log('material_type enum may already exist:', error.message);
    }
    
    try {
      console.log('Creating unit_of_measure enum...');
      await pool.query(`CREATE TYPE unit_of_measure AS ENUM ('Each', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'SquareMeter', 'CubicMeter', 'Hour', 'Minute', 'Ton', 'Dozen');`);
      console.log('Created unit_of_measure enum');
    } catch (error) {
      console.log('unit_of_measure enum may already exist:', error.message);
    }
    
    console.log('Enums created successfully');
    
    // Extend inventory_transaction_type enum one by one
    try {
      await pool.query(`ALTER TYPE inventory_transaction_type ADD VALUE 'Production';`);
      console.log('Added Production to inventory_transaction_type');
    } catch (error) {
      console.log('Production value may already exist in inventory_transaction_type:', error.message);
    }
    
    try {
      await pool.query(`ALTER TYPE inventory_transaction_type ADD VALUE 'Consumption';`);
      console.log('Added Consumption to inventory_transaction_type');
    } catch (error) {
      console.log('Consumption value may already exist in inventory_transaction_type:', error.message);
    }
    
    try {
      await pool.query(`ALTER TYPE inventory_transaction_type ADD VALUE 'QualityReject';`);
      console.log('Added QualityReject to inventory_transaction_type');
    } catch (error) {
      console.log('QualityReject value may already exist in inventory_transaction_type:', error.message);
    }
    
    try {
      await pool.query(`ALTER TYPE inventory_transaction_type ADD VALUE 'ScrapDisposal';`);
      console.log('Added ScrapDisposal to inventory_transaction_type');
    } catch (error) {
      console.log('ScrapDisposal value may already exist in inventory_transaction_type:', error.message);
    }
    
    try {
      await pool.query(`ALTER TYPE inventory_transaction_type ADD VALUE 'IntakeForProduction';`);
      console.log('Added IntakeForProduction to inventory_transaction_type');
    } catch (error) {
      console.log('IntakeForProduction value may already exist in inventory_transaction_type:', error.message);
    }
    
    try {
      await pool.query(`ALTER TYPE inventory_transaction_type ADD VALUE 'ProductionOutput';`);
      console.log('Added ProductionOutput to inventory_transaction_type');
    } catch (error) {
      console.log('ProductionOutput value may already exist in inventory_transaction_type:', error.message);
    }
    
    // Create warehouses table
    try {
      const warehouseTableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'warehouses'
        );
      `);
      
      if (!warehouseTableExists.rows[0].exists) {
        const createWarehousesSQL = `
          CREATE TABLE warehouses (
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
          )
        `;
        
        await pool.query(createWarehousesSQL);
        console.log('Warehouses table created successfully');
      } else {
        console.log('Warehouses table already exists');
      }
    } catch (error) {
      console.error('Error creating warehouses table:', error);
    }
    
    // Create work_centers table
    try {
      const workCenterTableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'work_centers'
        );
      `);
      
      if (!workCenterTableExists.rows[0].exists) {
        const createWorkCentersSQL = `
          CREATE TABLE work_centers (
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
          )
        `;
        
        await pool.query(createWorkCentersSQL);
        console.log('Work centers table created successfully');
      } else {
        console.log('Work centers table already exists');
      }
    } catch (error) {
      console.error('Error creating work_centers table:', error);
    }
    
    // Create bill_of_materials table
    try {
      const bomTableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'bill_of_materials'
        );
      `);
      
      if (!bomTableExists.rows[0].exists) {
        const createBOMSQL = `
          CREATE TABLE bill_of_materials (
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
          )
        `;
        
        await pool.query(createBOMSQL);
        console.log('Bill of materials table created successfully');
      } else {
        console.log('Bill of materials table already exists');
      }
    } catch (error) {
      console.error('Error creating bill_of_materials table:', error);
    }

    // Create production_orders table
    try {
      const productionOrdersTableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'production_orders'
        );
      `);
      
      if (!productionOrdersTableExists.rows[0].exists) {
        const createProductionOrdersSQL = `
          CREATE TABLE production_orders (
            id SERIAL PRIMARY KEY,
            order_number TEXT NOT NULL UNIQUE,
            product_id INTEGER REFERENCES products(id) NOT NULL,
            bom_id INTEGER REFERENCES bill_of_materials(id),
            routing_id INTEGER,
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
          )
        `;
        
        await pool.query(createProductionOrdersSQL);
        console.log('Production orders table created successfully');
      } else {
        console.log('Production orders table already exists');
      }
    } catch (error) {
      console.error('Error creating production_orders table:', error);
    }
    
    console.log('Manufacturing module tables created successfully');

  } catch (error) {
    console.error('Error creating manufacturing module:', error);
  } finally {
    await pool.end();
  }
}

main();