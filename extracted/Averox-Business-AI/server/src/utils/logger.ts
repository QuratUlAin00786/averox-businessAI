/**
 * @file Logger utility
 * @description Custom logging implementation with formatting and levels
 * @module utils/logger
 */

import { config } from '../config';

// Colors for different log levels in terminal output
const colors = {
  reset: '\x1b[0m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// Log levels with their priority
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Convert string log level to enum
function getLogLevelFromString(level: string): LogLevel {
  switch (level.toLowerCase()) {
    case 'error': return LogLevel.ERROR;
    case 'warn': return LogLevel.WARN;
    case 'info': return LogLevel.INFO;
    case 'debug': return LogLevel.DEBUG;
    default: return LogLevel.INFO;
  }
}

// Current log level from configuration
const currentLogLevel = getLogLevelFromString(config.logs.level);

/**
 * Format message with timestamp and color
 * @param level Log level
 * @param message Message to log
 * @param data Additional data to log
 * @returns Formatted log message
 */
function formatMessage(level: string, message: string, data?: any): string {
  const timestamp = config.logs.showTimestamp ? new Date().toISOString() : '';
  const timestampStr = timestamp ? `[${timestamp}] ` : '';
  
  let dataStr = '';
  if (data) {
    if (data instanceof Error) {
      dataStr = `\n${data.stack || data.message}`;
    } else if (typeof data === 'object') {
      try {
        dataStr = `\n${JSON.stringify(data, null, 2)}`;
      } catch (err) {
        dataStr = `\n[Object]`;
      }
    } else {
      dataStr = `\n${data}`;
    }
  }
  
  return `${timestampStr}[${level.toUpperCase()}] ${message}${dataStr}`;
}

/**
 * Apply color to message if colors are enabled
 * @param message Message to colorize
 * @param color ANSI color code
 * @returns Colorized message if colors are enabled
 */
function colorize(message: string, color: string): string {
  return config.logs.showColors ? `${color}${message}${colors.reset}` : message;
}

/**
 * Logger implementation
 */
export const logger = {
  /**
   * Log error message
   * @param message Error message
   * @param data Additional data
   */
  error: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.ERROR) {
      const formattedMessage = formatMessage('error', message, data);
      console.error(colorize(formattedMessage, colors.red));
    }
  },
  
  /**
   * Log warning message
   * @param message Warning message
   * @param data Additional data
   */
  warn: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.WARN) {
      const formattedMessage = formatMessage('warn', message, data);
      console.warn(colorize(formattedMessage, colors.yellow));
    }
  },
  
  /**
   * Log info message
   * @param message Info message
   * @param data Additional data
   */
  info: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.INFO) {
      const formattedMessage = formatMessage('info', message, data);
      console.info(colorize(formattedMessage, colors.green));
    }
  },
  
  /**
   * Log debug message
   * @param message Debug message
   * @param data Additional data
   */
  debug: (message: string, data?: any): void => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      const formattedMessage = formatMessage('debug', message, data);
      console.debug(colorize(formattedMessage, colors.cyan));
    }
  },
  
  /**
   * Log HTTP request
   * @param method HTTP method
   * @param url Request URL
   * @param statusCode HTTP status code
   * @param responseTime Response time in milliseconds
   * @param data Additional data
   */
  httpRequest: (method: string, url: string, statusCode: number, responseTime: number, data?: any): void => {
    if (currentLogLevel >= LogLevel.INFO) {
      const status = statusCode >= 500 
        ? colorize(`${statusCode}`, colors.bgRed)
        : statusCode >= 400 
          ? colorize(`${statusCode}`, colors.red)
          : statusCode >= 300 
            ? colorize(`${statusCode}`, colors.yellow)
            : colorize(`${statusCode}`, colors.green);
      
      const time = responseTime < 100 
        ? colorize(`${responseTime}ms`, colors.green)
        : responseTime < 1000 
          ? colorize(`${responseTime}ms`, colors.yellow)
          : colorize(`${responseTime}ms`, colors.red);
      
      const message = `${method} ${url} ${status} in ${time}`;
      const formattedMessage = formatMessage('http', message, data);
      console.info(formattedMessage);
    }
  }
};