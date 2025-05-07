import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { 
  maintenanceRequests, 
  qualityChecks, 
  qualityCheckParameters,
  maintenanceTypeEnum,
  maintenanceStatusEnum,
  qualityCheckStatusEnum,
  qualityCheckResultEnum,
  qualityParameterResultEnum
} from '../shared/schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const connectionString = process.env.DATABASE_URL;
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('Creating new enum types...');
  await createEnumTypes();

  console.log('Creating new tables...');
  await createTables(client);

  console.log('Schema update complete!');
  process.exit(0);
}

async function createEnumTypes() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const connectionString = process.env.DATABASE_URL;
  const client = postgres(connectionString);
  
  try {
    // Create enum types if they don't exist
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quality_check_status') THEN
          CREATE TYPE quality_check_status AS ENUM ('Planned', 'In Progress', 'Completed', 'Cancelled');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quality_check_result') THEN
          CREATE TYPE quality_check_result AS ENUM ('Pass', 'Fail', 'Conditional Pass', 'Not Applicable');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quality_parameter_result') THEN
          CREATE TYPE quality_parameter_result AS ENUM ('Pass', 'Fail', 'Not Tested');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_type') THEN
          CREATE TYPE maintenance_type AS ENUM ('Preventive', 'Corrective', 'Predictive', 'Condition-Based');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'maintenance_status') THEN
          CREATE TYPE maintenance_status AS ENUM ('Scheduled', 'InProgress', 'Completed', 'Deferred', 'Cancelled');
        END IF;
      END$$;
    `;
    console.log('Enum types created successfully');
  } catch (error) {
    console.error('Error creating enum types:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function createTables(client: postgres.Sql) {
  try {
    // First check if batch_lots table exists - we need it for the foreign key reference
    const batchLotsExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'batch_lots'
      );
    `;
    
    if (!batchLotsExists[0].exists) {
      // Create batch_lots table if it doesn't exist
      await client`
        CREATE TABLE IF NOT EXISTS batch_lots (
          id SERIAL PRIMARY KEY,
          batch_number TEXT NOT NULL UNIQUE,
          product_id INTEGER NOT NULL REFERENCES products(id),
          production_order_id INTEGER REFERENCES production_orders(id),
          manufactured_date DATE,
          expiry_date DATE,
          quantity NUMERIC NOT NULL,
          status TEXT DEFAULT 'Active',
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP,
          created_by INTEGER REFERENCES users(id)
        );
      `;
      console.log('batch_lots table created successfully');
    }

    // Create maintenance_requests table if it doesn't exist
    await client`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id SERIAL PRIMARY KEY,
        request_number TEXT NOT NULL UNIQUE,
        equipment_id INTEGER NOT NULL,
        request_type maintenance_type DEFAULT 'Corrective',
        status maintenance_status DEFAULT 'Scheduled',
        priority production_priority DEFAULT 'Medium',
        description TEXT NOT NULL,
        requested_by INTEGER NOT NULL,
        assigned_to INTEGER,
        request_date TIMESTAMP DEFAULT NOW(),
        scheduled_date TIMESTAMP,
        completion_date TIMESTAMP,
        notes TEXT,
        resolution_details TEXT,
        parts_used JSONB,
        downtime NUMERIC,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        work_center_id INTEGER,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (requested_by) REFERENCES users(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (work_center_id) REFERENCES work_centers(id)
      );
    `;
    console.log('maintenance_requests table created successfully');

    // Create quality_checks table if it doesn't exist
    await client`
      CREATE TABLE IF NOT EXISTS quality_checks (
        id SERIAL PRIMARY KEY,
        inspection_number TEXT NOT NULL,
        type TEXT NOT NULL,
        status quality_check_status DEFAULT 'Planned',
        result quality_check_result,
        production_order_id INTEGER,
        batch_lot_id INTEGER,
        product_id INTEGER,
        inspector_id INTEGER,
        inspection_date TIMESTAMP,
        notes TEXT,
        sample_size INTEGER,
        acceptance_criteria TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
        FOREIGN KEY (batch_lot_id) REFERENCES batch_lots(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (inspector_id) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `;
    console.log('quality_checks table created successfully');

    // Create quality_check_parameters table if it doesn't exist
    await client`
      CREATE TABLE IF NOT EXISTS quality_check_parameters (
        id SERIAL PRIMARY KEY,
        quality_check_id INTEGER NOT NULL,
        parameter_name TEXT NOT NULL,
        specification TEXT,
        result quality_parameter_result,
        measured_value TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (quality_check_id) REFERENCES quality_checks(id)
      );
    `;
    console.log('quality_check_parameters table created successfully');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

main().catch((err) => {
  console.error('Error in main function:', err);
  process.exit(1);
});