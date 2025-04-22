/**
 * @file Contact service
 * @description Provides contact management functionality
 * @module services/contact
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../utils/db';
import { contacts, accounts, users, activities } from '../../shared/schema';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Contact service class
 * Provides methods for contact CRUD operations
 */
export class ContactService {
  /**
   * Get all contacts
   * @returns List of all contacts
   */
  async getAllContacts() {
    try {
      // Fetch contacts with account and owner information
      const allContacts = await db.query.contacts.findMany({
        with: {
          account: true,
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
        orderBy: [desc(contacts.createdAt)]
      });
      
      return allContacts;
    } catch (error) {
      logger.error('Failed to retrieve contacts', error);
      throw new ApiError('Failed to retrieve contacts', 500);
    }
  }
  
  /**
   * Get contacts for a specific account
   * @param accountId Account ID to filter by
   * @returns List of contacts for the specified account
   */
  async getContactsByAccount(accountId: number) {
    try {
      const accountContacts = await db.query.contacts.findMany({
        where: eq(contacts.accountId, accountId),
        with: {
          account: true,
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
        orderBy: [desc(contacts.createdAt)]
      });
      
      return accountContacts;
    } catch (error) {
      logger.error('Failed to retrieve contacts by account', { accountId, error });
      throw new ApiError('Failed to retrieve contacts', 500);
    }
  }
  
  /**
   * Create a new contact
   * @param contactData Contact data for new contact
   * @returns Created contact object
   */
  async createContact(contactData: typeof contacts.$inferInsert) {
    try {
      // Validate account ID if provided
      if (contactData.accountId) {
        const account = await db.query.accounts.findFirst({
          where: eq(accounts.id, contactData.accountId)
        });
        
        if (!account) {
          throw new ApiError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
        }
      }
      
      // Insert the new contact
      const [newContact] = await db.insert(contacts)
        .values({
          ...contactData,
          createdAt: new Date(),
        })
        .returning();
      
      if (!newContact) {
        throw new ApiError('Failed to create contact', 500);
      }
      
      // Log activity
      if (contactData.ownerId) {
        await db.insert(activities).values({
          userId: contactData.ownerId,
          action: 'Created contact',
          detail: `${newContact.firstName} ${newContact.lastName}`,
          relatedToType: 'contact',
          relatedToId: newContact.id,
          createdAt: new Date(),
          icon: 'added',
        });
      }
      
      // Fetch full contact with account and owner information
      const contactWithRelations = await db.query.contacts.findFirst({
        where: eq(contacts.id, newContact.id),
        with: {
          account: true,
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
      
      return contactWithRelations;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to create contact', error);
      throw new ApiError('Failed to create contact', 500);
    }
  }
  
  /**
   * Get contact by ID
   * @param contactId Contact ID to lookup
   * @returns Contact object
   */
  async getContactById(contactId: number) {
    try {
      const contact = await db.query.contacts.findFirst({
        where: eq(contacts.id, contactId),
        with: {
          account: true,
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
      
      if (!contact) {
        throw new ApiError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }
      
      return contact;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to retrieve contact', { contactId, error });
      throw new ApiError('Failed to retrieve contact', 500);
    }
  }
  
  /**
   * Update a contact
   * @param contactId Contact ID to update
   * @param contactData Updated contact data
   * @param userId User ID performing the update
   * @returns Updated contact object
   */
  async updateContact(contactId: number, contactData: Partial<typeof contacts.$inferInsert>, userId: number) {
    try {
      // Check if contact exists
      const existingContact = await db.query.contacts.findFirst({
        where: eq(contacts.id, contactId)
      });
      
      if (!existingContact) {
        throw new ApiError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }
      
      // Validate account ID if provided
      if (contactData.accountId) {
        const account = await db.query.accounts.findFirst({
          where: eq(accounts.id, contactData.accountId)
        });
        
        if (!account) {
          throw new ApiError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
        }
      }
      
      // Update the contact
      const [updatedContact] = await db.update(contacts)
        .set(contactData)
        .where(eq(contacts.id, contactId))
        .returning();
      
      if (!updatedContact) {
        throw new ApiError('Failed to update contact', 500);
      }
      
      // Log activity
      await db.insert(activities).values({
        userId,
        action: 'Updated contact',
        detail: `${updatedContact.firstName} ${updatedContact.lastName}`,
        relatedToType: 'contact',
        relatedToId: updatedContact.id,
        createdAt: new Date(),
        icon: 'updated',
      });
      
      // Fetch full contact with account and owner information
      const contactWithRelations = await db.query.contacts.findFirst({
        where: eq(contacts.id, updatedContact.id),
        with: {
          account: true,
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
      
      return contactWithRelations;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to update contact', { contactId, error });
      throw new ApiError('Failed to update contact', 500);
    }
  }
  
  /**
   * Delete a contact
   * @param contactId Contact ID to delete
   * @param userId User ID performing the deletion
   * @returns Success status
   */
  async deleteContact(contactId: number, userId: number) {
    try {
      // Check if contact exists
      const existingContact = await db.query.contacts.findFirst({
        where: eq(contacts.id, contactId)
      });
      
      if (!existingContact) {
        throw new ApiError('Contact not found', 404, 'CONTACT_NOT_FOUND');
      }
      
      // Log activity before deletion
      await db.insert(activities).values({
        userId,
        action: 'Deleted contact',
        detail: `${existingContact.firstName} ${existingContact.lastName}`,
        relatedToType: 'contact',
        relatedToId: null, // No ID since it will be deleted
        createdAt: new Date(),
        icon: 'deleted',
      });
      
      // Delete the contact
      await db.delete(contacts).where(eq(contacts.id, contactId));
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to delete contact', { contactId, error });
      throw new ApiError('Failed to delete contact', 500);
    }
  }
  
  /**
   * Search contacts
   * @param query Search query
   * @returns List of matching contacts
   */
  async searchContacts(query: string) {
    try {
      if (!query || query.trim() === '') {
        return this.getAllContacts();
      }
      
      const searchTerm = `%${query.toLowerCase()}%`;
      
      // Search contacts by name, email, phone, or title
      const searchResults = await db.query.contacts.findMany({
        where: sql`(
          LOWER(${contacts.firstName}) LIKE ${searchTerm} OR
          LOWER(${contacts.lastName}) LIKE ${searchTerm} OR
          LOWER(${contacts.email}) LIKE ${searchTerm} OR
          LOWER(${contacts.phone}) LIKE ${searchTerm} OR
          LOWER(${contacts.title}) LIKE ${searchTerm}
        )`,
        with: {
          account: true,
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
        orderBy: [desc(contacts.createdAt)]
      });
      
      return searchResults;
    } catch (error) {
      logger.error('Failed to search contacts', { query, error });
      throw new ApiError('Failed to search contacts', 500);
    }
  }
}

// Export singleton instance
export const contactService = new ContactService();