/**
 * TypeScript wrapper for the Averox CryptoSphere SDK
 * This provides a type-safe interface to the SDK
 */

// Import the SDK and create a typed wrapper
import { createRequire } from 'module';
// We need to use createRequire since the SDK uses CommonJS format
const require = createRequire(import.meta.url);

// Define types for the CryptoSphere SDK
interface CryptoSphereConfig {
  apiKey?: string;
  keyId?: string;
  algorithm?: string;
  endpoint?: string;
  debug?: boolean;
  telemetry?: boolean;
}

interface EncryptParams {
  data: string | object;
  keyId?: string;
  algorithm?: string;
  additionalData?: Record<string, any>;
}

interface DecryptParams {
  encrypted: string;
  iv: string;
  keyId?: string;
}

interface EncryptResult {
  encrypted: string;
  iv: string;
  keyId: string;
  algorithm: string;
  timestamp: string;
  additionalData?: Record<string, any>;
}

interface DecryptResult {
  decrypted: any;
  keyId: string;
  timestamp: string;
}

// Import the SDK class
// Implement a fallback if the SDK is not available
let AveroxCryptoSphere;
try {
  AveroxCryptoSphere = require('./averox-cryptosphere.js').AveroxCryptoSphere;
  console.log("[CryptoSphere] Successfully imported Averox CryptoSphere SDK");
} catch (error) {
  console.warn("[CryptoSphere] Could not load actual SDK, using fallback implementation");
  // Create a simple fallback implementation with basic AES encryption
  const crypto = require('crypto');
  
  class FallbackCryptoSphere {
    constructor(config) {
      this.config = config || {};
      this.algorithm = 'aes-256-gcm';
      this.keyId = config.keyId || 'AES-FALLBACK';
      console.log("[CryptoSphere] Fallback implementation initialized", { 
        keyId: this.keyId, 
        algorithm: this.algorithm 
      });
    }

    async encrypt({ data, additionalData }) {
      // Generate a secure key from a consistent seed for demo purposes
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'averox-encryption-key', 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Set authentication tag if using GCM mode
      if (additionalData) {
        cipher.setAAD(Buffer.from(JSON.stringify(additionalData)));
      }
      
      // Encrypt the data
      let strData = typeof data === 'string' ? data : JSON.stringify(data);
      let encrypted = cipher.update(strData, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get auth tag for GCM mode
      const authTag = cipher.getAuthTag().toString('hex');
      
      return {
        encrypted: encrypted + ':' + authTag, // Store auth tag with encrypted data
        iv: iv.toString('hex'),
        keyId: this.keyId,
        algorithm: this.algorithm,
        timestamp: new Date().toISOString(),
        additionalData
      };
    }

    async decrypt({ encrypted, iv }) {
      try {
        // Generate the same key used for encryption
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'averox-encryption-key', 'salt', 32);
        
        // Split encrypted data and auth tag
        const [encryptedData, authTag] = encrypted.split(':');
        
        // Create decipher
        const decipher = crypto.createDecipheriv(
          this.algorithm, 
          key, 
          Buffer.from(iv, 'hex')
        );
        
        // Set auth tag if present
        if (authTag) {
          decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        }
        
        // Decrypt the data
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        // Try to parse as JSON, fallback to string
        try {
          return {
            decrypted: JSON.parse(decrypted),
            keyId: this.keyId,
            timestamp: new Date().toISOString()
          };
        } catch (e) {
          return {
            decrypted: decrypted,
            keyId: this.keyId,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error('[CryptoSphere] Fallback decryption error:', error);
        throw new Error(`Failed to decrypt data: ${error.message}`);
      }
    }
  }
  
  AveroxCryptoSphere = FallbackCryptoSphere;
}

// Create a typed class wrapper
export class CryptoSphere {
  private sdk: any;

  constructor(config: CryptoSphereConfig = {}) {
    this.sdk = new AveroxCryptoSphere(config);
  }

  /**
   * Encrypt data using the SDK
   */
  async encrypt(params: EncryptParams): Promise<EncryptResult> {
    try {
      return await this.sdk.encrypt(params);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error(`Failed to encrypt data: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt data using the SDK
   */
  async decrypt(params: DecryptParams): Promise<DecryptResult> {
    try {
      return await this.sdk.decrypt(params);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error(`Failed to decrypt data: ${(error as Error).message}`);
    }
  }
}

// Create a default instance with environment configuration
export const cryptoSphere = new CryptoSphere({
  apiKey: process.env.CRYPTOSPHERE_API_KEY,
  keyId: process.env.CRYPTOSPHERE_KEY_ID || 'AES-419ad38b',
  debug: process.env.NODE_ENV !== 'production',
  telemetry: process.env.ENABLE_TELEMETRY === 'true',
});