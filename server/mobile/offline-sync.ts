import express from 'express';
import { db } from '../db';
import { leads, contacts, tasks, opportunities, activities } from '../../shared/schema';
import { eq, gte } from 'drizzle-orm';

export interface OfflineData {
  leads: any[];
  contacts: any[];
  tasks: any[];
  opportunities: any[];
  activities: any[];
  lastSyncTimestamp: string;
  userId: number;
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'lead' | 'contact' | 'task' | 'opportunity' | 'activity';
  data: any;
  timestamp: string;
  userId: number;
  status: 'pending' | 'synced' | 'conflict';
}

class OfflineSyncManager {
  // Get offline data package for mobile app
  async getOfflineDataPackage(userId: number): Promise<OfflineData> {
    try {
      console.log(`[OfflineSync] Preparing offline data package for user ${userId}`);

      // Fetch real data from database
      const [leadsData, contactsData, tasksData, opportunitiesData, activitiesData] = await Promise.all([
        db.select().from(leads).limit(100),
        db.select().from(contacts).limit(100),
        db.select().from(tasks).where(eq(tasks.ownerId, userId)).limit(50),
        db.select().from(opportunities).limit(50),
        db.select().from(activities).limit(100)
      ]);

      const offlineData: OfflineData = {
        leads: leadsData,
        contacts: contactsData,
        tasks: tasksData,
        opportunities: opportunitiesData,
        activities: activitiesData,
        lastSyncTimestamp: new Date().toISOString(),
        userId
      };

      console.log(`[OfflineSync] Offline package prepared with ${leadsData.length} leads, ${contactsData.length} contacts`);
      return offlineData;
    } catch (error) {
      console.error('[OfflineSync] Error preparing offline data:', error);
      throw new Error('Failed to prepare offline data package');
    }
  }

  // Process sync operations from mobile app
  async processSyncOperations(userId: number, operations: SyncOperation[]): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
    conflicts: { id: string; serverData: any; clientData: any }[];
  }> {
    const successful: string[] = [];
    const failed: { id: string; error: string }[] = [];
    const conflicts: { id: string; serverData: any; clientData: any }[] = [];

    console.log(`[OfflineSync] Processing ${operations.length} sync operations for user ${userId}`);

    for (const operation of operations) {
      try {
        // Process each operation against real database
        switch (operation.entity) {
          case 'lead':
            await this.syncLeadOperation(operation);
            successful.push(operation.id);
            break;
          case 'contact':
            await this.syncContactOperation(operation);
            successful.push(operation.id);
            break;
          case 'task':
            await this.syncTaskOperation(operation);
            successful.push(operation.id);
            break;
          default:
            failed.push({
              id: operation.id,
              error: `Unsupported entity type: ${operation.entity}`
            });
        }
      } catch (error) {
        failed.push({
          id: operation.id,
          error: error instanceof Error ? error.message : 'Processing failed'
        });
      }
    }

    console.log(`[OfflineSync] Sync complete: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed, conflicts };
  }

  private async syncLeadOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await db.insert(leads).values(operation.data);
        break;
      case 'update':
        await db.update(leads).set(operation.data).where(eq(leads.id, operation.data.id));
        break;
      case 'delete':
        await db.delete(leads).where(eq(leads.id, operation.data.id));
        break;
    }
  }

  private async syncContactOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await db.insert(contacts).values(operation.data);
        break;
      case 'update':
        await db.update(contacts).set(operation.data).where(eq(contacts.id, operation.data.id));
        break;
      case 'delete':
        await db.delete(contacts).where(eq(contacts.id, operation.data.id));
        break;
    }
  }

  private async syncTaskOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'create':
        await db.insert(tasks).values(operation.data);
        break;
      case 'update':
        await db.update(tasks).set(operation.data).where(eq(tasks.id, operation.data.id));
        break;
      case 'delete':
        await db.delete(tasks).where(eq(tasks.id, operation.data.id));
        break;
    }
  }

  // Get incremental updates since last sync
  async getIncrementalUpdates(userId: number, lastSyncTimestamp: string): Promise<{
    updates: any[];
    deletions: any[];
    newSyncTimestamp: string;
  }> {
    const lastSync = new Date(lastSyncTimestamp);
    const now = new Date();

    console.log(`[OfflineSync] Getting incremental updates since ${lastSyncTimestamp}`);

    // Get updates from all entities since last sync
    const [updatedLeads, updatedContacts, updatedTasks] = await Promise.all([
      db.select().from(leads).where(gte(leads.createdAt, lastSync)),
      db.select().from(contacts).where(gte(contacts.createdAt, lastSync)),
      db.select().from(tasks).where(gte(tasks.createdAt, lastSync))
    ]);

    const updates = [
      ...updatedLeads.map(lead => ({ type: 'lead', data: lead })),
      ...updatedContacts.map(contact => ({ type: 'contact', data: contact })),
      ...updatedTasks.map(task => ({ type: 'task', data: task }))
    ];

    return {
      updates,
      deletions: [], // Would track deletions in a real implementation
      newSyncTimestamp: now.toISOString()
    };
  }
}

export const offlineSyncManager = new OfflineSyncManager();

// Express routes for offline sync
export function setupOfflineSyncRoutes(app: express.Application) {
  // Get offline data package
  app.get('/api/mobile/offline-data', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const offlineData = await offlineSyncManager.getOfflineDataPackage(req.user.id);
      res.json(offlineData);
    } catch (error) {
      console.error('[OfflineSync] Get offline data error:', error);
      res.status(500).json({ error: 'Failed to get offline data' });
    }
  });

  // Process sync operations
  app.post('/api/mobile/sync', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { operations } = req.body;
      
      if (!Array.isArray(operations)) {
        return res.status(400).json({ error: 'Operations must be an array' });
      }

      const result = await offlineSyncManager.processSyncOperations(req.user.id, operations);
      res.json(result);
    } catch (error) {
      console.error('[OfflineSync] Sync operations error:', error);
      res.status(500).json({ error: 'Failed to process sync operations' });
    }
  });

  // Get incremental updates
  app.get('/api/mobile/incremental-updates', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { lastSyncTimestamp } = req.query;
      
      if (!lastSyncTimestamp || typeof lastSyncTimestamp !== 'string') {
        return res.status(400).json({ error: 'lastSyncTimestamp is required' });
      }

      const updates = await offlineSyncManager.getIncrementalUpdates(req.user.id, lastSyncTimestamp);
      res.json(updates);
    } catch (error) {
      console.error('[OfflineSync] Incremental updates error:', error);
      res.status(500).json({ error: 'Failed to get incremental updates' });
    }
  });
}