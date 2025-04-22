/**
 * @file Routes registration
 * @description Central registry for all API routes
 * @module routes
 */

import { Express } from 'express';
import { logger } from '../utils/logger';

// Import route registration functions
import { registerAuthRoutes } from './auth.routes';
import { registerUserRoutes } from './user.routes';

/**
 * Register all API routes
 * @param app Express application
 */
export function registerRoutes(app: Express): void {
  try {
    logger.info('Registering API routes...');
    
    // Authentication and user routes
    registerAuthRoutes(app);
    registerUserRoutes(app);
    
    // Register additional API route modules here as they are implemented
    // For example:
    // registerContactRoutes(app);
    // registerLeadRoutes(app);
    // registerTaskRoutes(app);
    // registerOpportunityRoutes(app);
    // registerDashboardRoutes(app);
    // registerTeamRoutes(app);
    // registerAiRoutes(app);
    
    // API health check
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    // API info endpoint
    app.get('/api/info', (req, res) => {
      res.status(200).json({
        name: 'AVEROX CRM API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });
    
    logger.info('All API routes registered successfully');
  } catch (error) {
    logger.error('Error registering API routes', error);
    throw error;
  }
}