/**
 * @file Logger utility
 * @description Provides logging functionality throughout the application
 * This is a lightweight implementation of a logger that doesn't depend on external packages
 * @module utils/logger
 */

import { config } from '../config';

/**
 * Log levels
 */
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Get the current log level from configuration
 */
function getLogLevel(): LogLevel {
  switch (config.logs.level.toLowerCase()) {
    case 'error':
      return LogLevel.ERROR;
    case 'warn':
      return LogLevel.WARN;
    case 'info':
      return LogLevel.INFO;
    case 'debug':
      return LogLevel.DEBUG;
    default:
      return LogLevel.INFO;
  }
}

/**
 * Get the current timestamp formatted for logs
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format metadata for the log message
 */
function formatMeta(meta: any): string {
  if (!meta || typeof meta !== 'object' || Object.keys(meta).length === 0) {
    return '';
  }
  
  try {
    return ' ' + JSON.stringify(meta);
  } catch (e) {
    return ' [Unable to stringify metadata]';
  }
}

/**
 * Write a log message to the console
 */
function writeLog(level: string, message: string, meta?: any): void {
  const timestamp = getTimestamp();
  const metaStr = formatMeta(meta);
  const logMessage = `${timestamp} [${level}] ${message}${metaStr}`;
  
  switch (level) {
    case 'ERROR':
      console.error(logMessage);
      break;
    case 'WARN':
      console.warn(logMessage);
      break;
    case 'DEBUG':
      console.debug(logMessage);
      break;
    default:
      console.log(logMessage);
  }
  
  // In a real implementation, this would also write to log files in production
}

/**
 * Logger implementation
 */
export const logger = {
  error: (message: string, ...args: any[]): void => {
    if (getLogLevel() >= LogLevel.ERROR) {
      if (args.length > 0) {
        if (args[0] instanceof Error) {
          const error = args[0];
          writeLog('ERROR', `${message}: ${error.message}`, { 
            stack: error.stack,
            ...(args.length > 1 ? args.slice(1) : {})
          });
        } else {
          writeLog('ERROR', message, args.length ? args[0] : undefined);
        }
      } else {
        writeLog('ERROR', message);
      }
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (getLogLevel() >= LogLevel.WARN) {
      writeLog('WARN', message, args.length ? args[0] : undefined);
    }
  },
  
  info: (message: string, ...args: any[]): void => {
    if (getLogLevel() >= LogLevel.INFO) {
      writeLog('INFO', message, args.length ? args[0] : undefined);
    }
  },
  
  debug: (message: string, ...args: any[]): void => {
    if (getLogLevel() >= LogLevel.DEBUG) {
      writeLog('DEBUG', message, args.length ? args[0] : undefined);
    }
  },
  
  /**
   * Log HTTP request information
   * @param method HTTP method
   * @param url Request URL
   * @param status HTTP status code
   * @param responseTime Response time in milliseconds
   */
  httpRequest: (method: string, url: string, status: number, responseTime: number): void => {
    if (getLogLevel() >= LogLevel.INFO) {
      writeLog('INFO', `${method} ${url} ${status} in ${responseTime}ms`);
    }
  },
  
  /**
   * Log API error response
   * @param method HTTP method
   * @param url Request URL
   * @param status HTTP status code
   * @param error Error object or message
   */
  apiError: (method: string, url: string, status: number, error: any): void => {
    if (getLogLevel() >= LogLevel.ERROR) {
      const errorMessage = error instanceof Error ? error.message : error;
      writeLog('ERROR', `${method} ${url} ${status} - ${errorMessage}`, {
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  },
  
  /**
   * Log database operation
   * @param operation Database operation (e.g., 'query', 'insert')
   * @param entity Entity being operated on (e.g., 'users', 'tasks')
   * @param details Additional details
   */
  databaseOperation: (operation: string, entity: string, details?: any): void => {
    if (getLogLevel() >= LogLevel.DEBUG) {
      writeLog('DEBUG', `DB Operation: ${operation} on ${entity}`, details);
    }
  },
};