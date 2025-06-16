import { 
  socialIntegrations, type SocialIntegration, type InsertSocialIntegration,
  socialMessages, type SocialMessage, type InsertSocialMessage,
  leadSources, type LeadSource, type InsertLeadSource,
  socialCampaigns, type SocialCampaign, type InsertSocialCampaign
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from './db';

/**
 * This file contains the implementation of the social media-related storage methods.
 * Import these methods into the MemStorage and DatabaseStorage classes.
 */

// MemStorage implementations
export const MemStorageSocialMediaIntegrations = {
  // Social Media Integrations
  async getSocialIntegration(id: number): Promise<SocialIntegration | undefined> {
    return this.socialIntegrations.get(id);
  },

  async listSocialIntegrations(filter?: Partial<SocialIntegration>): Promise<SocialIntegration[]> {
    let integrations = Array.from(this.socialIntegrations.values());
    
    if (filter) {
      integrations = integrations.filter(integration => {
        for (const [key, value] of Object.entries(filter)) {
          if (integration[key as keyof SocialIntegration] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return integrations;
  },

  async getUserSocialIntegrations(userId: number): Promise<SocialIntegration[]> {
    return this.listSocialIntegrations({ userId });
  },

  async createSocialIntegration(integration: InsertSocialIntegration): Promise<SocialIntegration> {
    const id = this.socialIntegrationIdCounter++;
    const createdAt = new Date();
    
    const socialIntegration: SocialIntegration = {
      ...integration,
      id,
      createdAt,
      updatedAt: null,
      accessToken: integration.accessToken || null,
      refreshToken: integration.refreshToken || null,
      tokenExpiry: integration.tokenExpiry || null,
      webhookUrl: integration.webhookUrl || null,
      webhookSecret: integration.webhookSecret || null,
      config: integration.config || null,
      isActive: integration.isActive === undefined ? true : integration.isActive
    };
    
    this.socialIntegrations.set(id, socialIntegration);
    return socialIntegration;
  },

  async updateSocialIntegration(id: number, integrationData: Partial<InsertSocialIntegration>): Promise<SocialIntegration | undefined> {
    const existingIntegration = this.socialIntegrations.get(id);
    if (!existingIntegration) {
      return undefined;
    }
    
    const updatedIntegration = {
      ...existingIntegration,
      ...integrationData,
      updatedAt: new Date()
    };
    
    this.socialIntegrations.set(id, updatedIntegration);
    return updatedIntegration;
  },

  async deleteSocialIntegration(id: number): Promise<boolean> {
    return this.socialIntegrations.delete(id);
  },

  // Social Media Messages
  async getSocialMessage(id: number): Promise<SocialMessage | undefined> {
    return this.socialMessages.get(id);
  },

  async listSocialMessages(filter?: Partial<SocialMessage>): Promise<SocialMessage[]> {
    let messages = Array.from(this.socialMessages.values());
    
    if (filter) {
      messages = messages.filter(message => {
        for (const [key, value] of Object.entries(filter)) {
          if (message[key as keyof SocialMessage] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return messages;
  },

  async getLeadSocialMessages(leadId: number): Promise<SocialMessage[]> {
    return this.listSocialMessages({ leadId });
  },

  async getContactSocialMessages(contactId: number): Promise<SocialMessage[]> {
    return this.listSocialMessages({ contactId });
  },

  async createSocialMessage(message: InsertSocialMessage): Promise<SocialMessage> {
    const id = this.socialMessageIdCounter++;
    const createdAt = new Date();
    
    const socialMessage: SocialMessage = {
      ...message,
      id,
      createdAt,
      attachments: message.attachments || null,
      metadata: message.metadata || null,
      receivedAt: message.receivedAt || null,
      isDeleted: message.isDeleted === undefined ? false : message.isDeleted
    };
    
    this.socialMessages.set(id, socialMessage);
    return socialMessage;
  },

  async updateSocialMessage(id: number, messageData: Partial<InsertSocialMessage>): Promise<SocialMessage | undefined> {
    const existingMessage = this.socialMessages.get(id);
    if (!existingMessage) {
      return undefined;
    }
    
    const updatedMessage = {
      ...existingMessage,
      ...messageData
    };
    
    this.socialMessages.set(id, updatedMessage);
    return updatedMessage;
  },

  async deleteSocialMessage(id: number): Promise<boolean> {
    // Soft delete
    const existingMessage = this.socialMessages.get(id);
    if (!existingMessage) {
      return false;
    }
    
    const deletedMessage = {
      ...existingMessage,
      isDeleted: true
    };
    
    this.socialMessages.set(id, deletedMessage);
    return true;
  },

  // Lead Sources
  async getLeadSource(id: number): Promise<LeadSource | undefined> {
    return this.leadSources.get(id);
  },

  async listLeadSources(filter?: Partial<LeadSource>): Promise<LeadSource[]> {
    let sources = Array.from(this.leadSources.values());
    
    if (filter) {
      sources = sources.filter(source => {
        for (const [key, value] of Object.entries(filter)) {
          if (source[key as keyof LeadSource] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return sources;
  },

  async createLeadSource(source: InsertLeadSource): Promise<LeadSource> {
    const id = this.leadSourceIdCounter++;
    const createdAt = new Date();
    
    const leadSource: LeadSource = {
      ...source,
      id,
      createdAt,
      updatedAt: null,
      description: source.description || null,
      platform: source.platform || null,
      isActive: source.isActive === undefined ? true : source.isActive
    };
    
    this.leadSources.set(id, leadSource);
    return leadSource;
  },

  async updateLeadSource(id: number, sourceData: Partial<InsertLeadSource>): Promise<LeadSource | undefined> {
    const existingSource = this.leadSources.get(id);
    if (!existingSource) {
      return undefined;
    }
    
    const updatedSource = {
      ...existingSource,
      ...sourceData,
      updatedAt: new Date()
    };
    
    this.leadSources.set(id, updatedSource);
    return updatedSource;
  },

  async deleteLeadSource(id: number): Promise<boolean> {
    return this.leadSources.delete(id);
  },

  // Social Media Campaigns
  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    return this.socialCampaigns.get(id);
  },

  async listSocialCampaigns(filter?: Partial<SocialCampaign>): Promise<SocialCampaign[]> {
    let campaigns = Array.from(this.socialCampaigns.values());
    
    if (filter) {
      campaigns = campaigns.filter(campaign => {
        for (const [key, value] of Object.entries(filter)) {
          if (campaign[key as keyof SocialCampaign] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return campaigns;
  },

  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> {
    const id = this.socialCampaignIdCounter++;
    const createdAt = new Date();
    
    const socialCampaign: SocialCampaign = {
      ...campaign,
      id,
      createdAt,
      updatedAt: null,
      description: campaign.description || null,
      startDate: campaign.startDate || null,
      endDate: campaign.endDate || null,
      ownerId: campaign.ownerId || null,
      content: campaign.content || null,
      metrics: campaign.metrics || null,
      isActive: campaign.isActive === undefined ? true : campaign.isActive
    };
    
    this.socialCampaigns.set(id, socialCampaign);
    return socialCampaign;
  },

  async updateSocialCampaign(id: number, campaignData: Partial<InsertSocialCampaign>): Promise<SocialCampaign | undefined> {
    const existingCampaign = this.socialCampaigns.get(id);
    if (!existingCampaign) {
      return undefined;
    }
    
    const updatedCampaign = {
      ...existingCampaign,
      ...campaignData,
      updatedAt: new Date()
    };
    
    this.socialCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  },

  async deleteSocialCampaign(id: number): Promise<boolean> {
    return this.socialCampaigns.delete(id);
  }
};

// DatabaseStorage implementations
export const DatabaseStorageSocialMediaIntegrations = {
  // Social Media Integrations
  async getSocialIntegration(id: number): Promise<SocialIntegration | undefined> {
    try {
      const [integration] = await db.select().from(socialIntegrations).where(eq(socialIntegrations.id, id));
      return integration;
    } catch (error) {
      console.error('Database error in getSocialIntegration:', error);
      return undefined;
    }
  },

  async listSocialIntegrations(filter?: Partial<SocialIntegration>): Promise<SocialIntegration[]> {
    try {
      let query = db.select().from(socialIntegrations);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.userId !== undefined) {
          query = query.where(eq(socialIntegrations.userId, filter.userId));
        }
        if (filter.platform !== undefined) {
          query = query.where(eq(socialIntegrations.platform, filter.platform));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(socialIntegrations.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listSocialIntegrations:', error);
      return [];
    }
  },

  async getUserSocialIntegrations(userId: number): Promise<SocialIntegration[]> {
    try {
      return await db.select().from(socialIntegrations).where(eq(socialIntegrations.userId, userId));
    } catch (error) {
      console.error('Database error in getUserSocialIntegrations:', error);
      return [];
    }
  },

  async createSocialIntegration(integration: InsertSocialIntegration): Promise<SocialIntegration> {
    try {
      const [newIntegration] = await db.insert(socialIntegrations).values(integration).returning();
      return newIntegration;
    } catch (error) {
      console.error('Database error in createSocialIntegration:', error);
      throw new Error(`Failed to create social integration: ${error.message}`);
    }
  },

  async updateSocialIntegration(id: number, integration: Partial<InsertSocialIntegration>): Promise<SocialIntegration | undefined> {
    try {
      const [updatedIntegration] = await db.update(socialIntegrations)
        .set({ ...integration, updatedAt: new Date() })
        .where(eq(socialIntegrations.id, id))
        .returning();
      return updatedIntegration;
    } catch (error) {
      console.error('Database error in updateSocialIntegration:', error);
      return undefined;
    }
  },

  async deleteSocialIntegration(id: number): Promise<boolean> {
    try {
      const result = await db.delete(socialIntegrations).where(eq(socialIntegrations.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteSocialIntegration:', error);
      return false;
    }
  },

  // Social Media Messages
  async getSocialMessage(id: number): Promise<SocialMessage | undefined> {
    try {
      const [message] = await db.select().from(socialMessages).where(eq(socialMessages.id, id));
      return message;
    } catch (error) {
      console.error('Database error in getSocialMessage:', error);
      return undefined;
    }
  },

  async listSocialMessages(filter?: Partial<SocialMessage>): Promise<SocialMessage[]> {
    try {
      let query = db.select().from(socialMessages);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.integrationId !== undefined) {
          query = query.where(eq(socialMessages.integrationId, filter.integrationId));
        }
        if (filter.leadId !== undefined) {
          query = query.where(eq(socialMessages.leadId, filter.leadId));
        }
        if (filter.contactId !== undefined) {
          query = query.where(eq(socialMessages.contactId, filter.contactId));
        }
        if (filter.direction !== undefined) {
          query = query.where(eq(socialMessages.direction, filter.direction));
        }
        if (filter.status !== undefined) {
          query = query.where(eq(socialMessages.status, filter.status));
        }
        if (filter.isDeleted !== undefined) {
          query = query.where(eq(socialMessages.isDeleted, filter.isDeleted));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listSocialMessages:', error);
      return [];
    }
  },

  async getLeadSocialMessages(leadId: number): Promise<SocialMessage[]> {
    try {
      return await db.select().from(socialMessages).where(eq(socialMessages.leadId, leadId));
    } catch (error) {
      console.error('Database error in getLeadSocialMessages:', error);
      return [];
    }
  },

  async getContactSocialMessages(contactId: number): Promise<SocialMessage[]> {
    try {
      return await db.select().from(socialMessages).where(eq(socialMessages.contactId, contactId));
    } catch (error) {
      console.error('Database error in getContactSocialMessages:', error);
      return [];
    }
  },

  async createSocialMessage(message: InsertSocialMessage): Promise<SocialMessage> {
    try {
      const [newMessage] = await db.insert(socialMessages).values(message).returning();
      return newMessage;
    } catch (error) {
      console.error('Database error in createSocialMessage:', error);
      throw new Error(`Failed to create social message: ${error.message}`);
    }
  },

  async updateSocialMessage(id: number, message: Partial<InsertSocialMessage>): Promise<SocialMessage | undefined> {
    try {
      const [updatedMessage] = await db.update(socialMessages)
        .set(message)
        .where(eq(socialMessages.id, id))
        .returning();
      return updatedMessage;
    } catch (error) {
      console.error('Database error in updateSocialMessage:', error);
      return undefined;
    }
  },

  async deleteSocialMessage(id: number): Promise<boolean> {
    try {
      // Soft delete - update isDeleted flag
      const [updatedMessage] = await db.update(socialMessages)
        .set({ isDeleted: true })
        .where(eq(socialMessages.id, id))
        .returning();
      return !!updatedMessage;
    } catch (error) {
      console.error('Database error in deleteSocialMessage:', error);
      return false;
    }
  },

  // Lead Sources
  async getLeadSource(id: number): Promise<LeadSource | undefined> {
    try {
      const [source] = await db.select().from(leadSources).where(eq(leadSources.id, id));
      return source;
    } catch (error) {
      console.error('Database error in getLeadSource:', error);
      return undefined;
    }
  },

  async listLeadSources(filter?: Partial<LeadSource>): Promise<LeadSource[]> {
    try {
      let query = db.select().from(leadSources);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.platform !== undefined) {
          query = query.where(eq(leadSources.platform, filter.platform));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(leadSources.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listLeadSources:', error);
      return [];
    }
  },

  async createLeadSource(source: InsertLeadSource): Promise<LeadSource> {
    try {
      const [newSource] = await db.insert(leadSources).values(source).returning();
      return newSource;
    } catch (error) {
      console.error('Database error in createLeadSource:', error);
      throw new Error(`Failed to create lead source: ${error.message}`);
    }
  },

  async updateLeadSource(id: number, source: Partial<InsertLeadSource>): Promise<LeadSource | undefined> {
    try {
      const [updatedSource] = await db.update(leadSources)
        .set({ ...source, updatedAt: new Date() })
        .where(eq(leadSources.id, id))
        .returning();
      return updatedSource;
    } catch (error) {
      console.error('Database error in updateLeadSource:', error);
      return undefined;
    }
  },

  async deleteLeadSource(id: number): Promise<boolean> {
    try {
      const result = await db.delete(leadSources).where(eq(leadSources.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteLeadSource:', error);
      return false;
    }
  },

  // Social Media Campaigns
  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    try {
      const [campaign] = await db.select().from(socialCampaigns).where(eq(socialCampaigns.id, id));
      return campaign;
    } catch (error) {
      console.error('Database error in getSocialCampaign:', error);
      return undefined;
    }
  },

  async listSocialCampaigns(filter?: Partial<SocialCampaign>): Promise<SocialCampaign[]> {
    try {
      let query = db.select().from(socialCampaigns);
      
      if (filter) {
        // Add conditions dynamically based on filter
        if (filter.platform !== undefined) {
          query = query.where(eq(socialCampaigns.platform, filter.platform));
        }
        if (filter.ownerId !== undefined) {
          query = query.where(eq(socialCampaigns.ownerId, filter.ownerId));
        }
        if (filter.status !== undefined) {
          query = query.where(eq(socialCampaigns.status, filter.status));
        }
        if (filter.isActive !== undefined) {
          query = query.where(eq(socialCampaigns.isActive, filter.isActive));
        }
      }
      
      return await query;
    } catch (error) {
      console.error('Database error in listSocialCampaigns:', error);
      return [];
    }
  },

  async createSocialCampaign(campaign: InsertSocialCampaign): Promise<SocialCampaign> {
    try {
      const [newCampaign] = await db.insert(socialCampaigns).values(campaign).returning();
      return newCampaign;
    } catch (error) {
      console.error('Database error in createSocialCampaign:', error);
      throw new Error(`Failed to create social campaign: ${error.message}`);
    }
  },

  async updateSocialCampaign(id: number, campaign: Partial<InsertSocialCampaign>): Promise<SocialCampaign | undefined> {
    try {
      const [updatedCampaign] = await db.update(socialCampaigns)
        .set({ ...campaign, updatedAt: new Date() })
        .where(eq(socialCampaigns.id, id))
        .returning();
      return updatedCampaign;
    } catch (error) {
      console.error('Database error in updateSocialCampaign:', error);
      return undefined;
    }
  },

  async deleteSocialCampaign(id: number): Promise<boolean> {
    try {
      const result = await db.delete(socialCampaigns).where(eq(socialCampaigns.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteSocialCampaign:', error);
      return false;
    }
  }
};