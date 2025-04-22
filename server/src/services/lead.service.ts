/**
 * @file Lead service
 * @description Provides lead management functionality
 * @module services/lead
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../utils/db';
import { leads, users, activities } from '../../shared/schema';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Lead service class
 * Provides methods for lead CRUD operations
 */
export class LeadService {
  /**
   * Get all leads
   * @returns List of all leads
   */
  async getAllLeads() {
    try {
      // Fetch leads with owner information
      const allLeads = await db.query.leads.findMany({
        with: {
          owner: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [desc(leads.createdAt)]
      });
      
      return allLeads;
    } catch (error) {
      logger.error('Failed to retrieve leads', error);
      throw new ApiError('Failed to retrieve leads', 500);
    }
  }
  
  /**
   * Get leads for a specific owner
   * @param ownerId Owner ID to filter by
   * @returns List of leads for the specified owner
   */
  async getLeadsByOwner(ownerId: number) {
    try {
      const ownerLeads = await db.query.leads.findMany({
        where: eq(leads.ownerId, ownerId),
        with: {
          owner: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [desc(leads.createdAt)]
      });
      
      return ownerLeads;
    } catch (error) {
      logger.error('Failed to retrieve leads by owner', { ownerId, error });
      throw new ApiError('Failed to retrieve leads', 500);
    }
  }
  
  /**
   * Create a new lead
   * @param leadData Lead data for new lead
   * @returns Created lead object
   */
  async createLead(leadData: typeof leads.$inferInsert) {
    try {
      // Insert the new lead
      const [newLead] = await db.insert(leads)
        .values({
          ...leadData,
          createdAt: new Date(),
        })
        .returning();
      
      if (!newLead) {
        throw new ApiError('Failed to create lead', 500);
      }
      
      // Log activity
      if (leadData.ownerId) {
        await db.insert(activities).values({
          userId: leadData.ownerId,
          action: 'Created lead',
          detail: `${newLead.firstName} ${newLead.lastName}`,
          relatedToType: 'lead',
          relatedToId: newLead.id,
          createdAt: new Date(),
          icon: 'added',
        });
      }
      
      // Fetch full lead with owner information
      const leadWithOwner = await db.query.leads.findFirst({
        where: eq(leads.id, newLead.id),
        with: {
          owner: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      return leadWithOwner;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to create lead', error);
      throw new ApiError('Failed to create lead', 500);
    }
  }
  
  /**
   * Get lead by ID
   * @param leadId Lead ID to lookup
   * @returns Lead object
   */
  async getLeadById(leadId: number) {
    try {
      const lead = await db.query.leads.findFirst({
        where: eq(leads.id, leadId),
        with: {
          owner: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      if (!lead) {
        throw new ApiError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }
      
      return lead;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to retrieve lead', { leadId, error });
      throw new ApiError('Failed to retrieve lead', 500);
    }
  }
  
  /**
   * Update a lead
   * @param leadId Lead ID to update
   * @param leadData Updated lead data
   * @returns Updated lead object
   */
  async updateLead(leadId: number, leadData: Partial<typeof leads.$inferInsert>, userId: number) {
    try {
      // Check if lead exists
      const existingLead = await db.query.leads.findFirst({
        where: eq(leads.id, leadId)
      });
      
      if (!existingLead) {
        throw new ApiError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }
      
      // Update the lead
      const [updatedLead] = await db.update(leads)
        .set(leadData)
        .where(eq(leads.id, leadId))
        .returning();
      
      if (!updatedLead) {
        throw new ApiError('Failed to update lead', 500);
      }
      
      // Log activity
      await db.insert(activities).values({
        userId,
        action: 'Updated lead',
        detail: `${updatedLead.firstName} ${updatedLead.lastName}`,
        relatedToType: 'lead',
        relatedToId: updatedLead.id,
        createdAt: new Date(),
        icon: 'updated',
      });
      
      // Fetch full lead with owner information
      const leadWithOwner = await db.query.leads.findFirst({
        where: eq(leads.id, updatedLead.id),
        with: {
          owner: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      return leadWithOwner;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to update lead', { leadId, error });
      throw new ApiError('Failed to update lead', 500);
    }
  }
  
  /**
   * Delete a lead
   * @param leadId Lead ID to delete
   * @returns Success status
   */
  async deleteLead(leadId: number, userId: number) {
    try {
      // Check if lead exists
      const existingLead = await db.query.leads.findFirst({
        where: eq(leads.id, leadId)
      });
      
      if (!existingLead) {
        throw new ApiError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }
      
      // Log activity before deletion
      await db.insert(activities).values({
        userId,
        action: 'Deleted lead',
        detail: `${existingLead.firstName} ${existingLead.lastName}`,
        relatedToType: 'lead',
        relatedToId: null, // No ID since it will be deleted
        createdAt: new Date(),
        icon: 'deleted',
      });
      
      // Delete the lead
      await db.delete(leads).where(eq(leads.id, leadId));
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to delete lead', { leadId, error });
      throw new ApiError('Failed to delete lead', 500);
    }
  }
  
  /**
   * Get lead statistics
   * @returns Statistics about leads
   */
  async getLeadStats() {
    try {
      // Count total leads
      const totalLeadsResult = await db.select({
        count: sql<number>`count(*)`
      }).from(leads);
      
      const totalLeads = totalLeadsResult[0].count;
      
      // Count new leads in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newLeadsResult = await db.select({
        count: sql<number>`count(*)`
      }).from(leads).where(
        sql`${leads.createdAt} >= ${thirtyDaysAgo}`
      );
      
      const newLeads = newLeadsResult[0].count;
      
      // Count leads by status
      const leadsByStatusResult = await db.select({
        status: leads.status,
        count: sql<number>`count(*)`
      }).from(leads).groupBy(leads.status);
      
      const leadsByStatus = leadsByStatusResult.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate conversion rate
      const convertedLeadsResult = await db.select({
        count: sql<number>`count(*)`
      }).from(leads).where(
        eq(leads.isConverted, true)
      );
      
      const convertedLeads = convertedLeadsResult[0].count;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      return {
        totalLeads,
        newLeads,
        leadsByStatus,
        convertedLeads,
        conversionRate: `${conversionRate.toFixed(1)}%`
      };
    } catch (error) {
      logger.error('Failed to retrieve lead statistics', error);
      throw new ApiError('Failed to retrieve lead statistics', 500);
    }
  }
}

// Export singleton instance
export const leadService = new LeadService();