import CryptoJS from 'crypto-js';

// Secret key for encryption/decryption - should be stored in environment variables
const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-must-be-changed-in-production';

/**
 * AES-256 encryption utility for database data
 * 
 * This implementation uses AES-256 encryption in CBC mode with PKCS7 padding
 * for securing sensitive data in the database and during transmission.
 */

/**
 * Encrypt a string using AES-256
 * @param plainText The text to encrypt
 * @returns Encrypted string (Base64 format)
 */
export function encrypt(plainText: string): string {
  if (!plainText) return plainText;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(plainText, SECRET_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an AES-256 encrypted string
 * @param encryptedText The encrypted text (Base64 format)
 * @returns Decrypted string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt an object - encrypts all string values
 * @param obj The object to encrypt
 * @returns Object with encrypted string values
 */
export function encryptObject<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];
      if (typeof value === 'string') {
        result[key] = encrypt(value) as any;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = encryptObject(value);
      }
    }
  }
  
  return result;
}

/**
 * Decrypt an object - decrypts all string values
 * @param obj The object to decrypt
 * @returns Object with decrypted string values
 */
export function decryptObject<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];
      if (typeof value === 'string') {
        try {
          result[key] = decrypt(value) as any;
        } catch (e) {
          // If we cannot decrypt, leave the original value
          console.warn(`Could not decrypt property ${key}, keeping original value`);
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = decryptObject(value);
      }
    }
  }
  
  return result;
}

/**
 * Encrypt a database connection string
 * @param connectionString The database connection string
 * @returns Encrypted connection string
 */
export function encryptConnectionString(connectionString: string): string {
  return encrypt(connectionString);
}

/**
 * Decrypt a database connection string
 * @param encryptedConnectionString The encrypted database connection string
 * @returns Decrypted connection string
 */
export function decryptConnectionString(encryptedConnectionString: string): string {
  return decrypt(encryptedConnectionString);
}