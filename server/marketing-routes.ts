import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { encryptForDatabase, decryptFromDatabase } from './utils/database-encryption';

// Validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(['email', 'sms', 'social', 'automation']),
  status: z.enum(['active', 'paused', 'completed', 'draft', 'scheduled']).default('draft'),
  recipientCount: z.number().min(0).default(0),
  sentCount: z.number().min(0).default(0),
  openedCount: z.number().min(0).default(0),
  clickedCount: z.number().min(0).default(0),
  conversionCount: z.number().min(0).default(0),
  scheduledAt: z.string().optional(),
});

const createAutomationSchema = z.object({
  name: z.string().min(1, "Automation name is required"),
  status: z.enum(['active', 'paused', 'draft']).default('draft'),
  triggerType: z.enum(['lead_created', 'contact_added', 'opportunity_stage', 'date_based']),
  description: z.string().optional(),
  actions: z.array(z.string()).optional(),
  contactCount: z.number().min(0).default(0),
  steps: z.number().min(1).default(1),
  conversionRate: z.number().min(0).max(1).default(0),
  executionCount: z.number().min(0).default(0),
  createdAt: z.string().optional(),
});

export function registerMarketingRoutes(app: Express) {
  // Error handler
  const handleError = (res: Response, error: unknown) => {
    console.error('Marketing API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors 
      });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  };

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // CAMPAIGNS ENDPOINTS
  
  // Get all campaigns
  app.get('/api/marketing/campaigns', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Marketing] Fetching all campaigns');
      const campaigns = await storage.getMarketingCampaigns();
      console.log('[Marketing] Campaigns data type:', typeof campaigns);
      console.log('[Marketing] Campaigns is array:', Array.isArray(campaigns));
      console.log('[Marketing] Campaigns data:', JSON.stringify(campaigns, null, 2));
      
      // Ensure we always return an array
      const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
      console.log(`[Marketing] Successfully retrieved ${campaignsArray.length} campaigns`);
      res.json(campaignsArray);
    } catch (error) {
      console.error('[Marketing] Error fetching campaigns:', error);
      handleError(res, error);
    }
  });

  // Create new campaign
  app.post('/api/marketing/campaigns', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Marketing] Creating new campaign:', req.body);
      const validatedData = createCampaignSchema.parse(req.body);
      
      const campaign = await storage.createMarketingCampaign(validatedData);
      
      console.log(`[Marketing] Successfully created campaign with ID ${campaign.id}`);
      res.status(201).json(campaign);
    } catch (error) {
      console.error('[Marketing] Error creating campaign:', error);
      handleError(res, error);
    }
  });

  // AUTOMATIONS ENDPOINTS

  // Get all automations
  app.get('/api/marketing/automations', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Marketing] Fetching all automations');
      const automations = await storage.getMarketingAutomations();
      console.log('[Marketing] Automations data type:', typeof automations);
      console.log('[Marketing] Automations is array:', Array.isArray(automations));
      
      // Ensure we always return an array
      const automationsArray = Array.isArray(automations) ? automations : [];
      console.log(`[Marketing] Successfully retrieved ${automationsArray.length} automations`);
      res.json(automationsArray);
    } catch (error) {
      console.error('[Marketing] Error fetching automations:', error);
      handleError(res, error);
    }
  });

  // Create new automation
  app.post('/api/marketing/automations', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Marketing] Creating new automation:', req.body);
      const validatedData = createAutomationSchema.parse(req.body);
      
      const automation = await storage.createMarketingAutomation(validatedData);
      
      console.log(`[Marketing] Successfully created automation with ID ${automation.id}`);
      res.status(201).json(automation);
    } catch (error) {
      console.error('[Marketing] Error creating automation:', error);
      handleError(res, error);
    }
  });

  // METRICS ENDPOINTS

  // Get marketing metrics
  app.get('/api/marketing/metrics', requireAuth, async (req: Request, res: Response) => {
    try {
      console.log('[Marketing] Generating marketing metrics');
      const metrics = await storage.getMarketingMetrics();
      console.log('[Marketing] Successfully generated metrics');
      res.json(metrics);
    } catch (error) {
      console.error('[Marketing] Error generating metrics:', error);
      handleError(res, error);
    }
  });

  console.log('[Marketing] Marketing routes registered successfully');
}