/**
 * @file User controller
 * @description Handles HTTP requests for user management
 * @module controllers/user
 */

import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { handleControllerError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { insertUserSchema } from '../../shared/schema';

/**
 * Validation schema for user creation
 * Extends the base schema with additional validation rules
 */
const createUserSchema = insertUserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
});

/**
 * User controller class
 * Handles HTTP requests for user management
 */
export class UserController {
  /**
   * Get all users
   * @route GET /api/users
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Create a new user
   * @route POST /api/users
   */
  async createUser(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createUserSchema.parse(req.body);
      
      // Create user
      const newUser = await userService.createUser(validatedData);
      
      logger.info('User created successfully', { 
        userId: newUser.id, 
        username: newUser.username 
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.errors
        });
      }
      
      handleControllerError(res, error);
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   */
  async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a number'
        });
      }
      
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Update user
   * @route PATCH /api/users/:id
   */
  async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a number'
        });
      }
      
      // Only allow users to update their own profile or admins to update any profile
      if (req.user.id !== userId && req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'You can only update your own profile'
        });
      }
      
      const updatedUser = await userService.updateUser(userId, req.body);
      
      logger.info('User updated successfully', { 
        userId, 
        updatedBy: req.user.id 
      });
      
      res.json(updatedUser);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Delete user
   * @route DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'User ID must be a number'
        });
      }
      
      // Only allow admins to delete users
      if (req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'Only administrators can delete users'
        });
      }
      
      // Prevent self-deletion
      if (req.user.id === userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid operation',
          message: 'You cannot delete your own account'
        });
      }
      
      await userService.deleteUser(userId);
      
      logger.info('User deleted successfully', { 
        userId, 
        deletedBy: req.user.id 
      });
      
      res.json({ success: true });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Get the current authenticated user
   * @route GET /api/user
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      const userId = req.user.id;
      const user = await userService.getUserById(userId);
      
      res.json(user);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Make the current user an admin (for demo purposes)
   * @route POST /api/make-admin
   */
  async makeAdmin(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      const userId = req.user.id;
      const updatedUser = await userService.updateUser(userId, { role: 'Admin' });
      
      logger.info('User promoted to admin', { userId });
      
      res.json(updatedUser);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}

// Export singleton instance
export const userController = new UserController();