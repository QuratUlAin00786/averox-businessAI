/**
 * @file Authentication controller
 * @description Handles HTTP requests for authentication
 * @module controllers/auth
 */

import { Request, Response } from 'express';
import passport from 'passport';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';
import { handleControllerError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Authentication controller class
 * Handles HTTP requests for authentication
 */
export class AuthController {
  /**
   * Login user
   * @route POST /api/login
   */
  async login(req: Request, res: Response) {
    try {
      // Authenticate using passport
      passport.authenticate('local', (err: Error, user: Express.User) => {
        if (err) {
          logger.error('Authentication error', err);
          return res.status(500).json({
            success: false,
            error: 'Authentication error',
            message: err.message
          });
        }
        
        if (!user) {
          logger.warn('Failed login attempt', { 
            username: req.body.username, 
            ip: req.ip 
          });
          
          return res.status(401).json({
            success: false,
            error: 'Authentication failed',
            message: 'Invalid username or password'
          });
        }
        
        // Login the user
        req.login(user, (loginErr) => {
          if (loginErr) {
            logger.error('Login error', loginErr);
            return res.status(500).json({
              success: false,
              error: 'Login error',
              message: loginErr.message
            });
          }
          
          logger.info('User logged in successfully', { 
            userId: user.id, 
            username: user.username 
          });
          
          return res.json(user);
        });
      })(req, res);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Logout user
   * @route POST /api/logout
   */
  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Destroy the session
      req.logout((err) => {
        if (err) {
          logger.error('Logout error', err);
          return res.status(500).json({
            success: false,
            error: 'Logout error',
            message: err.message
          });
        }
        
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            logger.error('Session destruction error', sessionErr);
          }
          
          logger.info('User logged out successfully', { userId });
          
          res.clearCookie('connect.sid');
          return res.json({ success: true });
        });
      });
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Register a new user
   * @route POST /api/register
   */
  async register(req: Request, res: Response) {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      // Check for required fields
      if (!username || !password || !email) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Username, password, and email are required'
        });
      }
      
      // Check if username already exists
      const existingUser = await userService.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Registration Error',
          message: 'Username already exists'
        });
      }
      
      // Create the user
      const newUser = await userService.createUser({
        username,
        password,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'User',
        isActive: true,
        createdAt: new Date()
      });
      
      logger.info('User registered successfully', { 
        userId: newUser.id, 
        username 
      });
      
      // Automatically log in the new user
      req.login(newUser, (loginErr) => {
        if (loginErr) {
          logger.error('Auto-login error after registration', loginErr);
          return res.status(201).json({
            success: true,
            message: 'Registration successful, but automatic login failed',
            user: newUser
          });
        }
        
        return res.status(201).json({
          success: true,
          message: 'Registration and login successful',
          user: newUser
        });
      });
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Update user profile
   * @route PATCH /api/profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      const userId = req.user.id;
      const { firstName, lastName, email, company, avatar } = req.body;
      
      // Create a sanitized update object
      const updateData: Record<string, any> = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (company !== undefined) updateData.company = company;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      // Perform the update
      const updatedUser = await authService.updateUserProfile(userId, updateData);
      
      logger.info('User profile updated successfully', { userId });
      
      res.json(updatedUser);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Check if user is authenticated
   * @route GET /api/auth/status
   */
  async authStatus(req: Request, res: Response) {
    try {
      if (!req.isAuthenticated()) {
        return res.json({
          authenticated: false
        });
      }
      
      res.json({
        authenticated: true,
        user: req.user
      });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();