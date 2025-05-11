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
const AveroxCryptoSphere = require('../utils/averox-cryptosphere.js').AveroxCryptoSphere;

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