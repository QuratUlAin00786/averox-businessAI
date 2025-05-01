import { Request, Response } from 'express';
import { storage } from './storage';
import { users, apiKeys, apiProviderEnum, SystemSettings, systemSettings } from '@shared/schema';
import { hashPassword } from './auth';
import { z } from 'zod';
import { db, pool } from './db';
import { eq } from 'drizzle-orm';

// Define validation schemas for setup data
const CompanyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string(),
  size: z.string(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string()
});

const ApiKeysSchema = z.object({
  openAiKey: z.string().min(1, "OpenAI API key is required"),
  stripeKey: z.string().min(1, "Stripe Secret key is required"),
  stripePublicKey: z.string().min(1, "Stripe Public key is required"),
  sendgridKey: z.string().optional()
});

const FeaturesSchema = z.object({
  leadManagement: z.boolean(),
  contactManagement: z.boolean(),
  opportunityTracking: z.boolean(),
  accountManagement: z.boolean(),
  taskManagement: z.boolean(),
  calendarEvents: z.boolean(),
  invoicing: z.boolean(),
  reporting: z.boolean(),
  marketingAutomation: z.boolean(),
  aiAssistant: z.boolean(),
  eCommerce: z.boolean(),
  supportTickets: z.boolean()
});

const UserSettingsSchema = z.object({
  createDemoData: z.boolean(),
  enableOnboarding: z.boolean(),
  dataPrivacy: z.enum(["company", "private", "shared"]),
  defaultDateFormat: z.string()
});

const IntegrationsSchema = z.object({
  microsoftOutlook: z.boolean(),
  googleWorkspace: z.boolean(),
  slack: z.boolean(),
  zoom: z.boolean(),
  zapier: z.boolean(),
  webhooks: z.boolean()
});

const SetupSchema = z.object({
  companyInfo: CompanyInfoSchema,
  apiKeys: ApiKeysSchema,
  features: FeaturesSchema,
  userSettings: UserSettingsSchema,
  integrations: IntegrationsSchema
});

