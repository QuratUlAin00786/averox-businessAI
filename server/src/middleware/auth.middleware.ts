/**
 * @file Authentication middleware
 * @description Middleware for authentication and authorization
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Define a basic user type for the middleware
interface BasicUser {
  id: number;
  role: string;
  permissions?: Record<string, string[]>;
}

// Augment Express Request to include our user type
declare global {
  namespace Express {
    interface User extends BasicUser {}
  }
}

/**
 * Check if user is authenticated
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  
  logger.warn('Unauthorized access attempt', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(401).json({
    success: false,
    error: 'Not authenticated'
  });
}

/**
 * Check if user has admin role
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  
  logger.warn('Unauthorized admin access attempt', {
    path: req.path,
    method: req.method,
    userId: req.user?.id?.toString() || '',
    ip: req.ip
  });
  
  res.status(403).json({
    success: false,
    error: 'Permission denied',
    message: 'Admin role required'
  });
}

/**
 * Check if user has one of the specified roles
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    
    logger.warn('Unauthorized role access attempt', {
      path: req.path,
      method: req.method,
      userId: req.user?.id?.toString() || '',
      userRole: req.user?.role || '',
      requiredRoles: roles,
      ip: req.ip
    });
    
    res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: `Required role: ${roles.join(' or ')}`
    });
  };
}

/**
 * Check if user is the owner of the resource or has one of the specified roles
 * @param paramIdField Name of the request parameter containing the resource ID
 * @param allowedRoles Array of roles that can access regardless of ownership
 * @returns Middleware function
 */
export function isResourceOwnerOrHasRole(paramIdField: string, allowedRoles: string[] = ['Admin']) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // If user has an allowed role, allow access
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }
    
    // Get resource ID from request parameters
    const resourceId = req.params[paramIdField];
    
    // If resource ID matches user ID, allow access
    if (req.user && req.user.id === parseInt(resourceId)) {
      return next();
    }
    
    logger.warn('Unauthorized resource access attempt', {
      path: req.path,
      method: req.method,
      userId: req.user?.id?.toString() || '',
      resourceId,
      ip: req.ip
    });
    
    res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: 'You can only access your own resources or need higher privileges'
    });
  };
}

/**
 * Check if user has permission for a specific action
 * @param module Module name
 * @param action Permission action
 * @returns Middleware function
 */
export function hasPermission(module: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // If user has Admin role, allow all actions
    if (req.user && req.user.role === 'Admin') {
      return next();
    }
    
    // Check if user has the specific permission
    // This would typically query a permissions table from the database
    // For now, we'll use a simplified approach
    const hasPermission = Boolean(
      req.user && 
      req.user.permissions && 
      req.user.permissions[module] && 
      req.user.permissions[module].includes(action)
    );
    
    if (hasPermission) {
      return next();
    }
    
    logger.warn('Permission denied', {
      path: req.path,
      method: req.method,
      userId: req.user?.id?.toString() || '',
      module,
      action,
      ip: req.ip
    });
    
    res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: `You don't have permission for this action: ${action} ${module}`
    });
  };
}