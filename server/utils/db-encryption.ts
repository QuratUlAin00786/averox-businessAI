/**
 * Database encryption integration with Drizzle ORM
 * 
 * This module extends the default db object with encryption capabilities
 * for sensitive fields in the database.
 */

import { db as originalDb } from '../db';
import { encrypt, decrypt } from './encryption';
import { PgColumn, SQL } from 'drizzle-orm/pg-core';
import { Column, ColumnBaseConfig, ColumnDataType } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Definition for field that needs encryption
interface EncryptedField {
  table: string;
  fieldName: string;
}

// List of fields that should be encrypted in the database
// This should be configured based on your schema sensitivity requirements
const ENCRYPTED_FIELDS: EncryptedField[] = [
  // User data
  { table: 'users', fieldName: 'email' },
  { table: 'users', fieldName: 'firstName' },
  { table: 'users', fieldName: 'lastName' },
  
  // Account data
  { table: 'accounts', fieldName: 'email' },
  { table: 'accounts', fieldName: 'phone' },
  { table: 'accounts', fieldName: 'billingAddress' },
  { table: 'accounts', fieldName: 'notes' },
  
  // Lead data
  { table: 'leads', fieldName: 'email' },
  { table: 'leads', fieldName: 'phone' },
  { table: 'leads', fieldName: 'notes' },
  
  // Contact data
  { table: 'contacts', fieldName: 'email' },
  { table: 'contacts', fieldName: 'phone' },
  { table: 'contacts', fieldName: 'address' },
  { table: 'contacts', fieldName: 'notes' },
  
  // Opportunity data
  { table: 'opportunities', fieldName: 'notes' },
  
  // Proposal data
  { table: 'proposals', fieldName: 'content' },
  { table: 'proposal_templates', fieldName: 'content' },
  
  // Invoice data
  { table: 'invoices', fieldName: 'billingAddress' },
  { table: 'invoices', fieldName: 'shippingAddress' },
  { table: 'invoices', fieldName: 'notes' },
];

/**
 * Function to check if a field should be encrypted
 * @param tableName The name of the table
 * @param fieldName The name of the field
 * @returns Boolean indicating if the field should be encrypted
 */
function shouldEncrypt(tableName: string, fieldName: string): boolean {
  return ENCRYPTED_FIELDS.some(
    field => field.table === tableName && field.fieldName === fieldName
  );
}

/**
 * Creates a new database object with encryption capabilities
 * This extends the original db object with patched methods for encryption
 */
export const createEncryptedDb = () => {
  // Create a proxy of the original db object
  const encryptedDb = new Proxy(originalDb, {
    get(target, prop, receiver) {
      // Get the original property
      const original = Reflect.get(target, prop, receiver);
      
      // If this is a method we want to patch
      if (prop === 'insert') {
        // Return a patched insert function that encrypts sensitive fields
        return function(...args: any[]) {
          const [table, data] = args;
          
          // Get table name from the table object
          const tableName = table.name;
          
          // If data is an object (not an array of objects for bulk insert)
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Create a copy of data to avoid modifying the original
            const encryptedData = { ...data };
            
            // Encrypt sensitive fields
            for (const key in encryptedData) {
              if (
                shouldEncrypt(tableName, key) && 
                encryptedData[key] !== null && 
                encryptedData[key] !== undefined &&
                typeof encryptedData[key] === 'string'
              ) {
                encryptedData[key] = encrypt(encryptedData[key]);
              }
            }
            
            // Call the original method with encrypted data
            return original.call(target, table, encryptedData);
          }
          
          // Handle array of objects for bulk insert
          if (data && Array.isArray(data)) {
            const encryptedItems = data.map(item => {
              const encryptedItem = { ...item };
              
              for (const key in encryptedItem) {
                if (
                  shouldEncrypt(tableName, key) && 
                  encryptedItem[key] !== null && 
                  encryptedItem[key] !== undefined &&
                  typeof encryptedItem[key] === 'string'
                ) {
                  encryptedItem[key] = encrypt(encryptedItem[key]);
                }
              }
              
              return encryptedItem;
            });
            
            return original.call(target, table, encryptedItems);
          }
          
          // Fallback to original behavior
          return original.call(target, ...args);
        };
      } 
      
      // Patch the update method to encrypt data before updating
      if (prop === 'update') {
        return function(...args: any[]) {
          const [table, data] = args;
          
          // Get table name from the table object
          const tableName = table.name;
          
          // Create a copy of data to avoid modifying the original
          const encryptedData = { ...data };
          
          // Encrypt sensitive fields
          for (const key in encryptedData) {
            if (
              shouldEncrypt(tableName, key) && 
              encryptedData[key] !== null && 
              encryptedData[key] !== undefined &&
              typeof encryptedData[key] === 'string'
            ) {
              encryptedData[key] = encrypt(encryptedData[key]);
            }
          }
          
          // Call the original method with encrypted data
          return original.call(target, table, encryptedData);
        };
      }
      
      // For any other method, use the original behavior
      return original;
    }
  });
  
  return encryptedDb;
};

// Create an instance of the encrypted db
export const encryptedDb = createEncryptedDb();

/**
 * Decorator function to automatically decrypt a column
 * This can be used in select statements to decrypt data
 * @param column The column to decrypt
 * @returns SQL statement that decrypts the column
 */
export function decrypt_column<T>(
  column: PgColumn<ColumnBaseConfig<ColumnDataType, any>>
): SQL<T> {
  // PostgreSQL function to decrypt data
  // This is a pseudocode example - you would need a real 
  // PostgreSQL function to handle decryption on the DB side
  // or you could decrypt in application code
  
  const tableName = column.table;
  const columnName = column.name;
  
  if (shouldEncrypt(tableName, columnName)) {
    // In real implementation, use a custom function like this:
    // return sql<T>`decrypt_aes(${column}, ${process.env.ENCRYPTION_KEY})`;
    
    // For now, we'll return the raw column and decrypt in the app layer
    return column as unknown as SQL<T>;
  }
  
  return column as unknown as SQL<T>;
}

/**
 * Function to decrypt objects after they're retrieved from the database
 * @param data Data object or array of objects from database
 * @param tableName Name of the table this data came from
 * @returns Decrypted data object or array
 */
export function decryptDbData<T extends Record<string, any>>(
  data: T | T[],
  tableName: string
): T | T[] {
  if (!data) return data;
  
  // Handle array of objects
  if (Array.isArray(data)) {
    return data.map(item => decryptDbData(item, tableName) as T);
  }
  
  // Make a copy to avoid modifying the original
  const result = { ...data };
  
  // Decrypt all sensitive fields
  for (const key in result) {
    if (
      shouldEncrypt(tableName, key) && 
      result[key] !== null && 
      result[key] !== undefined &&
      typeof result[key] === 'string'
    ) {
      try {
        result[key] = decrypt(result[key]) as any;
      } catch (e) {
        // If decryption fails, leave the original value
        // This could happen for non-encrypted legacy data
        console.warn(`Could not decrypt ${tableName}.${key}, keeping original value`);
      }
    }
  }
  
  return result;
}