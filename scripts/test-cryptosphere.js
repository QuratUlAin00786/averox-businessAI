/**
 * Simple test script for the Averox CryptoSphere SDK
 * Run with: node scripts/test-cryptosphere.js
 */

const { AveroxCryptoSphere } = require('../server/utils/averox-cryptosphere.js');

// Initialize the SDK with debug mode
const crypto = new AveroxCryptoSphere({
  debug: true
});

// Test data to encrypt
const testData = {
  message: 'Hello from the Averox CryptoSphere SDK!',
  timestamp: new Date().toISOString(),
  metadata: {
    test: true,
    environment: 'development'
  }
};

// Run encryption test
async function runTest() {
  try {
    console.log('\n===== AVEROX CRYPTOSPHERE SDK TEST =====\n');
    
    console.log('Original data:');
    console.log(testData);
    
    console.log('\nEncrypting data...');
    const encryptedResult = await crypto.encrypt({ 
      data: testData,
      additionalData: { purpose: 'testing' }
    });
    
    console.log('\nEncryption result:');
    console.log(encryptedResult);
    
    console.log('\nDecrypting data...');
    const decryptedResult = await crypto.decrypt({
      encrypted: encryptedResult.encrypted,
      iv: encryptedResult.iv,
      keyId: encryptedResult.keyId
    });
    
    console.log('\nDecryption result:');
    console.log(decryptedResult);
    
    console.log('\nVerifying data integrity:');
    const originalJson = JSON.stringify(testData);
    const decryptedJson = JSON.stringify(decryptedResult.decrypted);
    
    console.log(`Original:  ${originalJson}`);
    console.log(`Decrypted: ${decryptedJson}`);
    console.log(`Match: ${originalJson === decryptedJson ? 'YES ✅' : 'NO ❌'}`);
    
    console.log('\n===== TEST COMPLETE =====\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  }
}

// Run the test
runTest();