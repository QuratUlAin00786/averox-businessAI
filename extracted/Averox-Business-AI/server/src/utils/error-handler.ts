/**
 * @file Error handling utilities
 * @description Centralized error handling for the application
 * @module utils/error-handler
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Error types enum for categorizing errors
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Custom API Error class for standardized error handling
 */
export class ApiError extends Error {
  statusCode: number;
  type: ErrorType;
  details?: any;

  /**
   * Create an API error
   * 
   * @param message Error message
   * @param statusCode HTTP status code
   * @param type Error type
   * @param details Additional error details
   */
  constructor(message: string, statusCode: number, type: ErrorType, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.name = 'ApiError';
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a validation error
   * 
   * @param message Error message
   * @param details Validation details
   * @returns ApiError instance
   */
  static validation(message: string, details?: any): ApiError {
    return new ApiError(message, 400, ErrorType.VALIDATION, details);
  }

  /**
   * Create a not found error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static notFound(message: string, details?: any): ApiError {
    return new ApiError(message, 404, ErrorType.NOT_FOUND, details);
  }

  /**
   * Create an unauthorized error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static unauthorized(message: string, details?: any): ApiError {
    return new ApiError(message, 401, ErrorType.UNAUTHORIZED, details);
  }

  /**
   * Create a forbidden error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static forbidden(message: string, details?: any): ApiError {
    return new ApiError(message, 403, ErrorType.FORBIDDEN, details);
  }

  /**
   * Create a conflict error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static conflict(message: string, details?: any): ApiError {
    return new ApiError(message, 409, ErrorType.CONFLICT, details);
  }

  /**
   * Create an internal server error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static internal(message: string, details?: any): ApiError {
    return new ApiError(message, 500, ErrorType.INTERNAL, details);
  }

  /**
   * Create a bad request error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(message, 400, ErrorType.BAD_REQUEST, details);
  }

  /**
   * Create a service unavailable error
   * 
   * @param message Error message
   * @param details Additional details
   * @returns ApiError instance
   */
  static serviceUnavailable(message: string, details?: any): ApiError {
    return new ApiError(message, 503, ErrorType.SERVICE_UNAVAILABLE, details);
  }
}

/**
 * Async handler to catch errors in async route handlers
 * 
 * @param fn Async route handler function
 * @returns Route handler with error catching
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler for undefined routes
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Resource not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error middleware for consistent error responses
 * 
 * @param err Error object
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const errorMiddleware = (err: Error | ApiError, req: Request, res: Response, next: NextFunction): void => {
  // Log the error
  logger.error(`Error handling request: ${req.method} ${req.path}`, err);
  
  // If the error is an ApiError, use its properties
  if (err instanceof ApiError) {
    // Don't expose internal details in production
    const details = process.env.NODE_ENV === 'production' 
      ? undefined 
      : err.details;
    
    res.status(err.statusCode).json({
      error: err.message,
      type: err.type,
      ...(details && { details })
    });
    return;
  }
  
  // For unknown errors, return a generic internal server error
  res.status(500).json({
    error: 'Internal Server Error',
    type: ErrorType.INTERNAL,
    ...(process.env.NODE_ENV !== 'production' && { message: err.message })
  });
};