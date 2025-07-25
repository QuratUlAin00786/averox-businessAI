import { SocialMessage, SocialIntegration, LeadSource, Lead, Contact } from "@shared/schema";
import { storage } from "./storage";
import { db } from "./db";
import { eq, and, or, desc, asc, isNull, gt, lt } from "drizzle-orm";
import { socialMessages, socialIntegrations, leads, contacts } from "@shared/schema";
import { MemStorage } from "./storage";

/**
 * This module provides the functionality to manage all communications
 * from various channels including email, WhatsApp, SMS, etc.
 * It serves as a central hub for all lead and customer communications.
 */

export type CommunicationContact = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  type: 'lead' | 'customer';
  socialProfiles?: {
    whatsapp?: string;
    messenger?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
};

export type Communication = {
  id: number;
  contactId: number;
  contactType: 'lead' | 'customer';
  channel: string; // email, whatsapp, sms, phone, messenger, etc.
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  sentAt: Date;
  receivedAt?: Date;
  attachments?: Array<{name: string, url: string}>;
  contactDetails: CommunicationContact;
  // New fields for entity relationships
  relatedToType?: string; // 'account', 'opportunity', 'contact', etc.
  relatedToId?: number;   // ID of the related entity
};

// Function to add communication-related methods to the MemStorage class
export function addCommunicationsToMemStorage(storage: MemStorage) {
  // Create a map for communications
  storage.communications = new Map();
  
  // Our communication ID counter
  storage.communicationIdCounter = 0;

  // Method to get all communications
  storage.getAllCommunications = async function(): Promise<Communication[]> {
    // Convert the map values to an array and sort by received date descending
    return Array.from(this.communications.values())
      .sort((a, b) => {
        // Sort by date DESC (newest first)
        const dateA = a.receivedAt || a.sentAt;
        const dateB = b.receivedAt || b.sentAt;
        return dateB.getTime() - dateA.getTime();
      });
  };

  // Method to get communications for a specific contact
  storage.getContactCommunications = async function(
    contactId: number, 
    contactType: 'lead' | 'customer'
  ): Promise<Communication[]> {
    return Array.from(this.communications.values())
      .filter(comm => comm.contactId === contactId && comm.contactType === contactType)
      .sort((a, b) => {
        const dateA = a.receivedAt || a.sentAt;
        const dateB = b.receivedAt || b.sentAt;
        return dateB.getTime() - dateA.getTime();
      });
  };
  
  // Method to get communications related to a specific entity
  storage.getRelatedCommunications = async function(
    relatedToType: string,
    relatedToId: number
  ): Promise<Communication[]> {
    return Array.from(this.communications.values())
      .filter(comm => comm.relatedToType === relatedToType && comm.relatedToId === relatedToId)
      .sort((a, b) => {
        const dateA = a.receivedAt || a.sentAt;
        const dateB = b.receivedAt || b.sentAt;
        return dateB.getTime() - dateA.getTime();
      });
  };

  // Method to update communication status
  storage.updateCommunicationStatus = async function(
    id: number, 
    status: 'unread' | 'read' | 'replied' | 'archived'
  ): Promise<Communication | null> {
    const communication = this.communications.get(id);
    if (!communication) return null;

    // Normalize the status to lowercase to handle case sensitivity
    const normalizedStatus = status.toLowerCase() as 'unread' | 'read' | 'replied' | 'archived';

    const updatedCommunication = {
      ...communication,
      status: normalizedStatus
    };

    this.communications.set(id, updatedCommunication);
    return updatedCommunication;
  };

  // Method to create a new communication (for sending messages or storing received ones)
  storage.createCommunication = async function(
    data: {
      contactId: number;
      contactType: 'lead' | 'customer';
      channel: string;
      direction: 'inbound' | 'outbound';
      content: string;
      status?: 'unread' | 'read' | 'replied' | 'archived';
      sentAt?: Date;
      receivedAt?: Date;
      attachments?: Array<{name: string, url: string}>;
      relatedToType?: string; // 'account', 'opportunity', etc.
      relatedToId?: number;   // ID of the related entity
    }
  ): Promise<Communication> {
    const id = ++this.communicationIdCounter;
    
    // Get contact details based on contactType and contactId
    let contactDetails: CommunicationContact | null = null;
    
    if (data.contactType === 'lead') {
      const lead = this.leads.get(data.contactId);
      if (lead) {
        contactDetails = {
          id: lead.id,
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          email: lead.email || undefined,
          phone: lead.phone || undefined,
          company: lead.company || undefined,
          avatarUrl: undefined, // We could add avatar URL to leads schema in the future
          type: 'lead',
          socialProfiles: {
            // These would be populated from social integrations if available
          }
        };
      }
    } else {
      const contact = this.contacts.get(data.contactId);
      if (contact) {
        contactDetails = {
          id: contact.id,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          company: undefined, // This would come from the related account
          avatarUrl: undefined,
          type: 'customer',
          socialProfiles: {
            // These would be populated from social integrations if available
          }
        };
      }
    }

    if (!contactDetails) {
      throw new Error(`Contact not found with ID ${data.contactId} and type ${data.contactType}`);
    }

    // Create the communication object
    const communication: Communication = {
      id,
      contactId: data.contactId,
      contactType: data.contactType,
      channel: data.channel.toLowerCase(), // Ensure consistent lowercase storage for channel
      direction: data.direction.toLowerCase() as 'inbound' | 'outbound', // Ensure consistent lowercase storage
      content: data.content,
      status: (data.status || 'unread').toLowerCase() as 'unread' | 'read' | 'replied' | 'archived', // Ensure consistent lowercase storage
      sentAt: data.sentAt || new Date(),
      receivedAt: data.receivedAt,
      attachments: data.attachments,
      contactDetails,
      // Add the relationship fields if provided
      relatedToType: data.relatedToType,
      relatedToId: data.relatedToId
    };

    // Store it in the map
    this.communications.set(id, communication);
    
    return communication;
  };

  // Add communication mock data for initial testing if needed
  storage.initializeCommunicationMockData = function() {
    if (this.communications.size === 0 && this.leads.size > 0 && this.contacts.size > 0) {
      const leadIds = Array.from(this.leads.keys());
      const contactIds = Array.from(this.contacts.keys());
      
      // Sample data for testing
      const channels = ['email', 'whatsapp', 'sms', 'phone', 'messenger', 'twitter', 'linkedin', 'instagram'];
      const directions = ['inbound', 'outbound'];
      const statuses = ['unread', 'read', 'replied', 'archived'];
      
      // Add some mock communications for leads
      if (leadIds.length > 0) {
        const leadId = leadIds[0];
        const lead = this.leads.get(leadId);
        
        if (lead) {
          this.createCommunication({
            contactId: leadId,
            contactType: 'lead',
            channel: 'email',
            direction: 'inbound',
            content: 'I\'m interested in your services. Can you tell me more?',
            status: 'unread',
            sentAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
            receivedAt: new Date(Date.now() - 2 * 3600 * 1000)
          });
          
          this.createCommunication({
            contactId: leadId,
            contactType: 'lead',
            channel: 'whatsapp',
            direction: 'inbound',
            content: 'Hello, following up on our conversation. When can we schedule a demo?',
            status: 'read',
            sentAt: new Date(Date.now() - 24 * 3600 * 1000), // 1 day ago
            receivedAt: new Date(Date.now() - 24 * 3600 * 1000)
          });
          
          this.createCommunication({
            contactId: leadId,
            contactType: 'lead',
            channel: 'email',
            direction: 'outbound',
            content: 'Thank you for your interest. I\'ve attached our product brochure for more information.',
            status: 'replied',
            sentAt: new Date(Date.now() - 23 * 3600 * 1000), // 23 hours ago
          });
        }
      }
      
      // Add some mock communications for contacts (customers)
      if (contactIds.length > 0) {
        const contactId = contactIds[0];
        const contact = this.contacts.get(contactId);
        
        if (contact) {
          this.createCommunication({
            contactId: contactId,
            contactType: 'customer',
            channel: 'phone',
            direction: 'outbound',
            content: 'Called to follow up on recent purchase and discuss satisfaction levels. Left voicemail.',
            status: 'read',
            sentAt: new Date(Date.now() - 6 * 3600 * 1000), // 6 hours ago
          });
          
          this.createCommunication({
            contactId: contactId,
            contactType: 'customer',
            channel: 'messenger',
            direction: 'inbound',
            content: 'I\'m having trouble with the latest update. Can you help me troubleshoot?',
            status: 'replied',
            sentAt: new Date(Date.now() - 8 * 3600 * 1000), // 8 hours ago
            receivedAt: new Date(Date.now() - 8 * 3600 * 1000)
          });
          
          this.createCommunication({
            contactId: contactId,
            contactType: 'customer',
            channel: 'messenger',
            direction: 'outbound',
            content: "I'll be happy to help. Can you please describe the specific issue you're experiencing?",
            status: 'read',
            sentAt: new Date(Date.now() - 7 * 3600 * 1000), // 7 hours ago
          });
        }
      }
    }
  };
}

