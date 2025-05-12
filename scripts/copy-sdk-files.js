/**
 * This script ensures the Averox CryptoSphere SDK is copied to the deployment location
 * Run this before deployment to ensure the SDK is available
 */
const fs = require('fs');
const path = require('path');

// Define source and destination paths
const srcFilePath = path.join(__dirname, '../server/utils/averox-cryptosphere.js');
const destDir = path.join(__dirname, '../dist/server/utils/');
const destFilePath = path.join(destDir, 'averox-cryptosphere.js');

console.log('Copying CryptoSphere SDK to deployment location...');
console.log('Source: ' + srcFilePath);
console.log('Destination: ' + destFilePath);

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  console.log('Creating directory: ' + destDir);
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  // Check if source file exists
  if (fs.existsSync(srcFilePath)) {
    // Copy the file
    fs.copyFileSync(srcFilePath, destFilePath);
    console.log('SDK file copied successfully!');
  } else {
    console.error('Source SDK file not found!');
    
    // Create a minimal implementation as fallback
    console.log('Creating minimal SDK implementation as fallback...');
    
    const fallbackCode = `/**
 * Fallback implementation of Averox CryptoSphere SDK
 * This is used when the actual SDK is not available
 */
const crypto = require('crypto');

class AveroxCryptoSphere {
  constructor(config = {}) {
    this.config = config || {};
    this.algorithm = 'aes-256-gcm';
    this.keyId = config.keyId || 'AES-FALLBACK';
    console.log("[AveroxCryptoSphere] Fallback SDK initialized", {
      apiKey: null,
      keyId: this.keyId,
      algorithm: this.algorithm,
      endpoint: config.endpoint || '/api',
      debug: true,
      telemetry: false,
      defaultAlgorithm: 'master'
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
      console.error('[AveroxCryptoSphere] Fallback decryption error:', error);
      throw new Error("Failed to decrypt data: " + error.message);
    }
  }
}

module.exports = { AveroxCryptoSphere };
`;
    
    fs.writeFileSync(destFilePath, fallbackCode);
    console.log('Fallback SDK file created successfully!');
  }
} catch (error) {
  console.error('Error copying SDK file:', error);
  process.exit(1);
}