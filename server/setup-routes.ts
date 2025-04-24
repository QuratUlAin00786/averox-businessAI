import { Request, Response } from 'express';
import { storage } from './storage';
import { users, apiKeys, apiProviderEnum } from '@shared/schema';
import { hashPassword } from './auth';
import { z } from 'zod';

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
        // 1. Save company information as system settings
        const systemSettings = {
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
          menuVisibility: {
            leads: setupData.features.leadManagement,
            contacts: setupData.features.contactManagement,
            opportunities: setupData.features.opportunityTracking,
            accounts: setupData.features.accountManagement,
            tasks: setupData.features.taskManagement,
            calendar: setupData.features.calendarEvents,
            invoices: setupData.features.invoicing,
            reports: setupData.features.reporting,
            marketing: setupData.features.marketingAutomation,
            intelligence: setupData.features.aiAssistant,
            ecommerce: setupData.features.eCommerce,
            ecommerceStore: setupData.features.eCommerce,
            support: setupData.features.supportTickets,
            communicationCenter: true,
            accounting: setupData.features.invoicing,
            inventory: true,
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
            pipelineChartType: 'pie' as const,
            revenueChartType: 'line' as const,
            leadsChartType: 'line' as const,
            defaultTimeRange: 'month' as const,
            showAIInsights: setupData.features.aiAssistant,
            aiInsightTypes: ['all'],
            aiInsightsCount: 3
          },
          enableOnboarding: setupData.userSettings.enableOnboarding
        };
        
        await storage.saveSystemSettings(user.id, systemSettings);
        
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
            // Import the demo data creation script
            const { createDemoAccounts } = await import('./create-demo-users');
            await createDemoAccounts();
          } catch (demoError) {
            console.error("Error creating demo data:", demoError);
            // Continue with setup even if demo data creation fails
          }
        }
        
        // 4. Update company information on the admin user
        await storage.updateUser(user.id, {
          company: setupData.companyInfo.name
        });
        
        // 5. Mark setup as complete in system settings
        await storage.saveSystemSettings({ setupComplete: true });
        
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
      const systemSettings = await storage.getSystemSettings();
      const setupComplete = systemSettings?.setupComplete || false;
      
      return res.status(200).json({
        setupComplete,
        setupRequired: !setupComplete
      });
    } catch (error) {
      console.error("Error checking setup status:", error);
      return res.status(500).json({
        error: "Server Error",
        message: "An error occurred while checking setup status"
      });
    }
  });
}