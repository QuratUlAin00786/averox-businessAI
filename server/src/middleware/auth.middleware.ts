/**
 * @file Authentication middleware
 * @description Middleware for authentication and authorization
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { checkPermissions } from '../services/auth.service';

/**
 * Middleware to check if user is authenticated
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    next(ApiError.unauthorized('Not authenticated'));
    return;
  }
  next();
};

/**
 * Middleware to check if user is admin
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    next(ApiError.unauthorized('Not authenticated'));
    return;
  }

  if (!req.user || req.user.role !== 'Admin') {
    next(ApiError.forbidden('Admin access required'));
    return;
  }

  next();
};

/**
 * Middleware to check if user has specific roles
 * 
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated()) {
      next(ApiError.unauthorized('Not authenticated'));
      return;
    }

    if (!req.user || !req.user.role) {
      next(ApiError.forbidden('Access denied'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden('Access denied: Insufficient role'));
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has specific permissions
 * 
 * @param permissions Array of required permissions
 * @returns Middleware function
 */
export const hasPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.isAuthenticated()) {
      next(ApiError.unauthorized('Not authenticated'));
      return;
    }

    if (!req.user || !req.user.id) {
      next(ApiError.forbidden('Access denied'));
      return;
    }

    try {
      const hasPermissions = await checkPermissions(req.user.id, permissions);
      
      if (!hasPermissions) {
        next(ApiError.forbidden('Access denied: Insufficient permissions'));
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking permissions', error);
      next(ApiError.internal('Error checking permissions'));
    }
  };
};

/**
 * Middleware to check if user is resource owner or has one of the specified roles
 * 
 * @param paramName Name of the request parameter containing the resource ID
 * @param roles Array of allowed roles (e.g., ['Admin', 'Manager'])
 * @returns Middleware function
 */
export const isResourceOwnerOrHasRole = (paramName: string, roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated()) {
      next(ApiError.unauthorized('Not authenticated'));
      return;
    }

    if (!req.user || !req.user.id) {
      next(ApiError.forbidden('Access denied'));
      return;
    }

    // If user has one of the specified roles, allow access
    if (req.user.role && roles.includes(req.user.role)) {
      next();
      return;
    }

    // Check if user is the resource owner
    const resourceId = req.params[paramName];
    if (!resourceId) {
      next(ApiError.forbidden('Access denied: Resource ID not provided'));
      return;
    }

    // Simple case: parameter is the user ID
    if (req.user.id === parseInt(resourceId)) {
      next();
      return;
    }

    // Otherwise, access is denied
    next(ApiError.forbidden('Access denied: Not the resource owner'));
  };
};