  // Social Media Integrations
  async getSocialIntegration(id: number): Promise<SocialIntegration | undefined> {
    return this.socialIntegrations.get(id);
  }

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
  }

  async getUserSocialIntegrations(userId: number): Promise<SocialIntegration[]> {
    return this.listSocialIntegrations({ userId });
  }

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
  }

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
  }

  async deleteSocialIntegration(id: number): Promise<boolean> {
    return this.socialIntegrations.delete(id);
  }

  // Social Media Messages
  async getSocialMessage(id: number): Promise<SocialMessage | undefined> {
    return this.socialMessages.get(id);
  }

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
  }

  async getLeadSocialMessages(leadId: number): Promise<SocialMessage[]> {
    return this.listSocialMessages({ leadId });
  }

  async getContactSocialMessages(contactId: number): Promise<SocialMessage[]> {
    return this.listSocialMessages({ contactId });
  }

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
  }

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
  }

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
  }

  // Lead Sources
  async getLeadSource(id: number): Promise<LeadSource | undefined> {
    return this.leadSources.get(id);
  }

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
  }

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
  }

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
  }

  async deleteLeadSource(id: number): Promise<boolean> {
    return this.leadSources.delete(id);
  }

  // Social Media Campaigns
  async getSocialCampaign(id: number): Promise<SocialCampaign | undefined> {
    return this.socialCampaigns.get(id);
  }

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
  }

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
      targetAudience: campaign.targetAudience || null,
      metrics: campaign.metrics || null,
      isActive: campaign.isActive === undefined ? true : campaign.isActive
    };
    
    this.socialCampaigns.set(id, socialCampaign);
    return socialCampaign;
  }

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
  }

  async deleteSocialCampaign(id: number): Promise<boolean> {
    return this.socialCampaigns.delete(id);
  }
