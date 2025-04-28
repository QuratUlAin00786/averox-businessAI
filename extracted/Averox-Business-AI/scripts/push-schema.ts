import { db } from "../server/db";

async function main() {
  console.log("Creating database tables...");
  
  try {
    // First check if the session table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamptz NOT NULL
      )
    `);
    console.log("Session table created or already exists");

    // Create enum types if they don't exist
    console.log("Creating enum types...");
    await createEnumTypes();
    
    // Create tables based on our schema
    console.log("Creating schema tables...");
    await createTables();
    
    console.log("Database schema successfully created!");
  } catch (error) {
    console.error("Error creating database schema:", error);
    process.exit(1);
  }
}

async function createEnumTypes() {
  // Check and create each enum type
  const enumTypes = [
    {
      name: 'lead_status',
      values: ['New', 'Qualified', 'Contacted', 'Not Interested', 'Converted']
    },
    {
      name: 'opportunity_stage',
      values: ['Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing']
    },
    {
      name: 'task_priority',
      values: ['High', 'Medium', 'Normal']
    },
    {
      name: 'task_status',
      values: ['Not Started', 'In Progress', 'Completed', 'Deferred']
    },
    {
      name: 'event_type',
      values: ['Meeting', 'Call', 'Demonstration', 'Follow-up', 'Other']
    },
    {
      name: 'subscription_status',
      values: ['Active', 'Pending', 'Expired', 'Canceled', 'Trial']
    },
    {
      name: 'user_role',
      values: ['Admin', 'Manager', 'User', 'ReadOnly']
    },
    {
      name: 'social_platform',
      values: ['Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'WhatsApp', 'Email', 'Messenger', 'Other']
    },
    {
      name: 'message_status',
      values: ['Unread', 'Read', 'Replied', 'Archived']
    }
  ];
  
  for (const enumType of enumTypes) {
    try {
      // Check if the enum type exists
      const enumExists = await db.execute(`
        SELECT 1 FROM pg_type 
        JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
        WHERE pg_type.typname = '${enumType.name}' 
        AND pg_namespace.nspname = 'public'
      `);
      
      if (enumExists.rowCount === 0) {
        // Create the enum type
        const valuesList = enumType.values.map(v => `'${v}'`).join(', ');
        await db.execute(`CREATE TYPE ${enumType.name} AS ENUM (${valuesList})`);
        console.log(`Created enum type: ${enumType.name}`);
      } else {
        console.log(`Enum type ${enumType.name} already exists`);
      }
    } catch (error) {
      console.error(`Error creating enum type ${enumType.name}:`, error);
      throw error;
    }
  }
}

async function createTables() {
  // Create users table first since other tables reference it
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" serial PRIMARY KEY,
      "username" text NOT NULL UNIQUE,
      "password" text NOT NULL,
      "first_name" text,
      "last_name" text,
      "email" text NOT NULL UNIQUE,
      "role" text DEFAULT 'User',
      "avatar" text,
      "created_at" timestamp DEFAULT now(),
      "stripe_customer_id" text UNIQUE,
      "stripe_subscription_id" text UNIQUE,
      "is_active" boolean DEFAULT true,
      "last_login" timestamp,
      "is_verified" boolean DEFAULT false,
      "company" text,
      "package_id" integer
    )
  `);
  console.log("Created users table");
  
  // Create accounts table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "accounts" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "industry" text,
      "website" text,
      "phone" text,
      "billing_address" text,
      "billing_city" text,
      "billing_state" text,
      "billing_zip" text,
      "billing_country" text,
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "annual_revenue" numeric,
      "employee_count" integer,
      "notes" text,
      "is_active" boolean DEFAULT true
    )
  `);
  console.log("Created accounts table");
  
  // Create contacts table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "contacts" (
      "id" serial PRIMARY KEY,
      "first_name" text NOT NULL,
      "last_name" text NOT NULL,
      "email" text,
      "phone" text,
      "title" text,
      "account_id" integer REFERENCES "accounts"("id"),
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "address" text,
      "city" text,
      "state" text,
      "zip" text,
      "country" text,
      "notes" text,
      "is_active" boolean DEFAULT true
    )
  `);
  console.log("Created contacts table");
  
  // Create opportunities table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "opportunities" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "account_id" integer REFERENCES "accounts"("id"),
      "stage" opportunity_stage DEFAULT 'Lead Generation',
      "amount" numeric,
      "expected_close_date" date,
      "probability" integer,
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "notes" text,
      "is_closed" boolean DEFAULT false,
      "is_won" boolean DEFAULT false
    )
  `);
  console.log("Created opportunities table");
  
  // Create leads table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "leads" (
      "id" serial PRIMARY KEY,
      "first_name" text NOT NULL,
      "last_name" text NOT NULL,
      "email" text,
      "phone" text,
      "company" text,
      "title" text,
      "status" lead_status DEFAULT 'New',
      "source" text,
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "notes" text,
      "is_converted" boolean DEFAULT false,
      "converted_to_contact_id" integer REFERENCES "contacts"("id"),
      "converted_to_account_id" integer REFERENCES "accounts"("id"),
      "converted_to_opportunity_id" integer REFERENCES "opportunities"("id")
    )
  `);
  console.log("Created leads table");
  
  // Create tasks table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "tasks" (
      "id" serial PRIMARY KEY,
      "title" text NOT NULL,
      "description" text,
      "due_date" date,
      "priority" task_priority DEFAULT 'Normal',
      "status" task_status DEFAULT 'Not Started',
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "related_to_type" text,
      "related_to_id" integer,
      "is_reminder" boolean DEFAULT false,
      "reminder_date" timestamp
    )
  `);
  console.log("Created tasks table");
  
  // Create events table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "events" (
      "id" serial PRIMARY KEY,
      "title" text NOT NULL,
      "description" text,
      "start_date" timestamp NOT NULL,
      "end_date" timestamp NOT NULL,
      "location" text,
      "location_type" text DEFAULT 'physical',
      "event_type" event_type DEFAULT 'Meeting',
      "status" text DEFAULT 'Confirmed',
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "is_all_day" boolean DEFAULT false,
      "is_recurring" boolean DEFAULT false,
      "recurring_rule" text
    )
  `);
  console.log("Created events table");
  
  // Create activities table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "activities" (
      "id" serial PRIMARY KEY,
      "user_id" integer REFERENCES "users"("id"),
      "action" text NOT NULL,
      "detail" text,
      "related_to_type" text,
      "related_to_id" integer,
      "created_at" timestamp DEFAULT now(),
      "icon" text DEFAULT 'added'
    )
  `);
  console.log("Created activities table");
  
  // Create subscription_packages table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "subscription_packages" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "description" text NOT NULL,
      "price" numeric NOT NULL,
      "interval" text NOT NULL,
      "stripe_price_id" text,
      "features" text[],
      "max_users" integer NOT NULL,
      "max_contacts" integer NOT NULL,
      "max_storage" integer NOT NULL,
      "is_active" boolean DEFAULT true,
      "display_order" integer DEFAULT 0,
      "created_at" timestamp DEFAULT now()
    )
  `);
  console.log("Created subscription_packages table");
  
  // Create user_subscriptions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "user_subscriptions" (
      "id" serial PRIMARY KEY,
      "user_id" integer NOT NULL REFERENCES "users"("id"),
      "package_id" integer NOT NULL REFERENCES "subscription_packages"("id"),
      "status" subscription_status DEFAULT 'Pending',
      "start_date" timestamp NOT NULL,
      "end_date" timestamp,
      "stripe_subscription_id" text,
      "canceled_at" timestamp,
      "current_period_start" timestamp,
      "current_period_end" timestamp,
      "created_at" timestamp DEFAULT now(),
      "trial_ends_at" timestamp
    )
  `);
  console.log("Created user_subscriptions table");
  
  // Create social_integrations table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "social_integrations" (
      "id" serial PRIMARY KEY,
      "user_id" integer NOT NULL REFERENCES "users"("id"),
      "platform" social_platform NOT NULL,
      "account_id" text NOT NULL,
      "name" text NOT NULL,
      "access_token" text NOT NULL,
      "refresh_token" text,
      "token_expiry" timestamp,
      "settings" jsonb,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "is_active" boolean DEFAULT true
    )
  `);
  console.log("Created social_integrations table");
  
  // Create social_messages table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "social_messages" (
      "id" serial PRIMARY KEY,
      "integration_id" integer NOT NULL REFERENCES "social_integrations"("id"),
      "external_id" text NOT NULL,
      "sender" text NOT NULL,
      "recipient" text,
      "message" text NOT NULL,
      "attachments" jsonb,
      "metadata" jsonb,
      "status" message_status DEFAULT 'Unread',
      "lead_id" integer REFERENCES "leads"("id"),
      "contact_id" integer REFERENCES "contacts"("id"),
      "received_at" timestamp,
      "created_at" timestamp DEFAULT now(),
      "is_deleted" boolean DEFAULT false
    )
  `);
  console.log("Created social_messages table");

  // Create lead_sources table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "lead_sources" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "description" text,
      "platform" social_platform,
      "is_active" boolean DEFAULT true,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp
    )
  `);
  console.log("Created lead_sources table");

  // Create social_campaigns table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "social_campaigns" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "description" text,
      "content" text,
      "platform" social_platform,
      "integration_id" integer REFERENCES "social_integrations"("id"),
      "status" text DEFAULT 'Draft',
      "start_date" timestamp,
      "end_date" timestamp,
      "owner_id" integer REFERENCES "users"("id"),
      "metrics" jsonb,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "is_active" boolean DEFAULT true
    )
  `);
  console.log("Created social_campaigns table");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });