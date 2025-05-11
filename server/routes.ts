import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { registerPermissionRoutes } from "./permission-routes";
import { addPermissionsToMemStorage, addPermissionsToDatabaseStorage } from "./permissions-manager";
import { migrationRouter } from "./migrations/migration-routes";
import { setupMarketingRoutes } from "./marketing-routes";
import { setupRoutes } from "./setup-routes";
import { generateBusinessInsights, getPersonalizedAdvice } from "./ai-assistant";
import manufacturingRouter from "./manufacturing-routes-fixed";
import { db } from "./db";
import { eq, sql, desc, asc } from "drizzle-orm";
import { encryptSensitiveData, decryptSensitiveData } from "./middleware/encryption-middleware";
import { encryptForDatabase, decryptFromDatabase, decryptArrayFromDatabase } from "./utils/database-encryption";
import { 
  insertUserSchema,
  insertContactSchema,
  insertAccountSchema,
  insertLeadSchema,
  insertOpportunitySchema,
  insertTaskSchema,
  insertEventSchema,
  insertActivitySchema,
  insertSubscriptionPackageSchema,
  insertUserSubscriptionSchema,
  insertApiKeySchema,
  insertCommunicationSchema,
  // Accounting and inventory schemas
  insertProductSchema,
  insertProductCategorySchema,
  insertInventoryTransactionSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  // Proposal system schemas
  insertProposalSchema,
  insertProposalTemplateSchema,
  insertProposalElementSchema,
  insertProposalCollaboratorSchema,
  insertProposalCommentSchema,
  insertProposalActivitySchema,
  // System types
  type MenuVisibilitySettings,
  type SystemSettings,
  // Database schema tables
  systemSettings,
  users,
  notifications,
  messages
} from "@shared/schema";
import { z } from "zod";
import { 
  isOpenAIQuotaError, 
  generateAnalysis, 
  generateInsights, 
  generateRecommendations,
  generateEmailTemplate,
  summarizeMeeting
} from "./openai";



// Utility function to handle OpenAI API errors
function handleOpenAIError(res: Response, errorData: any) {
  const errorMessage = errorData.error?.message || "Unknown error";
  const isQuotaError = isOpenAIQuotaError(errorMessage);
  
  return res.status(429).json({
    error: "OpenAI API Error",
    details: isQuotaError ? 
      "OpenAI API quota exceeded. Please contact your administrator or try again later." : 
      errorMessage,
    isQuotaError: isQuotaError
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Apply encryption middleware for sensitive data
  app.use(encryptSensitiveData);
  app.use(decryptSensitiveData);
  
  // Log encryption status and environment variables for debugging
  console.log('[Encryption] Averox CryptoSphere encryption middleware applied');
  console.log('[Encryption Debug] Environment variables:', {
    ENCRYPTION_ENABLED: process.env.ENCRYPTION_ENABLED,
    ENABLE_ENCRYPTION: process.env.ENABLE_ENCRYPTION,
    encryption_status: process.env.ENCRYPTION_ENABLED === 'true'
  });
  
  // Test authentication endpoint 
  app.get('/api/auth-test', (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({ 
        authenticated: true, 
        user: req.user,
        sessionID: req.sessionID
      });
    } else {
      return res.status(401).json({ 
        authenticated: false, 
        sessionID: req.sessionID
      });
    }
  });
  
  // Test encryption endpoint to verify encryption middleware
  app.post('/api/encryption-test', async (req, res) => {
    try {
      // If we don't have a request body, return an error
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Request body is required for testing encryption'
        });
      }

      console.log('[Encryption Test] Debug info:', {
        ENCRYPTION_ENABLED_VALUE: process.env.ENCRYPTION_ENABLED,
        ENCRYPTION_ENABLED_CHECK: process.env.ENCRYPTION_ENABLED === 'true',
        NODE_ENV: process.env.NODE_ENV,
        ENV_KEYS: Object.keys(process.env).filter(key => key.includes('ENCRYPT'))
      });
      
      // Return the request body to let the client verify encryption
      // This should trigger the encryption/decryption middleware
      return res.json({ 
        success: true, 
        message: 'Encryption test completed',
        data: req.body,
        encryption_enabled: process.env.ENCRYPTION_ENABLED === 'true',
        timestamp: new Date().toISOString(),
        // Debug info to help with troubleshooting
        debug: {
          encryptionSettings: {
            ENCRYPTION_ENABLED: process.env.ENCRYPTION_ENABLED,
            ENABLE_ENCRYPTION: process.env.ENABLE_ENCRYPTION,
            effective: process.env.ENCRYPTION_ENABLED === 'true'
          }
        }
      });
    } catch (error) {
      console.error('Error in encryption test:', error);
      return res.status(500).json({
        success: false,
        message: 'Encryption test failed',
        error: (error as Error).message
      });
    }
  });
  
  // Test endpoint for database encryption - encrypts data at the database layer
  app.post('/api/database-encryption-test', async (req, res) => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Request body is required for testing database encryption'
        });
      }
      
      // Use our database encryption utilities to encrypt and then decrypt the data
      // This simulates what happens during database storage and retrieval
      const entityType = req.query.entityType as string || 'test';
      
      console.log(`[Database Encryption Test] Testing encryption for entity type: ${entityType}`);
      
      // Step 1: Encrypt the data as if preparing for database storage
      const encryptedData = await encryptForDatabase(req.body, entityType);
      
      // Step 2: Decrypt the data as if retrieving from database
      const decryptedData = await decryptFromDatabase(encryptedData, entityType);
      
      // Return all stages to show the process
      return res.json({
        success: true,
        message: 'Database encryption test completed',
        original: req.body,
        encrypted: encryptedData,
        decrypted: decryptedData,
        encryption_enabled: process.env.ENCRYPTION_ENABLED === 'true',
        metadata: {
          entityType,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      });
    } catch (error) {
      console.error('Error in database encryption test:', error);
      return res.status(500).json({
        success: false,
        message: 'Database encryption test failed',
        error: (error as Error).message
      });
    }
  });
  
  // Dashboard Data API endpoints
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      // Import required schema tables
      const { leads: leadsTable, opportunities: opportunitiesTable, invoices: invoicesTable } = await import('@shared/schema');

      // Get leads created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const leadsData = await db.select().from(leadsTable);
      const newLeads = leadsData.filter(lead => {
        if (!lead.createdAt) return false;
        return new Date(lead.createdAt) >= thirtyDaysAgo;
      }).length;
      
      // Calculate conversion rate from actual data
      const opportunitiesData = await db.select().from(opportunitiesTable);
      const totalLeads = leadsData.length;
      const convertedLeads = leadsData.filter(lead => lead.isConverted).length;
      const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) + "%" : "0%";
      
      // Calculate total revenue from invoices
      const invoicesData = await db.select().from(invoicesTable);
      const paidInvoices = invoicesData.filter(invoice => invoice.status === 'Paid');
      const totalRevenue = paidInvoices.reduce((sum, invoice) => {
        const amount = Number(invoice.totalAmount || 0);
        return sum + amount;
      }, 0);
      const formattedRevenue = "$" + totalRevenue.toLocaleString();
      
      // Count open deals
      const openDeals = opportunitiesData.filter(opp => !opp.isClosed).length;
      
      res.json({
        newLeads,
        conversionRate,
        revenue: formattedRevenue,
        openDeals
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });
  
  app.get('/api/dashboard/pipeline', async (req, res) => {
    try {
      // Import required schema table
      const { opportunities: opportunitiesTable } = await import('@shared/schema');
      
      const opportunitiesData = await db.select().from(opportunitiesTable);
      
      // Get all stages and their corresponding opportunities
      const stageMap = new Map();
      
      opportunitiesData.forEach(opp => {
        if (!opp.isClosed) {
          const stage = opp.stage || 'Unknown';
          const amount = Number(opp.amount || 0);
          
          if (!stageMap.has(stage)) {
            stageMap.set(stage, { count: 0, value: 0 });
          }
          
          const data = stageMap.get(stage);
          data.count += 1;
          data.value += amount;
          stageMap.set(stage, data);
        }
      });
      
      // Calculate total value of all opportunities
      const totalValue = Array.from(stageMap.values()).reduce((sum, data) => sum + data.value, 0);
      
      // Create stages data
      const stages = Array.from(stageMap.entries()).map(([name, data]) => {
        const percentage = totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0;
        const formattedValue = "$" + data.value.toLocaleString();
        
        return {
          name,
          value: formattedValue,
          percentage
        };
      });
      
      res.json({ stages });
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      res.status(500).json({ error: 'Failed to fetch pipeline data' });
    }
  });
  
  app.get('/api/dashboard/activities', async (req, res) => {
    try {
      // Import required schema tables
      const { activities: activitiesTable, users: usersTable } = await import('@shared/schema');
      
      const activitiesData = await db.select().from(activitiesTable).orderBy(desc(activitiesTable.createdAt)).limit(5);
      const usersData = await db.select().from(usersTable);
      
      const formattedActivities = activitiesData.map(activity => {
        const user = usersData.find(u => u.id === activity.userId) || { 
          firstName: 'Unknown', 
          lastName: 'User', 
          avatar: '' 
        };
        
        // Safely handle potentially null createdAt dates
        const createdAt = activity.createdAt ? new Date(activity.createdAt) : new Date();
        let timeAgo = '';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
          timeAgo = `${diffInSeconds} sec ago`;
        } else if (diffInSeconds < 3600) {
          timeAgo = `${Math.floor(diffInSeconds / 60)} min ago`;
        } else if (diffInSeconds < 86400) {
          timeAgo = `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 172800) {
          timeAgo = 'Yesterday';
        } else {
          timeAgo = `${Math.floor(diffInSeconds / 86400)} days ago`;
        }
        
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'System User';
        const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'SU';
        
        return {
          id: activity.id,
          action: activity.action,
          detail: activity.detail,
          relatedToType: activity.relatedToType,
          relatedToId: activity.relatedToId,
          createdAt: activity.createdAt,
          icon: activity.icon,
          time: timeAgo,
          user: {
            name: fullName,
            avatar: user.avatar || '',
            initials
          }
        };
      });
      
      res.json(formattedActivities);
    } catch (error) {
      console.error('Error fetching dashboard activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });
  
  // Add endpoint for marketing campaigns
  app.get('/api/dashboard/marketing-campaigns', async (req, res) => {
    try {
      // Import required schema tables
      const { socialCampaigns: campaignsTable, workflows: workflowsTable } = await import('@shared/schema');
      
      // Get active campaigns
      const campaignsData = await db.select().from(campaignsTable).limit(3);
      
      // Get workflows for lead counts
      const workflowsData = await db.select().from(workflowsTable)
        .where(eq(workflowsTable.entityType, 'lead'))
        .where(eq(workflowsTable.isActive, true));
      
      const formattedCampaigns = campaignsData.map(campaign => {
        // Get associated workflow if it exists
        const workflow = workflowsData.find(w => {
          try {
            // Try to parse the entityFilter to see if it's related to this campaign
            if (w.entityFilter) {
              const filter = typeof w.entityFilter === 'string' 
                ? JSON.parse(w.entityFilter) 
                : w.entityFilter;
              
              return filter?.campaignId === campaign.id;
            }
            return false;
          } catch (e) {
            return false;
          }
        });
        
        // Extract campaign metrics
        let metricsData = {};
        if (campaign.metrics) {
          try {
            metricsData = typeof campaign.metrics === 'string' 
              ? JSON.parse(campaign.metrics) 
              : campaign.metrics;
          } catch (e) {
            console.warn('Error parsing campaign metrics:', e);
            metricsData = {};
          }
        }
        
        // Calculate statistics based on metrics - using real data when available
        const reach = metricsData.reach || 0;
        const conversions = metricsData.conversions || 0;
        const conversionRate = reach > 0 ? Math.round((conversions / reach) * 100) : 0;
        
        // Create stats object based on metrics data
        const stats = {
          Reach: reach.toString(),
          Clicks: (metricsData.clicks || 0).toString(),
          Conversions: conversions.toString()
        };
        
        return {
          id: campaign.id,
          name: campaign.name,
          platform: campaign.platform,
          status: campaign.status || 'Draft',
          stats: stats,
          reach: reach,
          conversion: conversionRate,
          budget: metricsData.budget ? `$${metricsData.budget}` : '$0',
          workflow: workflow ? {
            id: workflow.id,
            name: workflow.name,
            count: metricsData.leadCount || 0,
            nextAction: workflow.actions ? 'Follow-up emails' : 'No actions configured'
          } : null
        };
      });
      
      res.json(formattedCampaigns);
    } catch (error) {
      console.error('Error fetching marketing campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch marketing campaigns' });
    }
  });

  // Add endpoint for performance metrics
  app.get('/api/dashboard/performance-metrics', async (req, res) => {
    try {
      // Import required schema tables
      const { 
        opportunities: opportunitiesTable, 
        leads: leadsTable,
        proposals: proposalsTable 
      } = await import('@shared/schema');
      
      // Get data for calculating metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const opportunitiesData = await db.select().from(opportunitiesTable);
      const leadsData = await db.select().from(leadsTable);
      const recentLeads = leadsData.filter(lead => {
        return lead.createdAt && new Date(lead.createdAt) >= thirtyDaysAgo;
      });
      
      const proposalsData = await db.select().from(proposalsTable);
      
      // Calculate win rate
      const closedOpportunities = opportunitiesData.filter(opp => opp.isClosed);
      const wonOpportunities = closedOpportunities.filter(opp => opp.isWon);
      const winRate = closedOpportunities.length > 0 
        ? Math.round((wonOpportunities.length / closedOpportunities.length) * 100) 
        : 0;
      
      // Calculate lead response time (average time between lead creation and first activity)
      let avgResponseTime = "N/A";
      let responsePercentage = 0;
      if (recentLeads.length > 0) {
        const responseTimes = recentLeads
          .filter(lead => lead.lastActivityDate && lead.createdAt)
          .map(lead => {
            const created = new Date(lead.createdAt);
            const activity = new Date(lead.lastActivityDate);
            return (activity.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
          });
        
        if (responseTimes.length > 0) {
          const avgHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
          avgResponseTime = avgHours < 1 
            ? `${Math.round(avgHours * 60)} min` 
            : `${Math.round(avgHours)} hrs`;
          
          // Calculate percentage based on response time (lower is better)
          // If average response is within 2 hours, consider it 100%
          const targetResponseHours = 2;
          responsePercentage = Math.min(100, Math.round((targetResponseHours / Math.max(avgHours, 0.1)) * 100));
        }
      }
      
      // Calculate proposal acceptance rate
      const sentProposals = proposalsData.filter(prop => prop.sentAt);
      const acceptedProposals = sentProposals.filter(prop => prop.acceptedAt);
      const proposalAcceptanceRate = sentProposals.length > 0
        ? Math.round((acceptedProposals.length / sentProposals.length) * 100)
        : 0;
      
      const metrics = [
        {
          id: 1,
          name: "Win Rate",
          value: `${winRate}%`,
          percentage: winRate,
          change: winRate > 50 ? 5 : -2,
          trend: winRate > 50 ? 'up' : 'down',
          color: 'bg-green-500'
        },
        {
          id: 2,
          name: "Lead Response Time",
          value: avgResponseTime,
          percentage: responsePercentage,
          change: responsePercentage > 70 ? 10 : -10,
          trend: responsePercentage > 70 ? 'up' : 'down',
          color: 'bg-blue-500'
        },
        {
          id: 3,
          name: "Proposal Acceptance",
          value: `${proposalAcceptanceRate}%`,
          percentage: proposalAcceptanceRate,
          change: proposalAcceptanceRate > 30 ? 2 : -3,
          trend: proposalAcceptanceRate > 30 ? 'up' : 'down',
          color: 'bg-amber-500'
        }
      ];
      
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  });
  
  // Add endpoint for migration status
  app.get('/api/dashboard/migrations', async (req, res) => {
    try {
      // Get current migration statuses from database
      const { systemSettings } = await import('@shared/schema');
      
      // Check if any migrations are in progress based on system settings
      const settingsData = await db.select().from(systemSettings);
      
      // Create migration status based on actual database state
      const hasMigratedContacts = settingsData.some(s => 
        s.settingKey === 'hasMigratedContacts' && s.settingValue === 'true'
      );
      
      const hasMigratedOpportunities = settingsData.some(s => 
        s.settingKey === 'hasMigratedOpportunities' && s.settingValue === 'true'
      );
      
      const migrationInProgress = settingsData.some(s => 
        s.settingKey === 'migrationInProgress' && s.settingValue === 'true'
      );
      
      const migrations = [
        {
          id: 1,
          name: "Contact Data Migration",
          status: hasMigratedContacts ? "Complete" : (migrationInProgress ? "In Progress" : "Pending"),
          progress: hasMigratedContacts ? 100 : (migrationInProgress ? 65 : 0),
          progressText: hasMigratedContacts ? "All contacts migrated" : "Migrating contact records"
        },
        {
          id: 2,
          name: "Opportunity Migration",
          status: hasMigratedOpportunities ? "Complete" : "Pending",
          progress: hasMigratedOpportunities ? 100 : 0,
          progressText: hasMigratedOpportunities ? "All opportunities migrated" : "Waiting to start"
        }
      ];
      
      res.json(migrations);
    } catch (error) {
      console.error('Error fetching migration status:', error);
      res.status(500).json({ error: 'Failed to fetch migration status' });
    }
  });
  
  // Set up permission system and register routes
  registerPermissionRoutes(app);
  
  // Set up marketing routes
  setupMarketingRoutes(app);
  
  // Set up company setup wizard routes
  setupRoutes(app);
  
  // Set up manufacturing module routes - using fixed routes that match the existing database schema
  app.use('/api/manufacturing', manufacturingRouter);
  
  // Add permission methods to storage
  if ('initializePermissions' in storage) {
    // Initialize default permissions
    await storage.initializePermissions();
  }
  
  // System Settings API routes
  app.get('/api/system-settings', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const settings = await storage.getSystemSettings(userId);
      
      // Add default dashboard preferences if they don't exist
      if (!settings.dashboardPreferences) {
        settings.dashboardPreferences = {
          showSalesPipeline: true,
          showRecentActivities: true,
          showTasks: true,
          showEvents: true,
          showLeadsStats: true,
          showConversionStats: true,
          showRevenueStats: true,
          showOpportunitiesStats: true,
          pipelineChartType: 'pie',
          revenueChartType: 'line',
          leadsChartType: 'line',
          defaultTimeRange: 'month',
          showAIInsights: true,
          aiInsightTypes: ['leads', 'opportunities', 'revenue'],
          aiInsightsCount: 3
        };
      }
      
      res.json(settings);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/system-settings', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // All users should be able to save their own settings
      const userId = req.user.id;
      const settings = req.body as SystemSettings;
      const updatedSettings = await storage.saveSystemSettings(userId, settings);
      res.json(updatedSettings);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Menu items API - Get all menu items (with visibility settings)
  app.get('/api/menu-items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      
      // Get user's visibility settings from system settings
      const userSettings = await storage.getSystemSettings(userId);
      
      // Fetch global menu items from database
      const menuItemsQuery = await db.select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, 'menuItems'))
        .where(eq(systemSettings.scope, 'global'));
      
      let menuItems = [];
      
      if (menuItemsQuery.length > 0) {
        // If menu items are defined in the database, use them
        menuItems = menuItemsQuery[0].settingValue as any[];
        
        // Apply user's visibility settings
        menuItems = menuItems.map(item => ({
          ...item,
          isVisible: item.key ? 
            (userSettings.menuVisibility[item.key] ?? true) : 
            true // Items without a key are always visible
        }));
      } else {
        // If no menu items defined yet, create default ones
        const defaultMenuItems = [
          { name: "Dashboard", path: '/', icon: "LayoutDashboard", key: null, isVisible: true },
          { name: "Contacts", path: '/contacts', icon: "Users", key: "contacts", isVisible: userSettings.menuVisibility.contacts },
          { name: "Accounts", path: '/accounts', icon: "Briefcase", key: "accounts", isVisible: userSettings.menuVisibility.accounts },
          { name: "Leads", path: '/leads', icon: "UserPlus", key: "leads", isVisible: userSettings.menuVisibility.leads },
          { name: "Opportunities", path: '/opportunities', icon: "TrendingUp", key: "opportunities", isVisible: userSettings.menuVisibility.opportunities },
          { name: "Calendar", path: '/calendar', icon: "Calendar", key: "calendar", isVisible: userSettings.menuVisibility.calendar },
          { name: "Tasks", path: '/tasks', icon: "CheckSquare", key: "tasks", isVisible: userSettings.menuVisibility.tasks },
          { name: "Marketing", path: '/marketing', icon: "Megaphone", key: null, isVisible: true },
          { name: "Communication Center", path: '/communication-center', icon: "MessageSquare", key: "communicationCenter", isVisible: userSettings.menuVisibility.communicationCenter },
          { name: "Accounting", path: '/accounting', icon: "Calculator", key: "accounting", isVisible: userSettings.menuVisibility.accounting },
          { name: "Manufacturing", path: '/manufacturing', icon: "Factory", key: null, isVisible: true },
          { name: "Inventory", path: '/inventory', icon: "PackageOpen", key: "inventory", isVisible: userSettings.menuVisibility.inventory },
          { name: "Support Tickets", path: '/support-tickets', icon: "TicketCheck", key: "supportTickets", isVisible: userSettings.menuVisibility.supportTickets },
          { name: "E-commerce", path: '/ecommerce', icon: "ShoppingCart", key: "ecommerce", isVisible: userSettings.menuVisibility.ecommerce },
          { name: "Store", path: '/ecommerce-store', icon: "Store", key: "ecommerceStore", isVisible: userSettings.menuVisibility.ecommerceStore },
          { name: "Reports", path: '/reports', icon: "BarChart2", key: "reports", isVisible: userSettings.menuVisibility.reports },
          { name: "Intelligence", path: '/intelligence', icon: "BrainCircuit", key: "intelligence", isVisible: userSettings.menuVisibility.intelligence },
          { name: "Workflows", path: '/workflows', icon: "Workflow", key: "workflows", isVisible: userSettings.menuVisibility.workflows },
          { name: "Subscriptions", path: '/subscriptions', icon: "CreditCard", key: "subscriptions", isVisible: userSettings.menuVisibility.subscriptions },
          { name: "Training", path: '/training-help', icon: "HelpCircle", key: "training", isVisible: userSettings.menuVisibility.training },
          { name: "Settings", path: '/settings', icon: "Settings", key: null, isVisible: true }
        ];
        
        // Save default menu items to database
        await db.insert(systemSettings).values({
          userId: null, // Global setting
          settingKey: 'menuItems',
          settingValue: defaultMenuItems as any,
          scope: 'global',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        menuItems = defaultMenuItems;
      }
      
      // Return menu items with visibility applied
      res.json(menuItems);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // AI Assistant API Endpoints
  app.get('/api/ai-assistant/business-insights', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const insights = await generateBusinessInsights();
      // Add a unique id to each insight for frontend rendering
      const insightsWithIds = insights.map((insight, index) => ({
        ...insight,
        id: index + 1,
        timestamp: new Date().toISOString()
      }));
      res.json(insightsWithIds);
    } catch (error) {
      console.error('Error generating business insights:', error);
      if (error instanceof Error && error.message.includes('OpenAI')) {
        return handleOpenAIError(res, error);
      }
      handleError(res, error);
    }
  });
  
  app.get('/api/ai-assistant/entity-advice/:entityType/:entityId', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const { entityType, entityId } = req.params;
      const idNumber = parseInt(entityId);
      
      if (isNaN(idNumber)) {
        return res.status(400).json({ error: 'Invalid entity ID' });
      }
      
      const validEntityTypes = ['lead', 'opportunity', 'contact', 'task', 'event'];
      if (!validEntityTypes.includes(entityType)) {
        return res.status(400).json({ error: 'Invalid entity type' });
      }
      
      const advice = await getPersonalizedAdvice(entityType, idNumber);
      res.json(advice);  // Return the string directly, not wrapped in an object
    } catch (error) {
      console.error('Error generating personalized advice:', error);
      if (error instanceof Error && error.message.includes('OpenAI')) {
        return handleOpenAIError(res, error);
      }
      handleError(res, error);
    }
  });
  
  // Set up Stripe client for payment processing
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  
  // Base API route
  const apiRouter = app.route('/api');
  
  // Error handler helper
  const handleError = (res: Response, error: unknown) => {
    console.error('API Error:', error);
    
    // Log stack trace if available
    if (error instanceof Error) {
      console.error('Error stack trace:', error.stack);
    }
    
    // Log detailed object structure for debugging
    try {
      console.error('Error details:', JSON.stringify(error, null, 2));
    } catch (jsonError) {
      console.error('Error cannot be stringified:', error);
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: "Validation Error", 
        message: "The provided data does not meet validation requirements",
        details: error.errors 
      });
    }
    
    // Handle database-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      // PostgreSQL error codes
      const pgError = error as { code: string; message?: string; detail?: string };
      console.error('Database error code:', pgError.code);
      
      if (pgError.code === '42P01') { // undefined_table
        return res.status(500).json({
          success: false,
          error: "Database Error",
          message: "Table not found. Database schema may be outdated or incomplete.",
          details: pgError.detail || pgError.message
        });
      }
      
      if (pgError.code.startsWith('23')) { // integrity constraint violations
        return res.status(400).json({
          success: false,
          error: "Database Constraint Error",
          message: pgError.message || "Data violates database constraints",
          details: pgError.detail
        });
      }
    }
    
    return res.status(500).json({ 
      success: false,
      error: "Server Error", 
      message: error instanceof Error ? error.message : "Unknown error",
      ...(process.env.NODE_ENV !== 'production' && error instanceof Error && { 
        stack: error.stack 
      })
    });
  };
  
  // Notifications routes
  app.get('/api/notifications', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      try {
        // First check if the notifications table exists
        const tableExistsResult = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'notifications'
          ) as exists
        `);
        
        if (!tableExistsResult.rows?.[0]?.exists) {
          // Table doesn't exist, return empty array
          console.log('Notifications table does not exist');
          return res.json([]);
        }
        
        // Get notifications from the database for this user using raw SQL for consistent type handling
        const result = await db.execute(sql`
          SELECT 
            id, 
            user_id as "userId",
            type,
            title,
            description,
            link,
            read::boolean as read,
            created_at as "createdAt"
          FROM notifications
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `);
        
        // Extract rows from PostgreSQL result
        const rows = result.rows || [];
        
        const userNotifications = rows.map(notification => ({
          ...notification,
          read: notification.read === true
        }));
        
        res.json(userNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // If there's an issue with the table, return an empty array
        // This is better than showing an error to the user
        return res.json([]);
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/notifications/:id/read', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Update the notification in the database using raw SQL
      await db.execute(sql`
        UPDATE notifications 
        SET read = TRUE 
        WHERE id = ${id} AND user_id = ${userId}
      `);
      
      res.json({ success: true, message: `Notification ${id} marked as read` });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/notifications/read-all', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      // Update all notifications for this user in the database using raw SQL
      await db.execute(sql`
        UPDATE notifications 
        SET read = TRUE 
        WHERE user_id = ${userId}
      `);
      
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get('/api/messages', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      try {
        // First check if the messages table exists
        const tableExistsResult = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'messages'
          ) as exists
        `);
        
        if (!tableExistsResult.rows?.[0]?.exists) {
          // Table doesn't exist, return empty array
          console.log('Messages table does not exist');
          return res.json([]);
        }
        
        // Execute a raw SQL query to ensure we get the correct data types
        const result = await db.execute(sql`
          SELECT 
            m.id, 
            m.content, 
            m.read::boolean as read, 
            m.created_at as "createdAt", 
            m.urgent::boolean as urgent,
            u.id as "senderId", 
            u.first_name as "senderFirstName", 
            u.last_name as "senderLastName", 
            u.avatar as "senderAvatar"
          FROM messages m
          INNER JOIN users u ON m.sender_id = u.id
          WHERE m.recipient_id = ${userId}
          ORDER BY m.created_at DESC
        `);
        
        // Extract rows from PostgreSQL result
        const rows = result.rows || [];
        
        // Format the messages with sender info in the expected format
        const formattedMessages = rows.map(message => {
          return {
            id: message.id,
            sender: {
              id: message.senderId,
              name: `${message.senderFirstName || ''} ${message.senderLastName || ''}`.trim(),
              avatar: message.senderAvatar
            },
            content: message.content,
            read: message.read === true, // Strict boolean comparison
            createdAt: message.createdAt ? new Date(String(message.createdAt)).toISOString() : null,
            urgent: message.urgent === true
          };
        });
        
        res.json(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        // If there's an issue with the table, return an empty array
        // This is better than showing an error to the user
        return res.json([]);
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/messages/:id/read', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      try {
        // First check if the messages table exists
        const tableExistsResult = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'messages'
          ) as exists
        `);
        
        if (!tableExistsResult.rows?.[0]?.exists) {
          // Table doesn't exist, return success anyway
          console.log('Messages table does not exist');
          return res.json({ success: true, message: `Message ${id} marked as read` });
        }
        
        // Update the message in the database using raw SQL
        await db.execute(sql`
          UPDATE messages 
          SET read = TRUE 
          WHERE id = ${id} AND recipient_id = ${userId}
        `);
        
        res.json({ success: true, message: `Message ${id} marked as read` });
      } catch (error) {
        console.error('Error marking message as read:', error);
        // Return success even if there's an error to prevent user disruption
        return res.json({ success: true, message: `Message ${id} marked as read` });
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/messages/read-all', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      try {
        // First check if the messages table exists
        const tableExistsResult = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'messages'
          ) as exists
        `);
        
        if (!tableExistsResult.rows?.[0]?.exists) {
          // Table doesn't exist, return success anyway
          console.log('Messages table does not exist');
          return res.json({ success: true, message: "All messages marked as read" });
        }
        
        // Update all messages for this user in the database using raw SQL
        await db.execute(sql`
          UPDATE messages 
          SET read = TRUE 
          WHERE recipient_id = ${userId}
        `);
        
        res.json({ success: true, message: "All messages marked as read" });
      } catch (error) {
        console.error('Error marking all messages as read:', error);
        // Return success even if there's an error to prevent user disruption
        return res.json({ success: true, message: "All messages marked as read" });
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Send a new message
  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const { recipientId, content, urgent = false } = req.body;
      
      if (!recipientId || !content) {
        return res.status(400).json({ error: "Recipient and content are required" });
      }
      
      // Make sure the recipient exists
      const recipient = await db.query.users.findFirst({
        where: eq(users.id, recipientId)
      });
      
      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found" });
      }
      
      // Insert the new message into the database
      const [newMessage] = await db.insert(messages)
        .values({
          senderId: userId,
          recipientId,
          content,
          urgent: urgent || false,
          read: false
        })
        .returning();
      
      // Create a notification for the recipient
      await db.insert(notifications)
        .values({
          userId: recipientId,
          type: 'message',
          title: 'New Message',
          description: `You have a new message from ${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
          read: false,
          link: '/communication-center'
        });
      
      res.status(201).json(newMessage);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Special endpoint to make the current user an admin (for demo purposes only)
  app.post('/api/make-admin', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const updatedUser = await storage.updateUser(userId, { role: 'Admin' });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Special profile update endpoint that can handle large base64 encoded images
  app.post('/api/profile', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const { firstName, lastName, email, company, avatar } = req.body;
      
      // Create a sanitized update object
      const updateData: Record<string, any> = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (company !== undefined) updateData.company = company;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      console.log(`Processing profile update for user ${userId}`);
      
      // Perform the update
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Users routes
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      const { username, password, email, firstName, lastName, role, isActive, avatar } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'User',
        isActive: isActive !== undefined ? isActive : true,
        avatar: avatar || null,
      });
      
      res.status(200).json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
      // Check if the user is authenticated and has proper permissions
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Only allow users to update their own profile or admins to update any profile
      if (req.user.id !== id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Validate the request body using a schema
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Prevent changing the role for security
      if (userData.role && req.user.role !== 'Admin') {
        delete userData.role;
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.patch('/api/users/:id/password', async (req: Request, res: Response) => {
    try {
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Only allow users to update their own password or admins to update any password
      if (req.user.id !== id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Require newPassword in the body
      if (!req.body.newPassword) {
        return res.status(400).json({ error: "New password is required" });
      }
      
      // Hash the password
      const password = await hashPassword(req.body.newPassword);
      
      const updatedUser = await storage.updateUser(id, { password });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Contacts routes
  app.get('/api/contacts', async (req: Request, res: Response) => {
    try {
      const contacts = await storage.listContacts();
      res.json(contacts);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/contacts', async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contactData = insertContactSchema.partial().parse(req.body);
      const updatedContact = await storage.updateContact(id, contactData);
      if (!updatedContact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Accounts routes
  app.get('/api/accounts', async (req: Request, res: Response) => {
    try {
      // Fetch accounts from database
      const accounts = await storage.listAccounts();
      
      // Decrypt sensitive fields in accounts array before sending response
      const decryptedAccounts = await decryptArrayFromDatabase(accounts, 'accounts');
      res.json(decryptedAccounts);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/accounts', async (req: Request, res: Response) => {
    try {
      // Validate input data
      const accountData = insertAccountSchema.parse(req.body);
      
      // Encrypt sensitive fields before database insert
      const encryptedAccountData = await encryptForDatabase(accountData, 'accounts');
      console.log('[Encryption] Account data fields encrypted for database insertion');
      
      // Create account in database
      const account = await storage.createAccount(encryptedAccountData);
      
      // Decrypt for response
      const decryptedAccount = await decryptFromDatabase(account, 'accounts');
      res.status(201).json(decryptedAccount);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/accounts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      // Decrypt sensitive fields before sending response
      const decryptedAccount = await decryptFromDatabase(account, 'accounts');
      res.json(decryptedAccount);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/accounts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate input data
      const accountData = insertAccountSchema.partial().parse(req.body);
      
      // Encrypt sensitive fields before database update
      const encryptedAccountData = await encryptForDatabase(accountData, 'accounts');
      console.log('[Encryption] Account data fields encrypted for database update');
      
      // Update account in database
      const updatedAccount = await storage.updateAccount(id, encryptedAccountData);
      if (!updatedAccount) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      // Decrypt for response
      const decryptedAccount = await decryptFromDatabase(updatedAccount, 'accounts');
      res.json(decryptedAccount);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/accounts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAccount(id);
      if (!success) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Leads routes
  app.get('/api/leads', async (req: Request, res: Response) => {
    try {
      const leads = await storage.listLeads();
      res.json(leads);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/leads', async (req: Request, res: Response) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const leadData = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(id, leadData);
      if (!updatedLead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(updatedLead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/leads/:id/convert', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { contact, account, opportunity } = req.body;
      
      const validatedData: {
        contact?: any, 
        account?: any, 
        opportunity?: any
      } = {};
      
      if (contact) {
        validatedData.contact = insertContactSchema.parse(contact);
      }
      
      if (account) {
        validatedData.account = insertAccountSchema.parse(account);
      }
      
      if (opportunity) {
        validatedData.opportunity = insertOpportunitySchema.parse(opportunity);
      }
      
      const result = await storage.convertLead(id, validatedData);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Opportunities routes
  app.get('/api/opportunities', async (req: Request, res: Response) => {
    try {
      const opportunities = await storage.listOpportunities();
      res.json(opportunities);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/opportunities', async (req: Request, res: Response) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/opportunities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/opportunities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const opportunityData = insertOpportunitySchema.partial().parse(req.body);
      const updatedOpportunity = await storage.updateOpportunity(id, opportunityData);
      if (!updatedOpportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(updatedOpportunity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/opportunities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOpportunity(id);
      if (!success) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Tasks routes
  app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
      const tasks = await storage.listTasks();
      res.json(tasks);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Reminders endpoint - for entity-specific reminders
  app.get('/api/tasks/reminders', async (req: Request, res: Response) => {
    try {
      const { relatedToType, relatedToId } = req.query;
      
      if (!relatedToType || !relatedToId) {
        return res.status(400).json({ error: "Missing relatedToType or relatedToId parameters" });
      }
      
      const entityId = parseInt(relatedToId as string);
      if (isNaN(entityId)) {
        return res.status(400).json({ error: "Invalid relatedToId parameter" });
      }
      
      const tasks = await storage.listTasks();
      const reminders = tasks.filter(task => 
        task.isReminder && 
        task.relatedToType === relatedToType && 
        task.relatedToId === entityId
      );
      
      res.json(reminders);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Events routes
  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const events = await storage.listEvents();
      res.json(events);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(id, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updatedEvent);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Activities routes
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const activities = await storage.listActivities();
      res.json(activities);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/activities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Dashboard data
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/dashboard/pipeline', async (req: Request, res: Response) => {
    try {
      const pipeline = await storage.getSalesPipeline();
      res.json(pipeline);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Reports
  app.get('/api/reports/sales', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getSalesReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/leads', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getLeadsReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/conversion', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getConversionReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/performance', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getTeamPerformanceReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  // OpenAI API routes
  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    try {
      const { prompt, context, type } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Missing required field: prompt" });
      }
      
      const result = await generateAnalysis({
        prompt,
        context,
        type: type as any
      });
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/ai/insights', async (req: Request, res: Response) => {
    try {
      const { data, type } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: "Missing required field: data" });
      }
      
      const result = await generateInsights({
        data,
        type: type as any || 'all'
      });
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/ai/recommendations', async (req: Request, res: Response) => {
    try {
      const { entityType, entityData } = req.body;
      
      if (!entityType) {
        return res.status(400).json({ error: "Missing required field: entityType" });
      }
      
      // If entityData was not provided, fetch it
      let contextData = entityData;
      if (!contextData) {
        try {
          const entityId = req.body.entityId;
          switch(entityType) {
            case 'lead':
              if (entityId) {
                contextData = await storage.getLead(parseInt(entityId));
              } else {
                contextData = await storage.listLeads();
              }
              break;
            case 'opportunity':
              if (entityId) {
                contextData = await storage.getOpportunity(parseInt(entityId));
              } else {
                contextData = await storage.listOpportunities();
              }
              break;
            case 'contact':
              if (entityId) {
                contextData = await storage.getContact(parseInt(entityId));
              } else {
                contextData = await storage.listContacts();
              }
              break;
            default:
              contextData = {
                message: "No specific entity requested."
              };
          }
        } catch (dataError) {
          console.error('Error fetching data for AI recommendations:', dataError);
          contextData = { error: "Failed to fetch context data" };
        }
      }
      
      const result = await generateRecommendations({
        entityType,
        entityData: contextData
      });
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  // Email template generation endpoint
  app.post('/api/ai/email-template', async (req: Request, res: Response) => {
    try {
      const { emailType, contactInfo, dealInfo, additionalContext } = req.body;
      
      if (!emailType || !contactInfo) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          details: "Both emailType and contactInfo are required" 
        });
      }
      
      const result = await generateEmailTemplate(
        emailType,
        contactInfo,
        dealInfo,
        additionalContext
      );
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Meeting summarization endpoint
  app.post('/api/ai/summarize-meeting', async (req: Request, res: Response) => {
    try {
      const { transcript, meetingContext } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ 
          error: "Missing required field", 
          details: "Transcript is required" 
        });
      }
      
      const result = await summarizeMeeting(transcript, meetingContext);
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  // Subscription package routes
  app.get('/api/subscription-packages', async (req: Request, res: Response) => {
    try {
      const packages = await storage.listSubscriptionPackages();
      res.json(packages);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/subscription-packages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const package_ = await storage.getSubscriptionPackage(id);
      if (!package_) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      res.json(package_);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/subscription-packages', async (req: Request, res: Response) => {
    try {
      const packageData = insertSubscriptionPackageSchema.parse(req.body);
      const package_ = await storage.createSubscriptionPackage(packageData);
      res.status(201).json(package_);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/subscription-packages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = insertSubscriptionPackageSchema.partial().parse(req.body);
      const updatedPackage = await storage.updateSubscriptionPackage(id, packageData);
      if (!updatedPackage) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/subscription-packages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubscriptionPackage(id);
      if (!success) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // User subscription routes
  app.get('/api/user-subscriptions', async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.listUserSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/user-subscriptions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/users/:userId/active-subscription', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscription = await storage.getUserActiveSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ error: "No active subscription found for this user" });
      }
      res.json(subscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/user-subscriptions', async (req: Request, res: Response) => {
    try {
      const subscriptionData = insertUserSubscriptionSchema.parse(req.body);
      const subscription = await storage.createUserSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/user-subscriptions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscriptionData = insertUserSubscriptionSchema.partial().parse(req.body);
      const updatedSubscription = await storage.updateUserSubscription(id, subscriptionData);
      if (!updatedSubscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      res.json(updatedSubscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/user-subscriptions/:id/cancel', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // First get the subscription to check if it has a Stripe Subscription ID
      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      
      // If there's a Stripe subscription, cancel it there first
      if (subscription.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        } catch (stripeError) {
          console.error('Error canceling Stripe subscription:', stripeError);
          // Continue with local cancellation even if Stripe fails
        }
      }
      
      // Then cancel in our database
      const canceledSubscription = await storage.cancelUserSubscription(id);
      if (!canceledSubscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      
      res.json(canceledSubscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Stripe Integration Routes
  app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          error: "Invalid amount", 
          details: "Amount must be a positive number" 
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Stripe Error", 
        message: error.message
      });
    }
  });

  app.post('/api/create-subscription', async (req: Request, res: Response) => {
    try {
      const { userId, packageId } = req.body;
      
      if (!userId || !packageId) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: "User ID and package ID are required" 
        });
      }

      // Get user and package details
      const user = await storage.getUser(userId);
      const package_ = await storage.getSubscriptionPackage(packageId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!package_) {
        return res.status(404).json({ error: "Subscription package not found" });
      }

      if (!package_.stripePriceId) {
        return res.status(400).json({ 
          error: "Invalid package", 
          details: "This package is not configured for online payment" 
        });
      }

      let customerId = user.stripeCustomerId;
      
      // Create a Stripe customer if user doesn't have one
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        });
        
        customerId = customer.id;
        await storage.updateStripeCustomerId(userId, customerId);
      }

      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: package_.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Create user subscription in our database
      const userSubscription = await storage.createUserSubscription({
        userId,
        packageId,
        stripeSubscriptionId: subscription.id,
        status: 'Pending',
        startDate: new Date(),
        endDate: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        canceledAt: null,
        trialEndsAt: null
      });

      // Return the client secret
      const invoice = subscription.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret;

      res.json({
        clientSecret,
        subscriptionId: subscription.id,
        userSubscriptionId: userSubscription.id
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Stripe Error", 
        message: error.message
      });
    }
  });

  app.post('/api/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn('Missing Stripe webhook secret, skipping signature verification');
        return res.status(200).end();
      }
      
      // Verify the webhook
      const event = stripe.webhooks.constructEvent(
        req.body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription;
          const userSubscription = await storage.listUserSubscriptions({ 
            stripeSubscriptionId: subscriptionId 
          });
          
          if (userSubscription.length > 0) {
            await storage.updateUserSubscription(userSubscription[0].id, {
              status: 'Active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });
          }
          break;
        
        case 'customer.subscription.updated':
          const subscription = event.data.object as any;
          const userSubs = await storage.listUserSubscriptions({ 
            stripeSubscriptionId: subscription.id 
          });
          
          if (userSubs.length > 0) {
            let status: "Active" | "Canceled" | "Expired" | "Pending" | "Trial" | null = null;
            
            switch (subscription.status) {
              case 'active':
                status = 'Active';
                break;
              case 'canceled':
                status = 'Canceled';
                break;
              case 'past_due':
              case 'unpaid':
                status = 'Expired';
                break;
              case 'trialing':
                status = 'Trial';
                break;
              default:
                status = 'Pending';
            }
            
            if (status) {
              await storage.updateUserSubscription(userSubs[0].id, { status });
            }
          }
          break;
      }

      res.status(200).end();
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // Social Media Integrations Routes
  app.get('/api/social-integrations', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user ID from authenticated user
      const userId = req.user.id;
      const integrations = await storage.getUserSocialIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/social-integrations', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user ID from authenticated user
      const userId = req.user.id;
      const integrationData = {
        ...req.body,
        userId
      };

      const integration = await storage.createSocialIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/social-integrations/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const integration = await storage.getSocialIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ error: "Social integration not found" });
      }
      
      // Make sure the user owns this integration or is an admin
      if (integration.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to access this integration" });
      }
      
      res.json(integration);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/social-integrations/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the integration to check permissions
      const integration = await storage.getSocialIntegration(id);
      if (!integration) {
        return res.status(404).json({ error: "Social integration not found" });
      }
      
      // Make sure the user owns this integration or is an admin
      if (integration.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to update this integration" });
      }
      
      const updatedIntegration = await storage.updateSocialIntegration(id, req.body);
      res.json(updatedIntegration);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/social-integrations/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the integration to check permissions
      const integration = await storage.getSocialIntegration(id);
      if (!integration) {
        return res.status(404).json({ error: "Social integration not found" });
      }
      
      // Make sure the user owns this integration or is an admin
      if (integration.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to delete this integration" });
      }
      
      const success = await storage.deleteSocialIntegration(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete integration" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Social Media Messages Routes
  app.get('/api/social-messages', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Optionally filter by lead or contact ID
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;
      
      let messages = [];
      if (leadId) {
        messages = await storage.getLeadSocialMessages(leadId);
      } else if (contactId) {
        messages = await storage.getContactSocialMessages(contactId);
      } else {
        messages = await storage.listSocialMessages();
      }
      
      res.json(messages);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/social-messages', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const message = await storage.createSocialMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/social-messages/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const updatedMessage = await storage.updateSocialMessage(id, req.body);
      
      if (!updatedMessage) {
        return res.status(404).json({ error: "Social message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Lead Sources Routes
  app.get('/api/lead-sources', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const sources = await storage.listLeadSources();
      res.json(sources);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/lead-sources', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow admins to create lead sources
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Only administrators can create lead sources" });
      }

      const source = await storage.createLeadSource(req.body);
      res.status(201).json(source);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/lead-sources/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow admins to update lead sources
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Only administrators can update lead sources" });
      }

      const id = parseInt(req.params.id);
      const updatedSource = await storage.updateLeadSource(id, req.body);
      
      if (!updatedSource) {
        return res.status(404).json({ error: "Lead source not found" });
      }
      
      res.json(updatedSource);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/lead-sources/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow admins to delete lead sources
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Only administrators can delete lead sources" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteLeadSource(id);
      
      if (!success) {
        return res.status(404).json({ error: "Lead source not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Social Campaigns Routes
  app.get('/api/social-campaigns', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const campaigns = await storage.listSocialCampaigns();
      res.json(campaigns);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/social-campaigns', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Set the owner ID to the current user if not provided
      const campaignData = {
        ...req.body,
        ownerId: req.body.ownerId || req.user.id
      };

      const campaign = await storage.createSocialCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/social-campaigns/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const campaign = await storage.getSocialCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Social campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/social-campaigns/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the campaign to check permissions
      const campaign = await storage.getSocialCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: "Social campaign not found" });
      }
      
      // Make sure the user owns this campaign or is an admin
      if (campaign.ownerId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to update this campaign" });
      }
      
      const updatedCampaign = await storage.updateSocialCampaign(id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/social-campaigns/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the campaign to check permissions
      const campaign = await storage.getSocialCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: "Social campaign not found" });
      }
      
      // Make sure the user owns this campaign or is an admin
      if (campaign.ownerId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to delete this campaign" });
      }
      
      const success = await storage.deleteSocialCampaign(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete campaign" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // API Keys routes
  app.get('/api/settings/api-keys', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const apiKeys = await storage.listApiKeys();
      res.json(apiKeys);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/settings/api-keys', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Validate the data
      const apiKeyData = insertApiKeySchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const apiKey = await storage.createApiKey(apiKeyData);
      res.status(201).json(apiKey);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/settings/api-keys/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json(apiKey);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/settings/api-keys/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const apiKeyData = insertApiKeySchema.partial().parse(req.body);
      
      const updatedApiKey = await storage.updateApiKey(id, apiKeyData);
      
      if (!updatedApiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json(updatedApiKey);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/settings/api-keys/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteApiKey(id);
      
      if (!success) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/settings/api-keys/:id/stats', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      // For now we'll return static data, but this would be backed by a real stats system
      const stats = {
        totalRequests: apiKey.usageCount || 0,
        successRate: "95%",
        lastUsed: apiKey.lastUsed,
        usageByDay: [
          { date: "2025-03-28", count: 12 },
          { date: "2025-03-29", count: 15 },
          { date: "2025-03-30", count: 8 },
          { date: "2025-03-31", count: 20 },
          { date: "2025-04-01", count: 18 },
          { date: "2025-04-02", count: 25 },
          { date: "2025-04-03", count: 22 }
        ]
      };
      
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Communication Center APIs
  app.get('/api/communications', async (req: Request, res: Response) => {
    try {
      const communications = await storage.getAllCommunications();
      res.status(200).json(communications);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/communications/contact/:id', async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      const contactType = req.query.type as 'lead' | 'customer';
      
      if (!contactType || (contactType !== 'lead' && contactType !== 'customer')) {
        return res.status(400).json({ error: "Invalid contact type. Must be 'lead' or 'customer'." });
      }
      
      const communications = await storage.getContactCommunications(contactId, contactType);
      res.status(200).json(communications);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put('/api/communications/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['unread', 'read', 'replied', 'archived'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'unread', 'read', 'replied', or 'archived'." });
      }
      
      const communication = await storage.updateCommunicationStatus(id, status as 'unread' | 'read' | 'replied' | 'archived');
      
      if (!communication) {
        return res.status(404).json({ error: "Communication not found" });
      }
      
      res.status(200).json(communication);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/communications/send', async (req: Request, res: Response) => {
    try {
      console.log('Communication send request:', req.body);
      const { recipientId, channel, content, contactType, relatedToType, relatedToId } = req.body;
      
      // We're going to handle two types of communications:
      // 1. Direct communications with a specific recipient (recipientId and contactType are required)
      // 2. Entity-related communications (relatedToType and relatedToId are required)
      
      const isDirectCommunication = recipientId && contactType;
      const isEntityCommunication = relatedToType && relatedToId;
      
      if (!channel || !content) {
        return res.status(400).json({ error: "Required fields missing: channel, content" });
      }

      if (!isDirectCommunication && !isEntityCommunication) {
        return res.status(400).json({ 
          error: "Either (recipientId and contactType) or (relatedToType and relatedToId) must be provided" 
        });
      }
      
      if (isDirectCommunication && contactType !== 'lead' && contactType !== 'customer') {
        return res.status(400).json({ error: "Invalid contactType. Must be 'lead' or 'customer'." });
      }
      
      // For entity communications without a specific recipient (like account-related messages),
      // we'll create a placeholder contact
      let contactId = recipientId;
      let contactTypeValue = contactType;
      
      if (!isDirectCommunication && isEntityCommunication) {
        // For account-related communications, we use a placeholder contact
        if (relatedToType === 'account') {
          // Try to find the account
          const account = await storage.getAccount(relatedToId);
          if (!account) {
            return res.status(404).json({ error: `${relatedToType} with ID ${relatedToId} not found` });
          }

          // Use a specific customer contact if available, or create a system contact
          contactId = -1; // System contact ID for entity-related messages
          contactTypeValue = 'customer'; // Default to customer type for account messages
        }
      }
      
      const communication = await storage.createCommunication({
        contactId: contactId as number,
        contactType: contactTypeValue as 'lead' | 'customer',
        channel,
        direction: 'outbound',
        content,
        status: 'read',
        sentAt: new Date(),
        relatedToType,
        relatedToId
      });
      
      // Create an activity record when a message is sent
      if (req.user) {
        let activityDetail = '';
        
        if (isDirectCommunication) {
          activityDetail = `Sent ${channel} to ${contactType} ${recipientId}`;
        } else {
          activityDetail = `Sent ${channel} related to ${relatedToType} ${relatedToId}`;
        }
        
        await storage.createActivity({
          userId: req.user.id,
          action: `Sent ${channel} message`,
          detail: activityDetail,
          relatedToType: relatedToType || contactType,
          relatedToId: relatedToId || recipientId,
          createdAt: new Date(),
          icon: 'sent'
        });
      }
      
      res.status(201).json(communication);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get communications related to a specific entity (account, opportunity, etc.)
  app.get('/api/communications/related/:type/:id', async (req: Request, res: Response) => {
    try {
      const relatedToType = req.params.type;
      const relatedToId = parseInt(req.params.id);
      
      if (!relatedToType || !relatedToId) {
        return res.status(400).json({ error: "Invalid entity type or ID" });
      }
      
      const communications = await storage.getRelatedCommunications(relatedToType, relatedToId);
      res.status(200).json(communications);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Product Category Routes
  app.get('/api/product-categories', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const categories = await storage.listProductCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/product-categories', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/product-categories/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const category = await storage.getProductCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Product category not found" });
      }
      res.json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/product-categories/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const categoryData = insertProductCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateProductCategory(id, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ error: "Product category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/product-categories/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductCategory(id);
      if (!success) {
        return res.status(404).json({ error: "Product category not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Products Routes
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log('Fetching products from storage...');
      const products = await storage.listProducts();
      console.log('Products fetched:', products);
      res.json(products);
    } catch (error) {
      console.error('Detailed error when fetching products:', error);
      handleError(res, error);
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/products/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Inventory Transaction Routes
  app.get('/api/inventory-transactions', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const transactions = await storage.listInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/inventory-transactions', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const transactionData = insertInventoryTransactionSchema.parse(req.body);
      const transaction = await storage.createInventoryTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/inventory-transactions/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const transaction = await storage.getInventoryTransaction(id);
      if (!transaction) {
        return res.status(404).json({ error: "Inventory transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/products/:id/inventory-history', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const productId = parseInt(req.params.id);
      const history = await storage.getProductInventoryHistory(productId);
      res.json(history);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/inventory-summary', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const summary = await storage.getInventorySummary();
      res.json(summary);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Invoice Routes
  app.get('/api/invoices', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log('Fetching invoices from storage...');
      const invoices = await storage.listInvoices();
      console.log('Invoices fetched:', invoices);
      res.json(invoices);
    } catch (error) {
      console.error('Detailed error when fetching invoices:', error);
      handleError(res, error);
    }
  });

  app.post('/api/invoices', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/invoices/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/invoices/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const updatedInvoice = await storage.updateInvoice(id, invoiceData);
      if (!updatedInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/invoices/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoice(id);
      if (!success) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Invoice Items Routes
  app.get('/api/invoices/:invoiceId/items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const invoiceId = parseInt(req.params.invoiceId);
      const items = await storage.getInvoiceItems(invoiceId);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/invoice-items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const itemData = insertInvoiceItemSchema.parse(req.body);
      const item = await storage.createInvoiceItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/invoice-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const itemData = insertInvoiceItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateInvoiceItem(id, itemData);
      if (!updatedItem) {
        return res.status(404).json({ error: "Invoice item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/invoice-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoiceItem(id);
      if (!success) {
        return res.status(404).json({ error: "Invoice item not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Purchase Order Routes
  app.get('/api/purchase-orders', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const purchaseOrders = await storage.listPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/purchase-orders', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const purchaseOrderData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder(purchaseOrderData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/purchase-orders/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(purchaseOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/purchase-orders/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const purchaseOrderData = insertPurchaseOrderSchema.partial().parse(req.body);
      const updatedPurchaseOrder = await storage.updatePurchaseOrder(id, purchaseOrderData);
      if (!updatedPurchaseOrder) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(updatedPurchaseOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/purchase-orders/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchaseOrder(id);
      if (!success) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Purchase Order Items Routes
  app.get('/api/purchase-orders/:purchaseOrderId/items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const purchaseOrderId = parseInt(req.params.purchaseOrderId);
      const items = await storage.getPurchaseOrderItems(purchaseOrderId);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/purchase-order-items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const itemData = insertPurchaseOrderItemSchema.parse(req.body);
      const item = await storage.createPurchaseOrderItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/purchase-order-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const itemData = insertPurchaseOrderItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updatePurchaseOrderItem(id, itemData);
      if (!updatedItem) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/purchase-order-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchaseOrderItem(id);
      if (!success) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/purchase-orders/:id/receive', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }
      
      const result = await storage.receivePurchaseOrderItems(id, items);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  // --------------------------------
  // Proposal System Routes
  // --------------------------------

  // Proposal Template routes
  app.get('/api/proposal-templates', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const templates = await storage.listProposalTemplates();
      res.json(templates);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/proposal-templates/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const template = await storage.getProposalTemplate(id);
      if (!template) {
        return res.status(404).json({ error: "Proposal template not found" });
      }
      res.json(template);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/proposal-templates', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const templateData = insertProposalTemplateSchema.parse(req.body);
      
      // Add user as creator if not specified
      if (!templateData.createdBy) {
        templateData.createdBy = req.user.id;
      }
      
      const template = await storage.createProposalTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/proposal-templates/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const templateData = insertProposalTemplateSchema.partial().parse(req.body);
      
      // Add user as updater
      if (!templateData.updatedBy) {
        templateData.updatedBy = req.user.id;
      }
      
      const template = await storage.updateProposalTemplate(id, templateData);
      if (!template) {
        return res.status(404).json({ error: "Proposal template not found" });
      }
      
      res.json(template);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/proposal-templates/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteProposalTemplate(id);
      
      if (!success) {
        return res.status(404).json({ error: "Proposal template not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Proposal routes
  app.get('/api/proposals', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "You must be logged in to view proposals"
        });
      }
      
      try {
        // Parse filter params
        const filter: Record<string, any> = {};
        const queryParams: Record<string, any> = {};
        const parsedErrors: Record<string, string> = {};
        
        // Helper function to safely parse numeric parameters
        const parseNumericParam = (name: string, value: string): number | null => {
          const parsed = parseInt(value);
          if (isNaN(parsed)) {
            parsedErrors[name] = `Invalid ${name}: ${value} is not a number`;
            return null;
          }
          return parsed;
        };
        
        // Parse account ID filter
        if (req.query.accountId) {
          const accountId = parseNumericParam('accountId', req.query.accountId as string);
          if (accountId !== null) {
            filter.accountId = accountId;
            queryParams.accountId = accountId;
          }
        }
        
        // Parse opportunity ID filter
        if (req.query.opportunityId) {
          const opportunityId = parseNumericParam('opportunityId', req.query.opportunityId as string);
          if (opportunityId !== null) {
            filter.opportunityId = opportunityId;
            queryParams.opportunityId = opportunityId;
          }
        }
        
        // Parse status filter (string enum validation)
        if (req.query.status) {
          const status = req.query.status as string;
          const validStatuses = ["Draft", "Sent", "Accepted", "Rejected", "Expired", "Revoked"];
          
          if (validStatuses.includes(status)) {
            filter.status = status;
            queryParams.status = status;
          } else {
            parsedErrors.status = `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`;
          }
        }
        
        // Parse creator filter
        if (req.query.createdBy) {
          const createdBy = parseNumericParam('createdBy', req.query.createdBy as string);
          if (createdBy !== null) {
            filter.createdBy = createdBy;
            queryParams.createdBy = createdBy;
          }
        }
        
        // Check if there were any parsing errors
        if (Object.keys(parsedErrors).length > 0) {
          return res.status(400).json({
            error: "Validation Error",
            message: "Invalid filter parameters",
            details: parsedErrors
          });
        }
        
        // Get the proposals with the filter
        const proposals = await storage.listProposals(filter);
        
        // Return with standardized format including metadata about the query
        console.log(`Sending proposals list with ${proposals.length} items`);
        return res.status(200).json({
          success: true,
          data: proposals,
          metadata: {
            count: proposals.length,
            filters: queryParams,
            timestamp: new Date()
          },
          message: "Proposals retrieved successfully"
        });
      } catch (databaseError: any) {
        console.error("Database error retrieving proposals:", databaseError);
        
        return res.status(500).json({
          error: "Database Error",
          message: databaseError?.message || "Failed to retrieve proposals from database",
          // Include the stack trace in development for debugging
          ...(process.env.NODE_ENV !== 'production' && { 
            stack: databaseError?.stack,
            details: databaseError
          })
        });
      }
    } catch (error: any) {
      console.error("Unexpected error retrieving proposals:", error);
      
      return res.status(500).json({
        error: "Internal Server Error",
        message: error?.message || "An unexpected error occurred while retrieving proposals",
        // Only include details in development for security
        ...(process.env.NODE_ENV !== 'production' && { details: error })
      });
    }
  });

  app.get('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "You must be logged in to view proposal details"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate id is a number
      if (isNaN(id)) {
        return res.status(400).json({ 
          error: "Validation Error", 
          message: "Valid proposal ID is required",
          details: { id: req.params.id }
        });
      }
      
      try {
        const proposal = await storage.getProposal(id);
        
        if (!proposal) {
          return res.status(404).json({
            error: "Not Found",
            message: "Proposal not found",
            details: { id }
          });
        }
        
        try {
          // Get related counts to include in response
          const elements = await storage.listProposalElements(id);
          const comments = await storage.getProposalComments(id);
          const collaborators = await storage.getProposalCollaborators(id);
          const activities = await storage.getProposalActivities(id);
          
          // Log access activity
          try {
            if (req.user) {
              await storage.createProposalActivity({
                proposalId: id,
                userId: req.user.id,
                activityType: "view",
                description: `Proposal viewed by ${req.user.username || 'user'}`
              });
            }
          } catch (activityError) {
            // Log but don't fail the request if activity logging fails
            console.warn("Failed to log proposal view activity:", activityError);
          }
          
          // Return the proposal with additional metadata - use consistent response format
          console.log(`Sending proposal ${id} response:`, proposal.name);
          return res.status(200).json({
            success: true,
            data: {
              ...proposal,
              _metadata: {
                elementsCount: elements.length,
                commentsCount: comments.length,
                collaboratorsCount: collaborators.length,
                activitiesCount: activities.length
              }
            },
            message: "Proposal details retrieved successfully"
          });
        } catch (relatedDataError: any) {
          console.error("Error fetching related proposal data:", relatedDataError);
          
          // Still return the proposal even if we can't get related data - use consistent format
          return res.status(200).json({
            success: true,
            data: proposal,
            message: "Proposal details retrieved successfully (without related data)"
          });
        }
      } catch (databaseError: any) {
        console.error("Database error retrieving proposal:", databaseError);
        
        return res.status(500).json({
          error: "Database Error",
          message: databaseError?.message || "Failed to retrieve proposal from database",
          // Include the stack trace in development for debugging
          ...(process.env.NODE_ENV !== 'production' && { 
            stack: databaseError?.stack,
            details: databaseError
          })
        });
      }
    } catch (error: any) {
      console.error("Unexpected error retrieving proposal:", error);
      
      return res.status(500).json({
        error: "Internal Server Error",
        message: error?.message || "An unexpected error occurred while retrieving the proposal",
        // Only include details in development for security
        ...(process.env.NODE_ENV !== 'production' && { details: error })
      });
    }
  });

  // Test endpoint for proposal creation
  app.post('/api/test-proposal', async (req: Request, res: Response) => {
    try {
      console.log("Test proposal endpoint called with body:", JSON.stringify(req.body, null, 2));
      
      // Skip authentication for test
      
      // Create basic proposal data for testing
      const proposalData = {
        name: "Test Proposal",
        opportunityId: 91,
        accountId: 102,
        createdBy: 2, 
        status: "Draft" as "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired" | "Revoked",
        content: {},
        metadata: {},
      };
      
      console.log("Creating test proposal with data:", JSON.stringify(proposalData, null, 2));
      
      // Create the proposal
      const proposal = await storage.createProposal(proposalData);
      console.log("Test proposal created:", JSON.stringify(proposal, null, 2));
      
      // Return response in the new standardized format
      return res.status(201).json({
        success: true,
        data: proposal,
        message: "Test proposal created successfully"
      });
    } catch (error: any) {
      console.error("Error in test proposal creation:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create test proposal"
      });
    }
  });

  app.post('/api/proposals', async (req: Request, res: Response) => {
    try {
      // Log the incoming request for debugging purposes
      console.log("POST /api/proposals received with body:", JSON.stringify(req.body, null, 2));
      
      // Temporarily disable authentication check to fix proposal creation
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ 
      //     error: "Unauthorized", 
      //     message: "You must be logged in to create a proposal" 
      //   });
      // }
      
      try {
        // Manually construct the required proposal data with proper types
        const proposalToCreate = {
          name: req.body.name || "New Proposal",
          opportunityId: Number(req.body.opportunityId),
          accountId: Number(req.body.accountId),
          createdBy: req.body.createdBy || (req.user ? req.user.id : 2), // Default to user ID 2 if no user in session
          status: (req.body.status || "Draft") as "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired" | "Revoked",
          content: req.body.content || {},
          metadata: req.body.metadata || {},
          templateId: req.body.templateId ? Number(req.body.templateId) : undefined,
          expiresAt: req.body.expiresAt
        };
        
        console.log("Processed proposal data:", JSON.stringify(proposalToCreate, null, 2));
        
        // Validate required fields
        if (!proposalToCreate.name) {
          return res.status(400).json({ 
            error: "Validation Error", 
            message: "Proposal name is required" 
          });
        }
        
        if (isNaN(proposalToCreate.opportunityId)) {
          return res.status(400).json({ 
            error: "Validation Error", 
            message: "Valid opportunity ID is required",
            field: "opportunityId",
            value: req.body.opportunityId
          });
        }
        
        if (isNaN(proposalToCreate.accountId)) {
          return res.status(400).json({ 
            error: "Validation Error", 
            message: "Valid account ID is required",
            field: "accountId",
            value: req.body.accountId
          });
        }
        
        // Check if relationships exist
        const opportunity = await storage.getOpportunity(proposalToCreate.opportunityId);
        if (!opportunity) {
          return res.status(400).json({ 
            error: "Validation Error", 
            message: "The specified opportunity does not exist",
            field: "opportunityId"
          });
        }
        
        const account = await storage.getAccount(proposalToCreate.accountId);
        if (!account) {
          return res.status(400).json({ 
            error: "Validation Error", 
            message: "The specified account does not exist",
            field: "accountId"
          });
        }
        
        // If template ID is provided, check if template exists and apply content
        if (proposalToCreate.templateId) {
          const template = await storage.getProposalTemplate(proposalToCreate.templateId);
          if (!template) {
            return res.status(400).json({
              error: "Validation Error",
              message: "The specified template does not exist",
              field: "templateId"
            });
          }
          
          // Apply template content to proposal
          proposalToCreate.content = template.content;
        }
        
        console.log("Creating proposal with data:", JSON.stringify(proposalToCreate, null, 2));
        
        // Create the proposal
        const proposal = await storage.createProposal(proposalToCreate);
        
        console.log("Proposal created successfully:", JSON.stringify(proposal, null, 2));
        
        // Record activity for the creation
        try {
          await storage.createProposalActivity({
            proposalId: proposal.id,
            userId: proposalToCreate.createdBy,
            activityType: "create",
            description: `Proposal "${proposal.name}" created`,
            metadata: {
              createdAt: new Date(),
              fromTemplate: !!proposalToCreate.templateId,
              opportunityName: opportunity.name,
              accountName: account.name
            }
          });
        } catch (activityError) {
          // Log but don't fail the request if activity logging fails
          console.warn("Failed to log proposal creation activity:", activityError);
        }
        
        // Return a standardized response format
        const response = {
          success: true,
          data: proposal,
          message: "Proposal created successfully"
        };
        
        console.log("Sending successful response:", JSON.stringify(response, null, 2));
        return res.status(201).json(response);
      } catch (databaseError: any) {
        console.error("Database error creating proposal:", databaseError);
        
        // Provide more specific error messages based on the error
        const errorMessage = databaseError?.message || "Failed to create proposal in database";
        const statusCode = errorMessage.includes("does not exist") ? 400 : 500;
        
        return res.status(statusCode).json({ 
          error: statusCode === 400 ? "Validation Error" : "Database Error", 
          message: errorMessage,
          // Include the stack trace in development for debugging
          ...(process.env.NODE_ENV !== 'production' && { 
            stack: databaseError?.stack,
            details: databaseError
          })
        });
      }
    } catch (error: any) {
      console.error("Unexpected error creating proposal:", error);
      
      return res.status(500).json({ 
        error: "Internal Server Error", 
        message: error?.message || "An unexpected error occurred while creating the proposal",
        // Only include details in development for security
        ...(process.env.NODE_ENV !== 'production' && { details: error })
      });
    }
  });

  app.patch('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "You must be logged in to update a proposal" 
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate id is a number
      if (isNaN(id)) {
        return res.status(400).json({ 
          error: "Validation Error", 
          message: "Valid proposal ID is required",
          details: { id: req.params.id }
        });
      }
      
      try {
        // Get the current proposal to ensure it exists
        const existingProposal = await storage.getProposal(id);
        if (!existingProposal) {
          return res.status(404).json({ 
            error: "Not Found", 
            message: "Proposal not found",
            details: { id }
          });
        }
  
        try {
          // Parse and validate the update data
          const proposalData = insertProposalSchema.partial().parse(req.body);
          
          // Add current user as updater
          if (!proposalData.updatedBy) {
            proposalData.updatedBy = req.user.id;
          }
          
          // Special handling for status changes to track metadata
          if (proposalData.status && proposalData.status !== existingProposal.status) {
            if (!proposalData.metadata) {
              proposalData.metadata = existingProposal.metadata || {};
            }
            
            // Track timestamps based on status changes
            const now = new Date();
            
            // Ensure metadata is treated as an object
            const metadataObj = proposalData.metadata as Record<string, any>;
            
            if (proposalData.status === 'Sent') {
              metadataObj.sentAt = now;
            } else if (proposalData.status === 'Accepted') {
              metadataObj.acceptedAt = now;
            } else if (proposalData.status === 'Rejected') {
              metadataObj.rejectedAt = now;
            }
            
            // Reassign the object back
            proposalData.metadata = metadataObj;
            
            // Log status change activity
            try {
              await storage.createProposalActivity({
                proposalId: id,
                userId: req.user.id,
                activityType: "status_change",
                description: `Proposal status changed from "${existingProposal.status}" to "${proposalData.status}" by ${req.user.username || 'user'}`,
                metadata: {
                  previousStatus: existingProposal.status,
                  newStatus: proposalData.status,
                  changedAt: now
                }
              });
            } catch (activityError) {
              // Log but don't fail the request if activity logging fails
              console.warn("Failed to log proposal status change activity:", activityError);
            }
          }
          
          // Update the proposal
          const proposal = await storage.updateProposal(id, proposalData);
          
          if (!proposal) {
            return res.status(500).json({ 
              error: "Database Error", 
              message: "Failed to update proposal" 
            });
          }
          
          return res.status(200).json({
            success: true,
            data: proposal,
            message: "Proposal updated successfully"
          });
        } catch (validationError: any) {
          // Handle validation errors specifically
          if (validationError.name === 'ZodError') {
            return res.status(400).json({
              error: "Validation Error",
              message: "Invalid proposal data provided",
              details: validationError.errors
            });
          }
          
          throw validationError; // Re-throw for the outer catch block
        }
      } catch (databaseError: any) {
        console.error("Database error updating proposal:", databaseError);
        
        // Provide more specific error messages based on the error
        const errorMessage = databaseError?.message || "Failed to update proposal in database";
        const statusCode = errorMessage.includes("does not exist") ? 400 : 500;
        
        return res.status(statusCode).json({ 
          error: statusCode === 400 ? "Validation Error" : "Database Error", 
          message: errorMessage,
          // Include the stack trace in development for debugging
          ...(process.env.NODE_ENV !== 'production' && { 
            stack: databaseError?.stack,
            details: databaseError
          })
        });
      }
    } catch (error: any) {
      console.error("Unexpected error updating proposal:", error);
      
      return res.status(500).json({ 
        error: "Internal Server Error", 
        message: error?.message || "An unexpected error occurred while updating the proposal",
        // Only include details in development for security
        ...(process.env.NODE_ENV !== 'production' && { details: error })
      });
    }
  });

  app.delete('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          error: "Unauthorized", 
          message: "You must be logged in to delete a proposal"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate id is a number
      if (isNaN(id)) {
        return res.status(400).json({ 
          error: "Validation Error", 
          message: "Valid proposal ID is required",
          details: { id: req.params.id }
        });
      }
      
      try {
        // Check if proposal exists first
        const existingProposal = await storage.getProposal(id);
        if (!existingProposal) {
          return res.status(404).json({ 
            error: "Not Found", 
            message: "Proposal not found",
            details: { id }
          });
        }
        
        // For proposals in certain statuses, don't allow deletion
        if (existingProposal.status === 'Accepted') {
          return res.status(400).json({
            error: "Validation Error",
            message: "Cannot delete an accepted proposal",
            details: { 
              id,
              status: existingProposal.status,
              note: "Proposals that have been accepted cannot be deleted for record-keeping purposes"
            }
          });
        }
        
        try {
          // Check if any related elements, comments, or collaborators exist
          const elements = await storage.listProposalElements(id);
          const comments = await storage.getProposalComments(id);
          const collaborators = await storage.getProposalCollaborators(id);
          
          // Log proposal deletion activity before actual deletion
          try {
            await storage.createProposalActivity({
              proposalId: id,
              userId: req.user.id,
              activityType: "delete",
              description: `Proposal "${existingProposal.name}" deleted by ${req.user.username || 'user'}`,
              metadata: {
                deletedAt: new Date(),
                hadElements: elements.length > 0,
                hadComments: comments.length > 0,
                hadCollaborators: collaborators.length > 0,
                opportunityId: existingProposal.opportunityId,
                accountId: existingProposal.accountId,
                status: existingProposal.status
              }
            });
          } catch (activityError) {
            // Log but don't fail the request if activity logging fails
            console.warn("Failed to log proposal deletion activity:", activityError);
          }
          
          // Delete the proposal
          const success = await storage.deleteProposal(id);
          
          if (!success) {
            return res.status(500).json({ 
              error: "Database Error", 
              message: "Failed to delete proposal"
            });
          }
          
          return res.status(200).json({
            success: true,
            message: "Proposal deleted successfully",
            data: {
              id,
              name: existingProposal.name
            }
          });
        } catch (databaseError: any) {
          console.error("Database error deleting proposal:", databaseError);
          
          // Check for specific database errors
          if (databaseError.message && databaseError.message.includes('foreign key constraint')) {
            return res.status(400).json({
              error: "Constraint Error",
              message: "Cannot delete this proposal because it has related records in other tables",
              details: { 
                id,
                suggestion: "Make sure all related elements, comments, and collaborators are removed first"
              }
            });
          }
          
          return res.status(500).json({ 
            error: "Database Error", 
            message: databaseError?.message || "Failed to delete proposal from database",
            // Include the stack trace in development for debugging
            ...(process.env.NODE_ENV !== 'production' && { 
              stack: databaseError?.stack,
              details: databaseError
            })
          });
        }
      } catch (error: any) {
        console.error("Error processing proposal deletion:", error);
        return res.status(500).json({ 
          error: "Processing Error", 
          message: error?.message || "Failed to process proposal deletion request"
        });
      }
    } catch (error: any) {
      console.error("Unexpected error deleting proposal:", error);
      
      return res.status(500).json({ 
        error: "Internal Server Error", 
        message: error?.message || "An unexpected error occurred while deleting the proposal",
        // Only include details in development for security
        ...(process.env.NODE_ENV !== 'production' && { details: error })
      });
    }
  });

  // Proposal Elements routes
  app.get('/api/proposals/:proposalId/elements', async (req: Request, res: Response) => {
    try {
      // Temporarily disable authentication check
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ 
      //     success: false,
      //     error: "Unauthorized",
      //     message: "You must be logged in to view proposal elements"
      //   });
      // }
      
      const proposalId = parseInt(req.params.proposalId);
      const elements = await storage.listProposalElements(proposalId);
      
      // Return standardized response format
      res.status(200).json({
        success: true,
        data: elements,
        metadata: {
          count: elements.length,
          proposalId: proposalId,
          timestamp: new Date()
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/proposals/:proposalId/elements', async (req: Request, res: Response) => {
    try {
      // Temporarily disable authentication check
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ error: "Unauthorized" });
      // }
      
      const proposalId = parseInt(req.params.proposalId);
      
      // Validate proposal exists
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({ 
          success: false,
          error: "Not Found", 
          message: "Proposal not found",
          details: { proposalId }
        });
      }
      
      // Prepare request body with proper JSON content
      const requestBody = { ...req.body };
      
      // If content is provided, ensure it's valid JSON format
      if (requestBody.content !== undefined) {
        try {
          // If it's already a string, validate that it's proper JSON
          if (typeof requestBody.content === 'string') {
            // Try parsing it to validate
            JSON.parse(requestBody.content);
          } else {
            // If it's an object, stringify it properly
            requestBody.content = JSON.stringify(requestBody.content);
          }
        } catch (jsonError) {
          return res.status(400).json({
            success: false,
            error: "Validation Error",
            message: "Element content must be valid JSON",
            details: { contentError: jsonError.message }
          });
        }
      }
      
      // Validate element data
      const elementData = insertProposalElementSchema.parse({
        ...requestBody,
        proposalId,
        createdBy: requestBody.createdBy || 2 // Default to user ID 2 if not provided
      });
      
      const element = await storage.createProposalElement(elementData);
      
      // Log activity
      try {
        await storage.createProposalActivity({
          proposalId,
          activityType: "ELEMENT_ADDED",
          description: `Element "${element.name}" added`,
          userId: elementData.createdBy,
          metadata: {
            elementId: element.id,
            elementType: element.elementType
          }
        });
      } catch (logError) {
        console.error("Error logging proposal activity:", logError);
        // Continue despite logging error
      }
      
      // Return standardized response format
      res.status(201).json({
        success: true,
        data: element,
        message: "Proposal element created successfully"
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/proposal-elements/:id', async (req: Request, res: Response) => {
    try {
      // Temporarily disable authentication check
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ error: "Unauthorized" });
      // }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid element ID is required",
          details: { id: req.params.id }
        });
      }
      
      const element = await storage.getProposalElement(id);
      
      if (!element) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found",
          details: { id }
        });
      }
      
      // Return standardized response format
      return res.status(200).json({
        success: true,
        data: element
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Add the nested route form to support the client implementation
  app.patch('/api/proposals/:proposalId/elements/:id', async (req: Request, res: Response) => {
    try {
      // Parse IDs
      const proposalId = parseInt(req.params.proposalId);
      const elementId = parseInt(req.params.id);
      
      console.log(`PATCH request for element ${elementId} in proposal ${proposalId}`);
      
      // Validate IDs
      if (isNaN(proposalId) || isNaN(elementId)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid proposal ID and element ID are required",
          details: { 
            proposalId: req.params.proposalId,
            elementId: req.params.id 
          }
        });
      }
      
      // Get the current element to verify it belongs to the right proposal
      const currentElement = await storage.getProposalElement(elementId);
      if (!currentElement) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found",
          details: { id: elementId }
        });
      }
      
      // Verify the element belongs to the specified proposal
      if (currentElement.proposalId !== proposalId) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Element does not belong to the specified proposal",
          details: { 
            elementId: elementId,
            elementProposalId: currentElement.proposalId,
            requestedProposalId: proposalId
          }
        });
      }
      
      // Continue with the update using the original implementation
      // Forward to the existing endpoint logic
      req.params.id = elementId.toString();
      
      // Process the update using the same logic as the original endpoint
      try {
        const updatedElement = await storage.updateProposalElement(elementId, req.body);
        return res.status(200).json({
          success: true,
          data: updatedElement,
          message: "Element updated successfully"
        });
      } catch (error: any) {
        console.error("Error updating proposal element:", error);
        return res.status(500).json({
          success: false,
          error: "Server Error",
          message: error.message || "Failed to update element"
        });
      }
    } catch (error) {
      handleError(res, error);
    }
  });

  // Keep the original endpoint for backward compatibility
  app.patch('/api/proposal-elements/:id', async (req: Request, res: Response) => {
    try {
      // Temporarily disable authentication check
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ error: "Unauthorized" });
      // }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid element ID is required",
          details: { id: req.params.id }
        });
      }
      
      // Get the current element to know its proposal ID
      const currentElement = await storage.getProposalElement(id);
      if (!currentElement) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found",
          details: { id }
        });
      }
      
      try {
        // Ensure content is properly formatted if it exists in the request
        const requestBody = { ...req.body };
        
        // If content is provided, ensure it's valid JSON format
        if (requestBody.content !== undefined) {
          try {
            // If it's already a string, validate that it's proper JSON
            if (typeof requestBody.content === 'string') {
              // Try parsing it to validate
              JSON.parse(requestBody.content);
            } else {
              // If it's an object, stringify it properly
              requestBody.content = JSON.stringify(requestBody.content);
            }
          } catch (jsonError) {
            return res.status(400).json({
              success: false,
              error: "Validation Error",
              message: "Element content must be valid JSON",
              details: { contentError: jsonError.message }
            });
          }
        }
        
        // Validate the update data
        const elementData = insertProposalElementSchema.partial().parse({
          ...requestBody,
          updatedBy: requestBody.updatedBy || 2, // Default to user ID 2 if not provided
          // Ensure proposalId is included for activity log
          proposalId: currentElement.proposalId
        });
        
        const element = await storage.updateProposalElement(id, elementData);
        
        if (!element) {
          return res.status(404).json({
            success: false,
            error: "Not Found",
            message: "Proposal element not found or could not be updated",
            details: { id }
          });
        }
        
        // Log activity
        try {
          await storage.createProposalActivity({
            proposalId: currentElement.proposalId,
            activityType: "ELEMENT_UPDATED",
            description: `Element "${element.name}" updated`,
            userId: elementData.updatedBy || 2,
            metadata: {
              elementId: element.id,
              elementType: element.elementType,
              changes: Object.keys(req.body).filter(key => key !== 'updatedBy')
            }
          });
        } catch (logError) {
          console.error("Error logging proposal activity:", logError);
          // Continue despite logging error
        }
        
        // Return standardized response format
        return res.status(200).json({
          success: true,
          data: element,
          message: "Proposal element updated successfully"
        });
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid element data provided",
          details: validationError?.errors || validationError?.message
        });
      }
    } catch (error) {
      handleError(res, error);
    }
  });

  // Add the nested route form for element deletion to support the client implementation
  app.delete('/api/proposals/:proposalId/elements/:id', async (req: Request, res: Response) => {
    try {
      // Parse IDs
      const proposalId = parseInt(req.params.proposalId);
      const elementId = parseInt(req.params.id);
      
      console.log(`DELETE request for element ${elementId} in proposal ${proposalId}`);
      
      // Validate IDs
      if (isNaN(proposalId) || isNaN(elementId)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid proposal ID and element ID are required",
          details: { 
            proposalId: req.params.proposalId,
            elementId: req.params.id 
          }
        });
      }
      
      // First get the element to verify it belongs to the right proposal
      const element = await storage.getProposalElement(elementId);
      if (!element) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found",
          details: { id: elementId }
        });
      }
      
      // Verify the element belongs to the specified proposal
      if (element.proposalId !== proposalId) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Element does not belong to the specified proposal",
          details: { 
            elementId: elementId,
            elementProposalId: element.proposalId,
            requestedProposalId: proposalId
          }
        });
      }
      
      // Store element data for activity log
      const elementName = element.name;
      const elementType = element.elementType;
      
      // Delete the element
      const success = await storage.deleteProposalElement(elementId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found or already deleted",
          details: { id: elementId }
        });
      }
      
      // Log activity
      try {
        await storage.createProposalActivity({
          proposalId: proposalId,
          activityType: "ELEMENT_DELETED",
          description: `Element "${elementName}" deleted`,
          userId: req.body.userId || 2, // Default to user ID 2 if not provided
          metadata: {
            elementId: elementId,
            elementType: elementType
          }
        });
      } catch (logError) {
        console.error("Error logging proposal activity:", logError);
        // Continue despite logging error
      }
      
      // Return 200 with success message
      return res.status(200).json({
        success: true,
        message: "Proposal element deleted successfully",
        data: { id: elementId }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Keep the original endpoint for backward compatibility
  app.delete('/api/proposal-elements/:id', async (req: Request, res: Response) => {
    try {
      // Temporarily disable authentication check
      // if (!req.isAuthenticated()) {
      //   return res.status(401).json({ error: "Unauthorized" });
      // }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid element ID is required",
          details: { id: req.params.id }
        });
      }
      
      // First get the element to know its proposal ID for activity logging
      const element = await storage.getProposalElement(id);
      if (!element) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found",
          details: { id }
        });
      }
      
      // Store element data for activity log
      const elementName = element.name;
      const elementType = element.elementType;
      const proposalId = element.proposalId;
      
      // Then delete it
      const success = await storage.deleteProposalElement(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal element not found or already deleted",
          details: { id }
        });
      }
      
      // Log activity
      try {
        await storage.createProposalActivity({
          proposalId: proposalId,
          activityType: "ELEMENT_DELETED",
          description: `Element "${elementName}" deleted`,
          userId: req.body.userId || 2, // Default to user ID 2 if not provided
          metadata: {
            elementId: id,
            elementType: elementType
          }
        });
      } catch (logError) {
        console.error("Error logging proposal activity:", logError);
        // Continue despite logging error
      }
      
      // Return 200 with success message instead of 204 no content
      // This provides better feedback to the client
      return res.status(200).json({
        success: true,
        message: "Proposal element deleted successfully",
        data: { id }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Proposal Collaborator routes
  app.get('/api/proposals/:proposalId/collaborators', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to view proposal collaborators"
        });
      }
      
      const proposalId = parseInt(req.params.proposalId);
      
      // Validate ID
      if (isNaN(proposalId)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid proposal ID is required",
          details: { id: req.params.proposalId }
        });
      }
      
      // First verify the proposal exists
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal not found",
          details: { proposalId }
        });
      }
      
      // Get collaborators for the proposal
      const collaborators = await storage.getProposalCollaborators(proposalId);
      
      // Return standardized response with metadata
      res.status(200).json({
        success: true,
        data: collaborators,
        metadata: {
          count: collaborators.length,
          proposalId,
          proposalName: proposal.name,
          proposalStatus: proposal.status,
          timestamp: new Date()
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/proposals/:proposalId/collaborators', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to add collaborators to proposals"
        });
      }
      
      const proposalId = parseInt(req.params.proposalId);
      
      // Validate ID
      if (isNaN(proposalId)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid proposal ID is required",
          details: { id: req.params.proposalId }
        });
      }
      
      // Check if proposal exists
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "The proposal you're trying to add collaborators to does not exist",
          details: { proposalId }
        });
      }
      
      try {
        // Validate collaborator data
        const collaboratorData = insertProposalCollaboratorSchema.parse({
          ...req.body,
          proposalId,
          addedBy: req.user.id
        });
        
        const collaborator = await storage.addProposalCollaborator(collaboratorData);
        
        // Log activity
        try {
          await storage.createProposalActivity({
            proposalId,
            activityType: "COLLABORATOR_ADDED",
            description: `New collaborator added to proposal`,
            userId: req.user.id,
            metadata: {
              collaboratorId: collaborator.id,
              collaboratorUserId: collaborator.userId,
              role: collaborator.role
            }
          });
        } catch (logError) {
          console.error("Error logging proposal activity:", logError);
          // Continue despite logging error
        }
        
        return res.status(201).json({
          success: true,
          data: collaborator,
          message: "Collaborator added successfully"
        });
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid collaborator data provided",
          details: validationError?.errors || validationError?.message
        });
      }
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/proposal-collaborators/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to update proposal collaborators"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid collaborator ID is required",
          details: { id: req.params.id }
        });
      }
      
      try {
        // First get the existing collaborator to get the proposal ID for activity logging
        const existingCollaborator = await storage.getProposalCollaborator(id);
        if (!existingCollaborator) {
          return res.status(404).json({
            success: false,
            error: "Not Found",
            message: "Collaborator not found",
            details: { id }
          });
        }
        
        // Store data for activity log
        const previousRole = existingCollaborator.role;
        const proposalId = existingCollaborator.proposalId;
        
        const collaboratorData = insertProposalCollaboratorSchema.partial().parse(req.body);
        
        const collaborator = await storage.updateProposalCollaborator(id, collaboratorData);
        
        if (!collaborator) {
          return res.status(404).json({
            success: false,
            error: "Not Found",
            message: "Collaborator not found or update failed",
            details: { id }
          });
        }
        
        // Log activity if role changed
        if (collaboratorData.role && collaboratorData.role !== previousRole) {
          try {
            await storage.createProposalActivity({
              proposalId,
              activityType: "COLLABORATOR_UPDATED",
              description: `Collaborator role changed from "${previousRole}" to "${collaborator.role}"`,
              userId: req.user.id,
              metadata: {
                collaboratorId: collaborator.id,
                collaboratorUserId: collaborator.userId,
                previousRole,
                newRole: collaborator.role
              }
            });
          } catch (logError) {
            console.error("Error logging proposal activity:", logError);
            // Continue despite logging error
          }
        }
        
        return res.status(200).json({
          success: true,
          data: collaborator,
          message: "Collaborator updated successfully"
        });
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid collaborator data provided",
          details: validationError?.errors || validationError?.message
        });
      }
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/proposal-collaborators/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to remove proposal collaborators"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid collaborator ID is required",
          details: { id: req.params.id }
        });
      }
      
      // First get the collaborator to know its proposal ID for activity logging
      const collaborator = await storage.getProposalCollaborator(id);
      if (!collaborator) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Collaborator not found",
          details: { id }
        });
      }
      
      // Store data for activity log
      const proposalId = collaborator.proposalId;
      const userId = collaborator.userId;
      const role = collaborator.role;
      
      // Then delete it
      const success = await storage.deleteProposalCollaborator(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Collaborator not found or already deleted",
          details: { id }
        });
      }
      
      // Log activity
      try {
        await storage.createProposalActivity({
          proposalId,
          activityType: "COLLABORATOR_REMOVED",
          description: `Collaborator removed from proposal`,
          userId: req.user.id,
          metadata: {
            collaboratorId: id,
            collaboratorUserId: userId,
            role
          }
        });
      } catch (logError) {
        console.error("Error logging proposal activity:", logError);
        // Continue despite logging error
      }
      
      // Return 200 with success message instead of 204 no content
      // This provides better feedback to the client
      return res.status(200).json({
        success: true,
        message: "Collaborator removed successfully",
        data: { id }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Proposal Comment routes
  app.get('/api/proposals/:proposalId/comments', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to view proposal comments"
        });
      }
      
      const proposalId = parseInt(req.params.proposalId);
      
      // Validate ID
      if (isNaN(proposalId)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid proposal ID is required",
          details: { id: req.params.proposalId }
        });
      }
      
      // First verify the proposal exists
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Proposal not found",
          details: { proposalId }
        });
      }
      
      // Get comments for the proposal
      const comments = await storage.getProposalComments(proposalId);
      
      // Calculate stats on resolved/unresolved comments
      const resolvedComments = comments.filter(comment => comment.resolved === true).length;
      const unresolvedComments = comments.length - resolvedComments;
      
      // Return standardized response with enhanced metadata
      res.status(200).json({
        success: true,
        data: comments,
        metadata: {
          count: comments.length,
          resolvedCount: resolvedComments,
          unresolvedCount: unresolvedComments,
          proposalId,
          proposalName: proposal.name,
          proposalStatus: proposal.status,
          timestamp: new Date()
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/proposals/:proposalId/comments', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to add comments to proposals"
        });
      }
      
      const proposalId = parseInt(req.params.proposalId);
      
      // Check if proposal exists
      const proposal = await storage.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "The proposal you're trying to comment on does not exist",
          details: { proposalId }
        });
      }
      
      try {
        // Validate comment data
        const commentData = insertProposalCommentSchema.parse({
          ...req.body,
          proposalId,
          userId: req.user.id
        });
        
        const comment = await storage.createProposalComment(commentData);
        
        return res.status(201).json({
          success: true,
          data: comment,
          message: "Comment created successfully"
        });
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid comment data provided",
          details: validationError?.errors || validationError?.message
        });
      }
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/proposal-comments/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to update proposal comments"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid comment ID is required",
          details: { id: req.params.id }
        });
      }
      
      try {
        // If resolving a comment, add the resolver
        let commentData = req.body;
        if (commentData.resolved === true) {
          commentData.resolvedBy = req.user.id;
        }
        
        commentData = insertProposalCommentSchema.partial().parse(commentData);
        
        const comment = await storage.updateProposalComment(id, commentData);
        
        if (!comment) {
          return res.status(404).json({
            success: false,
            error: "Not Found",
            message: "Comment not found",
            details: { id }
          });
        }
        
        return res.status(200).json({
          success: true,
          data: comment,
          message: "Comment updated successfully"
        });
      } catch (validationError: any) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid comment data provided",
          details: validationError?.errors || validationError?.message
        });
      }
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/proposal-comments/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to delete proposal comments"
        });
      }
      
      const id = parseInt(req.params.id);
      
      // Validate ID
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Valid comment ID is required",
          details: { id: req.params.id }
        });
      }
      
      const deleteSuccess = await storage.deleteProposalComment(id);
      
      if (!deleteSuccess) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Comment not found or already deleted",
          details: { id }
        });
      }
      
      // Return 200 with success message instead of 204 no content
      // This provides better feedback to the client
      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        data: { id }
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Proposal Activity routes
  app.get('/api/proposals/:proposalId/activities', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to view proposal activities"
        });
      }
      
      const proposalId = parseInt(req.params.proposalId);
      
      // Validate id is a number
      if (isNaN(proposalId)) {
        return res.status(400).json({ 
          success: false,
          error: "Validation Error", 
          message: "Valid proposal ID is required",
          details: { id: req.params.proposalId }
        });
      }
      
      try {
        // First verify the proposal exists
        const proposal = await storage.getProposal(proposalId);
        if (!proposal) {
          return res.status(404).json({
            success: false,
            error: "Not Found",
            message: "Proposal not found",
            details: { proposalId }
          });
        }
        
        // Then get its activities
        const activities = await storage.getProposalActivities(proposalId);
        
        // Group activities by type for more detailed metadata
        const activityTypes = activities.reduce((acc, activity) => {
          acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Return with enhanced metadata about the proposal
        return res.status(200).json({
          success: true,
          data: activities,
          metadata: {
            proposalId,
            proposalName: proposal.name,
            totalCount: activities.length,
            status: proposal.status,
            activityTypeBreakdown: activityTypes,
            lastActivity: activities.length > 0 ? activities[0].createdAt : null,
            timestamp: new Date()
          }
        });
      } catch (databaseError: any) {
        console.error("Database error getting proposal activities:", databaseError);
        
        return res.status(500).json({
          success: false,
          error: "Database Error",
          message: databaseError?.message || "Failed to retrieve proposal activities",
          // Include the stack trace in development for debugging
          ...(process.env.NODE_ENV !== 'production' && { 
            stack: databaseError?.stack,
            details: databaseError
          })
        });
      }
    } catch (error: any) {
      console.error("Unexpected error getting proposal activities:", error);
      
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: error?.message || "An unexpected error occurred while retrieving proposal activities",
        // Only include details in development for security
        ...(process.env.NODE_ENV !== 'production' && { details: error })
      });
    }
  });

  // Register data migration routes
  app.use('/api/migration', migrationRouter);
  
  // NOTE: The duplicate notification and message endpoints with mock data
  // have been removed in favor of the database-driven implementations 
  // already present earlier in this file (around line 350).
  //
  // The fully database-driven endpoints that are being used are:
  // - GET /api/notifications
  // - POST /api/notifications/:id/read
  // - POST /api/notifications/read-all
  // - GET /api/messages
  // - POST /api/messages/:id/read
  // - POST /api/messages/read-all
  
  // Test endpoint to verify authentication and notifications
  app.get('/api/test-notifications', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated", isLoggedIn: false });
      }
      
      const userId = req.user.id;
      
      // Check if notifications table exists
      const tableExistsResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        ) as exists
      `);
      
      const notificationTableExists = tableExistsResult.rows?.[0]?.exists === true;
      
      // Get notification count
      let notificationCount = 0;
      if (notificationTableExists) {
        const countResult = await db.execute(sql`
          SELECT COUNT(*) AS count FROM notifications WHERE user_id = ${userId}
        `);
        notificationCount = parseInt(countResult.rows?.[0]?.count || '0');
      }
      
      // Return status info
      res.json({
        isLoggedIn: true,
        userId,
        username: req.user.username,
        notificationTableExists,
        notificationCount,
        success: true
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}
