/**
 * @file Main entry point
 * @description Starting point for the AVEROX CRM application
 * @module index
 */

import dotenv from 'dotenv';
import { startServer } from './server';
import { setupVite } from '../vite';
import { logger } from './utils/logger';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function main() {
  try {
    // Setup Vite for development mode
    if (process.env.NODE_ENV !== 'production') {
      await setupVite();
    }
    
    // Start the server
    await startServer();
  } catch (error) {
    logger.error('Application startup failed', error);
    process.exit(1);
  }
}

// Start the application
main();