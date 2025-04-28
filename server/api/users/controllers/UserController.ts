/**
 * @file User controller
 * @description Handles HTTP requests related to users
 */

import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { UserService } from '../services/UserService';
import { 
  createUserDTO, 
  updateUserDTO, 
  loginUserDTO, 
  changePasswordDTO 
} from '../dto/UserDTO';

/**
 * Controller for handling user-related HTTP requests
 */
export class UserController {
  private userService: UserService;
  
  constructor() {
    this.userService = new UserService();
  }
  
  /**
   * Get all users (admin only)
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'Admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  };
  
  /**
   * Get a user by ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      // Check if user is requesting their own data or is an admin
      if (req.user?.id !== id && req.user?.role !== 'Admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  };
  
  /**
   * Create a new user (admin only)
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'Admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      // Validate request body
      const validatedData = createUserDTO.parse(req.body);
      
      const newUser = await this.userService.createUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
        return;
      }
      
      if (error instanceof Error) {
        if (error.message === 'Username already exists' || error.message === 'Email already exists') {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      
      console.error('Error in createUser:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };
  
  /**
   * Update an existing user
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      // Check if user is updating their own data or is an admin
      if (req.user?.id !== id && req.user?.role !== 'Admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      // Prevent non-admin users from updating their role
      if (req.user?.role !== 'Admin' && req.body.role) {
        res.status(403).json({ error: 'Cannot update role' });
        return;
      }
      
      // Validate request body
      const validatedData = updateUserDTO.parse(req.body);
      
      const updatedUser = await this.userService.updateUser(id, validatedData);
      
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
        return;
      }
      
      if (error instanceof Error) {
        if (error.message === 'Username already exists' || error.message === 'Email already exists') {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      
      console.error('Error in updateUser:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  };
  
  /**
   * Change a user's password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      // Check if user is changing their own password
      if (req.user?.id !== id) {
        res.status(403).json({ error: 'Cannot change another user\'s password' });
        return;
      }
      
      // Validate request body
      const validatedData = changePasswordDTO.parse(req.body);
      
      const success = await this.userService.changePassword(id, validatedData);
      
      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: 'Validation error', 
          details: error.errors 
        });
        return;
      }
      
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        
        if (error.message === 'Current password is incorrect') {
          res.status(401).json({ error: error.message });
          return;
        }
      }
      
      console.error('Error in changePassword:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  };
  
  /**
   * Delete a user (admin only)
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'Admin') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      // Prevent deleting self
      if (req.user?.id === id) {
        res.status(400).json({ error: 'Cannot delete your own account' });
        return;
      }
      
      const success = await this.userService.deleteUser(id);
      
      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }
      
      const userId = req.user.id;
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      res.status(500).json({ error: 'Failed to retrieve current user' });
    }
  };
}