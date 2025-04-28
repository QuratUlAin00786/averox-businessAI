/**
 * @file Authentication middleware
 * @description Middleware for authentication and authorization
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  next();
};

/**
 * Middleware to check if user is an admin
 * @param req Express request
 * @param res Express response
 * @param next Express next function
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  if (req.user?.role !== 'Admin') {
    res.status(403).json({ error: 'Insufficient permissions' });
    return;
  }
  
  next();
};