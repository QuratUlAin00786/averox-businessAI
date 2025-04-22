/**
 * @file Logger utility
 * @description Provides logging functionality throughout the application
 * @module utils/logger
 */

import winston from 'winston';
import { config } from '../config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    // Format metadata
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';
    
    // Format log message
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaString}`;
  })
);

// Define console transport
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  ),
  level: config.logs.level,
});

// Create the logger
const logger = winston.createLogger({
  level: config.logs.level,
  defaultMeta: { service: 'api' },
  format: logFormat,
  transports: [consoleTransport],
});

// Add file transports in production
if (config.server.isProduction) {
  // Create combined log file
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
    })
  );
  
  // Create error log file
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
}

// Create wrapper methods with string interpolation support
const enhancedLogger = {
  error: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      if (args[0] instanceof Error) {
        const error = args[0];
        logger.error(`${message}: ${error.message}`, { 
          stack: error.stack,
          ...args.slice(1) 
        });
      } else {
        logger.error(message, ...args);
      }
    } else {
      logger.error(message);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    logger.warn(message, ...args);
  },
  
  info: (message: string, ...args: any[]) => {
    logger.info(message, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    logger.debug(message, ...args);
  },
  
  /**
   * Log HTTP request information
   * @param method HTTP method
   * @param url Request URL
   * @param status HTTP status code
   * @param responseTime Response time in milliseconds
   */
  httpRequest: (method: string, url: string, status: number, responseTime: number) => {
    logger.info(`${method} ${url} ${status} in ${responseTime}ms`);
  },
  
  /**
   * Log API error response
   * @param method HTTP method
   * @param url Request URL
   * @param status HTTP status code
   * @param error Error object or message
   */
  apiError: (method: string, url: string, status: number, error: any) => {
    const errorMessage = error instanceof Error ? error.message : error;
    logger.error(`${method} ${url} ${status} - ${errorMessage}`, {
      stack: error instanceof Error ? error.stack : undefined,
    });
  },
  
  /**
   * Log database operation
   * @param operation Database operation (e.g., 'query', 'insert')
   * @param entity Entity being operated on (e.g., 'users', 'tasks')
   * @param details Additional details
   */
  databaseOperation: (operation: string, entity: string, details?: any) => {
    logger.debug(`DB Operation: ${operation} on ${entity}`, details);
  },
};

export { enhancedLogger as logger };