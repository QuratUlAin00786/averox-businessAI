/**
 * @file Server implementation
 * @description HTTP server setup and management
 * @module server
 */

import http from 'http';
import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initDatabase } from './utils/db';

// Server instance
let server: http.Server | null = null;

/**
 * Start the HTTP server
 * @returns Promise that resolves when server is started
 */
export async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    await initDatabase();
    
    // Create HTTP server
    server = http.createServer(app);
    
    // Start listening
    return new Promise((resolve, reject) => {
      if (!server) {
        reject(new Error('Server not initialized'));
        return;
      }
      
      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${config.server.port} is already in use. Choose a different port.`);
        } else {
          logger.error('Error starting server', error);
        }
        reject(error);
      });
      
      server.on('listening', () => {
        const address = server?.address();
        const addressInfo = typeof address === 'string' 
          ? `pipe ${address}` 
          : `port ${address?.port}`;
        
        logger.info(`Server is running on ${addressInfo}`);
        resolve();
      });
      
      server.listen(config.server.port, config.server.host);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    throw error;
  }
}

/**
 * Stop the HTTP server
 * @returns Promise that resolves when server is stopped
 */
export async function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) {
      logger.warn('Server is not running. Nothing to stop.');
      resolve();
      return;
    }
    
    server.close((error) => {
      if (error) {
        logger.error('Error stopping server', error);
        reject(error);
        return;
      }
      
      logger.info('Server stopped');
      server = null;
      resolve();
    });
    
    // Force close server after 5 seconds if it doesn't close gracefully
    setTimeout(() => {
      if (server) {
        logger.warn('Forcing server to close after timeout');
        server = null;
        resolve();
      }
    }, 5000);
  });
}