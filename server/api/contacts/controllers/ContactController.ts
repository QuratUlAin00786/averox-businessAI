/**
 * @file Contact Controller
 * @description HTTP request handlers for contact operations
 */

import { Request, Response } from "express";
import { ContactService } from "../services/ContactService";
import { CreateContactDTO, UpdateContactDTO } from "../dto/ContactDTO";
import { ZodError } from "zod";

export class ContactController {
  private service: ContactService;
  
  constructor() {
    this.service = new ContactService();
  }
  
  /**
   * Get all contacts with pagination and filtering
   */
  getContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = req.query.search as string | undefined;
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string, 10) : undefined;
      const ownerId = req.query.ownerId ? parseInt(req.query.ownerId as string, 10) : undefined;
      const isActive = req.query.isActive === 'true' ? true : 
                       req.query.isActive === 'false' ? false : undefined;
      const includeRelations = req.query.includeRelations !== 'false';
      
      const result = await this.service.getContacts({
        page,
        limit,
        search,
        accountId,
        ownerId,
        isActive,
        includeRelations
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ error: 'Failed to retrieve contacts' });
    }
  };
  
  /**
   * Get a contact by ID
   */
  getContactById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid contact ID' });
        return;
      }
      
      const contact = await this.service.getContactById(id);
      
      if (!contact) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }
      
      res.status(200).json(contact);
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      res.status(500).json({ error: 'Failed to retrieve contact' });
    }
  };
  
  /**
   * Create a new contact
   */
  createContact = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validatedData = CreateContactDTO.parse(req.body);
      
      // Set owner ID to current user if not specified
      if (!validatedData.ownerId && req.user) {
        validatedData.ownerId = req.user.id;
      }
      
      const contact = await this.service.createContact(validatedData);
      
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
        return;
      }
      
      res.status(500).json({ error: 'Failed to create contact' });
    }
  };
  
  /**
   * Update a contact
   */
  updateContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid contact ID' });
        return;
      }
      
      // Validate request body
      const validatedData = UpdateContactDTO.parse(req.body);
      
      const contact = await this.service.updateContact(id, validatedData);
      
      res.status(200).json(contact);
    } catch (error) {
      console.error('Error updating contact:', error);
      
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
        return;
      }
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Failed to update contact' });
    }
  };
  
  /**
   * Delete a contact
   */
  deleteContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid contact ID' });
        return;
      }
      
      const deleted = await this.service.deleteContact(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  };
  
  /**
   * Soft delete a contact by marking as inactive
   */
  softDeleteContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid contact ID' });
        return;
      }
      
      const contact = await this.service.softDeleteContact(id);
      
      res.status(200).json(contact);
    } catch (error) {
      console.error('Error soft deleting contact:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Failed to soft delete contact' });
    }
  };
}