/**
 * @file Server implementation
 * @description HTTP server setup and management
 * @module server
 */

import { createServer } from 'http';
import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initDatabase } from './utils/db';

// HTTP server instance
let server: any = null;

/**
 * Start the server
 * @param port Optional port override
 * @param host Optional host override
 * @returns Promise that resolves when the server is started
 */
export async function startServer(port = config.server.port, host = config.server.host): Promise<void> {
  try {
    // Initialize database
    await initDatabase();
    
    // Create HTTP server
    server = createServer(app);
    
    // Start the server
    return new Promise((resolve) => {
      server.listen(port, host, () => {
        logger.info(`serving on port ${port}`);
        resolve();
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    throw error;
  }
}

/**
 * Stop the server
 * @returns Promise that resolves when the server is stopped
 */
export async function stopServer(): Promise<void> {
  if (!server) {
    logger.warn('Server not running, nothing to stop');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    server.close((err: Error) => {
      if (err) {
        logger.error('Error stopping server', err);
        reject(err);
      } else {
        logger.info('Server stopped');
        server = null;
        resolve();
      }
    });
  });
}