/**
 * @file Application setup
 * @description Configures the Express application
 * @module app
 */

import express, { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { setupAuth } from './config/auth.setup';
import { registerRoutes } from './routes';
import { requestLogger } from './middleware/request-logger.middleware';
import { logger } from './utils/logger';
import { config } from './config';

/**
 * Creates and configures an Express application
 * @returns Configured Express application
 */
export function createApp(): Express {
  // Create Express app
  const app = express();
  
  // Configure middleware
  app.use(cors({
    origin: config.security.corsOrigins,
    credentials: true
  }));
  
  // Parse request bodies
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // Setup request logging
  app.use(requestLogger);
  
  // Setup authentication
  setupAuth(app);
  
  // Register routes
  registerRoutes(app);
  
  // Log successful setup
  logger.info('Application setup completed');
  
  return app;
}