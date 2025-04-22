/**
 * @file Error handler
 * @description Error handling middleware and utilities
 * @module utils/error-handler
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Common error types
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
  FORBIDDEN = 'FORBIDDEN_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  statusCode: number;
  type: ErrorType;
  details?: any;

  constructor(message: string, statusCode: number, type: ErrorType, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.name = 'ApiError';
  }

  static validation(message: string, details?: any): ApiError {
    return new ApiError(message, 400, ErrorType.VALIDATION, details);
  }

  static notFound(message: string, details?: any): ApiError {
    return new ApiError(message, 404, ErrorType.NOT_FOUND, details);
  }

  static unauthorized(message: string, details?: any): ApiError {
    return new ApiError(message, 401, ErrorType.UNAUTHORIZED, details);
  }

  static forbidden(message: string, details?: any): ApiError {
    return new ApiError(message, 403, ErrorType.FORBIDDEN, details);
  }

  static database(message: string, details?: any): ApiError {
    return new ApiError(message, 500, ErrorType.DATABASE, details);
  }

  static externalService(message: string, details?: any): ApiError {
    return new ApiError(message, 502, ErrorType.EXTERNAL_SERVICE, details);
  }

  static internal(message: string, details?: any): ApiError {
    return new ApiError(message, 500, ErrorType.INTERNAL, details);
  }
}

/**
 * Async error handler wrapper for route handlers
 * Catches errors in async route handlers and passes them to the error middleware
 * 
 * @param fn The route handler function
 * @returns Wrapped route handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler middleware
 * This should be applied after all routes
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = ApiError.notFound(`Resource not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Error handling middleware
 * This should be the last middleware in the chain
 * 
 * @param err Error object
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let errorType = ErrorType.INTERNAL;
  let message = 'Internal server error';
  let details = undefined;

  // If this is our ApiError, use its properties
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorType = err.type;
    message = err.message;
    details = err.details;
  } else {
    // For other errors, just use the message
    message = err.message || message;
  }

  // Log the error with appropriate level
  const logData = {
    type: errorType,
    path: req.path,
    method: req.method,
    statusCode,
    error: err.stack || err.message,
    requestId: req.headers['x-request-id'] || '',
    userId: req.user?.id || null,
  };

  if (statusCode >= 500) {
    logger.error(`Server error: ${message}`, logData);
  } else if (statusCode >= 400) {
    logger.warn(`Client error: ${message}`, logData);
  }

  // Send the response
  const errorResponse = {
    error: {
      type: errorType,
      message,
      ...(details && { details }),
    },
    success: false,
  };

  // Only include stack trace in development environment
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.error['stack'] = err.stack.split('\n');
  }

  res.status(statusCode).json(errorResponse);
};