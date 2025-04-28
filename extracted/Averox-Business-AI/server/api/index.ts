/**
 * @file API routes registration
 * @description Register all API routes from domains
 */

import { Express } from 'express';
import userRoutes from './users/routes';

/**
 * Register all API routes
 * @param app Express app instance
 */
export const registerApiRoutes = (app: Express): void => {
  // Users routes
  app.use('/api/users', userRoutes);
  
  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  // Add more domain routes here as they are implemented
  // app.use('/api/contacts', contactRoutes);
  // app.use('/api/accounts', accountRoutes);
  // app.use('/api/leads', leadRoutes);
  // app.use('/api/opportunities', opportunityRoutes);
  // app.use('/api/tasks', taskRoutes);
  // app.use('/api/events', eventRoutes);
  // etc.
};