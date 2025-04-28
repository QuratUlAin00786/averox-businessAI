/**
 * @file Authentication middleware
 * @description Middleware for handling authentication and authorization
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorType } from '../utils/error-handler';
import { checkPermissions } from '../services/auth.service';
import { logger } from '../utils/logger';

/**
 * Middleware to check if user is authenticated
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    return next(ApiError.unauthorized('Not authenticated'));
  }
  
  next();
}

/**
 * Middleware to check if user is an admin
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    return next(ApiError.unauthorized('Not authenticated'));
  }
  
  if (req.user.role !== 'Admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  
  next();
}

/**
 * Middleware to check if user is a manager or admin
 * 
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function isManagerOrAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    return next(ApiError.unauthorized('Not authenticated'));
  }
  
  if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
    return next(ApiError.forbidden('Manager or Admin access required'));
  }
  
  next();
}

/**
 * Create middleware to check for specific permissions
 * 
 * @param requiredPermissions Array of permission strings to check
 * @returns Middleware function
 */
export function hasPermissions(requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.isAuthenticated()) {
        return next(ApiError.unauthorized('Not authenticated'));
      }
      
      // Admin users have all permissions
      if (req.user.role === 'Admin') {
        return next();
      }
      
      // Check permissions
      const hasPermission = await checkPermissions(req.user.id, requiredPermissions);
      
      if (!hasPermission) {
        const permissionString = requiredPermissions.join(', ');
        logger.warn(`User ${req.user.id} (${req.user.username}) attempted to access a resource requiring permissions: ${permissionString}`);
        return next(ApiError.forbidden(`Missing required permissions: ${permissionString}`));
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user is the owner of a resource or an admin
 * 
 * @param resourceIdField Field name in req.params containing the resource ID
 * @param resourceOwnerField Field name in the resource containing the owner ID
 * @param getResourceFn Function to fetch the resource
 * @returns Middleware function
 */
export function isResourceOwnerOrAdmin(
  resourceIdField: string,
  resourceOwnerField: string,
  getResourceFn: (id: number) => Promise<any | null>
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.isAuthenticated()) {
        return next(ApiError.unauthorized('Not authenticated'));
      }
      
      // Admin users have access to all resources
      if (req.user.role === 'Admin') {
        return next();
      }
      
      const resourceId = parseInt(req.params[resourceIdField]);
      
      if (isNaN(resourceId)) {
        return next(ApiError.badRequest(`Invalid ${resourceIdField}`));
      }
      
      // Get the resource
      const resource = await getResourceFn(resourceId);
      
      if (!resource) {
        return next(ApiError.notFound(`Resource not found`));
      }
      
      // Check if the user is the owner
      if (resource[resourceOwnerField] !== req.user.id) {
        return next(ApiError.forbidden('You do not have permission to access this resource'));
      }
      
      // Add resource to request for later use
      req.resource = resource;
      
      next();
    } catch (error) {
      next(error);
    }
  };
}