export function setupRoutes(app: any) {
  /**
   * Initialize the application with setup data
   * POST /api/setup/initialize
   */
  app.post('/api/setup/initialize', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          success: false,
          error: "Not authenticated",
          message: "You must be logged in to complete setup" 
        });
      }
      
      const user = req.user;
      if (user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          error: "Forbidden",
          message: "Only administrators can complete system setup"
        });
      }
      
      // Validate the setup data
      const validationResult = SetupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid setup data provided",
          details: validationResult.error.format()
        });
      }
      
      const setupData = validationResult.data;
      
      // Begin setup process
      try {
        // 1. Save system settings with menu visibility based on selected features
        try {
          // Due to typing constraints, we'll create the settings object this way
          await storage.saveSystemSettings(user.id, {
            menuVisibility: {
              leads: setupData.features.leadManagement,
              contacts: setupData.features.contactManagement,
              opportunities: setupData.features.opportunityTracking,
              accounts: setupData.features.accountManagement,
              tasks: setupData.features.taskManagement,
              calendar: setupData.features.calendarEvents,
              communicationCenter: true,
              accounting: setupData.features.invoicing,
              inventory: true,
              manufacturing: true,
              supportTickets: setupData.features.supportTickets,
              ecommerce: setupData.features.eCommerce,
              ecommerceStore: setupData.features.eCommerce,
              reports: setupData.features.reporting,
              intelligence: setupData.features.aiAssistant,
              workflows: setupData.features.marketingAutomation,
              subscriptions: true,
              training: true
            },
            dashboardPreferences: {
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
              showAIInsights: setupData.features.aiAssistant,
              aiInsightTypes: ['all'] as any,
              aiInsightsCount: 3
            }
          });
          
          // 2. Also save company information as a system setting
          const settingValue = {
            companyName: setupData.companyInfo.name,
            companyIndustry: setupData.companyInfo.industry,
            companySize: setupData.companyInfo.size,
            companyWebsite: setupData.companyInfo.website,
            companyAddress: setupData.companyInfo.address,
            companyCity: setupData.companyInfo.city,
            companyState: setupData.companyInfo.state,
            companyCountry: setupData.companyInfo.country,
            companyPostalCode: setupData.companyInfo.postalCode,
            companyPhone: setupData.companyInfo.phoneNumber,
            timezone: setupData.companyInfo.timezone,
            dateFormat: setupData.userSettings.defaultDateFormat,
            dataPrivacy: setupData.userSettings.dataPrivacy,
            setupComplete: true,
            enableOnboarding: setupData.userSettings.enableOnboarding
          };
          
          // Save company information as a system setting using Drizzle ORM
          await db.insert(systemSettings).values({
            userId: user.id,
            settingKey: 'companyInfo',
            settingValue: JSON.stringify(settingValue),
            scope: 'global'
          });
            
          console.log('Company information saved successfully');
          
          // Mark setup as complete using Drizzle ORM
          await db.insert(systemSettings).values({
            userId: user.id,
            settingKey: 'setupStatus',
            settingValue: JSON.stringify({
              complete: true,
              completedAt: new Date().toISOString()
            }),
            scope: 'global'
          });
            
          console.log('Setup marked as complete');
          
        } catch (settingsError) {
          console.error('Error saving system settings:', settingsError);
          // Continue with the rest of the setup process
        }
        
        // 2. Store API keys
        // OpenAI API Key
        await storage.createApiKey({
          name: "OpenAI API Key",
          key: setupData.apiKeys.openAiKey,
          provider: "OpenAI",
          isActive: true,
          ownerId: user.id,
          userId: user.id
        });
        
        // Stripe Secret Key
        await storage.createApiKey({
          name: "Stripe Secret Key",
          key: setupData.apiKeys.stripeKey,
          provider: "Stripe",
          isActive: true,
          ownerId: user.id,
          userId: user.id
        });
        
        // Stripe Public Key (stored in env vars and settings)
        process.env.VITE_STRIPE_PUBLIC_KEY = setupData.apiKeys.stripePublicKey;
        
        // SendGrid API Key (optional)
        if (setupData.apiKeys.sendgridKey) {
          await storage.createApiKey({
            name: "SendGrid API Key",
            key: setupData.apiKeys.sendgridKey,
            provider: "Other",
            isActive: true,
            ownerId: user.id,
            userId: user.id
          });
        }
        
        // 3. Create demo data if requested
        if (setupData.userSettings.createDemoData) {
          try {
            // Load the module first
            const demoDataModule = await import('./create-demo-users');
            
            // Use any available demo data creation function
            // TypeScript doesn't know which functions exist at compile time, so
            // we check at runtime
            const moduleAny = demoDataModule as any;
            
            if (typeof moduleAny.createDemoUsers === 'function') {
              await moduleAny.createDemoUsers();
              console.log("Demo users created successfully");
            } else if (typeof moduleAny.createDemoAccounts === 'function') {
              await moduleAny.createDemoAccounts();
              console.log("Demo accounts created successfully");
            } else {
              console.warn("No demo data creation function found in create-demo-users module");
            }
          } catch (demoError) {
            console.error("Error creating demo data:", demoError);
            // Continue with setup even if demo data creation fails
          }
        }
        
        // 4. Update company information on the admin user
        // Note: We need to update the user in the database directly since
        // the 'company' field isn't part of the standard InsertUser schema
        try {
          await db.update(users)
            .set({ company: setupData.companyInfo.name })
            .where(eq(users.id, user.id));
          
          console.log(`Updated company information for user ID ${user.id}`);
        } catch (updateError) {
          console.error("Error updating company information:", updateError);
          // Continue with setup even if company update fails
        }
        
        return res.status(200).json({
          success: true,
          message: "Setup completed successfully"
        });
        
      } catch (setupError) {
        console.error("Error during setup process:", setupError);
        return res.status(500).json({
          success: false,
          error: "Setup Error",
          message: "An error occurred during the setup process",
          details: setupError instanceof Error ? setupError.message : String(setupError)
        });
      }
      
    } catch (error) {
      console.error("Unexpected error in setup endpoint:", error);
      return res.status(500).json({
        success: false,
        error: "Server Error",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  /**
   * Check if setup is complete
   * GET /api/setup/status
   */
  app.get('/api/setup/status', async (req: Request, res: Response) => {
    try {
      // Check setup status directly from database
      const result = await pool.query(`
        SELECT setting_value 
        FROM system_settings 
        WHERE setting_key = 'setupStatus' 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      // Default to false if no setup status is found
      let setupComplete = false;
      
      if (result.rows.length > 0) {
        try {
          // Parse the setting value
          const settingValue = JSON.parse(result.rows[0].setting_value);
          setupComplete = settingValue?.complete || false;
        } catch (parseError) {
          console.error("Error parsing setup status:", parseError);
        }
      }
      
      return res.status(200).json({
        setupComplete,
        setupRequired: !setupComplete
      });
    } catch (error) {
      console.error("Error checking setup status:", error);
      // If there's an error, assume setup is required
      return res.status(200).json({
        setupComplete: false,
        setupRequired: true,
        error: "Could not determine setup status"
      });
    }
  });
}