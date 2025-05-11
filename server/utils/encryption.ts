/**
 * Encryption utilities for Averox Business AI using the CryptoSphere SDK
 * This module provides a simplified interface for encryption/decryption operations
 */

import { cryptoSphere } from './cryptosphere';

/**
 * Encrypt a string or object
 * @param data The data to encrypt (string or object)
 * @param additionalData Optional metadata to associate with the encrypted data
 * @returns Promise resolving to an object with the encrypted data and IV
 */
export async function encrypt(data: string | object, additionalData?: object): Promise<{
  encrypted: string;
  iv: string;
  keyId: string;
}> {
  try {
    // Track encryption timing for performance monitoring
    const startTime = Date.now();
    
    // Combine provided additionalData with default metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      application: 'averox-business-ai',
      purpose: 'data-protection',
      ...additionalData
    };
    
    const result = await cryptoSphere.encrypt({
      data,
      additionalData: metadata
    });
    
    // Performance monitoring
    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`[Encryption] Slow encryption operation: ${duration}ms`);
    }
    
    return {
      encrypted: result.encrypted,
      iv: result.iv,
      keyId: result.keyId
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Failed to encrypt data: ${(error as Error).message}`);
  }
}

/**
 * Decrypt encrypted data
 * @param encrypted The encrypted data as a base64 string
 * @param iv The initialization vector as a base64 string
 * @param keyId Optional key ID used for encryption
 * @returns Promise resolving to the decrypted data
 */
export async function decrypt(encrypted: string, iv: string, keyId?: string): Promise<any> {
  try {
    // Track decryption timing for performance monitoring
    const startTime = Date.now();
    
    const result = await cryptoSphere.decrypt({
      encrypted,
      iv,
      keyId
    });
    
    // Performance monitoring
    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`[Encryption] Slow decryption operation: ${duration}ms`);
    }
    
    return result.decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt data: ${(error as Error).message}`);
  }
}

/**
 * Helper function to encrypt a database connection string
 * @param connectionString The database connection string
 * @returns Promise resolving to an object with the encrypted string and IV
 */
export async function encryptConnectionString(connectionString: string): Promise<{
  encrypted: string;
  iv: string;
}> {
  try {
    // Use a specific key ID for database connections
    const keyId = process.env.DB_ENCRYPTION_KEY_ID || 'DB-CONNECTION-KEY';
    
    const result = await cryptoSphere.encrypt({
      data: connectionString,
      keyId,
      additionalData: { type: 'database-connection' }
    });
    
    return {
      encrypted: result.encrypted,
      iv: result.iv
    };
  } catch (error) {
    console.error('Database connection encryption error:', error);
    throw new Error(`Failed to encrypt database connection: ${error.message}`);
  }
}

/**
 * Helper function to decrypt a database connection string
 * @param encrypted The encrypted connection string
 * @param iv The initialization vector
 * @returns Promise resolving to the decrypted connection string
 */
export async function decryptConnectionString(encrypted: string, iv: string): Promise<string> {
  try {
    // Use a specific key ID for database connections
    const keyId = process.env.DB_ENCRYPTION_KEY_ID || 'DB-CONNECTION-KEY';
    
    const result = await cryptoSphere.decrypt({
      encrypted,
      iv,
      keyId
    });
    
    return result.decrypted as string;
  } catch (error) {
    console.error('Database connection decryption error:', error);
    throw new Error(`Failed to decrypt database connection: ${error.message}`);
  }
}

/**
 * Encrypt specific fields in an object
 * @param data The object containing fields to encrypt
 * @param fieldsToEncrypt Array of field names to encrypt
 * @returns A new object with encrypted fields
 */
export async function encryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: string[]
): Promise<Record<string, any>> {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (
      Object.prototype.hasOwnProperty.call(result, field) && 
      result[field] !== null && 
      result[field] !== undefined &&
      typeof result[field] === 'string'
    ) {
      const encrypted = await encrypt(result[field]);
      result[field] = JSON.stringify(encrypted);
    }
  }
  
  return result;
}

/**
 * Decrypt specific fields in an object
 * @param data The object containing fields to decrypt
 * @param fieldsToDecrypt Array of field names to decrypt
 * @returns A new object with decrypted fields
 */
export async function decryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: string[]
): Promise<Record<string, any>> {
  const result = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (
      Object.prototype.hasOwnProperty.call(result, field) && 
      result[field] !== null && 
      result[field] !== undefined &&
      typeof result[field] === 'string'
    ) {
      try {
        const encryptedData = JSON.parse(result[field]);
        if (encryptedData.encrypted && encryptedData.iv) {
          result[field] = await decrypt(encryptedData.encrypted, encryptedData.iv);
        }
      } catch (e) {
        // If parsing fails or it's not an encrypted field, leave as is
        console.warn(`Could not decrypt field ${field}, might not be encrypted`);
      }
    }
  }
  
  return result;
}

// Export the cryptoSphere instance for direct access if needed
export { cryptoSphere };