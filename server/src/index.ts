/**
 * @file Application entry point
 * @description Server initialization and process signal handling
 */

import { startServer, stopServer } from './server';
import { closeDatabase } from './utils/db';
import { logger } from './utils/logger';
import { validateConfig } from './config';

/**
 * Main function
 * Entry point for the application
 */
async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    
    // Start the server
    await startServer();
    logger.info('Application started successfully');
    
    // Handle graceful shutdown
    setupShutdownHandlers();
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

/**
 * Set up process signal handlers for graceful shutdown
 */
function setupShutdownHandlers(): void {
  // Handle termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    gracefulShutdown();
  });
  
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    gracefulShutdown();
  });
}

/**
 * Perform graceful shutdown
 */
async function gracefulShutdown(): Promise<void> {
  logger.info('Received shutdown signal');
  
  try {
    // Stop the server
    await stopServer();
    
    // Close database connections
    await closeDatabase();
    
    // Clean up other resources if needed
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
}

// Start the application
main();