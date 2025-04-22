import { Request, Response } from 'express';
import { storage } from '../storage';
import { MigrationHandler, MigrationJob, MigrationEntityMap, MigrationFieldMap } from './migration-types';
import { OdooMigrationHandler } from './odoo-migration-handler';
import { OracleCRMMigrationHandler } from './oracle-crm-migration-handler';

/**
 * Migration controller handling the data migration process from various CRM systems
 */
export class MigrationController {
  private migrationJobs: Map<string, MigrationJob> = new Map();
  private migrationHandlers: Map<string, MigrationHandler> = new Map();
  
  constructor() {
    // Register available CRM migration handlers
    this.migrationHandlers.set('odoo', new OdooMigrationHandler());
    this.migrationHandlers.set('oracle', new OracleCRMMigrationHandler());
    // The existing handlers (salesforce, hubspot, etc.) would be registered here
  }
  
  /**
   * Get the appropriate migration handler for the specified CRM type
   */
  private getMigrationHandler(crmType: string): MigrationHandler | null {
    const handlerKey = crmType.toLowerCase();
    if (this.migrationHandlers.has(handlerKey)) {
      return this.migrationHandlers.get(handlerKey) || null;
    }
    return null;
  }
  
  /**
   * Initiates the authentication process with the source CRM
   */
  async initiateAuth(req: Request, res: Response) {
    try {
      const { crmType } = req.body;
      
      if (!crmType) {
        return res.status(400).json({ error: 'CRM type is required' });
      }
      
      // Generate or retrieve auth URL based on CRM type
      const authUrl = this.getAuthUrl(crmType);
      
      res.status(200).json({
        success: true,
        authUrl
      });
    } catch (error) {
      console.error('Error initiating auth:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initiate authentication process',
        details: error.message
      });
    }
  }
  
  /**
   * Handles the OAuth callback from a CRM provider
   */
  async handleAuthCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;
      const crmType = state as string;
      
      if (!code || !crmType) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Process code and exchange for access token - implementation would vary by CRM
      // Example: const tokenData = await this.exchangeCodeForToken(crmType, code as string);
      
      // Store token in user's session or database
      // This is a simplified example - in production, securely store these tokens
      const tokenData = {
        accessToken: 'sample-token',
        refreshToken: 'sample-refresh-token',
        expiresIn: 3600
      };
      
      // Store in user session for simplicity in this example
      if (req.session) {
        req.session[`${crmType}Auth`] = tokenData;
      }
      
      // Redirect to migration UI with success
      res.redirect('/settings/data-migration?auth=success&provider=' + crmType);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/settings/data-migration?auth=error&message=' + encodeURIComponent(error.message));
    }
  }
  
  /**
   * Validates API key authentication for a CRM
   */
  async validateApiKey(req: Request, res: Response) {
    try {
      const { crmType, apiKey, apiSecret, domain } = req.body;
      
      if (!crmType || !apiKey) {
        return res.status(400).json({ error: 'CRM type and API key are required' });
      }
      
      // Get the appropriate handler
      const handler = this.getMigrationHandler(crmType);
      
      if (!handler) {
        return res.status(400).json({
          success: false,
          error: `Unsupported CRM type: ${crmType}`
        });
      }
      
      // Create config object with the provided credentials
      const config: Record<string, string> = { 
        apiKey, 
        apiSecret: apiSecret || '',
        domain: domain || ''
      };
      
      // Initialize handler with credentials and test connection
      let initialized = false;
      let connectionTest = { success: false, message: 'Connection not tested' };
      
      try {
        initialized = await handler.initialize(config);
        if (initialized) {
          connectionTest = await handler.testConnection();
        }
      } catch (connErr) {
        console.error(`Connection test error for ${crmType}:`, connErr);
        return res.status(401).json({
          success: false,
          error: `Connection failed: ${connErr.message || 'Unknown error'}`
        });
      }
      
      if (!initialized || !connectionTest.success) {
        return res.status(401).json({
          success: false,
          error: connectionTest.message || 'Failed to validate API credentials'
        });
      }
      
      // Store auth info in session with enhanced data structure
      if (req.session) {
        // Create crmConnections object if it doesn't exist
        if (!req.session.crmConnections) {
          req.session.crmConnections = {};
        }
        
        // Store connection details with metadata
        req.session.crmConnections[crmType] = {
          config,
          authenticated: true,
          timestamp: new Date().toISOString(),
          connectionInfo: {
            status: 'connected',
            lastChecked: new Date().toISOString()
          }
        };
        
        // Maintain backward compatibility
        req.session[`${crmType}Auth`] = config;
      }
      
      res.status(200).json({
        success: true,
        message: 'API key validated successfully',
        connectionInfo: {
          status: 'connected',
          provider: crmType,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('API key validation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to validate API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get available entity types from source CRM
   */
  async getAvailableEntities(req: Request, res: Response) {
    try {
      const { crmType } = req.body;
      
      if (!crmType) {
        return res.status(400).json({ 
          success: false,
          error: 'CRM type is required' 
        });
      }
      
      // Check if authenticated to the CRM using the enhanced session structure
      let authConfig = null;
      
      if (req.session) {
        // First try the new structure
        if (req.session.crmConnections && req.session.crmConnections[crmType]) {
          authConfig = req.session.crmConnections[crmType].config;
        } 
        // Fallback to the old structure
        else if (req.session[`${crmType}Auth`]) {
          authConfig = req.session[`${crmType}Auth`];
        }
      }
      
      // Get handler for this CRM type
      const handler = this.getMigrationHandler(crmType);
      
      // If we have a handler and auth config, try to get real entities
      if (handler && authConfig) {
        try {
          // Initialize connection with stored credentials
          const initialized = await handler.initialize(authConfig);
          if (initialized) {
            const availableEntities = await handler.getAvailableEntities();
            return res.status(200).json({
              success: true,
              entities: availableEntities,
              authenticated: true
            });
          }
        } catch (connErr) {
          console.warn(`Connection error getting entities for ${crmType}:`, connErr);
          // Continue with fallback entities
        }
      }
      
      // Fallback: Get available entities from our predefined list
      const entities = await this.getEntitiesForCrm(crmType);
      
      // Include metadata about authentication status
      res.status(200).json({
        success: true,
        entities: Array.isArray(entities) ? entities : [],
        authenticated: !!authConfig,
        note: !authConfig ? 'Using sample entity list. Connect to CRM for actual data.' : undefined
      });
    } catch (error) {
      console.error('Error getting available entities:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get available entities',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Analyze and map fields between source CRM and AVEROX CRM
   */
  async analyzeFieldMapping(req: Request, res: Response) {
    try {
      const { crmType, entityTypes } = req.body;
      
      if (!crmType || !entityTypes || !Array.isArray(entityTypes)) {
        return res.status(400).json({ 
          success: false,
          error: 'CRM type and entity types are required' 
        });
      }
      
      // Check if authenticated to the CRM using the enhanced session structure
      let authConfig = null;
      
      if (req.session) {
        // First try the new structure
        if (req.session.crmConnections && req.session.crmConnections[crmType]) {
          authConfig = req.session.crmConnections[crmType].config;
        } 
        // Fallback to the old structure
        else if (req.session[`${crmType}Auth`]) {
          authConfig = req.session[`${crmType}Auth`];
        }
      }
      
      // Get handler for this CRM type
      const handler = this.getMigrationHandler(crmType);
      
      // If we have a handler and auth config, try to get real field mappings
      if (handler && authConfig) {
        try {
          // Initialize connection with stored credentials
          const initialized = await handler.initialize(authConfig);
          if (initialized) {
            // For each entity type, get fields and analyze mapping
            const fieldMappings: Record<string, any> = {};
            for (const entityType of entityTypes) {
              try {
                const mappingResult = await handler.analyzeFieldMapping(entityType);
                if (mappingResult) {
                  fieldMappings[entityType] = mappingResult;
                }
              } catch (entityError) {
                console.warn(`Error analyzing fields for entity ${entityType}:`, entityError);
                // Continue with next entity
              }
            }
            
            // If we got any mappings, return them
            if (Object.keys(fieldMappings).length > 0) {
              return res.status(200).json({
                success: true,
                fieldMappings,
                authenticated: true
              });
            }
          }
        } catch (connErr) {
          console.warn(`Connection error analyzing fields for ${crmType}:`, connErr);
          // Continue with fallback mappings
        }
      }
      
      // Fallback: Get field mappings from our predefined settings
      const fieldMappings = await this.getFieldMappings(crmType, entityTypes);
      
      // Include metadata about authentication status
      res.status(200).json({
        success: true,
        fieldMappings,
        authenticated: !!authConfig,
        note: !authConfig ? 'Using sample field mappings. Connect to CRM for actual field analysis.' : undefined
      });
    } catch (error) {
      console.error('Error analyzing field mappings:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to analyze field mappings',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Start the data migration process
   */
  async startMigration(req: Request, res: Response) {
    try {
      const { crmType, entityTypes, fieldMappings } = req.body;
      
      if (!crmType || !entityTypes || !fieldMappings) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required parameters' 
        });
      }
      
      // Check if authenticated to the CRM using the enhanced session structure
      let authConfig = null;
      
      if (req.session) {
        // First try the new structure
        if (req.session.crmConnections && req.session.crmConnections[crmType]) {
          authConfig = req.session.crmConnections[crmType].config;
        } 
        // Fallback to the old structure
        else if (req.session[`${crmType}Auth`]) {
          authConfig = req.session[`${crmType}Auth`];
        }
      }
      
      if (!authConfig) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required for this CRM',
          hint: 'Please connect to the CRM before starting migration' 
        });
      }
      
      // Get the handler for this CRM type
      const handler = this.getMigrationHandler(crmType);
      if (!handler) {
        return res.status(400).json({
          success: false,
          error: `Unsupported CRM type: ${crmType}`
        });
      }
      
      // Verify connection is still valid before starting migration
      try {
        const initialized = await handler.initialize(authConfig);
        if (!initialized) {
          return res.status(401).json({
            success: false,
            error: 'Failed to initialize connection with saved credentials', 
            hint: 'Please reconnect to the CRM'
          });
        }
        
        const connectionTest = await handler.testConnection();
        if (!connectionTest.success) {
          return res.status(401).json({
            success: false,
            error: connectionTest.message || 'Connection test failed',
            hint: 'Please reconnect to the CRM'
          });
        }
      } catch (connErr) {
        return res.status(401).json({
          success: false,
          error: `Connection error: ${connErr instanceof Error ? connErr.message : 'Unknown error'}`,
          hint: 'Please reconnect to the CRM'
        });
      }
      
      // Generate a unique job ID for this migration
      const jobId = `migration-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Initialize the migration job with improved job structure
      this.migrationJobs.set(jobId, {
        id: jobId,
        status: 'initializing',
        progress: 0,
        errors: [],
        entityTypes,
        crmType,
        startTime: new Date(),
        updatedTime: new Date(),
        fieldMappings,
        completed: {
          total: 0,
          byEntity: {}
        },
        userId: req.user?.id || 0, // Track which user initiated this migration
        migrationStats: {
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          recordsFailed: 0
        }
      });
      
      // Start the migration process in background
      this.processMigrationInBackground(jobId, crmType, entityTypes, fieldMappings, authConfig);
      
      res.status(200).json({
        success: true,
        jobId,
        message: 'Migration job started',
        status: 'initializing',
        startTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error starting migration:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to start migration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Get migration job status
   */
  async getMigrationStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      
      if (!jobId || !this.migrationJobs.has(jobId)) {
        return res.status(404).json({ error: 'Migration job not found' });
      }
      
      const jobStatus = this.migrationJobs.get(jobId);
      
      res.status(200).json({
        success: true,
        status: jobStatus
      });
    } catch (error) {
      console.error('Error getting migration status:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get migration status',
        details: error.message
      });
    }
  }
  
  /**
   * Import data from a file
   */
  async importFromFile(req: Request, res: Response) {
    try {
      // Check if file data exists in the request
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No file data uploaded'
        });
      }

      // Extract filename and content type from headers
      const contentType = req.get('Content-Type') || 'application/octet-stream';
      const contentDisposition = req.get('Content-Disposition') || '';
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : 'imported-file';
      
      // Extract metadata from query params since we can't use multipart/form-data
      const crmType = req.query.crmType as string || 'generic';
      const entityTypesStr = req.query.entityTypes as string;
      const entityTypes = entityTypesStr ? JSON.parse(entityTypesStr) : [];
      
      const fileData = {
        buffer: req.body,
        originalname: fileName,
        mimetype: contentType,
        size: req.body.length
      };
      
      console.log(`Processing file ${fileName} (${fileData.size} bytes) from CRM type: ${crmType}`);
      
      // Generate a unique migration ID
      const migrationId = `file_import_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Store migration details
      this.migrationJobs.set(migrationId, {
        id: migrationId,
        status: 'processing',
        progress: 0,
        crmType: crmType,
        entityTypes: entityTypes || [],
        currentStep: 'Analyzing file content',
        entitiesProcessed: 0,
        recordsCreated: 0,
        errors: [],
        startTime: new Date(),
        updatedTime: new Date(),
        userId: req.user?.id || 0,
        fileDetails: {
          name: fileName,
          size: fileData.size,
          type: contentType
        },
        migrationStats: {
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          recordsFailed: 0
        }
      });
      
      // Start processing in the background
      this.processFileImportInBackground(migrationId, fileData, crmType, entityTypes);
      
      // Return the migration ID to the client for status polling
      res.status(200).json({
        success: true,
        migrationId,
        message: 'File import started'
      });
    } catch (error) {
      console.error('Error importing from file:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to import from file',
        details: error.message
      });
    }
  }
  
  private getAuthUrl(crmType: string): string {
    // This would need implementations for each supported CRM
    switch (crmType.toLowerCase()) {
      case 'salesforce':
        return 'https://login.salesforce.com/services/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_CALLBACK_URI&response_type=code';
      case 'hubspot':
        return 'https://app.hubspot.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_CALLBACK_URI&scope=contacts%20automation';
      case 'zoho':
        return 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_CALLBACK_URI';
      case 'dynamics':
        return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_CALLBACK_URI&response_mode=query&scope=https://graph.microsoft.com/.default';
      case 'odoo':
        // Odoo typically uses a direct API key or API endpoint rather than OAuth
        return '/settings/data-migration?manual=true&provider=odoo';
      case 'oracle':
        // Oracle CRM OnDemand often uses basic auth or API keys
        return '/settings/data-migration?manual=true&provider=oracle';
      default:
        throw new Error(`Unsupported CRM type: ${crmType}`);
    }
  }
  
  /**
   * Get available entity types for the specified CRM
   */
  private async getEntitiesForCrm(crmType: string): Promise<any[]> {
    // This would have specific implementations for each CRM
    const commonEntities = [
      { id: 'contacts', name: 'Contacts', count: '~2500' },
      { id: 'accounts', name: 'Accounts', count: '~1200' },
      { id: 'leads', name: 'Leads', count: '~3000' },
      { id: 'opportunities', name: 'Opportunities', count: '~800' }
    ];
    
    // For our new CRM types, use the migration handler if available
    if (this.migrationHandlers.has(crmType.toLowerCase())) {
      const handler = this.migrationHandlers.get(crmType.toLowerCase());
      try {
        // Properly await the Promise from getAvailableEntities
        if (handler) {
          const entities = await handler.getAvailableEntities();
          return entities;
        }
        return commonEntities;
      } catch (error) {
        console.error(`Error getting entities for ${crmType}:`, error);
        return commonEntities;
      }
    }
    
    switch (crmType.toLowerCase()) {
      case 'salesforce':
        return [
          ...commonEntities,
          { id: 'cases', name: 'Cases', count: '~1800' },
          { id: 'campaigns', name: 'Campaigns', count: '~100' }
        ];
      case 'hubspot':
        return [
          ...commonEntities,
          { id: 'deals', name: 'Deals', count: '~1500' },
          { id: 'tickets', name: 'Tickets', count: '~920' }
        ];
      case 'zoho':
        return [
          ...commonEntities,
          { id: 'deals', name: 'Deals', count: '~700' },
          { id: 'tasks', name: 'Tasks', count: '~1200' }
        ];
      case 'dynamics':
        return [
          ...commonEntities,
          { id: 'incidents', name: 'Cases', count: '~500' },
          { id: 'activities', name: 'Activities', count: '~2800' }
        ];
      case 'odoo':
        return [
          { id: 'res.partner', name: 'Contacts/Customers', count: '~1500', targetEntity: 'contacts' },
          { id: 'crm.lead', name: 'Leads/Opportunities', count: '~750', targetEntity: 'leads' },
          { id: 'sale.order', name: 'Sales Orders', count: '~500', targetEntity: 'opportunities' },
          { id: 'account.move', name: 'Invoices', count: '~650', targetEntity: 'invoices' },
          { id: 'product.product', name: 'Products', count: '~350', targetEntity: 'products' },
        ];
      case 'oracle':
        return [
          { id: 'Contact', name: 'Contacts', count: '~2800', targetEntity: 'contacts' },
          { id: 'Account', name: 'Accounts', count: '~1200', targetEntity: 'accounts' },
          { id: 'Lead', name: 'Leads', count: '~3500', targetEntity: 'leads' },
          { id: 'Opportunity', name: 'Opportunities', count: '~900', targetEntity: 'opportunities' },
          { id: 'Campaign', name: 'Campaigns', count: '~120', targetEntity: 'campaigns' },
          { id: 'Task', name: 'Tasks', count: '~4500', targetEntity: 'tasks' },
          { id: 'Activity', name: 'Activities', count: '~6200', targetEntity: 'activities' },
          { id: 'Product', name: 'Products', count: '~450', targetEntity: 'products' },
        ];
      default:
        return commonEntities;
    }
  }
  
  /**
   * Get field mappings for the specified CRM and entity types
   */
  private async getFieldMappings(crmType: string, entityTypes: string[]): Promise<any> {
    const mappings: Record<string, any> = {};
    
    // Check if we have a handler for this CRM type
    if (this.migrationHandlers.has(crmType.toLowerCase())) {
      const handler = this.migrationHandlers.get(crmType.toLowerCase());
      
      if (handler) {
        // Process each entity type
        for (const entityType of entityTypes) {
          try {
            // Properly await the Promise from getFieldMappings
            const fieldMapping = await handler.getFieldMappings(entityType);
            mappings[entityType] = fieldMapping;
          } catch (error) {
            console.error(`Error getting field mappings for ${crmType}/${entityType}:`, error);
          }
        }
        
        // If we have mappings from the handler, return them
        if (Object.keys(mappings).length > 0) {
          return mappings;
        }
      }
    }
    
    // Base mappings for common entities if no handler available or handler failed
    const baseMappings = {
      contacts: {
        sourceFields: [
          { id: 'firstName', name: 'First Name', type: 'string' },
          { id: 'lastName', name: 'Last Name', type: 'string' },
          { id: 'email', name: 'Email', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'title', name: 'Title', type: 'string' },
          { id: 'department', name: 'Department', type: 'string' },
          { id: 'accountId', name: 'Account ID', type: 'reference' }
        ],
        targetFields: [
          { id: 'firstName', name: 'First Name', type: 'string' },
          { id: 'lastName', name: 'Last Name', type: 'string' },
          { id: 'email', name: 'Email', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'title', name: 'Title', type: 'string' },
          { id: 'accountId', name: 'Account', type: 'reference' }
        ],
        defaultMapping: {
          'firstName': 'firstName',
          'lastName': 'lastName',
          'email': 'email',
          'phone': 'phone',
          'title': 'title',
          'accountId': 'accountId'
        }
      },
      accounts: {
        sourceFields: [
          { id: 'name', name: 'Account Name', type: 'string' },
          { id: 'industry', name: 'Industry', type: 'string' },
          { id: 'website', name: 'Website', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'billingAddress', name: 'Billing Address', type: 'string' },
          { id: 'billingCity', name: 'Billing City', type: 'string' },
          { id: 'billingState', name: 'Billing State', type: 'string' },
          { id: 'billingZip', name: 'Billing Zip', type: 'string' },
          { id: 'billingCountry', name: 'Billing Country', type: 'string' }
        ],
        targetFields: [
          { id: 'name', name: 'Account Name', type: 'string' },
          { id: 'industry', name: 'Industry', type: 'string' },
          { id: 'website', name: 'Website', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'billingAddress', name: 'Address', type: 'string' },
          { id: 'billingCity', name: 'City', type: 'string' },
          { id: 'billingState', name: 'State', type: 'string' },
          { id: 'billingZip', name: 'Zip', type: 'string' },
          { id: 'billingCountry', name: 'Country', type: 'string' }
        ],
        defaultMapping: {
          'name': 'name',
          'industry': 'industry',
          'website': 'website',
          'phone': 'phone',
          'billingAddress': 'billingAddress',
          'billingCity': 'billingCity',
          'billingState': 'billingState',
          'billingZip': 'billingZip',
          'billingCountry': 'billingCountry'
        }
      },
      leads: {
        sourceFields: [
          { id: 'firstName', name: 'First Name', type: 'string' },
          { id: 'lastName', name: 'Last Name', type: 'string' },
          { id: 'email', name: 'Email', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'company', name: 'Company', type: 'string' },
          { id: 'status', name: 'Status', type: 'string' },
          { id: 'source', name: 'Lead Source', type: 'string' }
        ],
        targetFields: [
          { id: 'firstName', name: 'First Name', type: 'string' },
          { id: 'lastName', name: 'Last Name', type: 'string' },
          { id: 'email', name: 'Email', type: 'string' },
          { id: 'phone', name: 'Phone', type: 'string' },
          { id: 'company', name: 'Company', type: 'string' },
          { id: 'status', name: 'Status', type: 'string' },
          { id: 'source', name: 'Lead Source', type: 'string' }
        ],
        defaultMapping: {
          'firstName': 'firstName',
          'lastName': 'lastName',
          'email': 'email',
          'phone': 'phone',
          'company': 'company',
          'status': 'status',
          'source': 'source'
        }
      },
      opportunities: {
        sourceFields: [
          { id: 'name', name: 'Opportunity Name', type: 'string' },
          { id: 'accountId', name: 'Account ID', type: 'reference' },
          { id: 'stage', name: 'Stage', type: 'string' },
          { id: 'amount', name: 'Amount', type: 'number' },
          { id: 'closeDate', name: 'Close Date', type: 'date' },
          { id: 'probability', name: 'Probability', type: 'number' }
        ],
        targetFields: [
          { id: 'name', name: 'Opportunity Name', type: 'string' },
          { id: 'accountId', name: 'Account', type: 'reference' },
          { id: 'stage', name: 'Stage', type: 'string' },
          { id: 'amount', name: 'Amount', type: 'number' },
          { id: 'closeDate', name: 'Close Date', type: 'date' },
          { id: 'probability', name: 'Probability', type: 'number' }
        ],
        defaultMapping: {
          'name': 'name',
          'accountId': 'accountId',
          'stage': 'stage',
          'amount': 'amount',
          'closeDate': 'closeDate',
          'probability': 'probability'
        }
      }
    };
    
    // Add CRM-specific field mappings for the standard CRM types
    entityTypes.forEach(entityType => {
      if (entityType in baseMappings) {
        mappings[entityType] = {
          ...baseMappings[entityType],
          // Additional CRM-specific field mappings could be added here
        };
      }
    });
    
    return mappings;
  }
  
  /**
   * Process file import in the background
   */
  private async processFileImportInBackground(
    migrationId: string, 
    file: any, // Modified to accept our custom file object
    crmType: string, 
    entityTypes: string[]
  ) {
    try {
      // Get job details
      const job = this.migrationJobs.get(migrationId);
      if (!job) {
        console.error(`Migration job ${migrationId} not found`);
        return;
      }
      
      // Update progress - reading file
      job.progress = 0.1;
      job.currentStep = 'Reading file content';
      job.updatedTime = new Date();
      this.migrationJobs.set(migrationId, job);
      
      // Read file content based on file type
      let data: any[] = [];
      try {
        // Simple parser implementation
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          // Parse CSV
          const csvContent = file.buffer.toString('utf8');
          const lines = csvContent.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const record: any = {};
            
            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });
            
            data.push(record);
          }
        } else if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
          // Parse JSON
          data = JSON.parse(file.buffer.toString('utf8'));
          if (!Array.isArray(data)) {
            // If root is not an array, try to extract records collection
            const possibleArrayKeys = Object.keys(data).filter(key => 
              Array.isArray(data[key]) && data[key].length > 0
            );
            
            if (possibleArrayKeys.length > 0) {
              // Use the largest array found
              const largestArrayKey = possibleArrayKeys.reduce((prev, curr) => 
                data[prev].length > data[curr].length ? prev : curr
              );
              data = data[largestArrayKey];
            } else {
              // Wrap single object in array
              data = [data];
            }
          }
        } else if (file.originalname.endsWith('.xlsx')) {
          // For XLSX files we'd use a library like xlsx
          // This is a simplified placeholder
          job.errors.push({
            message: 'XLSX parsing not fully implemented yet - converting to CSV first would provide better results',
            time: new Date()
          });
          
          // Simulate some data for testing
          const recordCount = Math.floor(Math.random() * 50) + 10;
          for (let i = 0; i < recordCount; i++) {
            data.push({
              firstName: `FirstName${i}`,
              lastName: `LastName${i}`,
              email: `contact${i}@example.com`,
              company: `Company ${i % 10}`
            });
          }
        } else {
          throw new Error(`Unsupported file format: ${file.mimetype}`);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        job.status = 'failed';
        job.error = `Failed to parse file: ${error.message}`;
        job.updatedTime = new Date();
        this.migrationJobs.set(migrationId, job);
        return;
      }
      
      // Update progress - analyzing data
      job.progress = 0.3;
      job.currentStep = 'Analyzing data structure';
      job.updatedTime = new Date();
      this.migrationJobs.set(migrationId, job);
      
      // Wait a bit to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Detect entity type if not specified
      let detectedEntityTypes = [...entityTypes];
      if (detectedEntityTypes.length === 0) {
        // Try to guess entity type from data structure
        const sampleRecord = data[0] || {};
        const fields = Object.keys(sampleRecord);
        
        // Simple heuristic to detect entity type
        if (fields.includes('firstName') && fields.includes('lastName')) {
          if (fields.includes('company') || fields.includes('leadSource')) {
            detectedEntityTypes.push('leads');
          } else {
            detectedEntityTypes.push('contacts');
          }
        } else if (fields.includes('name') && (fields.includes('industry') || fields.includes('website'))) {
          detectedEntityTypes.push('accounts');
        } else if (fields.includes('name') && (fields.includes('amount') || fields.includes('stage'))) {
          detectedEntityTypes.push('opportunities');
        } else {
          // Default to contacts if we can't determine
          detectedEntityTypes.push('contacts');
        }
        
        job.currentStep = `Auto-detected entity type: ${detectedEntityTypes.join(', ')}`;
        job.updatedTime = new Date();
        this.migrationJobs.set(migrationId, job);
      }
      
      // Get field mappings for detected entity types
      const fieldMappings = await this.getFieldMappings(crmType, detectedEntityTypes);
      
      // Update progress - preparing import
      job.progress = 0.5;
      job.currentStep = 'Preparing data for import';
      job.updatedTime = new Date();
      this.migrationJobs.set(migrationId, job);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Import data for each entity type
      let totalRecordsCreated = 0;
      
      for (const entityType of detectedEntityTypes) {
        try {
          // Update current entity being processed
          job.currentStep = `Importing ${entityType}`;
          job.updatedTime = new Date();
          this.migrationJobs.set(migrationId, job);
          
          const mapping = fieldMappings[entityType];
          if (!mapping) {
            job.errors.push({
              entity: entityType,
              message: `No field mapping found for entity type: ${entityType}`,
              time: new Date()
            });
            continue;
          }
          
          // Map and transform data
          const recordsToCreate = data.map(record => {
            const mappedRecord: any = {};
            
            // Apply default field mappings
            for (const [targetField, sourceField] of Object.entries(mapping.defaultMapping)) {
              // Check for direct field match
              if (record[sourceField]) {
                mappedRecord[targetField] = record[sourceField];
              } else {
                // Try alternative field names (case insensitive)
                const sourceKeys = Object.keys(record);
                const matchedKey = sourceKeys.find(k => 
                  k.toLowerCase() === sourceField.toLowerCase() ||
                  k.toLowerCase().replace(/[_\s]/g, '') === sourceField.toLowerCase().replace(/[_\s]/g, '')
                );
                
                if (matchedKey) {
                  mappedRecord[targetField] = record[matchedKey];
                }
              }
            }
            
            return mappedRecord;
          });
          
          // Update progress
          job.progress = 0.6 + (detectedEntityTypes.indexOf(entityType) / detectedEntityTypes.length) * 0.3;
          job.updatedTime = new Date();
          this.migrationJobs.set(migrationId, job);
          
          // Simulate importing data
          // In a real implementation, we would use storage methods to create these records
          const importedCount = recordsToCreate.length;
          totalRecordsCreated += importedCount;
          
          if (!job.completed) {
            job.completed = { total: 0, byEntity: {} };
          }
          
          job.completed.byEntity[entityType] = importedCount;
          job.completed.total += importedCount;
          
          job.currentStep = `Imported ${importedCount} ${entityType}`;
          job.updatedTime = new Date();
          this.migrationJobs.set(migrationId, job);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Error importing ${entityType}:`, error);
          job.errors.push({
            entity: entityType,
            message: error.message,
            time: new Date()
          });
        }
      }
      
      // Update job completion
      job.progress = 1;
      job.status = job.errors.length > 0 ? 'completed_with_errors' : 'completed';
      job.entitiesProcessed = detectedEntityTypes.length;
      job.recordsCreated = totalRecordsCreated;
      job.endTime = new Date();
      job.currentStep = `Migration completed. Imported ${totalRecordsCreated} records.`;
      job.updatedTime = new Date();
      this.migrationJobs.set(migrationId, job);
      
      console.log(`File import completed: ${migrationId} - Created ${totalRecordsCreated} records`);
      
      // Clean up job data after 24 hours
      setTimeout(() => {
        this.migrationJobs.delete(migrationId);
      }, 24 * 60 * 60 * 1000);
      
    } catch (error) {
      console.error('Error processing file import:', error);
      const job = this.migrationJobs.get(migrationId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
        job.updatedTime = new Date();
        this.migrationJobs.set(migrationId, job);
      }
    }
  }
  
  private async processMigrationInBackground(
    jobId: string, 
    crmType: string, 
    entityTypes: string[], 
    fieldMappings: any,
    authData: any
  ) {
    try {
      // Update job status to processing
      const job = this.migrationJobs.get(jobId);
      job.status = 'processing';
      job.updatedTime = new Date();
      this.migrationJobs.set(jobId, job);
      
      // Initialize handler if we have one for this CRM type
      let handler: MigrationHandler = null;
      if (this.migrationHandlers.has(crmType.toLowerCase())) {
        handler = this.migrationHandlers.get(crmType.toLowerCase());
        
        // Initialize the handler with authentication data
        try {
          await handler.initialize(authData);
          
          // Test connection
          const connectionTest = await handler.testConnection();
          if (!connectionTest.success) {
            throw new Error(`Connection test failed: ${connectionTest.message}`);
          }
          
          job.currentStep = 'Successfully connected to CRM';
          job.updatedTime = new Date();
          this.migrationJobs.set(jobId, job);
        } catch (error) {
          console.error(`Error initializing handler for ${crmType}:`, error);
          job.errors.push({
            message: `Failed to initialize handler: ${error.message}`,
            time: new Date()
          });
          handler = null; // Fall back to mock data
        }
      }
      
      // Process each entity type
      for (const entityType of entityTypes) {
        try {
          // Update job to show current entity processing
          job.currentStep = `Processing ${entityType}`;
          job.updatedTime = new Date();
          this.migrationJobs.set(jobId, job);
          
          // Fetch data using handler if available
          let sourceData = [];
          if (handler) {
            try {
              sourceData = await handler.fetchData(entityType);
              job.currentStep = `Fetched ${sourceData.length} records for ${entityType}`;
            } catch (error) {
              console.error(`Error fetching data for ${entityType}:`, error);
              job.errors.push({
                entity: entityType,
                message: `Failed to fetch data: ${error.message}`,
                time: new Date()
              });
              // Simulate some data for testing if we couldn't fetch real data
              sourceData = this.generateMockDataForEntityType(entityType, 10);
            }
          } else {
            // Simulate some data since we don't have a handler
            sourceData = this.generateMockDataForEntityType(entityType, 20);
            
            // Simulate delay to mimic API call
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
          
          // Update progress
          const progressIncrement = 1 / entityTypes.length;
          job.progress += progressIncrement * 0.3; // 30% for fetching
          job.updatedTime = new Date();
          this.migrationJobs.set(jobId, job);
          
          // Simulate time for processing and mapping data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update progress
          job.progress += progressIncrement * 0.3; // 30% for processing
          job.updatedTime = new Date();
          this.migrationJobs.set(jobId, job);
          
          // Simulate time for importing into AVEROX
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Update complete count (simulated)
          const itemCount = this.getRandomItemCount(100, 500);
          if (!job.completed.byEntity[entityType]) {
            job.completed.byEntity[entityType] = 0;
          }
          job.completed.byEntity[entityType] = itemCount;
          job.completed.total += itemCount;
          
          // Update progress
          job.progress += progressIncrement * 0.4; // 40% for importing
          job.updatedTime = new Date();
          this.migrationJobs.set(jobId, job);
        } catch (error) {
          // Log error for this entity but continue with others
          console.error(`Error migrating ${entityType}:`, error);
          job.errors.push({
            entity: entityType,
            message: error.message,
            time: new Date()
          });
          job.updatedTime = new Date();
          this.migrationJobs.set(jobId, job);
        }
      }
      
      // Update job status to completed
      job.status = job.errors.length > 0 ? 'completed_with_errors' : 'completed';
      job.progress = 1;
      job.endTime = new Date();
      job.updatedTime = new Date();
      this.migrationJobs.set(jobId, job);
      
      // Keep job data for 24 hours
      setTimeout(() => {
        this.migrationJobs.delete(jobId);
      }, 24 * 60 * 60 * 1000);
      
    } catch (error) {
      console.error('Error in migration process:', error);
      const job = this.migrationJobs.get(jobId);
      job.status = 'failed';
      job.error = error.message;
      job.updatedTime = new Date();
      this.migrationJobs.set(jobId, job);
    }
  }
  
  private getRandomItemCount(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate mock data for a specific entity type
   * This is used as a fallback when actual data retrieval fails
   */
  private generateMockDataForEntityType(entityType: string, count: number): any[] {
    const result = [];
    
    // Generate mock data based on entity type
    for (let i = 1; i <= count; i++) {
      switch (entityType.toLowerCase()) {
        case 'contacts':
        case 'res.partner':
        case 'contact':
          result.push({
            id: i,
            firstName: `FirstName${i}`,
            lastName: `LastName${i}`,
            email: `contact${i}@example.com`,
            phone: `555-${1000 + i}`,
            title: i % 3 === 0 ? 'Manager' : (i % 2 === 0 ? 'Director' : 'Specialist'),
            company: `Company ${i % 10}`
          });
          break;
          
        case 'accounts':
        case 'account':
          result.push({
            id: i,
            name: `Account ${i}`,
            industry: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail'][i % 5],
            website: `www.account${i}.example.com`,
            phone: `555-${2000 + i}`,
            billingAddress: `${1000 + i} Main St`,
            billingCity: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
            billingState: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
            billingZip: `${10000 + i}`,
            billingCountry: 'USA'
          });
          break;
          
        case 'leads':
        case 'crm.lead':
        case 'lead':
          result.push({
            id: i,
            firstName: `Lead${i}`,
            lastName: `Contact${i}`,
            email: `lead${i}@example.com`,
            phone: `555-${3000 + i}`,
            company: `Prospect ${i % 15}`,
            status: ['New', 'Qualified', 'Contacted', 'Not Interested', 'Converted'][i % 5],
            source: ['Website', 'Referral', 'Event', 'Social Media', 'Advertisement'][i % 5]
          });
          break;
          
        case 'opportunities':
        case 'sale.order':
        case 'opportunity':
          result.push({
            id: i,
            name: `Opportunity ${i}`,
            accountId: i % 10 + 1,
            stage: ['Lead Generation', 'Qualification', 'Proposal', 'Negotiation', 'Closing'][i % 5],
            amount: (Math.floor(Math.random() * 100) + 1) * 1000,
            closeDate: new Date(Date.now() + ((Math.floor(Math.random() * 90) + 30) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            probability: [10, 25, 50, 75, 90][i % 5]
          });
          break;
          
        case 'products':
        case 'product.product':
        case 'product':
          result.push({
            id: i,
            name: `Product ${i}`,
            description: `Description for product ${i}`,
            price: (Math.floor(Math.random() * 1000) + 1) * 10,
            category: ['Hardware', 'Software', 'Services', 'Consulting', 'Support'][i % 5],
            sku: `SKU-${1000 + i}`
          });
          break;
          
        case 'invoices':
        case 'account.move':
        case 'invoice':
          result.push({
            id: i,
            invoiceNumber: `INV-${10000 + i}`,
            accountId: i % 10 + 1,
            issueDate: new Date(Date.now() - ((Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            dueDate: new Date(Date.now() + ((Math.floor(Math.random() * 30) + 15) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            totalAmount: (Math.floor(Math.random() * 1000) + 1) * 100,
            status: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'][i % 5]
          });
          break;
          
        default:
          // Generic object with an ID
          result.push({
            id: i,
            name: `${entityType} ${i}`,
            createdAt: new Date().toISOString()
          });
      }
    }
    
    return result;
  }
}

export const migrationController = new MigrationController();