import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

async function main() {
  console.log('Connecting to database and applying schema...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Use this for applying the schema directly
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  // Create all the tables defined in schema.ts
  await createEnumTypes();
  await createTables(sql);

  console.log('Schema applied successfully.');
  await sql.end();
  
  console.log('Now running the seeding process...');
  // Import and run the reset-and-seed-database.ts file
  const { resetAndSeedDatabase } = await import('./reset-and-seed-database.js');
  try {
    await resetAndSeedDatabase();
    console.log('Database reset and seeded successfully.');
  } catch (error) {
    console.error('Error during database reset and seeding:', error);
  }
}

async function createEnumTypes() {
  const enumQueries = [
    `DO $$ BEGIN
      CREATE TYPE lead_status AS ENUM ('New', 'Qualified', 'Contacted', 'Not Interested', 'Converted');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE opportunity_stage AS ENUM ('Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE task_priority AS ENUM ('High', 'Medium', 'Normal');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE task_status AS ENUM ('Not Started', 'In Progress', 'Completed', 'Deferred');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE event_type AS ENUM ('Meeting', 'Call', 'Demonstration', 'Follow-up', 'Other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE subscription_status AS ENUM ('Active', 'Pending', 'Expired', 'Canceled', 'Trial');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'User', 'ReadOnly');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE social_platform AS ENUM ('Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'WhatsApp', 'Email', 'Messenger', 'Other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE message_status AS ENUM ('Unread', 'Read', 'Replied', 'Archived');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE api_provider AS ENUM ('OpenAI', 'Stripe', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE communication_channel AS ENUM ('Email', 'WhatsApp', 'SMS', 'Phone', 'Messenger', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE communication_direction AS ENUM ('Inbound', 'Outbound');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
    
    `DO $$ BEGIN
      CREATE TYPE communication_status AS ENUM ('Unread', 'Read', 'Replied', 'Archived');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`
  ];
  
  // For enum types, we'll use the postgres library directly
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  try {    
    for (const query of enumQueries) {
      await sql.unsafe(query);
    }
    
    console.log('Enum types created successfully');
  } catch (error) {
    console.error('Error creating enum types:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

async function createTables(sql: postgres.Sql) {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role user_role,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      last_login TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      settings JSONB,
      preferences JSONB,
      package_id INTEGER
    )`,
    
    // Contacts table
    `CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      title TEXT,
      account_id INTEGER,
      owner_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      notes TEXT,
      is_active BOOLEAN DEFAULT TRUE
    )`,
    
    // Accounts table
    `CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE,
      phone TEXT,
      industry TEXT,
      website TEXT,
      billing_address TEXT,
      shipping_address TEXT,
      owner_id INTEGER,
      annual_revenue NUMERIC,
      employee_count INTEGER,
      type TEXT,
      notes TEXT
    )`,
    
    // Leads table
    `CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      company TEXT,
      phone TEXT,
      title TEXT,
      owner_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      source TEXT,
      status lead_status,
      notes TEXT,
      converted_to_contact_id INTEGER,
      converted_to_opportunity_id INTEGER
    )`,
    
    // Opportunities table
    `CREATE TABLE IF NOT EXISTS opportunities (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      amount NUMERIC,
      stage opportunity_stage,
      close_date TIMESTAMP,
      probability INTEGER,
      owner_id INTEGER,
      account_id INTEGER,
      contact_id INTEGER,
      lead_id INTEGER,
      description TEXT,
      is_closed BOOLEAN DEFAULT FALSE,
      is_won BOOLEAN DEFAULT FALSE,
      priority TEXT
    )`,
    
    // Tasks table
    `CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      title TEXT NOT NULL,
      owner_id INTEGER,
      status task_status,
      description TEXT,
      due_date TIMESTAMP,
      priority task_priority,
      related_to_type TEXT,
      related_to_id INTEGER,
      completed_at TIMESTAMP,
      reminder_date TIMESTAMP
    )`,
    
    // Events table
    `CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      title TEXT NOT NULL,
      owner_id INTEGER,
      status TEXT,
      description TEXT,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      location TEXT,
      type event_type,
      related_to_type TEXT,
      related_to_id INTEGER,
      recurring_rule TEXT
    )`,
    
    // Activities table (record of actions)
    `CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      details JSONB,
      happened_at TIMESTAMP NOT NULL,
      metadata JSONB
    )`,
    
    // Subscription packages
    `CREATE TABLE IF NOT EXISTS subscription_packages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      interval TEXT NOT NULL,
      stripe_price_id TEXT,
      features JSONB,
      max_users INTEGER NOT NULL,
      max_contacts INTEGER NOT NULL,
      max_storage INTEGER NOT NULL,
      display_order INTEGER
    )`,
    
    // User subscriptions
    `CREATE TABLE IF NOT EXISTS user_subscriptions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      stripe_subscription_id TEXT,
      package_id INTEGER NOT NULL,
      status subscription_status,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      recurring BOOLEAN DEFAULT TRUE,
      user_id INTEGER NOT NULL,
      payment_method JSONB,
      cancellation_reason TEXT,
      trial_ends_at TIMESTAMP
    )`,
    
    // Social integrations
    `CREATE TABLE IF NOT EXISTS social_integrations (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      name TEXT NOT NULL,
      platform social_platform NOT NULL,
      token TEXT,
      refresh_token TEXT,
      expires_at TIMESTAMP,
      user_id INTEGER NOT NULL,
      account_id INTEGER,
      metadata JSONB,
      settings JSONB,
      is_active BOOLEAN DEFAULT TRUE
    )`,
    
    // Social messages
    `CREATE TABLE IF NOT EXISTS social_messages (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      status message_status,
      integration_id INTEGER NOT NULL,
      external_id TEXT NOT NULL,
      lead_id INTEGER,
      contact_id INTEGER,
      message TEXT NOT NULL,
      sender TEXT NOT NULL,
      recipient TEXT NOT NULL,
      received_at TIMESTAMP,
      attachments JSONB,
      metadata JSONB,
      is_deleted BOOLEAN DEFAULT FALSE
    )`,
    
    // Lead sources
    `CREATE TABLE IF NOT EXISTS lead_sources (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      name TEXT NOT NULL,
      platform social_platform,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      user_id INTEGER NOT NULL,
      updated_at TIMESTAMP
    )`,
    
    // Social campaigns
    `CREATE TABLE IF NOT EXISTS social_campaigns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      platform social_platform NOT NULL,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      status TEXT DEFAULT 'Draft',
      owner_id INTEGER,
      content TEXT,
      integration_id INTEGER,
      metrics JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    )`,
    
    // API keys
    `CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      key TEXT NOT NULL,
      secret TEXT,
      project_id TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP,
      user_id INTEGER NOT NULL,
      usage_data JSONB,
      rate_limit INTEGER,
      is_active BOOLEAN DEFAULT TRUE
    )`,
    
    // Workflows
    `CREATE TABLE IF NOT EXISTS workflows (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      is_active BOOLEAN DEFAULT TRUE,
      description TEXT,
      settings JSONB,
      updated_at TIMESTAMP,
      entity_type TEXT NOT NULL,
      entity_filter JSONB,
      actions JSONB NOT NULL,
      created_by INTEGER,
      updated_by INTEGER,
      version INTEGER
    )`,
    
    // Communications
    `CREATE TABLE IF NOT EXISTS communications (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      channel communication_channel NOT NULL,
      direction communication_direction NOT NULL,
      contact_id INTEGER,
      lead_id INTEGER,
      content TEXT NOT NULL,
      status communication_status DEFAULT 'Unread',
      sent_at TIMESTAMP,
      received_at TIMESTAMP,
      owner_id INTEGER,
      subject TEXT,
      attachments JSONB,
      is_starred BOOLEAN DEFAULT FALSE,
      labels JSONB,
      metadata JSONB
    )`
  ];
  
  for (const tableQuery of tables) {
    await sql.unsafe(tableQuery);
  }
  
  console.log('Tables created successfully');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});