/**
 * @file Authentication service
 * @description Provides authentication and user management functionality
 * @module services/auth
 */

import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../utils/db';
import { users } from '../../../shared/schema';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Password hashing error', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a password with a hashed password
 * @param supplied Plain text password
 * @param stored Hashed password
 * @returns Whether the passwords match
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    return await bcrypt.compare(supplied, stored);
  } catch (error) {
    logger.error('Password comparison error', error);
    throw new Error('Failed to compare passwords');
  }
}

/**
 * Authentication service class
 * Provides methods for authentication and user management
 */
export class AuthService {
  /**
   * Update user profile
   * @param userId User ID
   * @param userData User data to update
   * @returns Updated user object
   */
  async updateUserProfile(userId: number, userData: Record<string, any>): Promise<any> {
    try {
      // Ensure user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!existingUser) {
        throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // Check for email uniqueness if changing email
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await db.query.users.findFirst({
          where: eq(users.email, userData.email)
        });
        
        if (emailExists) {
          throw new ApiError('Email already in use', 400, 'EMAIL_EXISTS');
        }
      }
      
      // Update user
      const [updatedUser] = await db.update(users)
        .set(userData)
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        throw new ApiError('Failed to update profile', 500);
      }
      
      // Remove password from result
      const { password, ...userWithoutPassword } = updatedUser;
      
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Profile update error', error);
      throw new ApiError('Failed to update profile', 500);
    }
  }
  
  /**
   * Change password
   * @param userId User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      // Validate password requirements
      if (newPassword.length < 8) {
        throw new ApiError('Password must be at least 8 characters', 400, 'INVALID_PASSWORD');
      }
      
      // Get user with password
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        throw new ApiError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Password change error', error);
      throw new ApiError('Failed to change password', 500);
    }
  }
  
  /**
   * Request password reset
   * @param email User email
   * @returns Success status
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    try {
      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      
      // Even if user not found, return success for security
      if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return { success: true };
      }
      
      // Generate reset token (would typically save to database)
      const resetToken = Math.random().toString(36).substring(2, 15);
      
      // In a real implementation, this would:
      // 1. Save the token to the database with an expiry
      // 2. Send an email with a reset link
      
      logger.info(`Password reset token generated for user: ${user.id}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Password reset request error', error);
      throw new ApiError('Failed to process password reset', 500);
    }
  }
  
  /**
   * Reset password with token
   * @param token Reset token
   * @param newPassword New password
   * @returns Success status
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      // Validate password requirements
      if (newPassword.length < 8) {
        throw new ApiError('Password must be at least 8 characters', 400, 'INVALID_PASSWORD');
      }
      
      // In a real implementation, this would:
      // 1. Verify the token is valid and not expired
      // 2. Find the user associated with the token
      // 3. Update the user's password
      // 4. Invalidate the token
      
      // For now, just simulate success
      logger.info(`Password reset with token: ${token.substring(0, 5)}...`);
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Password reset error', error);
      throw new ApiError('Failed to reset password', 500);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();