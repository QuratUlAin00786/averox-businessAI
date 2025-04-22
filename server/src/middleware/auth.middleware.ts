/**
 * @file Authentication middleware
 * @description Handles authentication and authorization checks for routes
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Middleware to check if user is authenticated
 * This attaches to routes that require authentication
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    logger.warn('Unauthorized access attempt', { 
      path: req.path, 
      ip: req.ip 
    });
    return next(new ApiError('Not authenticated', 401));
  }
  next();
}

/**
 * Middleware to check for specific user roles
 * @param roles Array of allowed roles
 */
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next(new ApiError('Not authenticated', 401));
    }
    
    const userRole = req.user.role;
    
    if (!roles.includes(userRole)) {
      logger.warn('Permission denied - insufficient role', { 
        path: req.path, 
        userRole, 
        requiredRoles: roles 
      });
      return next(new ApiError('Permission denied', 403, 'INSUFFICIENT_ROLE'));
    }
    
    next();
  };
}

/**
 * Middleware to check if user has admin role
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return next(new ApiError('Not authenticated', 401));
  }
  
  if (req.user.role !== 'Admin') {
    logger.warn('Admin access denied', { 
      path: req.path, 
      userId: req.user.id 
    });
    return next(new ApiError('Admin access required', 403, 'ADMIN_REQUIRED'));
  }
  
  next();
}

/**
 * Middleware to check if user is accessing their own resource
 * or has sufficient role to access others' resources
 * @param paramIdField The parameter name containing the resource owner ID
 * @param allowedRoles Array of roles allowed to access any resource
 */
export function isResourceOwnerOrHasRole(paramIdField: string, allowedRoles: string[] = ['Admin']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next(new ApiError('Not authenticated', 401));
    }
    
    const resourceId = parseInt(req.params[paramIdField]);
    const userId = req.user.id;
    
    // Allow if user is the resource owner
    if (resourceId === userId) {
      return next();
    }
    
    // Allow if user has one of the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    
    logger.warn('Resource access denied', { 
      path: req.path, 
      userId, 
      resourceId, 
      userRole: req.user.role 
    });
    return next(new ApiError('Permission denied', 403, 'INSUFFICIENT_PERMISSION'));
  };
}