/**
 * Utility script to generate a secure AES-256 encryption key
 * This key should be stored securely in your environment variables
 * as ENCRYPTION_KEY for production environments
 * 
 * Run with: npx tsx scripts/generate-encryption-key.ts
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { encrypt } from '../server/utils/encryption';

// Function to generate a strong random encryption key for AES-256
function generateEncryptionKey(): string {
  // Generate 32 bytes (256 bits) of random data
  const keyBuffer = crypto.randomBytes(32);
  // Convert to base64 for storage
  return keyBuffer.toString('base64');
}

// Function to encrypt the database connection string using the new key
function encryptConnectionString(key: string, connectionString: string): string {
  // Simple encryption of the connection string for demonstration
  // In a real environment, this would use proper encryption from the util
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(key, 'base64'), 
    crypto.randomBytes(16)
  );
  
  let encrypted = cipher.update(connectionString, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}

// Main function
async function main() {
  console.log('Generating AES-256 encryption key for Averox Business AI...');
  
  // Generate encryption key
  const encryptionKey = generateEncryptionKey();
  
  console.log('\nEncryption Key (Add this to your .env file as ENCRYPTION_KEY):');
  console.log(encryptionKey);
  
  // Get the current DATABASE_URL from environment if available
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    console.log('\nYour current DATABASE_URL can be encrypted as follows:');
    
    // Set the key in environment for the utility to use
    process.env.ENCRYPTION_KEY = encryptionKey;
    
    // Use our encryption utility to encrypt the database URL
    const encryptedDbUrl = encrypt(databaseUrl);
    
    console.log('\nEncrypted Database URL:');
    console.log(encryptedDbUrl);
    
    console.log('\nTo use encrypted connection strings:');
    console.log('1. Add ENCRYPTION_KEY to your environment');
    console.log('2. Replace DATABASE_URL with the encrypted value above');
    console.log('3. Set USE_ENCRYPTED_CONNECTION=true in your environment');
  } else {
    console.log('\nNo DATABASE_URL found in environment.');
    console.log('To encrypt your database connection:');
    console.log('1. Add ENCRYPTION_KEY to your environment with the value above');
    console.log('2. Encrypt your DATABASE_URL using this utility');
    console.log('3. Set USE_ENCRYPTED_CONNECTION=true in your environment');
  }
  
  // Create a sample .env file with the key
  try {
    const envFile = path.join(process.cwd(), '.env.encryption-sample');
    const envContent = `# Encryption configuration
ENCRYPTION_KEY=${encryptionKey}
USE_ENCRYPTED_CONNECTION=true

# Replace DATABASE_URL with encrypted version if needed
# DATABASE_URL=${databaseUrl || 'your-database-url'}
`;
    
    fs.writeFileSync(envFile, envContent);
    console.log(`\nA sample environment file has been created at: ${envFile}`);
  } catch (error) {
    console.error('Error creating sample .env file:', error);
  }
  
  console.log('\nIMPORTANT: Keep your encryption key secure and backed up!');
  console.log('If you lose this key, encrypted data will become inaccessible.');
}

// Run the main function
main().catch(console.error);