/**
 * @file Authentication service
 * @description Service for handling authentication operations
 * @module services/auth
 */

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import { ApiError, ErrorType } from '../utils/error-handler';
import { db } from '../utils/db';

// Promisify scrypt for async use
const scryptAsync = promisify(scrypt);

/**
 * Hash a password with a random salt
 * 
 * @param password Plain text password to hash
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    
    // Return the hashed password with salt
    return `${buf.toString('hex')}.${salt}`;
  } catch (error) {
    logger.error('Error hashing password', error);
    throw new ApiError('Failed to hash password', 500, ErrorType.INTERNAL);
  }
}

/**
 * Compare a plain text password with a hashed password
 * 
 * @param supplied Plain text password to check
 * @param stored Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    // Split stored hash and salt
    const [hashed, salt] = stored.split('.');
    
    // Hash the supplied password with the same salt
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Compare the hashes using a constant-time comparison
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    logger.error('Error comparing passwords', error);
    return false;
  }
}

/**
 * Check if a user has the required permissions
 * 
 * @param userId User ID to check permissions for
 * @param permissions Array of permission strings to check
 * @returns Promise that resolves to a boolean indicating if the user has all the permissions
 */
export async function checkPermissions(userId: number, permissions: string[]): Promise<boolean> {
  try {
    // Get user data
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId)
    });
    
    if (!user) {
      throw new ApiError('User not found', 404, ErrorType.NOT_FOUND);
    }
    
    // Admin users have all permissions
    if (user.role === 'Admin') {
      return true;
    }
    
    // For now, implement a simplified permission check
    // In a real implementation, this would check against a permissions database
    
    // Placeholder implementation - certain roles have certain permissions
    const rolePermissions: Record<string, string[]> = {
      'Manager': ['view_dashboard', 'create_lead', 'edit_lead', 'view_lead', 'create_task', 'edit_task', 'delete_task'],
      'User': ['view_dashboard', 'create_lead', 'view_lead', 'create_task'],
      'ReadOnly': ['view_dashboard', 'view_lead']
    };
    
    // Get permissions for user's role
    const userPermissions = rolePermissions[user.role] || [];
    
    // Check if the user has all required permissions
    return permissions.every(permission => userPermissions.includes(permission));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Error checking permissions', error);
    throw new ApiError('Failed to check permissions', 500, ErrorType.INTERNAL);
  }
}

/**
 * Authenticate user with username and password
 * 
 * @param username Username for authentication
 * @param password Password for authentication
 * @returns User object if authentication is successful
 */
export async function authenticateUser(username: string, password: string) {
  try {
    // Find user by username
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });
    
    if (!user) {
      throw new ApiError('Invalid username or password', 401, ErrorType.UNAUTHORIZED);
    }
    
    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      throw new ApiError('Invalid username or password', 401, ErrorType.UNAUTHORIZED);
    }
    
    // Remove sensitive data before returning
    const { password: _, ...safeUser } = user;
    
    return safeUser;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Error authenticating user', error);
    throw new ApiError('Authentication failed', 500, ErrorType.INTERNAL);
  }
}