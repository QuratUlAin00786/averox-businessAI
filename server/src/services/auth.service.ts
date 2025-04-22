/**
 * @file Authentication service
 * @description Provides authentication and user management functionality
 * @module services/auth
 */

import bcrypt from 'bcrypt';
import { config } from '../config';
import { logger } from '../utils/logger';
import { db } from '../utils/db';
import { users } from '../../shared/schema';
import { ApiError } from '../utils/error-handler';
import { eq } from 'drizzle-orm';

/**
 * Hashes a password using bcrypt
 * @param password Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.security.bcryptSaltRounds);
}

/**
 * Compares a plain text password with a hashed password
 * @param supplied Plain text password to check
 * @param stored Hashed password to compare against
 * @returns True if passwords match
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

/**
 * User service class
 * Provides methods for working with user accounts
 */
export class AuthService {
  /**
   * Authenticates a user with username and password
   * @param username Username to authenticate
   * @param password Password to check
   * @returns User object if authentication is successful
   * @throws ApiError if authentication fails
   */
  async authenticateUser(username: string, password: string) {
    try {
      // Find user by username
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      if (!user) {
        throw new ApiError('Invalid username or password', 401);
      }
      
      // Check if user is active
      if (user.isActive === false) {
        logger.warn('Login attempt for inactive account', { username });
        throw new ApiError('Account is inactive', 401, 'ACCOUNT_INACTIVE');
      }
      
      // Verify password
      const passwordValid = await comparePasswords(password, user.password);
      
      if (!passwordValid) {
        logger.warn('Failed login attempt - invalid password', { username });
        throw new ApiError('Invalid username or password', 401);
      }
      
      // Update last login timestamp
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));
      
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Authentication error', error);
      throw new ApiError('Authentication failed', 500);
    }
  }
  
  /**
   * Get user by ID
   * @param userId ID of user to retrieve
   * @returns User object
   */
  async getUserById(userId: number) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Remove password from returned user object
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
  
  /**
   * Updates user profile information
   * @param userId ID of user to update
   * @param userData User data to update
   * @returns Updated user object
   */
  async updateUserProfile(userId: number, userData: Partial<typeof users.$inferInsert>) {
    try {
      // Hash password if provided
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      // Update user in database
      await db.update(users)
        .set({
          ...userData,
          // Add updated timestamp logic here if needed
        })
        .where(eq(users.id, userId));
      
      // Get updated user
      const updatedUser = await this.getUserById(userId);
      
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user profile', { userId, error });
      throw new ApiError('Failed to update user profile', 500);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();