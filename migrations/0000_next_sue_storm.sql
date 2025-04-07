-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."api_provider" AS ENUM('OpenAI', 'Stripe', 'Facebook', 'LinkedIn', 'Twitter', 'WhatsApp', 'Other');--> statement-breakpoint
CREATE TYPE "public"."communication_channel" AS ENUM('Email', 'WhatsApp', 'SMS', 'Phone', 'Messenger', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Other');--> statement-breakpoint
CREATE TYPE "public"."communication_direction" AS ENUM('Inbound', 'Outbound');--> statement-breakpoint
CREATE TYPE "public"."communication_status" AS ENUM('Unread', 'Read', 'Replied', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('Meeting', 'Call', 'Demonstration', 'Follow-up', 'Other');--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('Purchase', 'Sale', 'Adjustment', 'Return', 'Transfer');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled', 'Refunded');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('New', 'Qualified', 'Contacted', 'Not Interested', 'Converted');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('Unread', 'Read', 'Replied', 'Archived');--> statement-breakpoint
CREATE TYPE "public"."opportunity_stage" AS ENUM('Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('Cash', 'Credit Card', 'Bank Transfer', 'Check', 'PayPal', 'Other');--> statement-breakpoint
CREATE TYPE "public"."permission_action" AS ENUM('view', 'create', 'update', 'delete', 'export', 'import', 'assign');--> statement-breakpoint
CREATE TYPE "public"."proposal_element_type" AS ENUM('Header', 'Text', 'Image', 'Table', 'List', 'Quote', 'ProductList', 'Signature', 'PageBreak', 'Custom');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Revoked');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('Draft', 'Sent', 'Received', 'Cancelled', 'Partially Received');--> statement-breakpoint
CREATE TYPE "public"."social_platform" AS ENUM('Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'WhatsApp', 'Email', 'Messenger', 'Other');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('Active', 'Pending', 'Expired', 'Canceled', 'Trial');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('High', 'Medium', 'Normal');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('Not Started', 'In Progress', 'Completed', 'Deferred');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Admin', 'Manager', 'User', 'ReadOnly');--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"role" text DEFAULT 'User',
	"avatar" text,
	"created_at" timestamp DEFAULT now(),
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"is_verified" boolean DEFAULT false,
	"company" text,
	"package_id" integer,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_stripe_customer_id_key" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_stripe_subscription_id_key" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"detail" text,
	"related_to_type" text,
	"related_to_id" integer,
	"created_at" timestamp DEFAULT now(),
	"icon" text DEFAULT 'added'
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"package_id" integer NOT NULL,
	"status" "subscription_status" DEFAULT 'Pending',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"stripe_subscription_id" text,
	"canceled_at" timestamp,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"trial_ends_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "subscription_packages" (
	"id" serial PRIMARY KEY NOT NULL,
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
);
--> statement-breakpoint
CREATE TABLE "social_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" "social_platform" NOT NULL,
	"account_id" text NOT NULL,
	"name" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expiry" timestamp,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "social_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" text,
	"platform" "social_platform",
	"integration_id" integer,
	"status" text DEFAULT 'Draft',
	"start_date" timestamp,
	"end_date" timestamp,
	"owner_id" integer,
	"metrics" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "lead_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"platform" "social_platform",
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "social_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"integration_id" integer NOT NULL,
	"external_id" text NOT NULL,
	"sender" text NOT NULL,
	"recipient" text,
	"message" text NOT NULL,
	"attachments" jsonb,
	"metadata" jsonb,
	"status" "message_status" DEFAULT 'Unread',
	"lead_id" integer,
	"contact_id" integer,
	"received_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false,
	"related_to_type" text,
	"related_to_id" integer
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" text,
	"location_type" text DEFAULT 'physical',
	"event_type" "event_type" DEFAULT 'Meeting',
	"status" text DEFAULT 'Confirmed',
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	"is_all_day" boolean DEFAULT false,
	"is_recurring" boolean DEFAULT false,
	"recurring_rule" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date,
	"priority" "task_priority" DEFAULT 'Normal',
	"status" "task_status" DEFAULT 'Not Started',
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	"related_to_type" text,
	"related_to_id" integer,
	"is_reminder" boolean DEFAULT false,
	"reminder_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"account_id" integer,
	"stage" "opportunity_stage" DEFAULT 'Lead Generation',
	"amount" numeric,
	"expected_close_date" date,
	"probability" integer,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	"notes" text,
	"is_closed" boolean DEFAULT false,
	"is_won" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"title" text,
	"status" "lead_status" DEFAULT 'New',
	"source" text,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	"notes" text,
	"is_converted" boolean DEFAULT false,
	"converted_to_contact_id" integer,
	"converted_to_account_id" integer,
	"converted_to_opportunity_id" integer
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"title" text,
	"account_id" integer,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"country" text,
	"notes" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"description" text,
	"settings" jsonb,
	"updated_at" timestamp,
	"entity_type" text NOT NULL,
	"entity_filter" jsonb,
	"actions" jsonb NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	"version" integer
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"image" text,
	"attributes" jsonb,
	"owner_id" integer,
	CONSTRAINT "product_categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"description" text,
	"price" numeric NOT NULL,
	"cost" numeric,
	"category_id" integer,
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
	"owner_id" integer,
	"weight" numeric,
	"dimensions" jsonb,
	"barcode" text,
	"tags" text[],
	CONSTRAINT "products_sku_key" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"type" "inventory_transaction_type" NOT NULL,
	"reference_type" text,
	"reference_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" integer,
	"unit_cost" numeric,
	"location" text,
	"batch_id" text,
	"expiry_date" date,
	"serial_number" text
);
--> statement-breakpoint
CREATE TABLE "module_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"order" integer DEFAULT 0,
	"icon" text
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "user_role" NOT NULL,
	"module_id" integer NOT NULL,
	"action" text NOT NULL,
	"is_allowed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"action" text NOT NULL,
	"is_allowed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"created_by" integer,
	"parent_team_id" integer
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"assigned_to_type" text NOT NULL,
	"assigned_to_id" integer NOT NULL,
	"assigned_by_id" integer,
	"assigned_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text,
	"is_leader" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"account_id" integer NOT NULL,
	"contact_id" integer,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" "invoice_status" DEFAULT 'Draft',
	"subtotal" numeric NOT NULL,
	"tax_amount" numeric NOT NULL,
	"discount_amount" numeric DEFAULT '0',
	"total_amount" numeric NOT NULL,
	"notes" text,
	"terms" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"owner_id" integer,
	"payment_method" "payment_method",
	"payment_date" date,
	"payment_reference" text,
	"currency" text DEFAULT 'USD',
	CONSTRAINT "invoices_invoice_number_key" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"product_id" integer,
	"description" text NOT NULL,
	"quantity" numeric NOT NULL,
	"unit_price" numeric NOT NULL,
	"tax_rate" numeric,
	"tax_amount" numeric,
	"discount_percent" numeric,
	"discount_amount" numeric,
	"line_total" numeric NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"po_number" text NOT NULL,
	"supplier_id" integer NOT NULL,
	"status" "purchase_order_status" DEFAULT 'Draft',
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
	"created_by" integer,
	"approved_by" integer,
	"approval_date" date,
	"currency" text DEFAULT 'USD',
	CONSTRAINT "purchase_orders_po_number_key" UNIQUE("po_number")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"product_id" integer,
	"description" text NOT NULL,
	"quantity" numeric NOT NULL,
	"received_quantity" numeric DEFAULT '0',
	"unit_price" numeric NOT NULL,
	"tax_amount" numeric,
	"line_total" numeric NOT NULL,
	"expected_delivery_date" date,
	"notes" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"channel" "communication_channel" NOT NULL,
	"direction" "communication_direction" NOT NULL,
	"contact_id" integer,
	"lead_id" integer,
	"content" text NOT NULL,
	"status" "communication_status" DEFAULT 'Unread',
	"sent_at" timestamp,
	"received_at" timestamp,
	"owner_id" integer,
	"subject" text,
	"attachments" jsonb,
	"is_starred" boolean DEFAULT false,
	"labels" jsonb,
	"metadata" jsonb,
	"contact_type" text,
	"contact_details" jsonb
);
--> statement-breakpoint
CREATE TABLE "proposal_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" jsonb NOT NULL,
	"thumbnail" text,
	"is_default" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"is_active" boolean DEFAULT true,
	"category" text,
	"tags" text[]
);
--> statement-breakpoint
CREATE TABLE "proposal_elements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"element_type" "proposal_element_type" NOT NULL,
	"content" jsonb NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"is_global" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"category" text DEFAULT 'General',
	"thumbnail" text,
	"proposal_id" integer,
	"sort_order" integer
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"opportunity_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"status" "proposal_status" DEFAULT 'Draft',
	"content" jsonb NOT NULL,
	"template_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"sent_at" timestamp,
	"expires_at" timestamp,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"total_amount" numeric,
	"currency" text DEFAULT 'USD',
	"version_number" integer DEFAULT 1,
	"previous_version_id" integer,
	"settings" jsonb,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "proposal_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'Editor',
	"added_by" integer,
	"added_at" timestamp DEFAULT now(),
	"last_accessed" timestamp,
	"notifications" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"key" text NOT NULL,
	"secret" text,
	"project_id" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"user_id" integer NOT NULL,
	"usage_data" jsonb,
	"rate_limit" integer,
	"is_active" boolean DEFAULT true,
	"additional_fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "proposal_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"element_path" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"parent_id" integer,
	"resolved" boolean DEFAULT false,
	"resolved_by" integer,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "proposal_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"user_id" integer,
	"activity_type" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"website" text,
	"phone" text,
	"billing_address" text,
	"billing_city" text,
	"billing_state" text,
	"billing_zip" text,
	"billing_country" text,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	"annual_revenue" numeric,
	"employee_count" integer,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"email" text,
	"type" text,
	"number_of_employees" integer,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"country" text
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."subscription_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_integrations" ADD CONSTRAINT "social_integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_campaigns" ADD CONSTRAINT "social_campaigns_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."social_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_campaigns" ADD CONSTRAINT "social_campaigns_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_messages" ADD CONSTRAINT "social_messages_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."social_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_messages" ADD CONSTRAINT "social_messages_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_messages" ADD CONSTRAINT "social_messages_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_contact_id_fkey" FOREIGN KEY ("converted_to_contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_account_id_fkey" FOREIGN KEY ("converted_to_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_opportunity_id_fkey" FOREIGN KEY ("converted_to_opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_templates" ADD CONSTRAINT "proposal_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_elements" ADD CONSTRAINT "proposal_elements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_elements" ADD CONSTRAINT "proposal_elements_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."proposal_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_collaborators" ADD CONSTRAINT "proposal_collaborators_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_collaborators" ADD CONSTRAINT "proposal_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_collaborators" ADD CONSTRAINT "proposal_collaborators_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_comments" ADD CONSTRAINT "proposal_comments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_comments" ADD CONSTRAINT "proposal_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_comments" ADD CONSTRAINT "proposal_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."proposal_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_comments" ADD CONSTRAINT "proposal_comments_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_activities" ADD CONSTRAINT "proposal_activities_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_activities" ADD CONSTRAINT "proposal_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "session" USING btree ("expire" timestamp_ops);
*/