/**
 * @file Request logger middleware
 * @description Logs incoming HTTP requests and their responses
 * @module middleware/request-logger
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to log HTTP requests and responses
 * This provides visibility into API traffic for debugging and monitoring
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Skip logging for static assets to reduce noise
  if (req.path.startsWith('/assets/') || req.path.startsWith('/static/')) {
    return next();
  }

  // Record request start time
  const startTime = Date.now();
  
  // Log the incoming request
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id || 'unauthenticated'
  });

  // Capture the original end method
  const originalEnd = res.end;
  
  // Override the end method to log the response
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Log the response
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    };
    
    if (res.statusCode >= 400) {
      // Log errors with higher visibility
      logger.warn(`Request failed: ${req.method} ${req.path}`, logData);
    } else {
      // Log successful requests
      logger.info(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
}