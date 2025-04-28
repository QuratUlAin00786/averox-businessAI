/**
 * @file Contact Service
 * @description Business logic for contact management
 */

import { ContactRepository } from "../repositories/ContactRepository";
import { type Contact, type InsertContact, type UpdateContact } from "../entities/Contact";

export class ContactService {
  private repository: ContactRepository;
  
  constructor() {
    this.repository = new ContactRepository();
  }
  
  /**
   * Get all contacts with pagination and filtering
   */
  async getContacts(params: {
    page?: number;
    limit?: number;
    search?: string;
    accountId?: number;
    ownerId?: number;
    isActive?: boolean;
    includeRelations?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    const { includeRelations = true, ...queryParams } = params;
    
    if (includeRelations) {
      return this.repository.findWithRelations(queryParams);
    }
    
    return this.repository.findAll(queryParams);
  }
  
  /**
   * Get a contact by ID
   */
  async getContactById(id: number): Promise<Contact | undefined> {
    return this.repository.findById(id);
  }
  
  /**
   * Create a new contact
   */
  async createContact(data: InsertContact): Promise<Contact> {
    return this.repository.create(data);
  }
  
  /**
   * Update a contact
   * @throws {Error} If contact is not found
   */
  async updateContact(id: number, data: UpdateContact): Promise<Contact> {
    const updated = await this.repository.update(id, data);
    
    if (!updated) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    
    return updated;
  }
  
  /**
   * Delete a contact
   * @returns {boolean} True if contact was deleted
   */
  async deleteContact(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
  
  /**
   * Soft delete a contact by marking as inactive
   * @throws {Error} If contact is not found
   */
  async softDeleteContact(id: number): Promise<Contact> {
    const updated = await this.repository.softDelete(id);
    
    if (!updated) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    
    return updated;
  }
  
  /**
   * Get the number of contacts for an account
   */
  async getContactCountForAccount(accountId: number): Promise<number> {
    return this.repository.countByAccountId(accountId);
  }
  
  /**
   * Enrich contact data with computed properties
   */
  private enrichContactData(contact: Contact): any {
    return {
      ...contact,
      fullName: `${contact.firstName} ${contact.lastName}`,
    };
  }
}