import { db } from "../server/db";

async function main() {
  console.log("Creating inventory and accounting related tables...");
  
  try {
    // Create enum types
    console.log("Creating inventory enum types...");
    await createEnumTypes();
    
    // Create tables 
    console.log("Creating inventory and accounting tables...");
    await createTables();
    
    console.log("Inventory and accounting tables successfully created!");
  } catch (error) {
    console.error("Error creating inventory tables:", error);
    process.exit(1);
  }
}

async function createEnumTypes() {
  // Check and create each enum type
  const enumTypes = [
    {
      name: 'invoice_status',
      values: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded']
    },
    {
      name: 'inventory_transaction_type',
      values: ['Purchase', 'Sale', 'Adjustment', 'Return', 'Transfer']
    },
    {
      name: 'payment_method',
      values: ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal', 'Other']
    },
    {
      name: 'purchase_order_status',
      values: ['Draft', 'Sent', 'Received', 'Cancelled', 'Partially Received']
    },
    {
      name: 'communication_channel',
      values: ['Email', 'WhatsApp', 'SMS', 'Phone', 'Messenger', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Other']
    },
    {
      name: 'communication_direction',
      values: ['Inbound', 'Outbound']
    },
    {
      name: 'communication_status',
      values: ['Unread', 'Read', 'Replied', 'Archived']
    },
    {
      name: 'api_provider',
      values: ['OpenAI', 'Stripe', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other']
    },
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
  // Create product_categories table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "product_categories" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL UNIQUE,
      "description" text,
      "parent_id" integer REFERENCES "product_categories"("id"),
      "is_active" boolean DEFAULT true,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "image" text,
      "attributes" jsonb,
      "owner_id" integer REFERENCES "users"("id")
    )
  `);
  console.log("Created product_categories table");

  // Create products table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "products" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "sku" text NOT NULL UNIQUE,
      "description" text,
      "price" numeric NOT NULL,
      "cost" numeric,
      "category_id" integer REFERENCES "product_categories"("id"),
      "is_active" boolean DEFAULT true,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "in_stock" boolean DEFAULT true,
      "stock_quantity" integer DEFAULT 0,
      "reorder_level" integer DEFAULT 5,
      "attributes" jsonb,
      "images" text[],
      "taxable" boolean DEFAULT true,
      "tax_rate" numeric,
      "owner_id" integer REFERENCES "users"("id"),
      "weight" numeric,
      "dimensions" jsonb,
      "barcode" text,
      "tags" text[]
    )
  `);
  console.log("Created products table");

  // Create inventory_transactions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "inventory_transactions" (
      "id" serial PRIMARY KEY,
      "product_id" integer NOT NULL REFERENCES "products"("id"),
      "quantity" integer NOT NULL,
      "type" inventory_transaction_type NOT NULL,
      "reference_type" text,
      "reference_id" integer,
      "notes" text,
      "created_at" timestamp DEFAULT now(),
      "created_by" integer REFERENCES "users"("id"),
      "unit_cost" numeric,
      "location" text,
      "batch_id" text,
      "expiry_date" date,
      "serial_number" text
    )
  `);
  console.log("Created inventory_transactions table");

  // Create invoices table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "invoices" (
      "id" serial PRIMARY KEY,
      "invoice_number" text NOT NULL UNIQUE,
      "account_id" integer NOT NULL REFERENCES "accounts"("id"),
      "contact_id" integer REFERENCES "contacts"("id"),
      "issue_date" date NOT NULL,
      "due_date" date NOT NULL,
      "status" invoice_status DEFAULT 'Draft',
      "subtotal" numeric NOT NULL,
      "tax_amount" numeric NOT NULL,
      "discount_amount" numeric DEFAULT 0,
      "total_amount" numeric NOT NULL,
      "notes" text,
      "terms" text,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "owner_id" integer REFERENCES "users"("id"),
      "payment_method" payment_method,
      "payment_date" date,
      "payment_reference" text,
      "currency" text DEFAULT 'USD'
    )
  `);
  console.log("Created invoices table");

  // Create invoice_items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "invoice_items" (
      "id" serial PRIMARY KEY,
      "invoice_id" integer NOT NULL REFERENCES "invoices"("id"),
      "product_id" integer REFERENCES "products"("id"),
      "description" text NOT NULL,
      "quantity" numeric NOT NULL,
      "unit_price" numeric NOT NULL,
      "tax_rate" numeric,
      "tax_amount" numeric,
      "discount_percent" numeric,
      "discount_amount" numeric,
      "line_total" numeric NOT NULL,
      "sort_order" integer DEFAULT 0
    )
  `);
  console.log("Created invoice_items table");

  // Create purchase_orders table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "purchase_orders" (
      "id" serial PRIMARY KEY,
      "po_number" text NOT NULL UNIQUE,
      "supplier_id" integer NOT NULL REFERENCES "accounts"("id"),
      "status" purchase_order_status DEFAULT 'Draft',
      "order_date" date NOT NULL,
      "expected_delivery_date" date,
      "delivery_date" date,
      "subtotal" numeric NOT NULL,
      "tax_amount" numeric,
      "total_amount" numeric NOT NULL,
      "notes" text,
      "shipping_address" text,
      "billing_address" text,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "created_by" integer REFERENCES "users"("id"),
      "approved_by" integer REFERENCES "users"("id"),
      "approval_date" date,
      "currency" text DEFAULT 'USD'
    )
  `);
  console.log("Created purchase_orders table");

  // Create purchase_order_items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "purchase_order_items" (
      "id" serial PRIMARY KEY,
      "purchase_order_id" integer NOT NULL REFERENCES "purchase_orders"("id"),
      "product_id" integer REFERENCES "products"("id"),
      "description" text NOT NULL,
      "quantity" numeric NOT NULL,
      "received_quantity" numeric DEFAULT 0,
      "unit_price" numeric NOT NULL,
      "tax_amount" numeric,
      "line_total" numeric NOT NULL,
      "expected_delivery_date" date,
      "notes" text,
      "sort_order" integer DEFAULT 0
    )
  `);
  console.log("Created purchase_order_items table");

  // Create api_keys table (for API keys management)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "api_keys" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "key" text NOT NULL UNIQUE,
      "api_provider" api_provider NOT NULL,
      "owner_id" integer REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "last_used" timestamp,
      "usage_count" integer DEFAULT 0,
      "usage_limit" integer,
      "is_active" boolean DEFAULT true,
      "settings" jsonb
    )
  `);
  console.log("Created api_keys table");

  // Create communications table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "communications" (
      "id" serial PRIMARY KEY,
      "contact_id" integer NOT NULL,
      "contact_type" text NOT NULL,
      "channel" communication_channel NOT NULL,
      "direction" communication_direction NOT NULL,
      "content" text NOT NULL,
      "status" communication_status DEFAULT 'Unread',
      "sent_at" timestamp NOT NULL,
      "received_at" timestamp,
      "attachments" jsonb,
      "created_at" timestamp DEFAULT now(),
      "created_by" integer REFERENCES "users"("id")
    )
  `);
  console.log("Created communications table");

  // Create workflows table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "workflows" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "description" text,
      "entity_type" text NOT NULL,
      "entity_filter" jsonb,
      "actions" jsonb NOT NULL,
      "settings" jsonb,
      "created_at" timestamp DEFAULT now(),
      "updated_at" timestamp,
      "created_by" integer REFERENCES "users"("id"),
      "updated_by" integer REFERENCES "users"("id"),
      "is_active" boolean DEFAULT true,
      "version" integer DEFAULT 1
    )
  `);
  console.log("Created workflows table");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });