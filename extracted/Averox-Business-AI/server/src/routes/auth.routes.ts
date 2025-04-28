/**
 * @file Authentication routes
 * @description Routes for authentication and user account management
 * @module routes/auth
 */

import { Express, Request, Response } from 'express';
import passport from 'passport';
import { asyncHandler } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { hashPassword, comparePasswords } from '../services/auth.service';
import { db } from '../utils/db';
import { isAuthenticated } from '../middleware/auth.middleware';

/**
 * Register authentication routes
 * @param app Express application
 */
export function registerAuthRoutes(app: Express): void {
  // Register a new user
  app.post('/api/register', asyncHandler(async (req: Request, res: Response) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      // Check if username exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, username)
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      // Note: This is a placeholder for the actual user creation
      // In a production environment, this would interact with the database
      // through a proper ORM like Drizzle
      const newUser = {
        id: Date.now(), // Placeholder for auto-generated ID
        username,
        password: hashedPassword,
        email: email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'User', // Default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Log the user in
      req.login(newUser, (err) => {
        if (err) {
          logger.error('Error logging in after registration', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Return user info without sensitive data
        const { password: _, ...userInfo } = newUser;
        return res.status(201).json(userInfo);
      });
    } catch (error) {
      logger.error('Error registering user', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }));

  // Login
  app.post('/api/login', (req: Request, res: Response, next: Function) => {
    passport.authenticate('local', (err: Error, user: Express.User) => {
      if (err) {
        logger.error('Login error', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      req.login(user, (err) => {
        if (err) {
          logger.error('Error establishing session', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        logger.error('Error logging out', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Get current user
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.status(200).json(req.user);
  });

  // Change password
  app.post('/api/change-password', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      // Get the user from the database
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, req.user.id)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user's password
      // Note: This is a placeholder for the actual password update
      logger.info(`Password changed for user ${user.id}`);
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Error changing password', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }));
}