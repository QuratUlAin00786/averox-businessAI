/**
 * @file User repository
 * @description Database interaction for users
 */

import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users, User, InsertUser, UpdateUser } from "../entities/User";

/**
 * User repository for database operations related to users
 */
export class UserRepository {
  /**
   * Get a user by ID
   * @param id User ID
   * @returns User or undefined if not found
   */
  async findById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Database error in findById:', error);
      throw new Error('Failed to retrieve user by ID');
    }
  }

  /**
   * Get a user by username
   * @param username Username
   * @returns User or undefined if not found
   */
  async findByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Database error in findByUsername:', error);
      throw new Error('Failed to retrieve user by username');
    }
  }

  /**
   * Get a user by email
   * @param email Email address
   * @returns User or undefined if not found
   */
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw new Error('Failed to retrieve user by email');
    }
  }

  /**
   * Get all users
   * @returns Array of users
   */
  async findAll(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Database error in findAll:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Create a new user
   * @param userData User data
   * @returns Created user
   */
  async create(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error('Database error in create:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param userData Updated user data
   * @returns Updated user or undefined if not found
   */
  async update(id: number, userData: UpdateUser): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in update:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Boolean indicating success
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return result !== null;
    } catch (error) {
      console.error('Database error in delete:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Update a user's last login timestamp
   * @param id User ID
   * @returns Updated user
   */
  async updateLastLogin(id: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in updateLastLogin:', error);
      throw new Error('Failed to update last login time');
    }
  }
}