import express from 'express';
import { migrationController } from './migration-controller';

export const migrationRouter = express.Router();

// Route for initiating authentication with a CRM system
migrationRouter.post('/auth/init', migrationController.initiateAuth.bind(migrationController));

// Route for handling OAuth callback from CRM providers
migrationRouter.get('/auth/callback', migrationController.handleAuthCallback.bind(migrationController));

// Route for validating API keys for direct connection to CRMs
migrationRouter.post('/auth/apikey', migrationController.validateApiKey.bind(migrationController));

// Route for getting available entities from the connected CRM
migrationRouter.post('/entities', migrationController.getAvailableEntities.bind(migrationController));

// Route for analyzing and mapping fields between CRM systems
migrationRouter.post('/analyze-mapping', migrationController.analyzeFieldMapping.bind(migrationController));

// Route for starting the migration process
migrationRouter.post('/start', migrationController.startMigration.bind(migrationController));

// Route for checking migration status
migrationRouter.get('/status/:jobId', migrationController.getMigrationStatus.bind(migrationController));

// Route for importing data from a file (CSV, Excel, etc.)
// Using express.raw() to handle file uploads with size limit of 10MB
migrationRouter.post('/import-file', 
  express.raw({ 
    type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'],
    limit: '10mb'
  }), 
  migrationController.importFromFile.bind(migrationController));