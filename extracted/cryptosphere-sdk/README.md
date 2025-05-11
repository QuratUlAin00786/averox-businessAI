# Averox CryptoSphere JavaScript SDK

This package contains the Averox CryptoSphere encryption SDK for JavaScript applications.

## Usage

### Browser

Include the SDK directly in your HTML:

```html
<script src="./averox-cryptosphere.js"></script>
```

Then use it in your JavaScript:

```javascript
const crypto = new AveroxCryptoSphere({
  debug: true
});

// Encrypt data
crypto.encrypt({ data: "Hello, secure world!" })
  .then(result => {
    console.log("Encrypted:", result);
    
    // Decrypt data
    return crypto.decrypt({
      encrypted: result.encrypted,
      iv: result.iv
    });
  })
  .then(result => {
    console.log("Decrypted:", result.decrypted);
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

### Node.js

Copy the SDK file to your project and require it:

```javascript
const { AveroxCryptoSphere } = require('./averox-cryptosphere.js');

const crypto = new AveroxCryptoSphere({
  debug: true
});

// Use the same API as the browser version
```

## API Reference

### Initialize

```javascript
const crypto = new AveroxCryptoSphere({
  apiKey: "YOUR_API_KEY", // Optional
  keyId: "your-key-id",   // Optional, defaults to the bundled key
  algorithm: "AES-GCM",   // Optional, defaults to the bundled algorithm
  endpoint: "/api",       // Optional API endpoint
  debug: false,           // Optional, enables console logging
  telemetry: true         // Optional, enables usage telemetry
});
```

### Encrypt Data

```javascript
crypto.encrypt({
  data: "Your data to encrypt", // String, object, or ArrayBuffer
  keyId: "optional-specific-key-id", // Optional
  algorithm: "AES-GCM", // Optional
  additionalData: { /* any additional metadata */ } // Optional
})
.then(result => {
  console.log(result.encrypted); // Base64 encrypted data
  console.log(result.iv);        // Base64 initialization vector
  console.log(result.keyId);     // Key ID used
  console.log(result.timestamp); // Encryption timestamp
});
```

### Decrypt Data

```javascript
crypto.decrypt({
  encrypted: "Base64EncodedEncryptedData", // Required
  iv: "Base64EncodedInitializationVector", // Required
  keyId: "optional-specific-key-id"        // Optional
})
.then(result => {
  console.log(result.decrypted); // Decrypted data (parsed as JSON if possible)
  console.log(result.keyId);     // Key ID used
  console.log(result.timestamp); // Decryption timestamp
});
```

## Security Notes

- This SDK uses the Web Crypto API in browsers and Node.js crypto module in Node environments
- The bundled key is derived from a key ID and is suitable for testing only
- For production use, connect to the Averox CryptoSphere API server
