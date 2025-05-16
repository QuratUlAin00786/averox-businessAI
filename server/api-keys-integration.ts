import { 
  apiKeys, type ApiKey, type InsertApiKey
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from './db';
import { MemStorage, DatabaseStorage } from './storage';

/**
 * Adds API key management methods to the MemStorage class
 * @param storage The MemStorage instance to enhance
 */
export function addApiKeysToMemStorage(storage: MemStorage): void {
  // API Keys
  storage.getApiKey = async function(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  };

  storage.listApiKeys = async function(filter?: Partial<ApiKey>): Promise<ApiKey[]> {
    let keys = Array.from(this.apiKeys.values());
    
    if (filter) {
      keys = keys.filter(key => {
        for (const [k, value] of Object.entries(filter)) {
          if (key[k as keyof ApiKey] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return keys;
  };

  storage.createApiKey = async function(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.apiKeyIdCounter++;
    const createdAt = new Date();
    
    const newApiKey: ApiKey = {
      ...apiKey,
      id,
      createdAt,
      updatedAt: null,
      usageCount: 0,
      lastUsed: null
    };
    
    this.apiKeys.set(id, newApiKey);
    return newApiKey;
  };

  storage.updateApiKey = async function(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    const existingApiKey = this.apiKeys.get(id);
    if (!existingApiKey) {
      return undefined;
    }
    
    const updatedApiKey = {
      ...existingApiKey,
      ...apiKeyData,
      updatedAt: new Date()
    };
    
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  };

  storage.deleteApiKey = async function(id: number): Promise<boolean> {
    return this.apiKeys.delete(id);
  };
}

/**
 * Adds API key management methods to the DatabaseStorage class
 * @param storage The DatabaseStorage instance to enhance
 */
export function addApiKeysToDatabaseStorage(storage: DatabaseStorage): void {
  // API Keys
  storage.getApiKey = async function(id: number): Promise<ApiKey | undefined> {
    try {
      const [key] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
      return key;
    } catch (error) {
      console.error('Database error in getApiKey:', error);
      return undefined;
    }
  };

  storage.listApiKeys = async function(filter?: Partial<ApiKey>): Promise<ApiKey[]> {
    try {
      let query = db.select().from(apiKeys);
      
      // Add WHERE clauses based on filter
      if (filter) {
        if (filter.provider !== undefined) {
          query = query.where(eq(apiKeys.provider, filter.provider));
        }
        if (filter.ownerId !== undefined) {
          query = query.where(eq(apiKeys.ownerId, filter.ownerId));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(apiKeys.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listApiKeys:', error);
      return [];
    }
  };

  storage.createApiKey = async function(apiKey: InsertApiKey): Promise<ApiKey> {
    try {
      const [newApiKey] = await db.insert(apiKeys).values(apiKey).returning();
      return newApiKey;
    } catch (error) {
      console.error('Database error in createApiKey:', error);
      throw new Error(`Failed to create API key: ${error}`);
    }
  };

  storage.updateApiKey = async function(id: number, apiKeyData: Partial<InsertApiKey>): Promise<ApiKey | undefined> {
    try {
      // Remove the updatedAt field as it doesn't exist in the schema
      const [updatedApiKey] = await db.update(apiKeys)
        .set(apiKeyData)
        .where(eq(apiKeys.id, id))
        .returning();
      return updatedApiKey;
    } catch (error) {
      console.error('Database error in updateApiKey:', error);
      return undefined;
    }
  };

  storage.deleteApiKey = async function(id: number): Promise<boolean> {
    try {
      const result = await db.delete(apiKeys).where(eq(apiKeys.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Database error in deleteApiKey:', error);
      return false;
    }
  };
}