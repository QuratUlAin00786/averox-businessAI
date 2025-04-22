import { Router, Request, Response, NextFunction } from 'express';
import { migrationController } from './migration-controller';
import { Session } from 'express-session';

// Extend the Session interface
declare module 'express-session' {
  interface Session {
    odooAuth?: {
      baseUrl: string; 
      apiKey: string; 
      database: string; 
      username: string;
    };
    oracleAuth?: {
      instanceUrl: string;
      apiKey: string;
      username: string;
      password: string;
    };
  }
}

// Create router for migration endpoints
export const migrationRouter = Router();

// Authentication check middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// Admin check middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin permissions required' });
};

// Export supported migration providers (public endpoint, no auth required)
migrationRouter.get('/providers', (req: Request, res: Response) => {
  const providers = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Migrate data from Salesforce CRM',
      logo: '/assets/logos/salesforce.svg',
      authType: 'oauth',
      status: 'available'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Migrate data from HubSpot CRM',
      logo: '/assets/logos/hubspot.svg',
      authType: 'oauth',
      status: 'available'
    },
    {
      id: 'zoho',
      name: 'Zoho CRM',
      description: 'Migrate data from Zoho CRM',
      logo: '/assets/logos/zoho.svg',
      authType: 'oauth',
      status: 'available'
    },
    {
      id: 'dynamics',
      name: 'Microsoft Dynamics',
      description: 'Migrate data from Microsoft Dynamics 365',
      logo: '/assets/logos/dynamics.svg',
      authType: 'oauth',
      status: 'available'
    },
    {
      id: 'odoo',
      name: 'Odoo',
      description: 'Migrate data from Odoo CRM',
      logo: '/assets/logos/odoo.svg',
      authType: 'apikey',
      status: 'available',
      fields: [
        { name: 'baseUrl', label: 'Odoo Server URL', type: 'text', placeholder: 'https://your-instance.odoo.com', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'database', label: 'Database Name', type: 'text', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true }
      ]
    },
    {
      id: 'oracle',
      name: 'Oracle CRM On Demand',
      description: 'Migrate data from Oracle CRM On Demand',
      logo: '/assets/logos/oracle.svg',
      authType: 'apikey',
      status: 'available',
      fields: [
        { name: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://your-instance.crmondemand.com', required: true },
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'username', label: 'Username', type: 'text', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true }
      ]
    },
    {
      id: 'file',
      name: 'File Import',
      description: 'Import data from CSV, Excel, or JSON files',
      logo: '/assets/logos/file-import.svg',
      authType: 'file',
      status: 'available',
      supportedFormats: ['csv', 'json', 'xlsx']
    }
  ];
  
  res.json(providers);
});

// Add public endpoints for testing
migrationRouter.post('/available-entities', (req: Request, res: Response) => {
  migrationController.getAvailableEntities(req, res);
});

migrationRouter.post('/analyze-fields', (req: Request, res: Response) => {
  migrationController.analyzeFieldMapping(req, res);
});

// Apply authentication middleware to all other migration routes
migrationRouter.use(isAuthenticated);

// Migration endpoints
migrationRouter.post('/initiate-auth', (req: Request, res: Response) => {
  migrationController.initiateAuth(req, res);
});

migrationRouter.get('/auth-callback', (req: Request, res: Response) => {
  migrationController.handleAuthCallback(req, res);
});

migrationRouter.post('/validate-api-key', (req: Request, res: Response) => {
  migrationController.validateApiKey(req, res);
});

migrationRouter.post('/start', (req: Request, res: Response) => {
  migrationController.startMigration(req, res);
});

migrationRouter.get('/status/:jobId', (req: Request, res: Response) => {
  migrationController.getMigrationStatus(req, res);
});

// File import route
migrationRouter.post('/import-file', (req: Request, res: Response) => {
  migrationController.importFromFile(req, res);
});

// Odoo-specific routes
migrationRouter.post('/odoo/connect', (req: Request, res: Response) => {
  const { baseUrl, apiKey, database, username } = req.body;
  
  // Validate required fields
  if (!baseUrl || !apiKey || !database || !username) {
    return res.status(400).json({
      success: false,
      error: 'Missing required Odoo connection parameters'
    });
  }
  
  // Store connection details in session
  if (req.session) {
    req.session.odooAuth = { baseUrl, apiKey, database, username };
  }
  
  return res.status(200).json({
    success: true,
    message: 'Odoo connection details saved'
  });
});

// Oracle CRM-specific routes
migrationRouter.post('/oracle/connect', (req: Request, res: Response) => {
  const { instanceUrl, apiKey, username, password } = req.body;
  
  // Validate required fields
  if (!instanceUrl || !apiKey || !username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required Oracle CRM connection parameters'
    });
  }
  
  // Store connection details in session
  if (req.session) {
    req.session.oracleAuth = { instanceUrl, apiKey, username, password };
  }
  
  return res.status(200).json({
    success: true,
    message: 'Oracle CRM connection details saved'
  });
});