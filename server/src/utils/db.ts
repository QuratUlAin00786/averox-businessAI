/**
 * @file Database connection utility
 * @description Sets up and manages the database connection for the application
 * @module utils/db
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { config } from '../config';

/**
 * PostgreSQL connection pool
 * Creates a reusable pool of connections to the PostgreSQL database
 */
export const pool = new Pool({ 
  connectionString: config.database.url 
});

/**
 * Drizzle ORM instance configured with our database schema
 * Use this to perform database operations with type safety
 */
export const db = drizzle(pool, { schema });

/**
 * Initializes the database connection and tests it
 * @returns Promise that resolves when connection is established
 */
export async function initDatabase(): Promise<void> {
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('Database connection established successfully');
    client.release();
    
    // Set up error handling for the pool
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
}

/**
 * Closes the database connection pool
 * Should be called when shutting down the application
 */
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

export default db;