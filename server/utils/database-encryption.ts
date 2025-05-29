/**
 * Database encryption utilities for Averox Business AI
 * This module provides functions to encrypt/decrypt data before database operations
 */

import { encrypt, decrypt } from './encryption';

// List of sensitive fields that should always be encrypted in the database
const SENSITIVE_FIELD_PATTERNS = [
  // Common sensitive fields
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /ssn/i,
  /credit.*card/i,
  /cvv/i,
  /security.*code/i,
  
  // Entity-specific sensitive fields
  /^email$/i,
  /^phone$/i,
  /^address$/i,
  /^notes$/i,
  /^first_name$/i,
  /^last_name$/i,
  /^billing_address$/i,
  /^shipping_address$/i,
];

// Map of entities and their sensitive fields
const ENTITY_SENSITIVE_FIELDS: Record<string, string[]> = {
  accounts: ['billing_address', 'notes', 'email', 'phone', 'address'],
  contacts: ['email', 'phone', 'address', 'notes', 'first_name', 'last_name'],
  leads: ['email', 'phone', 'address', 'notes', 'first_name', 'last_name'],
  opportunities: ['notes', 'description'],
  users: ['email', 'first_name', 'last_name'],
  invoices: ['billing_address', 'shipping_address', 'notes'],
  proposals: ['content', 'notes', 'description'],
  
  // Camel case variants for API compatibility
  account: ['billingAddress', 'notes', 'email', 'phone', 'address'],
  contact: ['email', 'phone', 'address', 'notes', 'firstName', 'lastName'],
  lead: ['email', 'phone', 'address', 'notes', 'firstName', 'lastName'],
  opportunity: ['notes', 'description'],
  user: ['email', 'firstName', 'lastName'],
  invoice: ['billingAddress', 'shippingAddress', 'notes'],
  proposal: ['content', 'notes', 'description'],
};

/**
 * Determines if a field should be encrypted based on its name and context
 * @param fieldName Name of the field
 * @param entityType Optional entity type for context-specific encryption
 * @returns Boolean indicating if the field should be encrypted
 */
export function shouldEncryptField(fieldName: string, entityType?: string): boolean {
  // Skip encryption if disabled
  if (process.env.ENCRYPTION_ENABLED !== 'true') {
    return false;
  }
  
  // Check against sensitive field patterns
  for (const pattern of SENSITIVE_FIELD_PATTERNS) {
    if (pattern.test(fieldName)) {
      return true;
    }
  }
  
  // Check entity-specific sensitive fields
  if (entityType && entityType in ENTITY_SENSITIVE_FIELDS) {
    return ENTITY_SENSITIVE_FIELDS[entityType].includes(fieldName);
  }
  
  return false;
}

/**
 * Encrypts an entire object's sensitive fields before database operations
 * @param data Object with data to be potentially encrypted
 * @param entityType Type of entity (e.g., 'accounts', 'contacts')
 * @returns Promise resolving to object with encrypted sensitive fields
 */
export async function encryptForDatabase<T extends Record<string, any>>(data: T, entityType?: string): Promise<T> {
  // Skip encryption if disabled
  if (process.env.ENCRYPTION_ENABLED !== 'true') {
    return data;
  }
  
  // Create a new object to avoid mutating the original
  const result = { ...data } as Record<string, any>;
  const encryptionPromises: Promise<void>[] = [];
  
  // Encrypt each field if it should be encrypted
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'string' && shouldEncryptField(key, entityType)) {
      const encryptPromise = async () => {
        try {
          const encryptedData = await encrypt(value);
          result[key] = JSON.stringify(encryptedData);
        } catch (err) {
          console.error(`Error encrypting field ${key}:`, err);
        }
      };
      encryptionPromises.push(encryptPromise());
    }
  }
  
  // Wait for all encryption operations to complete
  await Promise.all(encryptionPromises);
  
  return result as T;
}

/**
 * Decrypts an entire object's sensitive fields after database retrieval
 * @param data Object with potentially encrypted data
 * @param entityType Type of entity (e.g., 'accounts', 'contacts')
 * @returns Promise resolving to object with decrypted sensitive fields
 */
export async function decryptFromDatabase<T extends Record<string, any>>(data: T, entityType?: string): Promise<T> {
  // Skip decryption if disabled
  if (process.env.ENCRYPTION_ENABLED !== 'true') {
    return data;
  }
  
  // Create a new object to avoid mutating the original
  const result = { ...data } as Record<string, any>;
  const decryptionPromises: Promise<void>[] = [];
  
  // Decrypt each field if it should be encrypted
  for (const [key, value] of Object.entries(data)) {
    if (value && shouldEncryptField(key, entityType)) {
      const decryptPromise = async () => {
        try {
          // Handle different encryption formats
          if (typeof value === 'string') {
            // Check if the field is a JSON stringified encryption object
            try {
              const encryptedData = JSON.parse(value);
              if (encryptedData.encrypted && encryptedData.iv && encryptedData.keyId) {
                const decrypted = await decrypt(encryptedData.encrypted, encryptedData.iv, encryptedData.keyId);
                result[key] = decrypted;
              }
            } catch (parseError) {
              // Not a JSON string, might not be encrypted
            }
          } else if (typeof value === 'object' && value.encrypted && value.iv && value.keyId) {
            // Handle direct encryption object
            const decrypted = await decrypt(value.encrypted, value.iv, value.keyId);
            result[key] = decrypted;
          }
        } catch (err) {
          console.error(`Decryption error for field ${key}:`, err);
          // For corrupted encrypted data, check if it's a recognizable pattern
          if (typeof value === 'string' && value.includes('encrypted') && value.includes('iv')) {
            console.warn(`Corrupted encrypted data detected in field ${key}, setting to null`);
            result[key] = null;
          } else {
            // Keep original value if it's not encrypted or corruption is unclear
            result[key] = value;
          }
        }
      };
      decryptionPromises.push(decryptPromise());
    }
  }
  
  // Wait for all decryption operations to complete
  await Promise.all(decryptionPromises);
  
  return result as T;
}

/**
 * Encrypts an array of objects' sensitive fields before database operations
 * @param dataArray Array of objects with data to be potentially encrypted
 * @param entityType Type of entity (e.g., 'accounts', 'contacts')
 * @returns Promise resolving to array of objects with encrypted sensitive fields
 */
export async function encryptArrayForDatabase<T extends Record<string, any>>(dataArray: T[], entityType?: string): Promise<T[]> {
  // Skip encryption if disabled
  if (process.env.ENCRYPTION_ENABLED !== 'true') {
    return dataArray;
  }
  
  // Process empty arrays quickly
  if (!dataArray || dataArray.length === 0) {
    return [];
  }
  
  console.log(`[Encryption] Encrypting array of ${dataArray.length} ${entityType || 'items'} for database`);
  return Promise.all(dataArray.map(item => encryptForDatabase(item, entityType)));
}

/**
 * Decrypts an array of objects' sensitive fields after database retrieval
 * @param dataArray Array of objects with potentially encrypted data
 * @param entityType Type of entity (e.g., 'accounts', 'contacts')
 * @returns Promise resolving to array of objects with decrypted sensitive fields
 */
export async function decryptArrayFromDatabase<T extends Record<string, any>>(dataArray: T[], entityType?: string): Promise<T[]> {
  // Skip decryption if disabled
  if (process.env.ENCRYPTION_ENABLED !== 'true') {
    return dataArray;
  }
  
  // Process empty arrays quickly
  if (!dataArray || dataArray.length === 0) {
    return [];
  }
  
  return Promise.all(dataArray.map(item => decryptFromDatabase(item, entityType)));
}