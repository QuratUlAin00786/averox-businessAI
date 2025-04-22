/**
 * @file Error handling utilities
 * @description Centralizes error handling logic for consistent error responses
 * @module utils/error-handler
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from './logger';

/**
 * Custom API error class with additional properties
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  details?: any;
  
  /**
   * Creates a new API error
   * @param message Error message
   * @param statusCode HTTP status code
   * @param errorCode Optional error code for client
   * @param details Optional detailed error information
   */
  constructor(message: string, statusCode: number, errorCode?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }

  /**
   * Converts the error to a response object
   */
  toResponse() {
    return {
      success: false,
      error: this.message,
      errorCode: this.errorCode,
      details: this.details,
    };
  }
}

/**
 * Global error handling middleware
 * This should be added after all routes to catch errors
 */
export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toResponse());
  }

  // Handle Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      success: false,
      error: "Validation Error", 
      message: "The provided data does not meet validation requirements",
      details: err.errors 
    });
  }

  // Handle database errors
  if (err && typeof err === 'object' && 'code' in err) {
    // PostgreSQL error codes
    const pgError = err as { code: string; message?: string; detail?: string };
    logger.error('Database error code:', pgError.code);
    
    if (pgError.code === '42P01') { // undefined_table
      return res.status(500).json({
        success: false,
        error: "Database Error",
        message: "Table not found. Database schema may be outdated or incomplete.",
        details: pgError.detail || pgError.message
      });
    }
    
    if (pgError.code.startsWith('23')) { // integrity constraint violations
      return res.status(400).json({
        success: false,
        error: "Database Constraint Error",
        message: pgError.message || "Data violates database constraints",
        details: pgError.detail
      });
    }
  }

  // Default server error response
  return res.status(500).json({ 
    success: false,
    error: "Server Error", 
    message: err instanceof Error ? err.message : "Unknown error",
    ...(process.env.NODE_ENV !== 'production' && err instanceof Error && { 
      stack: err.stack 
    })
  });
}

/**
 * Wraps an async route handler to catch errors and pass them to next()
 * This eliminates the need for try/catch blocks in every route handler
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found error handler
 * Use this middleware after all routes to handle 404 errors
 */
export function notFoundHandler(req: Request, res: Response) {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'Not Found', 
    message: `The requested URL ${req.path} was not found` 
  });
}

/**
 * Standard error handling function for controllers
 * @param res Express response object
 * @param error Error to handle
 */
export function handleControllerError(res: Response, error: unknown) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(error.toResponse());
  }
  
  logger.error('Controller error:', error);
  
  if (error instanceof z.ZodError) {
    return res.status(400).json({ 
      success: false,
      error: "Validation Error", 
      message: "The provided data does not meet validation requirements",
      details: error.errors 
    });
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    // PostgreSQL error codes
    const pgError = error as { code: string; message?: string; detail?: string };
    logger.error('Database error code:', pgError.code);
    
    if (pgError.code === '42P01') { // undefined_table
      return res.status(500).json({
        success: false,
        error: "Database Error",
        message: "Table not found. Database schema may be outdated or incomplete.",
        details: pgError.detail || pgError.message
      });
    }
    
    if (pgError.code.startsWith('23')) { // integrity constraint violations
      return res.status(400).json({
        success: false,
        error: "Database Constraint Error",
        message: pgError.message || "Data violates database constraints",
        details: pgError.detail
      });
    }
  }
  
  return res.status(500).json({ 
    success: false,
    error: "Server Error", 
    message: error instanceof Error ? error.message : "Unknown error",
    ...(process.env.NODE_ENV !== 'production' && error instanceof Error && { 
      stack: error.stack 
    })
  });
}