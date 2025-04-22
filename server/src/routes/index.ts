/**
 * @file Route registry
 * @description Registers all API routes for the application
 * @module routes
 */

import { Express } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import leadRoutes from './lead.routes';
import openaiRoutes from './openai.routes';
import { errorMiddleware, notFoundHandler } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Registers all API routes with the Express application
 * @param app Express application
 */
export function registerRoutes(app: Express): void {
  // Log routes registration
  logger.info('Registering API routes');
  
  // Register route modules
  app.use('/api', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api', leadRoutes);
  app.use('/api', openaiRoutes);

  // ToDo: Register other route modules as they are created
  // app.use('/api', contactRoutes);
  // app.use('/api', accountRoutes);
  // app.use('/api', opportunityRoutes);
  // app.use('/api', taskRoutes);
  // app.use('/api', eventRoutes);
  // app.use('/api', activityRoutes);
  // app.use('/api', invoiceRoutes);
  // app.use('/api', productRoutes);
  // app.use('/api', proposalRoutes);
  
  // Register 404 handler
  app.use(notFoundHandler);
  
  // Register error middleware
  app.use(errorMiddleware);
  
  logger.info('API routes registered successfully');
}

/**
 * List of all API endpoints
 * This is useful for documentation and testing
 */
export const apiEndpoints = {
  auth: {
    login: { method: 'POST', path: '/api/login' },
    logout: { method: 'POST', path: '/api/logout' },
    register: { method: 'POST', path: '/api/register' },
    updateProfile: { method: 'PATCH', path: '/api/profile' },
    authStatus: { method: 'GET', path: '/api/auth/status' },
  },
  users: {
    getAll: { method: 'GET', path: '/api/users' },
    create: { method: 'POST', path: '/api/users' },
    getById: { method: 'GET', path: '/api/users/:id' },
    update: { method: 'PATCH', path: '/api/users/:id' },
    delete: { method: 'DELETE', path: '/api/users/:id' },
    getCurrent: { method: 'GET', path: '/api/user' },
    makeAdmin: { method: 'POST', path: '/api/make-admin' },
  },
  leads: {
    getAll: { method: 'GET', path: '/api/leads' },
    create: { method: 'POST', path: '/api/leads' },
    getStats: { method: 'GET', path: '/api/leads/stats' },
    getById: { method: 'GET', path: '/api/leads/:id' },
    update: { method: 'PATCH', path: '/api/leads/:id' },
    delete: { method: 'DELETE', path: '/api/leads/:id' },
    convert: { method: 'POST', path: '/api/leads/:id/convert' },
  },
  ai: {
    insights: { method: 'POST', path: '/api/ai/insights' },
    analysis: { method: 'POST', path: '/api/ai/analysis' },
    recommendations: { method: 'POST', path: '/api/ai/recommendations' },
    emailTemplate: { method: 'POST', path: '/api/ai/email-template' },
    summarizeMeeting: { method: 'POST', path: '/api/ai/summarize-meeting' },
  },
  // Add other endpoint categories as they are implemented
};