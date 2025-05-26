import { db } from '../server/db';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function createTenantTables() {
  console.log('🏗️  Creating multi-tenant database tables...');

  try {
    // Create tenant-related enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'trial', 'inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create subscription_plans table
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price_monthly INTEGER NOT NULL, -- in cents
        price_yearly INTEGER, -- in cents  
        features JSONB DEFAULT '{}',
        max_users INTEGER,
        storage_limit INTEGER, -- in GB
        api_calls_limit INTEGER,
        stripe_price_id VARCHAR(100),
        stripe_price_id_yearly VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create tenants table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        subdomain VARCHAR(100) UNIQUE NOT NULL,
        billing_email VARCHAR(255) NOT NULL,
        status tenant_status DEFAULT 'trial',
        max_users INTEGER DEFAULT 10,
        storage_limit INTEGER DEFAULT 5, -- in GB
        api_calls_limit INTEGER DEFAULT 10000,
        trial_ends_at TIMESTAMP,
        stripe_customer_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create tenant_users table  
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_users (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'User',
        is_owner BOOLEAN DEFAULT false,
        invited_by INTEGER REFERENCES users(id),
        invited_at TIMESTAMP,
        joined_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, user_id)
      );
    `;

    // Create tenant_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_subscriptions (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES subscription_plans(id),
        stripe_subscription_id VARCHAR(100),
        status subscription_status DEFAULT 'trial',
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        trial_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create tenant_invitations table
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_invitations (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'User',
        token VARCHAR(500) NOT NULL UNIQUE,
        invited_by INTEGER REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create tenant_usage table
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_usage (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        user_count INTEGER DEFAULT 0,
        storage_used INTEGER DEFAULT 0, -- in MB
        api_calls INTEGER DEFAULT 0,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, month, year)
      );
    `;

    console.log('✅ Multi-tenant database tables created successfully!');

    // Insert default subscription plans
    console.log('📋 Creating default subscription plans...');
    
    await sql`
      INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, max_users, storage_limit, api_calls_limit)
      VALUES 
        ('Starter', 'Perfect for small teams getting started', 2900, 29000, '{"basic_crm": true, "email_support": true, "basic_analytics": true}', 5, 5, 5000),
        ('Professional', 'Advanced features for growing businesses', 9900, 99000, '{"advanced_crm": true, "priority_support": true, "advanced_analytics": true, "integrations": true, "custom_fields": true}', 25, 50, 50000),
        ('Enterprise', 'Full suite for large organizations', 29900, 299000, '{"full_crm": true, "dedicated_support": true, "advanced_analytics": true, "all_integrations": true, "custom_development": true, "white_label": true}', 999, 1000, 500000)
      ON CONFLICT DO NOTHING;
    `;

    console.log('✅ Default subscription plans created!');
    
    // Show created tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%tenant%' OR table_name = 'subscription_plans'
      ORDER BY table_name;
    `;

    console.log('\n📊 Multi-tenant tables created:');
    tables.forEach((table: any) => {
      console.log(`   • ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error creating tenant tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the script
createTenantTables()
  .then(() => {
    console.log('✅ Tenant tables creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Tenant tables creation failed:', error);
    process.exit(1);
  });