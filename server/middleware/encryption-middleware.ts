import { Request, Response, NextFunction } from 'express';
import { encrypt, decrypt, encryptObject, decryptObject } from '../utils/encryption';

// List of URL patterns that contain sensitive data that should be encrypted/decrypted
const SENSITIVE_ROUTES = [
  { path: /^\/api\/accounts/, fields: ['billingAddress', 'notes', 'email', 'phone'] },
  { path: /^\/api\/contacts/, fields: ['email', 'phone', 'address', 'notes'] },
  { path: /^\/api\/leads/, fields: ['email', 'phone', 'address', 'notes'] },
  { path: /^\/api\/opportunities/, fields: ['notes'] },
  { path: /^\/api\/users/, fields: ['email', 'firstName', 'lastName'] },
  { path: /^\/api\/invoices/, fields: ['billingAddress', 'shippingAddress', 'notes'] },
  { path: /^\/api\/proposals/, fields: ['content'] },
];

/**
 * Middleware to encrypt sensitive data in request body before it reaches the database
 */
export function encryptSensitiveData(req: Request, res: Response, next: NextFunction) {
  if (!req.body || req.method === 'GET') {
    return next();
  }

  try {
    // Check if encryption is enabled
    if (process.env.ENCRYPTION_ENABLED !== 'true') {
      return next();
    }

    // Find if this is a sensitive route that needs encryption
    const routeConfig = SENSITIVE_ROUTES.find(route => route.path.test(req.path));
    
    if (routeConfig) {
      // Create a promise array to handle all encryption operations
      const encryptionPromises = [];
      
      // Apply field-specific encryption
      for (const field of routeConfig.fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          const encryptPromise = async () => {
            try {
              const encryptedData = await encrypt(req.body[field]);
              req.body[field] = JSON.stringify(encryptedData);
            } catch (err) {
              console.error(`Error encrypting field ${field}:`, err);
            }
          };
          encryptionPromises.push(encryptPromise());
        }
      }
      
      // Wait for all encryption operations to finish before proceeding
      Promise.all(encryptionPromises)
        .then(() => next())
        .catch(err => {
          console.error('Error during batch encryption:', err);
          next();
        });
    } else {
      next();
    }
  } catch (error) {
    console.error('Error encrypting request data:', error);
    next();
  }
}

/**
 * Middleware to decrypt sensitive data in response before sending to client
 */
export function decryptSensitiveData(req: Request, res: Response, next: NextFunction) {
  // Store the original send method
  const originalSend = res.send;

  // Override the send method
  res.send = function(body?: any): Response {
    if (body && typeof body === 'object' && req.method !== 'DELETE') {
      try {
        // Check if encryption is enabled
        if (process.env.ENCRYPTION_ENABLED !== 'true') {
          return originalSend.call(this, body);
        }
        
        // Find if this is a sensitive route that needs decryption
        const routeConfig = SENSITIVE_ROUTES.find(route => route.path.test(req.path));
        
        if (routeConfig) {
          // Handle decryption asynchronously
          const processDecryption = async () => {
            try {
              // Check if we have an array of objects or a single object
              if (Array.isArray(body)) {
                // Create a new array with decrypted items
                const decryptedItems = await Promise.all(body.map(async (item) => {
                  const decryptedItem = { ...item };
                  
                  // Apply field-specific decryption to each item in array
                  for (const field of routeConfig.fields) {
                    if (item[field] && typeof item[field] === 'string') {
                      try {
                        // Check if the field is a JSON stringified encryption object
                        try {
                          const encryptedData = JSON.parse(item[field]);
                          if (encryptedData.encrypted && encryptedData.iv) {
                            const decrypted = await decrypt(encryptedData.encrypted, encryptedData.iv, encryptedData.keyId);
                            decryptedItem[field] = decrypted;
                          }
                        } catch (parseError) {
                          // Not a JSON string, might not be encrypted
                        }
                      } catch (decryptError) {
                        console.error(`Error decrypting field ${field} in array item:`, decryptError);
                      }
                    }
                  }
                  return decryptedItem;
                }));
                
                return originalSend.call(this, decryptedItems);
              } else {
                // Single object case
                const decryptedBody = { ...body };
                
                // Process each field
                for (const field of routeConfig.fields) {
                  if (body[field] && typeof body[field] === 'string') {
                    try {
                      // Check if the field is a JSON stringified encryption object
                      try {
                        const encryptedData = JSON.parse(body[field]);
                        if (encryptedData.encrypted && encryptedData.iv) {
                          const decrypted = await decrypt(encryptedData.encrypted, encryptedData.iv, encryptedData.keyId);
                          decryptedBody[field] = decrypted;
                        }
                      } catch (parseError) {
                        // Not a JSON string, might not be encrypted
                      }
                    } catch (decryptError) {
                      console.error(`Error decrypting field ${field}:`, decryptError);
                    }
                  }
                }
                
                return originalSend.call(this, decryptedBody);
              }
            } catch (error) {
              console.error('Error during decryption process:', error);
              return originalSend.call(this, body);
            }
          };
          
          // Execute the decryption process
          processDecryption().catch(error => {
            console.error('Unhandled decryption error:', error);
            return originalSend.call(this, body);
          });
          
          // Don't return here, as the response will be sent by processDecryption
          return undefined as any;
        }
      } catch (error) {
        console.error('Error in decryption middleware:', error);
      }
    }
    
    // Call the original send method with the processed body
    return originalSend.call(this, body);
  };
  
  next();
}

/**
 * Function to determine if a field should be encrypted based on its name and context
 * This is useful for auto-detecting sensitive fields even if not explicitly listed
 */
export function isSensitiveField(fieldName: string, entityType: string): boolean {
  // Common sensitive field patterns
  const sensitivePatterns = [
    /password/i, 
    /secret/i, 
    /key/i, 
    /token/i, 
    /ssn/i, 
    /social.*security/i,
    /credit.*card/i, 
    /card.*number/i,
    /cvv/i,
    /security.*code/i,
    /tax.*id/i, 
    /passport/i
  ];

  // Check if field name matches any sensitive pattern
  for (const pattern of sensitivePatterns) {
    if (pattern.test(fieldName)) {
      return true;
    }
  }

  // Entity-specific sensitive fields
  const entitySensitiveFields: Record<string, string[]> = {
    users: ['email', 'firstName', 'lastName', 'phoneNumber'],
    leads: ['email', 'phone', 'address', 'notes'],
    contacts: ['email', 'phone', 'address', 'notes'],
    accounts: ['billingAddress', 'notes', 'email', 'phone'],
    opportunities: ['notes'],
    invoices: ['billingAddress', 'shippingAddress', 'notes'],
    proposals: ['content']
  };

  // Check if field is sensitive for this entity type
  if (entityType in entitySensitiveFields) {
    return entitySensitiveFields[entityType].includes(fieldName);
  }

  return false;
}