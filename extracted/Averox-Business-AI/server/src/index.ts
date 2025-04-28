/**
 * @file Server entry point
 * @description Application startup and error handling
 * @module index
 */

import { config, validateConfig } from './config';
import { startServer, stopServer } from './server';
import { logger } from './utils/logger';
import { closeDatabase } from './utils/db';

/**
 * Main application startup function
 */
async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    
    // Start server
    await startServer();
    
    logger.info('AVEROX CRM server started successfully');
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`OpenAI API: ${config.externalServices.openai.hasValidKey ? 'Available' : 'Not configured'}`);
    logger.info(`Stripe API: ${config.externalServices.stripe.hasValidKeys ? 'Available' : 'Not configured'}`);
    
    // Handle graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(): void {
  // Handle process termination signals
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    await shutdown();
  });
  
  process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully');
    await shutdown();
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    shutdown(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', { reason, promise });
    shutdown(1);
  });
}

/**
 * Shutdown function to close connections and exit
 * @param exitCode Process exit code (default: 0)
 */
async function shutdown(exitCode: number = 0): Promise<void> {
  try {
    logger.info('Shutting down server...');
    
    // Stop HTTP server
    await stopServer();
    
    // Close database connections
    await closeDatabase();
    
    logger.info('Shutdown complete. Exiting.');
    process.exit(exitCode);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
}

// Start the application
main();