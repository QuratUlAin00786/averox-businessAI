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
        "criteria" JSONB NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "is_active" BOOLEAN,
        "contact_count" INTEGER DEFAULT 0,
        "tags" TEXT[]
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "marketing_campaigns" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "type" campaign_type NOT NULL,
        "status" campaign_status NOT NULL DEFAULT 'draft',
        "content" JSONB,
        "schedule" JSONB,
        "segment_id" INTEGER,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "stats" JSONB,
        "template_id" INTEGER,
        "send_time" TIMESTAMP WITH TIME ZONE,
        "settings" JSONB,
        "tags" TEXT[]
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "marketing_workflows" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" workflow_status NOT NULL DEFAULT 'draft',
        "trigger_type" workflow_trigger_type NOT NULL,
        "trigger_settings" JSONB,
        "nodes" JSONB NOT NULL,
        "connections" JSONB NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "created_by" INTEGER,
        "is_active" BOOLEAN,
        "enrolled_contacts" INTEGER DEFAULT 0,
        "settings" JSONB,
        "tags" TEXT[]
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "campaign_engagements" (
        "id" SERIAL PRIMARY KEY,
        "campaign_id" INTEGER NOT NULL,
        "contact_id" INTEGER NOT NULL,
        "status" TEXT NOT NULL,
        "engagement_time" TIMESTAMP WITH TIME ZONE,
        "action" TEXT,
        "details" JSONB,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE,
        "device_info" JSONB,
        "location_info" JSONB
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "workflow_enrollments" (
        "id" SERIAL PRIMARY KEY,
        "workflow_id" INTEGER NOT NULL,
        "contact_id" INTEGER NOT NULL,
        "status" TEXT NOT NULL,
        "current_step" TEXT,
        "steps_completed" JSONB,
        "enrollment_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "completion_time" TIMESTAMP WITH TIME ZONE,
        "data" JSONB,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE
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