/**
 * @file Request logger middleware
 * @description Logs HTTP requests and responses
 * @module middleware/request-logger
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware that logs HTTP requests and responses
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Get request start time
  const startTime = Date.now();
  
  // Store original res.end method
  const originalEnd = res.end;
  
  // Override res.end method to log response details
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Only log API requests
    if (req.path.startsWith('/api')) {
      // Extract request body (but limit size for logging)
      const requestBody = req.body && Object.keys(req.body).length > 0
        ? JSON.stringify(req.body).substring(0, 200) 
        : null;
      
      // Extract response body if it's JSON
      let responseBody = null;
      if (chunk && typeof chunk === 'string' && chunk.startsWith('{')) {
        try {
          // Try to parse as JSON and limit size
          const parsedBody = JSON.parse(chunk);
          responseBody = JSON.stringify(parsedBody).substring(0, 100);
          
          // Add ellipsis if truncated
          if (chunk.length > 100) {
            responseBody += '...';
          }
        } catch (e) {
          // Not valid JSON, ignore
        }
      }
      
      // Skip logging for health check endpoints to reduce noise
      if (!req.path.includes('/health')) {
        logger.httpRequest(
          req.method,
          req.path,
          res.statusCode,
          responseTime
        );
      }
      
      // Log detailed debug information
      if (res.statusCode >= 400) {
        logger.apiError(
          req.method,
          req.path,
          res.statusCode,
          responseBody || 'Error response'
        );
      } else if (process.env.NODE_ENV === 'development') {
        logger.debug(`Request details: ${req.method} ${req.path}`, {
          query: req.query,
          body: requestBody,
          response: responseBody,
          responseTime
        });
      }
    }
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
}