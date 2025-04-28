import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { users, type User, type InsertUser, userSubscriptions, type UserSubscription, type InsertUserSubscription } from "@shared/schema";
import { eq } from "drizzle-orm";
import ws from "ws";
import { hashPassword } from "./auth";

neonConfig.webSocketConstructor = ws;

// Set up database connection
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Subscriptions
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash password
      if (insertUser.password) {
        insertUser.password = await hashPassword(insertUser.password);
      }
      
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw new Error('Failed to create user');
    }
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    try {
      const [userSubscription] = await db
        .insert(userSubscriptions)
        .values(subscription)
        .returning();
      return userSubscription;
    } catch (error) {
      console.error('Database error in createUserSubscription:', error);
      throw new Error('Failed to create user subscription');
    }
  }
}

// Initialize demo users if they don't exist yet
const initializeDemoUsers = async (storage: DatabaseStorage) => {
  try {
    // Check if admin user exists
    const adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      console.log('Creating admin user...');
      await storage.createUser({
        username: "admin",
        password: "password",
        firstName: "Admin",
        lastName: "User",
        email: "admin@averox.com",
        role: "Administrator",
        avatar: ""
      });
    }
    
    // Check if sales manager exists
    const salesManager = await storage.getUserByUsername("sales.manager");
    if (!salesManager) {
      console.log('Creating sales manager user...');
      await storage.createUser({
        username: "sales.manager",
        password: "password",
        firstName: "Sales",
        lastName: "Manager",
        email: "sales@averox.com",
        role: "Sales Manager",
        avatar: ""
      });
    }
    
    console.log('Demo users initialized successfully');
  } catch (error) {
    console.error('Error initializing demo users:', error);
  }
};

// Export storage instance
export const storage = new DatabaseStorage();

// Initialize demo users
initializeDemoUsers(storage).catch(error => {
  console.error('Failed to initialize demo users:', error);
});