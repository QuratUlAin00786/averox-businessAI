import { Express } from "express";
import { db } from "./db";
import { 
  audienceSegments,
  marketingCampaigns, 
  marketingWorkflows, 
  emailTemplates,
  campaignEngagements,
  workflowEnrollments,
  insertEmailTemplateSchema,
  insertAudienceSegmentSchema,
  insertMarketingCampaignSchema,
  insertMarketingWorkflowSchema,
  insertWorkflowEnrollmentSchema,
  insertCampaignEngagementSchema,
} from "@shared/marketing";
import { eq } from "drizzle-orm";
import { z } from "zod";

export function setupMarketingRoutes(app: Express) {
  // Email Templates API Endpoints
  app.get("/api/marketing/email-templates", async (req, res) => {
    try {
      const templates = await db.select().from(emailTemplates);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/marketing/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
      
      if (!template) {
        return res.status(404).json({ error: "Email template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketing/email-templates", async (req, res) => {
    try {
      const validatedData = insertEmailTemplateSchema.parse(req.body);
      
      // Add userId as createdBy if authenticated
      if (req.isAuthenticated() && req.user?.id) {
        validatedData.createdBy = req.user.id;
      }

      const [newTemplate] = await db.insert(emailTemplates).values(validatedData).returning();
      res.status(201).json(newTemplate);
    } catch (error) {
      console.error("Error creating email template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/marketing/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const validatedData = insertEmailTemplateSchema.parse(req.body);
      
      // Add updatedAt timestamp
      validatedData.updatedAt = new Date();

      const [updatedTemplate] = await db.update(emailTemplates)
        .set(validatedData)
        .where(eq(emailTemplates.id, id))
        .returning();
      
      if (!updatedTemplate) {
        return res.status(404).json({ error: "Email template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating email template:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/marketing/email-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [deletedTemplate] = await db.delete(emailTemplates)
        .where(eq(emailTemplates.id, id))
        .returning();
      
      if (!deletedTemplate) {
        return res.status(404).json({ error: "Email template not found" });
      }
      
      res.json({ message: "Email template deleted successfully" });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Audience Segments API Endpoints
  app.get("/api/marketing/audience-segments", async (req, res) => {
    try {
      const segments = await db.select().from(audienceSegments);
      res.json(segments);
    } catch (error) {
      console.error("Error fetching audience segments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/marketing/audience-segments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [segment] = await db.select().from(audienceSegments).where(eq(audienceSegments.id, id));
      
      if (!segment) {
        return res.status(404).json({ error: "Audience segment not found" });
      }
      
      res.json(segment);
    } catch (error) {
      console.error("Error fetching audience segment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketing/audience-segments", async (req, res) => {
    try {
      const validatedData = insertAudienceSegmentSchema.parse(req.body);
      
      // Add userId as createdBy if authenticated
      if (req.isAuthenticated() && req.user?.id) {
        validatedData.createdBy = req.user.id;
      }

      const [newSegment] = await db.insert(audienceSegments).values(validatedData).returning();
      res.status(201).json(newSegment);
    } catch (error) {
      console.error("Error creating audience segment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/marketing/audience-segments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const validatedData = insertAudienceSegmentSchema.parse(req.body);
      
      // Add updatedAt timestamp
      validatedData.updatedAt = new Date();

      const [updatedSegment] = await db.update(audienceSegments)
        .set(validatedData)
        .where(eq(audienceSegments.id, id))
        .returning();
      
      if (!updatedSegment) {
        return res.status(404).json({ error: "Audience segment not found" });
      }
      
      res.json(updatedSegment);
    } catch (error) {
      console.error("Error updating audience segment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/marketing/audience-segments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [deletedSegment] = await db.delete(audienceSegments)
        .where(eq(audienceSegments.id, id))
        .returning();
      
      if (!deletedSegment) {
        return res.status(404).json({ error: "Audience segment not found" });
      }
      
      res.json({ message: "Audience segment deleted successfully" });
    } catch (error) {
      console.error("Error deleting audience segment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketing Campaigns API Endpoints
  app.get("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaigns = await db.select().from(marketingCampaigns);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [campaign] = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id));
      
      if (!campaign) {
        return res.status(404).json({ error: "Marketing campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching marketing campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketing/campaigns", async (req, res) => {
    try {
      const validatedData = insertMarketingCampaignSchema.parse(req.body);
      
      // Add userId as createdBy if authenticated
      if (req.isAuthenticated() && req.user?.id) {
        validatedData.createdBy = req.user.id;
      }

      const [newCampaign] = await db.insert(marketingCampaigns).values(validatedData).returning();
      res.status(201).json(newCampaign);
    } catch (error) {
      console.error("Error creating marketing campaign:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const validatedData = insertMarketingCampaignSchema.parse(req.body);
      
      // Add updatedAt timestamp
      validatedData.updatedAt = new Date();

      const [updatedCampaign] = await db.update(marketingCampaigns)
        .set(validatedData)
        .where(eq(marketingCampaigns.id, id))
        .returning();
      
      if (!updatedCampaign) {
        return res.status(404).json({ error: "Marketing campaign not found" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating marketing campaign:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [deletedCampaign] = await db.delete(marketingCampaigns)
        .where(eq(marketingCampaigns.id, id))
        .returning();
      
      if (!deletedCampaign) {
        return res.status(404).json({ error: "Marketing campaign not found" });
      }
      
      res.json({ message: "Marketing campaign deleted successfully" });
    } catch (error) {
      console.error("Error deleting marketing campaign:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketing Workflows API Endpoints
  app.get("/api/marketing/workflows", async (req, res) => {
    try {
      const workflows = await db.select().from(marketingWorkflows);
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching marketing workflows:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/marketing/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [workflow] = await db.select().from(marketingWorkflows).where(eq(marketingWorkflows.id, id));
      
      if (!workflow) {
        return res.status(404).json({ error: "Marketing workflow not found" });
      }
      
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching marketing workflow:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketing/workflows", async (req, res) => {
    try {
      const validatedData = insertMarketingWorkflowSchema.parse(req.body);
      
      // Add userId as createdBy if authenticated
      if (req.isAuthenticated() && req.user?.id) {
        validatedData.createdBy = req.user.id;
      }

      const [newWorkflow] = await db.insert(marketingWorkflows).values(validatedData).returning();
      res.status(201).json(newWorkflow);
    } catch (error) {
      console.error("Error creating marketing workflow:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/marketing/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const validatedData = insertMarketingWorkflowSchema.parse(req.body);
      
      // Add updatedAt timestamp
      validatedData.updatedAt = new Date();

      const [updatedWorkflow] = await db.update(marketingWorkflows)
        .set(validatedData)
        .where(eq(marketingWorkflows.id, id))
        .returning();
      
      if (!updatedWorkflow) {
        return res.status(404).json({ error: "Marketing workflow not found" });
      }
      
      res.json(updatedWorkflow);
    } catch (error) {
      console.error("Error updating marketing workflow:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/marketing/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const [deletedWorkflow] = await db.delete(marketingWorkflows)
        .where(eq(marketingWorkflows.id, id))
        .returning();
      
      if (!deletedWorkflow) {
        return res.status(404).json({ error: "Marketing workflow not found" });
      }
      
      res.json({ message: "Marketing workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting marketing workflow:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Marketing Dashboard Stats API Endpoint
  app.get("/api/marketing/dashboard-stats", async (req, res) => {
    try {
      // Count of email templates
      const templateCount = await db.select().from(emailTemplates);
      
      // Count of campaigns by status
      const campaigns = await db.select().from(marketingCampaigns);
      const campaignsByStatus = Array.from(
        campaigns.reduce((acc, campaign) => {
          const status = campaign.status || 'unknown';
          acc.set(status, (acc.get(status) || 0) + 1);
          return acc;
        }, new Map()),
        ([status, count]) => ({ status, count })
      );
      
      // Count of workflows
      const workflows = await db.select().from(marketingWorkflows);
      
      // Count of audience segments
      const segments = await db.select().from(audienceSegments);

      // Sample email engagement data (this would normally come from the engagement table)
      const emailStats = {
        sent: 1250,
        opened: 680,
        clicked: 320,
        bounced: 50,
        unsubscribed: 15,
        openRate: "54.4%",
        clickRate: "25.6%",
        bounceRate: "4.0%",
        unsubscribeRate: "1.2%"
      };

      res.json({
        emailTemplateCount: templateCount.length || 0,
        campaignsByStatus,
        workflowCount: workflows.length || 0,
        segmentCount: segments.length || 0,
        emailStats
      });
    } catch (error) {
      console.error("Error fetching marketing dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Recent Marketing Activities
  app.get("/api/marketing/recent-activities", async (req, res) => {
    try {
      // This would normally fetch from an activities table specifically for marketing
      // For now, returning sample data
      const recentActivities = [
        {
          id: 1,
          type: "campaign",
          action: "created",
          name: "Welcome Email Campaign",
          timestamp: new Date(Date.now() - 3600000),
          user: "Admin"
        },
        {
          id: 2,
          type: "email",
          action: "edited",
          name: "Monthly Newsletter Template",
          timestamp: new Date(Date.now() - 7200000),
          user: "Marketing Team"
        },
        {
          id: 3,
          type: "workflow",
          action: "activated",
          name: "Lead Nurturing Sequence",
          timestamp: new Date(Date.now() - 86400000),
          user: "Admin"
        },
        {
          id: 4,
          type: "segment",
          action: "created",
          name: "High-Value Prospects",
          timestamp: new Date(Date.now() - 172800000),
          user: "Marketing Team"
        },
        {
          id: 5,
          type: "campaign",
          action: "completed",
          name: "Product Launch Announcement",
          timestamp: new Date(Date.now() - 259200000),
          user: "Admin"
        }
      ];

      res.json(recentActivities);
    } catch (error) {
      console.error("Error fetching marketing activities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Workflow Enrollments CRUD Endpoints
  app.get("/api/marketing/workflow-enrollments", async (req, res) => {
    try {
      const workflowId = req.query.workflowId ? parseInt(req.query.workflowId as string) : undefined;
      
      let query = db.select().from(workflowEnrollments);
      
      if (workflowId && !isNaN(workflowId)) {
        query = query.where(eq(workflowEnrollments.workflowId, workflowId));
      }
      
      const enrollments = await query;
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching workflow enrollments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/marketing/workflow-enrollments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const [enrollment] = await db
        .select()
        .from(workflowEnrollments)
        .where(eq(workflowEnrollments.id, id));
      
      if (!enrollment) {
        return res.status(404).json({ error: "Workflow enrollment not found" });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching workflow enrollment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/marketing/workflow-enrollments", async (req, res) => {
    try {
      const validatedData = insertWorkflowEnrollmentSchema.parse(req.body);
      
      const [enrollment] = await db
        .insert(workflowEnrollments)
        .values(validatedData)
        .returning();
      
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating workflow enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/marketing/workflow-enrollments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      // Partial update, so we only validate the fields provided
      const validatedData = insertWorkflowEnrollmentSchema.partial().parse(req.body);
      
      const [updatedEnrollment] = await db
        .update(workflowEnrollments)
        .set(validatedData)
        .where(eq(workflowEnrollments.id, id))
        .returning();
      
      if (!updatedEnrollment) {
        return res.status(404).json({ error: "Workflow enrollment not found" });
      }
      
      res.json(updatedEnrollment);
    } catch (error) {
      console.error("Error updating workflow enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/marketing/workflow-enrollments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const [deletedEnrollment] = await db
        .delete(workflowEnrollments)
        .where(eq(workflowEnrollments.id, id))
        .returning();
      
      if (!deletedEnrollment) {
        return res.status(404).json({ error: "Workflow enrollment not found" });
      }
      
      res.json({ message: "Workflow enrollment deleted successfully" });
    } catch (error) {
      console.error("Error deleting workflow enrollment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}