// Function to add communication-related methods to the DatabaseStorage class
export function addCommunicationsToDatabase(dbStorage: any) {
  // Method to get all communications
  dbStorage.getAllCommunications = async function(): Promise<Communication[]> {
    try {
      // First get all social messages
      const messages = await db
        .select({
          social_messages: socialMessages,
          social_integrations: socialIntegrations
        })
        .from(socialMessages)
        .leftJoin(socialIntegrations, eq(socialMessages.integrationId, socialIntegrations.id))
        .where(eq(socialMessages.isDeleted, false))
        .orderBy(desc(socialMessages.createdAt));

      // Map to our unified Communication type
      const result: Communication[] = [];

      for (const msg of messages) {
        // Skip deleted messages
        if (msg.social_messages.isDeleted) continue;

        let contactDetails: CommunicationContact | null = null;
        let contactType: 'lead' | 'customer' = 'lead';

        // Try to get lead or contact information
        if (msg.social_messages.leadId) {
          const [lead] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, msg.social_messages.leadId));

          if (lead) {
            contactDetails = {
              id: lead.id,
              firstName: lead.firstName || '',
              lastName: lead.lastName || '',
              email: lead.email || undefined,
              phone: lead.phone || undefined,
              company: lead.company || undefined,
              type: 'lead',
              socialProfiles: {}
            };
            contactType = 'lead';
          }
        } else if (msg.social_messages.contactId) {
          const [contactRecord] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.id, msg.social_messages.contactId));

          if (contactRecord) {
            contactDetails = {
              id: contactRecord.id,
              firstName: contactRecord.firstName || '',
              lastName: contactRecord.lastName || '',
              email: contactRecord.email || undefined,
              phone: contactRecord.phone || undefined,
              type: 'customer',
              socialProfiles: {}
            };
            contactType = 'customer';
          }
        }

        // Skip if we couldn't find a contact
        if (!contactDetails) continue;

        // Determine channel from integration platform
        const channel = msg.social_integrations?.platform?.toLowerCase() || 'unknown';

        result.push({
          id: msg.social_messages.id,
          contactId: contactDetails.id,
          contactType,
          channel,
          // Determine direction based on sender field
          direction: msg.social_messages.sender === 'system' ? 'outbound' : 'inbound',
          // In the database the message field is used instead of content
          content: msg.social_messages.message || '',
          status: (msg.social_messages.status?.toLowerCase() || 'unread') as 'unread' | 'read' | 'replied' | 'archived',
          // We use createdAt for the sentAt field since our database schema doesn't have sent_at
          sentAt: msg.social_messages.createdAt,
          receivedAt: msg.social_messages.receivedAt || undefined,
          attachments: msg.social_messages.attachments as any || [],
          contactDetails
        });
      }

      return result;
    } catch (error) {
      console.error('Database error in getAllCommunications:', error);
      return [];
    }
  };

  // Method to get communications for a specific contact
  // Method to get communications related to a specific entity
  dbStorage.getRelatedCommunications = async function(
    relatedToType: string,
    relatedToId: number
  ): Promise<Communication[]> {
    try {
      // Query based on related entity
      const messages = await db
        .select({
          social_messages: socialMessages,
          social_integrations: socialIntegrations
        })
        .from(socialMessages)
        .leftJoin(socialIntegrations, eq(socialMessages.integrationId, socialIntegrations.id))
        .where(
          and(
            eq(socialMessages.relatedToType, relatedToType),
            eq(socialMessages.relatedToId, relatedToId),
            eq(socialMessages.isDeleted, false)
          )
        )
        .orderBy(desc(socialMessages.createdAt));

      // Process the results into our unified Communication format
      const result: Communication[] = [];

      for (const msg of messages) {
        // Skip deleted messages
        if (msg.social_messages.isDeleted) continue;

        let contactDetails: CommunicationContact | null = null;
        let contactType: 'lead' | 'customer' = 'lead';
        let contactId = 0;

        // Try to get lead or contact information
        if (msg.social_messages.leadId) {
          const [lead] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, msg.social_messages.leadId));

          if (lead) {
            contactDetails = {
              id: lead.id,
              firstName: lead.firstName || '',
              lastName: lead.lastName || '',
              email: lead.email || undefined,
              phone: lead.phone || undefined,
              company: lead.company || undefined,
              type: 'lead',
              socialProfiles: {}
            };
            contactType = 'lead';
            contactId = lead.id;
          }
        } else if (msg.social_messages.contactId) {
          const [contactRecord] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.id, msg.social_messages.contactId));

          if (contactRecord) {
            contactDetails = {
              id: contactRecord.id,
              firstName: contactRecord.firstName || '',
              lastName: contactRecord.lastName || '',
              email: contactRecord.email || undefined,
              phone: contactRecord.phone || undefined,
              type: 'customer',
              socialProfiles: {}
            };
            contactType = 'customer';
            contactId = contactRecord.id;
          }
        }

        // Skip if we couldn't find a contact
        if (!contactDetails) continue;

        // Determine channel from integration platform
        const channel = msg.social_integrations?.platform?.toLowerCase() || 'unknown';

        result.push({
          id: msg.social_messages.id,
          contactId,
          contactType,
          channel,
          // Determine direction based on sender field
          direction: msg.social_messages.sender === 'system' ? 'outbound' : 'inbound',
          // In the database the message field is used instead of content
          content: msg.social_messages.message || '',
          status: (msg.social_messages.status?.toLowerCase() || 'unread') as 'unread' | 'read' | 'replied' | 'archived',
          // We use createdAt for the sentAt field since our database schema doesn't have sent_at
          sentAt: msg.social_messages.createdAt,
          receivedAt: msg.social_messages.receivedAt || undefined,
          attachments: msg.social_messages.attachments as any || [],
          contactDetails,
          relatedToType: msg.social_messages.relatedToType || undefined,
          relatedToId: msg.social_messages.relatedToId || undefined
        });
      }

      return result;
    } catch (error) {
      console.error('Database error in getRelatedCommunications:', error);
      return [];
    }
  };

  dbStorage.getContactCommunications = async function(
    contactId: number, 
    contactType: 'lead' | 'customer'
  ): Promise<Communication[]> {
    try {
      // Query based on contact type
      const messages = await db
        .select({
          social_messages: socialMessages,
          social_integrations: socialIntegrations
        })
        .from(socialMessages)
        .leftJoin(socialIntegrations, eq(socialMessages.integrationId, socialIntegrations.id))
        .where(
          and(
            contactType === 'lead' 
              ? eq(socialMessages.leadId, contactId) 
              : eq(socialMessages.contactId, contactId),
            eq(socialMessages.isDeleted, false)
          )
        )
        .orderBy(desc(socialMessages.createdAt));

      // Process the results into our unified Communication format
      const result: Communication[] = [];

      for (const msg of messages) {
        // Skip deleted messages
        if (msg.social_messages.isDeleted) continue;

        let contactDetails: CommunicationContact | null = null;

        // Get contact details based on the contact type
        if (contactType === 'lead') {
          const [lead] = await db
            .select()
            .from(leads)
            .where(eq(leads.id, contactId));

          if (lead) {
            contactDetails = {
              id: lead.id,
              firstName: lead.firstName || '',
              lastName: lead.lastName || '',
              email: lead.email || undefined,
              phone: lead.phone || undefined,
              company: lead.company || undefined,
              type: 'lead',
              socialProfiles: {}
            };
          }
        } else {
          const [contactRecord] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.id, contactId));

          if (contactRecord) {
            contactDetails = {
              id: contactRecord.id,
              firstName: contactRecord.firstName || '',
              lastName: contactRecord.lastName || '',
              email: contactRecord.email || undefined,
              phone: contactRecord.phone || undefined,
              type: 'customer',
              socialProfiles: {}
            };
          }
        }

        // Skip if we couldn't find a contact
        if (!contactDetails) continue;

        // Determine channel from integration platform
        const channel = msg.social_integrations?.platform?.toLowerCase() || 'unknown';

        result.push({
          id: msg.social_messages.id,
          contactId: contactDetails.id,
          contactType,
          channel,
          // Determine direction based on sender field
          direction: msg.social_messages.sender === 'system' ? 'outbound' : 'inbound',
          // In the database the message field is used instead of content
          content: msg.social_messages.message || '',
          status: (msg.social_messages.status?.toLowerCase() || 'unread') as 'unread' | 'read' | 'replied' | 'archived',
          // We use createdAt for the sentAt field since our database schema doesn't have sent_at
          sentAt: msg.social_messages.createdAt,
          receivedAt: msg.social_messages.receivedAt || undefined,
          attachments: msg.social_messages.attachments as any || [],
          contactDetails
        });
      }

      return result;
    } catch (error) {
      console.error('Database error in getContactCommunications:', error);
      return [];
    }
  };

  // Method to update communication status
  dbStorage.updateCommunicationStatus = async function(
    id: number, 
    status: 'unread' | 'read' | 'replied' | 'archived'
  ): Promise<Communication | null> {
    try {
      // Normalize the status to lowercase first to handle case sensitivity
      const normalizedStatus = status.toLowerCase() as 'unread' | 'read' | 'replied' | 'archived';

      // Map our status values to the database enum values
      let dbStatus: 'Unread' | 'Read' | 'Replied' | 'Archived';
      switch (normalizedStatus) {
        case 'unread': dbStatus = 'Unread'; break;
        case 'read': dbStatus = 'Read'; break;
        case 'replied': dbStatus = 'Replied'; break;
        case 'archived': dbStatus = 'Archived'; break;
        default: dbStatus = 'Unread';
      }

      // Update the social message status
      const result = await db
        .update(socialMessages)
        .set({ status: dbStatus })
        .where(eq(socialMessages.id, id))
        .returning();

      if (result.length === 0) {
        return null;
      }

      // Fetch the updated message with its integration
      const [msg] = await db
        .select({
          social_messages: socialMessages,
          social_integrations: socialIntegrations
        })
        .from(socialMessages)
        .leftJoin(socialIntegrations, eq(socialMessages.integrationId, socialIntegrations.id))
        .where(eq(socialMessages.id, id));
      
      if (!msg) return null;

      // Get contact details based on the contact type
      let contactDetails: CommunicationContact | null = null;
      let contactType: 'lead' | 'customer' = 'lead';
      let contactId = 0;

      if (msg.social_messages.leadId) {
        const [lead] = await db
          .select()
          .from(leads)
          .where(eq(leads.id, msg.social_messages.leadId));

        if (lead) {
          contactDetails = {
            id: lead.id,
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            company: lead.company || undefined,
            type: 'lead',
            socialProfiles: {}
          };
          contactType = 'lead';
          contactId = lead.id;
        }
      } else if (msg.social_messages.contactId) {
        const [contactRecord] = await db
          .select()
          .from(contacts)
          .where(eq(contacts.id, msg.social_messages.contactId));

        if (contactRecord) {
          contactDetails = {
            id: contactRecord.id,
            firstName: contactRecord.firstName || '',
            lastName: contactRecord.lastName || '',
            email: contactRecord.email || undefined,
            phone: contactRecord.phone || undefined,
            type: 'customer',
            socialProfiles: {}
          };
          contactType = 'customer';
          contactId = contactRecord.id;
        }
      }

      // If we couldn't find contact details, return null
      if (!contactDetails) return null;

      // Determine channel from integration platform
      const channel = msg.social_integrations?.platform?.toLowerCase() || 'unknown';

      // Create the complete Communication object
      return {
        id: msg.social_messages.id,
        contactId: contactId,
        contactType,
        channel,
        direction: msg.social_messages.sender === 'system' ? 'outbound' : 'inbound',
        content: msg.social_messages.message || '',
        status: normalizedStatus,
        sentAt: msg.social_messages.createdAt,
        receivedAt: msg.social_messages.receivedAt || undefined,
        attachments: msg.social_messages.attachments as any || [],
        contactDetails
      };
    } catch (error) {
      console.error('Database error in updateCommunicationStatus:', error);
      return null;
    }
  };

  // Method to create a new communication
  dbStorage.createCommunication = async function(
    data: {
      contactId: number;
      contactType: 'lead' | 'customer';
      channel: string;
      direction: 'inbound' | 'outbound';
      content: string;
      status?: 'unread' | 'read' | 'replied' | 'archived';
      sentAt?: Date;
      receivedAt?: Date;
      attachments?: Array<{name: string, url: string}>;
      relatedToType?: string; // 'account', 'opportunity', etc.
      relatedToId?: number;   // ID of the related entity
    }
  ): Promise<Communication | null> {
    try {
      // Find appropriate integration for the channel
      const [integration] = await db
        .select()
        .from(socialIntegrations)
        .where(eq(socialIntegrations.platform, data.channel as any))
        .limit(1);

      if (!integration && data.channel !== 'email' && data.channel !== 'phone' && data.channel !== 'sms') {
        throw new Error(`No integration found for channel ${data.channel}`);
      }

      // Map our status values to the database enum values
      let dbStatus: 'Unread' | 'Read' | 'Replied' | 'Archived';
      const statusLower = (data.status || '').toLowerCase();
      switch (statusLower) {
        case 'read': dbStatus = 'Read'; break;
        case 'replied': dbStatus = 'Replied'; break;
        case 'archived': dbStatus = 'Archived'; break;
        default: dbStatus = 'Unread';
      }

      // Create the social message
      const messageData: any = {
        integrationId: integration?.id || null,
        externalId: `internal-${Date.now()}`, // Generate a fake external ID for internal messages
        // Use message field instead of content since that's what exists in the database
        message: data.content,
        // For direction, use sender/recipient fields
        // Normalize direction to lowercase for consistent handling
        sender: data.direction.toLowerCase() === 'outbound' ? 'system' : 'user',
        recipient: data.direction.toLowerCase() === 'outbound' ? 'user' : 'system',
        status: dbStatus,
        // Don't use sentAt as it doesn't exist in the database schema
        // createdAt will be set automatically by Drizzle's defaultNow()
        receivedAt: data.receivedAt,
        attachments: data.attachments || null,
        // Add the relationship fields if provided
        relatedToType: data.relatedToType || null,
        relatedToId: data.relatedToId || null,
      };

      // Set the correct contact ID based on type
      if (data.contactType === 'lead') {
        messageData.leadId = data.contactId;
      } else {
        messageData.contactId = data.contactId;
      }

      const [newMessage] = await db
        .insert(socialMessages)
        .values(messageData)
        .returning();

      if (!newMessage) {
        return null;
      }

      // Get contact details based on contact type
      let contactDetails: CommunicationContact | null = null;

      if (data.contactType === 'lead') {
        const [lead] = await db
          .select()
          .from(leads)
          .where(eq(leads.id, data.contactId));

        if (lead) {
          contactDetails = {
            id: lead.id,
            firstName: lead.firstName || '',
            lastName: lead.lastName || '',
            email: lead.email || undefined,
            phone: lead.phone || undefined,
            company: lead.company || undefined,
            type: 'lead',
            socialProfiles: {}
          };
        }
      } else {
        const [contactRecord] = await db
          .select()
          .from(contacts)
          .where(eq(contacts.id, data.contactId));

        if (contactRecord) {
          contactDetails = {
            id: contactRecord.id,
            firstName: contactRecord.firstName || '',
            lastName: contactRecord.lastName || '',
            email: contactRecord.email || undefined,
            phone: contactRecord.phone || undefined,
            type: 'customer',
            socialProfiles: {}
          };
        }
      }

      // If we couldn't find contact details, return null
      if (!contactDetails) return null;

      // Create and return the complete Communication object
      // Make sure to normalize the status to lowercase to match the interface type
      let normalizedStatus = 'unread';
      if (data.status) {
        normalizedStatus = data.status.toLowerCase() as 'unread' | 'read' | 'replied' | 'archived';
      }
      
      return {
        id: newMessage.id,
        contactId: data.contactId,
        contactType: data.contactType,
        channel: data.channel,
        // Return direction in lowercase to match the interface type
        direction: data.direction.toLowerCase() as 'inbound' | 'outbound',
        content: data.content,
        status: normalizedStatus,
        sentAt: newMessage.createdAt,
        receivedAt: data.receivedAt,
        attachments: data.attachments,
        contactDetails,
        relatedToType: data.relatedToType,
        relatedToId: data.relatedToId
      };
    } catch (error) {
      console.error('Database error in createCommunication:', error);
      return null;
    }
  };
}