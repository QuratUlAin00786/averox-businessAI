/**
 * Middleware for encrypting/decrypting sensitive data in API requests/responses
 * Uses the Averox CryptoSphere SDK for enhanced security and key monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { encryptFields, decryptFields } from '../utils/encryption';

// Whether to enable encryption middleware (controlled via environment variable)
const ENCRYPTION_ENABLED = process.env.ENABLE_ENCRYPTION === 'true';

// Define fields that should be encrypted across different API endpoints
const SENSITIVE_FIELDS_MAP: Record<string, string[]> = {
  // User-related endpoints
  '/api/users': ['email', 'firstName', 'lastName', 'phone'],
  '/api/auth': ['email', 'password'],
  
  // Account-related endpoints
  '/api/accounts': ['email', 'phone', 'billingAddress', 'notes'],
  
  // Lead-related endpoints
  '/api/leads': ['email', 'phone', 'notes'],
  
  // Contact-related endpoints
  '/api/contacts': ['email', 'phone', 'address', 'notes'],
  
  // Opportunity-related endpoints
  '/api/opportunities': ['notes'],
  
  // Invoice-related endpoints
  '/api/invoices': ['billingAddress', 'shippingAddress', 'notes']
};

/**
 * Get sensitive fields for a given API path
 * @param path The API path
 * @returns Array of field names that are sensitive
 */
function getSensitiveFieldsForPath(path: string): string[] {
  // Exact match
  if (SENSITIVE_FIELDS_MAP[path]) {
    return SENSITIVE_FIELDS_MAP[path];
  }
  
  // Check for path with ID pattern (e.g., /api/users/123)
  const basePathWithId = Object.keys(SENSITIVE_FIELDS_MAP).find(basePath => 
    path.startsWith(basePath + '/') && /^\/\d+$/.test(path.substring(basePath.length))
  );
  
  if (basePathWithId) {
    return SENSITIVE_FIELDS_MAP[basePathWithId];
  }
  
  // No sensitive fields for this path
  return [];
}

/**
 * Middleware to encrypt sensitive fields in request bodies
 */
export const encryptSensitiveData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip encryption if not enabled or if it's a GET request
    if (!ENCRYPTION_ENABLED || req.method === 'GET' || !req.body || typeof req.body !== 'object') {
      return next();
    }

    const sensitiveFields = getSensitiveFieldsForPath(req.path);
    
    if (sensitiveFields.length > 0) {
      req.body = await encryptFields(req.body, sensitiveFields);
      console.log(`[Encryption] Encrypted ${sensitiveFields.length} fields for ${req.path}`);
    }
    
    next();
  } catch (error) {
    console.error('Error encrypting request data:', error);
    next(error);
  }
};

/**
 * Middleware to decrypt sensitive fields in response bodies
 */
export const decryptSensitiveData = async (req: Request, res: Response, next: NextFunction) => {
  // Skip decryption setup if not enabled
  if (!ENCRYPTION_ENABLED) {
    return next();
  }
  
  const originalSend = res.send;
  
  res.send = async function(body?: any): Response {
    try {
      if (body && typeof body === 'object') {
        const sensitiveFields = getSensitiveFieldsForPath(req.path);
        
        if (sensitiveFields.length > 0) {
          // Handle array responses
          if (Array.isArray(body)) {
            body = await Promise.all(body.map(item => decryptFields(item, sensitiveFields)));
          } else {
            body = await decryptFields(body, sensitiveFields);
          }
          console.log(`[Encryption] Decrypted ${sensitiveFields.length} fields for ${req.path}`);
        }
      }
      
      // Call the original send
      return originalSend.call(this, body);
    } catch (error) {
      console.error('Error decrypting response data:', error);
      return originalSend.call(this, body);
    }
  };
  
  next();
};