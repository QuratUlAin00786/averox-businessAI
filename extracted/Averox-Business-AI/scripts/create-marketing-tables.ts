import { db } from "../server/db";
import { 
  campaignTypeEnum, 
  campaignStatusEnum, 
  workflowStatusEnum, 
  workflowTriggerTypeEnum, 
  nodeTypeEnum,
  emailTemplates,
  audienceSegments,
  marketingCampaigns,
  marketingWorkflows,
  campaignEngagements,
  workflowEnrollments
} from "../shared/marketing";
import { sql } from "drizzle-orm";

async function createMarketingTables() {
  console.log("Creating marketing module tables...");
  
  try {
    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "campaign_type" AS ENUM ('email', 'social', 'sms', 'push');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "campaign_status" AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "workflow_status" AS ENUM ('draft', 'active', 'paused', 'archived');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "workflow_trigger_type" AS ENUM ('form_submission', 'page_visit', 'email_open', 'email_click', 'time_delay', 'date', 'contact_property_change', 'segment_change', 'custom');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "node_type" AS ENUM ('trigger', 'action', 'condition', 'delay', 'email', 'webhook', 'notification');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    
    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "email_templates" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "subject" TEXT NOT NULL,
        "preview_text" TEXT,
        "content" JSONB NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "is_active" BOOLEAN,
        "category" TEXT,
        "tags" TEXT[],
        "thumbnail" TEXT
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "audience_segments" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "conditions" JSONB DEFAULT '[]' NOT NULL,
        "match_type" TEXT DEFAULT 'all' NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "contact_count" INTEGER DEFAULT 0,
        "last_updated" TIMESTAMP WITH TIME ZONE,
        "is_active" BOOLEAN DEFAULT TRUE
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "marketing_campaigns" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "type" campaign_type NOT NULL,
        "status" campaign_status NOT NULL DEFAULT 'draft',
        "content" JSONB DEFAULT '{}' NOT NULL,
        "segment_id" INTEGER,
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "stats" JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0, "unsubscribed": 0}',
        "settings" JSONB DEFAULT '{"trackOpens": true, "trackClicks": true, "personalizeContent": true}'
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "marketing_workflows" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" workflow_status NOT NULL DEFAULT 'draft',
        "trigger_type" workflow_trigger_type NOT NULL,
        "nodes" JSONB DEFAULT '{}' NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "settings" JSONB DEFAULT '{"allowReEnrollment": false, "suppressFromOtherWorkflows": false, "businessHoursOnly": false}',
        "stats" JSONB DEFAULT '{"activeContacts": 0, "completedContacts": 0, "conversionRate": 0}'
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "campaign_engagements" (
        "id" SERIAL PRIMARY KEY,
        "campaign_id" INTEGER NOT NULL REFERENCES "marketing_campaigns"("id"),
        "contact_id" INTEGER REFERENCES "contacts"("id"),
        "lead_id" INTEGER REFERENCES "leads"("id"),
        "status" TEXT NOT NULL DEFAULT 'pending',
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "delivered_at" TIMESTAMP WITH TIME ZONE,
        "opened_at" TIMESTAMP WITH TIME ZONE,
        "clicked_at" TIMESTAMP WITH TIME ZONE,
        "clicked_url" TEXT,
        "device_info" JSONB,
        "location" JSONB,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "workflow_enrollments" (
        "id" SERIAL PRIMARY KEY,
        "workflow_id" INTEGER NOT NULL REFERENCES "marketing_workflows"("id"),
        "contact_id" INTEGER REFERENCES "contacts"("id"),
        "lead_id" INTEGER REFERENCES "leads"("id"), 
        "status" TEXT NOT NULL DEFAULT 'active',
        "current_node_id" TEXT,
        "enrolled_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "exited_at" TIMESTAMP WITH TIME ZONE,
        "exit_reason" TEXT
      );
    `);
    
    console.log("Marketing tables created successfully!");
  } catch (error) {
    console.error("Error creating marketing tables:", error);
  } finally {
    process.exit(0);
  }
}

createMarketingTables();