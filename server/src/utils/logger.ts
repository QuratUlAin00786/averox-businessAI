/**
 * @file Logging utility
 * @description Provides a consistent logging interface throughout the application
 * @module utils/logger
 */

import { config } from '../config';

/**
 * Log levels
 */
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Logger utility class
 * Provides methods for logging with different severity levels
 */
class Logger {
  private env: string;

  constructor() {
    this.env = config.server.env;
  }

  /**
   * Formats the log message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `${timestamp} [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  }

  /**
   * Logs an error message
   */
  error(message: string, data?: any): void {
    console.error(this.formatMessage('error', message, data));
  }

  /**
   * Logs a warning message
   */
  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  /**
   * Logs an info message
   */
  info(message: string, data?: any): void {
    console.info(this.formatMessage('info', message, data));
  }

  /**
   * Logs a debug message
   * Only displayed in non-production environments
   */
  debug(message: string, data?: any): void {
    if (this.env !== 'production') {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  /**
   * Logs an API request
   */
  logRequest(req: any): void {
    this.info(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userId: req.user?.id || 'unauthenticated',
    });
  }

  /**
   * Logs an API response
   */
  logResponse(req: any, res: any, time: number): void {
    this.info(`${req.method} ${req.originalUrl} ${res.statusCode} in ${time}ms`);
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();