/**
 * @file Server
 * @description HTTP server setup and initialization
 * @module server
 */

import http from 'http';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initDatabase } from './utils/db';

// Get port from config
const port = config.server.port;

// Create HTTP server
const server = http.createServer(app);

/**
 * Initialize the server
 * Sets up all necessary services and starts the server
 */
export async function startServer(): Promise<http.Server> {
  try {
    // Initialize database connection
    await initDatabase();
    logger.info('Database initialized successfully');
    
    // Additional initialization can go here:
    // - Initialize authentication
    // - Initialize WebSocket server
    // - Initialize cron jobs
    
    // Start listening
    server.listen(port);
    
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
      
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' 
        ? `pipe ${addr}` 
        : `port ${addr?.port}`;
      logger.info(`serving on ${bind}`);
    });
    
    return server;
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Shutdown the server gracefully
 */
export async function stopServer(): Promise<void> {
  logger.info('Shutting down server...');
  
  return new Promise((resolve) => {
    server.close(() => {
      logger.info('Server shut down successfully');
      resolve();
    });
  });
}

export default server;