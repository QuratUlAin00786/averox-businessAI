/**
 * Test script for Averox CryptoSphere SDK
 * This can be run directly to verify encryption functionality
 */

import { cryptoSphere } from '../server/utils/cryptosphere.js';
import { encrypt, decrypt, encryptFields, decryptFields } from '../server/utils/encryption.js';

// Set environment variables for testing
process.env.ENABLE_ENCRYPTION = 'true';
process.env.CRYPTOSPHERE_KEY_ID = 'AES-419ad38b';
process.env.DEBUG = 'true';

async function runEncryptionTests() {
  console.log('🔒 Starting Averox CryptoSphere Encryption Tests 🔒');
  console.log('------------------------------------------------');
  
  try {
    // Test basic string encryption/decryption
    console.log('\n🧪 Test 1: Basic String Encryption/Decryption');
    const testString = 'This is a sensitive test string for Averox CryptoSphere';
    console.log(`Input: "${testString}"`);
    
    const encryptedResult = await encrypt(testString);
    console.log('Encrypted:', {
      encrypted: encryptedResult.encrypted.substring(0, 20) + '...',
      iv: encryptedResult.iv,
      keyId: encryptedResult.keyId
    });
    
    const decryptedResult = await decrypt(
      encryptedResult.encrypted,
      encryptedResult.iv,
      encryptedResult.keyId
    );
    
    console.log(`Decrypted: "${decryptedResult}"`);
    console.log(`Test Result: ${decryptedResult === testString ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test object encryption/decryption
    console.log('\n🧪 Test 2: Object Encryption/Decryption');
    const testObject = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      ssn: '123-45-6789',
      address: '123 Main St, Anytown, USA'
    };
    console.log('Input:', testObject);
    
    const encryptedObjectResult = await encrypt(testObject);
    console.log('Encrypted:', {
      encrypted: encryptedObjectResult.encrypted.substring(0, 20) + '...',
      iv: encryptedObjectResult.iv,
      keyId: encryptedObjectResult.keyId
    });
    
    const decryptedObjectResult = await decrypt(
      encryptedObjectResult.encrypted,
      encryptedObjectResult.iv,
      encryptedObjectResult.keyId
    );
    
    console.log('Decrypted:', decryptedObjectResult);
    console.log(`Test Result: ${JSON.stringify(decryptedObjectResult) === JSON.stringify(testObject) ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test selective field encryption/decryption
    console.log('\n🧪 Test 3: Selective Field Encryption/Decryption');
    const userData = {
      id: 12345,
      username: 'jdoe',
      email: 'john.doe@example.com',
      password: 'secure_password',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date().toISOString(),
      notes: 'This user has special account privileges'
    };
    
    console.log('Original Data:', userData);
    
    const fieldsToEncrypt = ['email', 'password', 'firstName', 'lastName', 'notes'];
    const encryptedData = await encryptFields(userData, fieldsToEncrypt);
    
    console.log('Data with Encrypted Fields:');
    console.log(encryptedData);
    
    const decryptedData = await decryptFields(encryptedData, fieldsToEncrypt);
    
    console.log('Data with Decrypted Fields:');
    console.log(decryptedData);
    
    let fieldEncryptionPassed = true;
    for (const field of fieldsToEncrypt) {
      if (userData[field] !== decryptedData[field]) {
        fieldEncryptionPassed = false;
        console.log(`Field mismatch in ${field}`);
      }
    }
    
    console.log(`Test Result: ${fieldEncryptionPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Test encryption performance
    console.log('\n🧪 Test 4: Encryption Performance');
    const largeObject = { data: new Array(10000).fill('X').join('') };
    
    console.log('Testing encryption performance with large data...');
    const startTime = Date.now();
    await encrypt(largeObject);
    const duration = Date.now() - startTime;
    
    console.log(`Encryption of large object completed in ${duration}ms`);
    console.log(`Test Result: ${duration < 1000 ? '✅ PASSED' : '⚠️ SLOW'}`);
    
    console.log('\n✅ All encryption tests completed');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

// Run the tests
runEncryptionTests().catch(error => {
  console.error('Test script error:', error);
});