/**
 * @file Database utility
 * @description Provides database connection and utilities
 * @module utils/db
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from '../config';
import { logger } from './logger';
import * as schema from '../../../shared/schema';

// Create postgres connection
export const sql = postgres(config.database.url, { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
});

// Create drizzle instance
export const db = drizzle(sql, { schema });

/**
 * Initialize the database connection
 * Sets up the database and performs migrations if needed
 */
export async function initDatabase(): Promise<void> {
  try {
    // Test the connection
    await sql`SELECT 1`;
    
    // If MIGRATE_DB environment variable is set, run migrations
    if (process.env.MIGRATE_DB === 'true') {
      logger.info('Running database migrations...');
      
      // Run migrations
      await migrate(db, { migrationsFolder: 'migrations' });
      
      logger.info('Database migrations completed successfully');
    }
    
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw new Error('Database initialization failed');
  }
}

/**
 * Close database connections
 */
export async function closeDatabase(): Promise<void> {
  try {
    await sql.end({ timeout: 5 });
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Failed to close database connections', error);
    throw error;
  }
}

/**
 * Check if a table exists in the database
 * @param tableName Name of the table to check
 * @returns True if table exists, false otherwise
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      );
    `;
    
    return result[0]?.exists || false;
  } catch (error) {
    logger.error(`Failed to check if table ${tableName} exists`, error);
    return false;
  }
}

/**
 * Run a raw SQL query
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function runQuery(query: string, params: any[] = []): Promise<any> {
  try {
    logger.debug(`Running raw SQL query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    
    // Convert the array of parameters to a format postgres-js can use
    const result = await sql.unsafe(query, params);
    
    return result;
  } catch (error) {
    logger.error(`Failed to run query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`, error);
    throw error;
  }
}