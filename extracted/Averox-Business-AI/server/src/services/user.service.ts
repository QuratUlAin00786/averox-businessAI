/**
 * @file User service
 * @description Provides user management functionality
 * @module services/user
 */

import { eq } from 'drizzle-orm';
import { db } from '../utils/db';
import { users } from '../../shared/schema';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { hashPassword } from './auth.service';

/**
 * User service class
 * Provides methods for user CRUD operations
 */
export class UserService {
  /**
   * Get all users
   * @returns List of all users (with passwords removed)
   */
  async getAllUsers() {
    try {
      const allUsers = await db.query.users.findMany();
      
      // Remove passwords from all users
      return allUsers.map(user => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      logger.error('Failed to retrieve users', error);
      throw new ApiError('Failed to retrieve users', 500);
    }
  }
  
  /**
   * Create a new user
   * @param userData User data for new user
   * @returns Created user object (without password)
   */
  async createUser(userData: typeof users.$inferInsert) {
    try {
      // Check if username already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, userData.username)
      });
      
      if (existingUser) {
        throw new ApiError('Username already exists', 400, 'USERNAME_EXISTS');
      }
      
      // Check if email already exists
      if (userData.email) {
        const existingEmail = await db.query.users.findFirst({
          where: eq(users.email, userData.email)
        });
        
        if (existingEmail) {
          throw new ApiError('Email already exists', 400, 'EMAIL_EXISTS');
        }
      }
      
      // Hash password
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      // Insert the new user
      const [newUser] = await db.insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
        })
        .returning();
      
      if (!newUser) {
        throw new ApiError('Failed to create user', 500);
      }
      
      // Remove password from the returned user
      const { password, ...userWithoutPassword } = newUser;
      
      return userWithoutPassword;
    } catch (error) {
      // If error is already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to create user', error);
      throw new ApiError('Failed to create user', 500);
    }
  }
  
  /**
   * Get user by ID
   * @param userId User ID to lookup
   * @returns User object (without password)
   */
  async getUserById(userId: number) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // Remove password from the returned user
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to retrieve user', { userId, error });
      throw new ApiError('Failed to retrieve user', 500);
    }
  }
  
  /**
   * Update a user
   * @param userId User ID to update
   * @param userData Updated user data
   * @returns Updated user object (without password)
   */
  async updateUser(userId: number, userData: Partial<typeof users.$inferInsert>) {
    try {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!existingUser) {
        throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // If updating username, check if it's already taken
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await db.query.users.findFirst({
          where: eq(users.username, userData.username)
        });
        
        if (usernameExists) {
          throw new ApiError('Username already exists', 400, 'USERNAME_EXISTS');
        }
      }
      
      // If updating email, check if it's already taken
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await db.query.users.findFirst({
          where: eq(users.email, userData.email)
        });
        
        if (emailExists) {
          throw new ApiError('Email already exists', 400, 'EMAIL_EXISTS');
        }
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      // Update the user
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        throw new ApiError('Failed to update user', 500);
      }
      
      // Remove password from the returned user
      const { password, ...userWithoutPassword } = updatedUser;
      
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to update user', { userId, error });
      throw new ApiError('Failed to update user', 500);
    }
  }
  
  /**
   * Delete a user
   * @param userId User ID to delete
   * @returns Success status
   */
  async deleteUser(userId: number) {
    try {
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!existingUser) {
        throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // Delete the user
      await db.delete(users).where(eq(users.id, userId));
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to delete user', { userId, error });
      throw new ApiError('Failed to delete user', 500);
    }
  }
  
  /**
   * Get user by username
   * @param username Username to lookup
   * @returns User object (with password for authentication)
   */
  async getUserByUsername(username: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      if (!user) {
        return null;
      }
      
      return user;
    } catch (error) {
      logger.error('Failed to retrieve user by username', { username, error });
      throw new ApiError('Failed to retrieve user', 500);
    }
  }
}

// Export singleton instance
export const userService = new UserService();