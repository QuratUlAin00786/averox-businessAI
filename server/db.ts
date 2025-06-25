//import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { decryptConnectionString } from './utils/encryption';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';


//npm uninstall @neondatabase/serverless for local database

//npm install pg for lacal database


// Clear any existing DATABASE_URL
delete process.env.DATABASE_URL;



// Force reload .env
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env'),
  override: true 
});

console.log('Forced reload DATABASE_URL:', process.env.DATABASE_URL);
// Configure Neon WebSocket with error handling
//neonConfig.webSocketConstructor = ws;
//neonConfig.pipelineConnect = false;
//neonConfig.useSecureWebSocket = true;

// Check for database URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Flag to determine if we're using encrypted connection strings
// This can be set to true in production environment
const USE_ENCRYPTED_CONNECTION = process.env.USE_ENCRYPTED_CONNECTION === 'true';
const DATABASE_URL_IV = process.env.DATABASE_URL_IV || '';


// Add this at the top of your db.ts file
console.log('🔍 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('All DB vars:', Object.keys(process.env).filter(key => key.includes('DB')));
/**
 * Get database connection string - either decrypt it or use it directly
 * @returns Promise resolving to the connection string
 */
async function getConnectionString(): Promise<string> {
  const connectionString = process.env.DATABASE_URL || '';
  
  // If we're using encrypted connection strings and we have the IV
  if (USE_ENCRYPTED_CONNECTION && DATABASE_URL_IV) {
    try {
      console.log('[Database] Using encrypted database connection');
      const startTime = Date.now();
      
      const decryptedString = await decryptConnectionString(connectionString, DATABASE_URL_IV);
      
      const duration = Date.now() - startTime;
      console.log(`[Database] Connection string decryption completed in ${duration}ms`);
      
      return decryptedString;
    } catch (error) {
      console.error('Failed to decrypt database connection string:', error);
      throw new Error('Database connection configuration is invalid');
    }
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('[Database] Using unencrypted database connection in production environment');
  } else {
    console.log('[Database] Using unencrypted database connection in development environment');
  }
  
  return connectionString;
}

// Create database connection pool asynchronously
let pool: Pool;
let db: ReturnType<typeof drizzle>;

/**
 * Initialize the database connection with proper security measures
 */
export async function initDatabase() {
  try {
    console.log('[Database] Initializing secure database connection...');
    const startTime = Date.now();
    
    // Get connection string (potentially decrypted)
    const connectionString = await getConnectionString();
    
    // Create connection pool with secure settings
    pool = new Pool({ 
      connectionString,
      ssl: process.env.NODE_ENV === 'production' // Enable SSL in production
    });
    
    // Initialize Drizzle ORM
    db = drizzle({ client: pool, schema });
    
    const duration = Date.now() - startTime;
    console.log(`[Database] Secure database connection initialized in ${duration}ms`);
    
    return { pool, db };
  } catch (error) {
    console.error('[Database] Failed to initialize secure database:', error);
    throw error;
  }
}

// Perform initial database connection with improved settings
console.log('[Database] Setting up initial database connection...');
pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production', // Enable SSL in production
  max: 10, // Maximum pool connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout
  maxUses: 7500, // Reuse connections up to 7500 times
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('[Database] Pool error:', err);
});

pool.on('connect', () => {
  console.log('[Database] New client connected');
});

db = drizzle({ client: pool, schema });

// Optional: Initialize the secure connection immediately if enabled
if (USE_ENCRYPTED_CONNECTION) {
  console.log('[Database] Encrypted connection enabled, initializing secure connection...');
  initDatabase().catch(err => {
    console.error('[Database] Failed to initialize secure database connection:', err);
  });
}

// Export for use in other modules
export { pool, db };
