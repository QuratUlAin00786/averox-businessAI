/**
 * @file Contact Repository
 * @description Database operations for contacts
 */

import { db } from "../../../db";
import { contacts, type Contact, type InsertContact, type UpdateContact } from "../entities/Contact";
import { eq, and, ilike, or } from "drizzle-orm";
import { accounts } from "../../accounts/entities/Account";
import { users } from "../../users/entities/User";

export class ContactRepository {
  /**
   * Find all contacts with pagination and filtering
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    accountId?: number;
    ownerId?: number;
    isActive?: boolean;
  }): Promise<{ data: Contact[]; total: number }> {
    const {
      page = 1,
      limit = 50,
      search,
      accountId,
      ownerId,
      isActive,
    } = params;
    
    const offset = (page - 1) * limit;
    
    // Build the where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          ilike(contacts.firstName, `%${search}%`),
          ilike(contacts.lastName, `%${search}%`),
          ilike(contacts.email, `%${search}%`)
        )
      );
    }
    
    if (accountId) {
      whereConditions.push(eq(contacts.accountId, accountId));
    }
    
    if (ownerId) {
      whereConditions.push(eq(contacts.ownerId, ownerId));
    }
    
    if (isActive !== undefined) {
      whereConditions.push(eq(contacts.isActive, isActive));
    }
    
    const where = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // Execute the query
    const data = await db
      .select()
      .from(contacts)
      .where(where)
      .limit(limit)
      .offset(offset);
    
    // Get the total count
    const countResult = await db
      .select({ count: db.fn.count() })
      .from(contacts)
      .where(where);
    
    const total = Number(countResult[0].count) || 0;
    
    return { data, total };
  }
  
  /**
   * Find a contact by ID
   */
  async findById(id: number): Promise<Contact | undefined> {
    const result = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id))
      .limit(1);
    
    return result[0];
  }
  
  /**
   * Find contacts with related account and owner data
   */
  async findWithRelations(params: {
    page?: number;
    limit?: number;
    search?: string;
    accountId?: number;
    ownerId?: number;
    isActive?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    const {
      page = 1,
      limit = 50,
      search,
      accountId,
      ownerId,
      isActive,
    } = params;
    
    const offset = (page - 1) * limit;
    
    // Build the where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          ilike(contacts.firstName, `%${search}%`),
          ilike(contacts.lastName, `%${search}%`),
          ilike(contacts.email, `%${search}%`)
        )
      );
    }
    
    if (accountId) {
      whereConditions.push(eq(contacts.accountId, accountId));
    }
    
    if (ownerId) {
      whereConditions.push(eq(contacts.ownerId, ownerId));
    }
    
    if (isActive !== undefined) {
      whereConditions.push(eq(contacts.isActive, isActive));
    }
    
    const where = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // Execute the query with joins
    const data = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        title: contacts.title,
        accountId: contacts.accountId,
        ownerId: contacts.ownerId,
        createdAt: contacts.createdAt,
        address: contacts.address,
        city: contacts.city,
        state: contacts.state,
        zip: contacts.zip,
        country: contacts.country,
        notes: contacts.notes,
        isActive: contacts.isActive,
        accountName: accounts.name,
        ownerUsername: users.username,
      })
      .from(contacts)
      .leftJoin(accounts, eq(contacts.accountId, accounts.id))
      .leftJoin(users, eq(contacts.ownerId, users.id))
      .where(where)
      .limit(limit)
      .offset(offset);
    
    // Get the total count
    const countResult = await db
      .select({ count: db.fn.count() })
      .from(contacts)
      .where(where);
    
    const total = Number(countResult[0].count) || 0;
    
    return { data, total };
  }
  
  /**
   * Create a new contact
   */
  async create(data: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(data)
      .returning();
    
    return contact;
  }
  
  /**
   * Update a contact
   */
  async update(id: number, data: UpdateContact): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set(data)
      .where(eq(contacts.id, id))
      .returning();
    
    return contact;
  }
  
  /**
   * Delete a contact
   */
  async delete(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning({ id: contacts.id });
    
    return !!deleted;
  }
  
  /**
   * Soft delete a contact by marking as inactive
   */
  async softDelete(id: number): Promise<Contact | undefined> {
    return this.update(id, { isActive: false });
  }
  
  /**
   * Count contacts by accountId
   */
  async countByAccountId(accountId: number): Promise<number> {
    const result = await db
      .select({ count: db.fn.count() })
      .from(contacts)
      .where(eq(contacts.accountId, accountId));
    
    return Number(result[0].count) || 0;
  }
}