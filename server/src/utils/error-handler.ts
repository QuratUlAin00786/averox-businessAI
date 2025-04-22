/**
 * @file Error handler
 * @description Centralized error handling for the application
 * @module utils/error-handler
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Custom API error class
 * Extends Error with additional properties
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  
  /**
   * Create a new API error
   * @param message Error message
   * @param statusCode HTTP status code
   * @param code Optional error code for client identification
   */
  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Async error handler for route controllers
 * Wraps async route handlers to catch errors
 * @param fn Async route handler function
 * @returns Wrapped route handler that catches errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Error handler middleware
 * Central error handling for Express
 * @param err Error object
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Set default status code
  const statusCode = err.statusCode || 500;
  
  // Determine error details to log
  const errorDetails = {
    path: req.path,
    method: req.method,
    statusCode,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  };
  
  // Log the error
  if (statusCode >= 500) {
    logger.error('Server error', errorDetails);
  } else {
    logger.warn('Client error', errorDetails);
  }
  
  // Prepare response object
  const errorResponse = {
    success: false,
    error: statusCode >= 500 ? 'Server Error' : err.name || 'Request Error',
    message: err.message,
    code: err.code,
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse['stack'] = err.stack;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  // Skip for non-API routes (let Vite or static files handler deal with it)
  if (!req.path.startsWith('/api/')) {
    return next();
  }
  
  // Log 404 error
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  
  // Send 404 response
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested resource does not exist: ${req.path}`,
  });
};

/**
 * Controller error handler
 * Helper function to handle errors in controllers
 * @param res Express response object
 * @param error Error to handle
 */
export const handleControllerError = (res: Response, error: any) => {
  if (error instanceof ApiError) {
    // Known API error
    return res.status(error.statusCode).json({
      success: false,
      error: error.name,
      message: error.message,
      code: error.code
    });
  }
  
  // Log unexpected errors
  logger.error('Unexpected controller error', error);
  
  // Generic error response
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: 'An unexpected error occurred'
  });
};