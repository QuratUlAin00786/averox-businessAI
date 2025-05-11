import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { decryptConnectionString } from './utils/encryption';

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;

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

/**
 * Get database connection string - either decrypt it or use it directly
 * @returns Promise resolving to the connection string
 */
async function getConnectionString(): Promise<string> {
  const connectionString = process.env.DATABASE_URL || '';
  
  // If we're using encrypted connection strings and we have the IV
  if (USE_ENCRYPTED_CONNECTION && DATABASE_URL_IV) {
    try {
      return await decryptConnectionString(connectionString, DATABASE_URL_IV);
    } catch (error) {
      console.error('Failed to decrypt database connection string:', error);
      throw new Error('Database connection configuration is invalid');
    }
  }
  
  return connectionString;
}

// Create database connection pool asynchronously
let pool: Pool;
let db: ReturnType<typeof drizzle>;

/**
 * Initialize the database connection
 */
export async function initDatabase() {
  try {
    const connectionString = await getConnectionString();
    pool = new Pool({ connectionString });
    db = drizzle({ client: pool, schema });
    return { pool, db };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Initialize pool and db with non-encrypted connection for now
// This will be replaced by the async initialization from initDatabase
pool = new Pool({ connectionString: process.env.DATABASE_URL });
db = drizzle({ client: pool, schema });

// Export for use in other modules
export { pool, db };
