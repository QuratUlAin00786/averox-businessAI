/**
 * @file Server entry point
 * @description Starts the Express server
 * @module server
 */

import http from 'http';
import { createApp } from './app';
import { initDatabase, closeDatabase } from './utils/db';
import { logger } from './utils/logger';
import { config } from './config';

/**
 * Initializes and starts the server
 */
async function startServer() {
  try {
    // Validate configuration
    // validateConfig();
    
    // Initialize database connection
    await initDatabase();
    logger.info('Database initialized successfully');
    
    // Create Express app
    const app = createApp();
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Start listening for requests
    server.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port} in ${config.server.env} mode`);
    });
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the server
 * @param server HTTP server instance
 */
async function gracefulShutdown(server: http.Server) {
  logger.info('Shutting down server...');
  
  // Close the server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connections
      await closeDatabase();
      logger.info('Database connections closed');
      
      // Exit process
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  });
  
  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
}

// Start the server
if (require.main === module) {
  startServer();
}

export { startServer };