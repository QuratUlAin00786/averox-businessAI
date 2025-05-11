/**
 * Averox CryptoSphere Protocol - TypeScript SDK
 * Copyright (c) 2025 Averox Ltd. All rights reserved.
 * v1.0.0
 * 
 * TypeScript wrapper for the Averox CryptoSphere JavaScript SDK
 */

// Utility functions for encoding/decoding
const utils = {
  // Convert string to ArrayBuffer
  strToArrayBuffer: function(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  },
  
  // Convert ArrayBuffer to string
  arrayBufferToStr: function(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  },
  
  // Convert ArrayBuffer to Base64 string
  arrayBufferToBase64: function(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },
  
  // Convert Base64 string to ArrayBuffer
  base64ToArrayBuffer: function(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },
  
  // Convert object to JSON string
  objectToString: function(obj: any): string {
    return JSON.stringify(obj);
  },
  
  // Parse JSON string to object
  stringToObject: function(str: string): any {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  },
  
  // Generate a random initialization vector
  generateIV: function(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  },
  
  // Generate a random key
  generateKey: async function(algorithm = 'AES-GCM', length = 256): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: algorithm,
        length: length
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
};

// Interface for SDK initialization
export interface AveroxCryptoSphereConfig {
  apiKey?: string;
  keyId?: string;
  algorithm?: string;
  endpoint?: string;
  debug?: boolean;
  telemetry?: boolean;
  defaultAlgorithm?: string;
}

// Interface for encryption parameters
export interface EncryptParams {
  data: string | object | ArrayBuffer;
  keyId?: string;
  algorithm?: string;
  additionalData?: Record<string, any>;
}

// Interface for decryption parameters
export interface DecryptParams {
  encrypted: string;
  iv: string;
  keyId?: string;
}

// Interface for encryption result
export interface EncryptResult {
  encrypted: string;
  iv: string;
  keyId: string;
  algorithm: string;
  timestamp: string;
  additionalData?: Record<string, any>;
}

// Interface for decryption result
export interface DecryptResult {
  decrypted: any;
  keyId: string;
  timestamp: string;
}

/**
 * Main CryptoSphere class
 */
export class AveroxCryptoSphere {
  private config: AveroxCryptoSphereConfig;
  
  constructor(config: AveroxCryptoSphereConfig = {}) {
    this.config = {
      apiKey: config.apiKey || null,
      keyId: config.keyId || 'AES-419ad38b',
      algorithm: config.algorithm || 'AES-GCM',
      endpoint: config.endpoint || '/api',
      debug: config.debug || false,
      telemetry: config.telemetry !== false,
      defaultAlgorithm: config.defaultAlgorithm || 'master'
    };
    
    this.log('CryptoSphere SDK initialized', this.config);
  }
  
  /**
   * Encrypt data using Web Crypto API
   */
  async encrypt(params: EncryptParams): Promise<EncryptResult> {
    try {
      const algorithm = params.algorithm || this.config.algorithm;
      const data = params.data || '';
      let dataBuffer: ArrayBuffer;
      
      // Convert data to ArrayBuffer based on type
      if (typeof data === 'string') {
        dataBuffer = utils.strToArrayBuffer(data);
      } else if (data instanceof ArrayBuffer) {
        dataBuffer = data;
      } else if (typeof data === 'object') {
        dataBuffer = utils.strToArrayBuffer(utils.objectToString(data));
      } else {
        throw new Error('Unsupported data type for encryption');
      }
      
      // Generate encryption key from the provided key ID
      const encryptionKey = await this.deriveKeyFromId(params.keyId || this.config.keyId);
      
      // Generate random IV
      const iv = utils.generateIV();
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        encryptionKey,
        dataBuffer
      );
      
      // Build result object
      const result: EncryptResult = {
        encrypted: utils.arrayBufferToBase64(encryptedBuffer),
        iv: utils.arrayBufferToBase64(iv),
        keyId: params.keyId || this.config.keyId,
        algorithm: algorithm,
        timestamp: new Date().toISOString()
      };
      
      if (params.additionalData) {
        result.additionalData = params.additionalData;
      }
      
      this.log('Data encrypted successfully', { size: dataBuffer.byteLength });
      return result;
    } catch (error) {
      this.logError('Encryption error', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  
  /**
   * Decrypt data using Web Crypto API
   */
  async decrypt(params: DecryptParams): Promise<DecryptResult> {
    try {
      if (!params.encrypted || !params.iv) {
        throw new Error('Missing required parameters for decryption');
      }
      
      // Convert encrypted data and IV from Base64 to ArrayBuffer
      const encryptedBuffer = utils.base64ToArrayBuffer(params.encrypted);
      const iv = utils.base64ToArrayBuffer(params.iv);
      
      // Generate decryption key from the provided key ID
      const decryptionKey = await this.deriveKeyFromId(params.keyId || this.config.keyId);
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(iv),
          tagLength: 128
        },
        decryptionKey,
        encryptedBuffer
      );
      
      // Try to parse the decrypted data as JSON
      const decryptedString = utils.arrayBufferToStr(decryptedBuffer);
      const jsonData = utils.stringToObject(decryptedString);
      
      // Return parsed JSON if valid, or the raw string
      const result: DecryptResult = {
        decrypted: jsonData !== null ? jsonData : decryptedString,
        keyId: params.keyId || this.config.keyId,
        timestamp: new Date().toISOString()
      };
      
      this.log('Data decrypted successfully', { size: decryptedBuffer.byteLength });
      return result;
    } catch (error) {
      this.logError('Decryption error', error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
  
  /**
   * Derive a cryptographic key from a key ID
   * In a real implementation, this would fetch the key from the server
   * For standalone use, we derive a key from the key ID string
   */
  private async deriveKeyFromId(keyId: string): Promise<CryptoKey> {
    try {
      // Use the key ID as a seed to derive a consistent key
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        utils.strToArrayBuffer(keyId + 'AES-419ad38b'),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      
      // Derive a key using PBKDF2
      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: utils.strToArrayBuffer('AveroxSalt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      this.logError('Key derivation error', error);
      throw new Error(`Failed to derive key: ${error.message}`);
    }
  }
  
  /**
   * Log debug messages if debug mode is enabled
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log('[AveroxCryptoSphere]', message, data || '');
    }
  }
  
  /**
   * Log error messages
   */
  private logError(message: string, error?: any): void {
    console.error('[AveroxCryptoSphere]', message, error || '');
  }
}