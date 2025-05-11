// Example of using Averox CryptoSphere SDK in Node.js
const { AveroxCryptoSphere } = require('./averox-cryptosphere.js');

async function runExample() {
  try {
    console.log('Initializing Averox CryptoSphere SDK...');
    const crypto = new AveroxCryptoSphere({
      debug: true
    });
    
    const dataToEncrypt = {
      message: 'This is a secure message',
      timestamp: new Date().toISOString(),
      metadata: {
        importance: 'high',
        category: 'example'
      }
    };
    
    console.log('\nOriginal data:');
    console.log(dataToEncrypt);
    
    console.log('\nEncrypting data...');
    const encryptedResult = await crypto.encrypt({ 
      data: dataToEncrypt,
      additionalData: { purpose: 'nodejs-example' }
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
    
    console.log('\nVerifying decrypted data matches original:');
    console.log('Match:', JSON.stringify(dataToEncrypt) === JSON.stringify(decryptedResult.decrypted));
  } catch (error) {
    console.error('Error:', error);
  }
}

runExample();
