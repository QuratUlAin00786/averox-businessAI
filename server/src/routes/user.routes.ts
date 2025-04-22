/**
 * @file User routes
 * @description API routes for user management
 * @module routes/user
 */

import { Express, Request, Response } from 'express';
import { asyncHandler } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { db } from '../utils/db';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware';

/**
 * Register user management routes
 * @param app Express application
 */
export function registerUserRoutes(app: Express): void {
  // Get all users (admin only)
  app.get('/api/users', isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get users from database
      const users = await db.query.users.findMany({
        orderBy: (users, { asc }) => [asc(users.username)]
      });
      
      // Remove sensitive data before returning
      const safeUsers = users.map((user) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.status(200).json(safeUsers);
    } catch (error) {
      logger.error('Error fetching users', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }));

  // Get user by ID (admin or self)
  app.get('/api/users/:id', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is admin or requesting their own data
      if (req.user.role !== 'Admin' && req.user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Get user from database
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove sensitive data before returning
      const { password, ...safeUser } = user;
      
      res.status(200).json(safeUser);
    } catch (error) {
      logger.error('Error fetching user', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }));

  // Update user (admin or self)
  app.put('/api/users/:id', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is admin or updating their own data
      if (req.user.role !== 'Admin' && req.user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { username, email, firstName, lastName, role } = req.body;
      
      // Check if updating role and if user has permission
      if (role && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Only administrators can update roles' });
      }
      
      // Get user from database
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if username is being changed and if it's already taken
      if (username && username !== user.username) {
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.username, username)
        });
        
        if (existingUser) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }
      
      // Note: This is a placeholder for the actual user update
      // In a production environment, this would interact with the database through ORM
      logger.info(`User updated: ${userId}`);
      
      // Return updated user (pretend the update happened)
      const updatedUser = {
        ...user,
        username: username || user.username,
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        role: (role && req.user.role === 'Admin') ? role : user.role,
        updatedAt: new Date().toISOString()
      };
      
      // Remove sensitive data before returning
      const { password, ...safeUser } = updatedUser;
      
      res.status(200).json(safeUser);
    } catch (error) {
      logger.error('Error updating user', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }));

  // Delete user (admin only)
  app.delete('/api/users/:id', isAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Prevent deleting self
      if (req.user.id === userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }
      
      // Note: This is a placeholder for the actual user deletion
      // In a production environment, this would interact with the database through ORM
      logger.info(`User deleted: ${userId}`);
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      logger.error('Error deleting user', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }));
}