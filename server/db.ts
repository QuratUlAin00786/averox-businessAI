import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { decrypt, encrypt } from './utils/encryption';

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

// Get database connection string - either decrypt it or use it directly
const getConnectionString = (): string => {
  const connectionString = process.env.DATABASE_URL || '';
  
  // If we're using encrypted connection strings and it appears to be encrypted
  if (USE_ENCRYPTED_CONNECTION && connectionString.startsWith('U2F')) {
    try {
      return decrypt(connectionString);
    } catch (error) {
      console.error('Failed to decrypt database connection string:', error);
      throw new Error('Database connection configuration is invalid');
    }
  }
  
  return connectionString;
};

// Function to encrypt the connection string (for storing in environment variables)
export const encryptConnectionStringForStorage = (): string => {
  if (!process.env.DATABASE_URL) {
    throw new Error('No database URL available to encrypt');
  }
  return encrypt(process.env.DATABASE_URL);
};

// Create database pool with proper connection string
export const pool = new Pool({ 
  connectionString: getConnectionString(),
});

// Initialize Drizzle ORM with the pool
export const db = drizzle({ client: pool, schema });

// Add encryption hooks for sensitive queries if needed
// This would involve adding pre-processing and post-processing steps
// when working with sensitive data fields

/**
 * Helper function to encrypt specific fields in an object before storing
 * @param data The data object to process
 * @param fieldsToEncrypt Array of field names to encrypt
 * @returns Processed object with encrypted fields
 */
export function encryptSensitiveFields<T extends Record<string, any>>(
  data: T, 
  fieldsToEncrypt: string[]
): T {
  // Create a mutable copy of the data object
  const result = { ...data } as Record<string, any>;

  for (const field of fieldsToEncrypt) {
    if (
      Object.prototype.hasOwnProperty.call(result, field) && 
      result[field] && 
      typeof result[field] === 'string'
    ) {
      result[field] = encrypt(result[field] as string);
    }
  }

  return result as T;
}

/**
 * Helper function to decrypt specific fields in an object after retrieval
 * @param data The data object to process
 * @param fieldsToDecrypt Array of field names to decrypt
 * @returns Processed object with decrypted fields
 */
export function decryptSensitiveFields<T extends Record<string, any>>(
  data: T, 
  fieldsToDecrypt: string[]
): T {
  // Create a mutable copy of the data object
  const result = { ...data } as Record<string, any>;

  for (const field of fieldsToDecrypt) {
    if (
      Object.prototype.hasOwnProperty.call(result, field) && 
      result[field] && 
      typeof result[field] === 'string'
    ) {
      try {
        result[field] = decrypt(result[field] as string);
      } catch (e) {
        // If field wasn't encrypted, leave as is
        console.warn(`Could not decrypt field ${field}, might not be encrypted`);
      }
    }
  }

  return result as T;
}
