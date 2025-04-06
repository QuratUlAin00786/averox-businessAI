import express from 'express';
import { migrationController } from './migration-controller';
import multer from 'multer';

export const migrationRouter = express.Router();

// Set up multer for file uploads
// Store files in memory for processing
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedMimeTypes = [
      'text/csv', 
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    // Check file type
    if (allowedMimeTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
    }
  }
});

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
// Use multer middleware to handle file upload
migrationRouter.post('/import-file', upload.single('file'), migrationController.importFromFile.bind(migrationController));