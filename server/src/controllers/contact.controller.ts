/**
 * @file Contact controller
 * @description Handles HTTP requests for contact management
 * @module controllers/contact
 */

import { Request, Response } from 'express';
import { contactService } from '../services/contact.service';
import { handleControllerError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { insertContactSchema } from '../../shared/schema';

/**
 * Validation schema for contact creation
 * Extends the base schema with additional validation rules
 */
const createContactSchema = insertContactSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).nullable(),
});

/**
 * Contact controller class
 * Handles HTTP requests for contact management
 */
export class ContactController {
  /**
   * Get all contacts
   * @route GET /api/contacts
   */
  async getAllContacts(req: Request, res: Response) {
    try {
      // If account filter is provided, get contacts for that account
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : null;
      
      let contacts;
      if (accountId) {
        contacts = await contactService.getContactsByAccount(accountId);
      } else {
        contacts = await contactService.getAllContacts();
      }
      
      res.json(contacts);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Create a new contact
   * @route POST /api/contacts
   */
  async createContact(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createContactSchema.parse(req.body);
      
      // Assign owner if not provided
      if (!validatedData.ownerId) {
        validatedData.ownerId = req.user.id;
      }
      
      // Create contact
      const newContact = await contactService.createContact(validatedData);
      
      logger.info('Contact created successfully', { 
        contactId: newContact.id, 
        name: `${newContact.firstName} ${newContact.lastName}`,
        createdBy: req.user.id
      });
      
      res.status(201).json(newContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: error.errors
        });
      }
      
      handleControllerError(res, error);
    }
  }

  /**
   * Get contact by ID
   * @route GET /api/contacts/:id
   */
  async getContactById(req: Request, res: Response) {
    try {
      const contactId = parseInt(req.params.id);
      
      if (isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Contact ID must be a number'
        });
      }
      
      const contact = await contactService.getContactById(contactId);
      res.json(contact);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Update contact
   * @route PATCH /api/contacts/:id
   */
  async updateContact(req: Request, res: Response) {
    try {
      const contactId = parseInt(req.params.id);
      
      if (isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Contact ID must be a number'
        });
      }
      
      const updatedContact = await contactService.updateContact(contactId, req.body, req.user.id);
      
      logger.info('Contact updated successfully', { 
        contactId, 
        updatedBy: req.user.id 
      });
      
      res.json(updatedContact);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Delete contact
   * @route DELETE /api/contacts/:id
   */
  async deleteContact(req: Request, res: Response) {
    try {
      const contactId = parseInt(req.params.id);
      
      if (isNaN(contactId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Contact ID must be a number'
        });
      }
      
      await contactService.deleteContact(contactId, req.user.id);
      
      logger.info('Contact deleted successfully', { 
        contactId, 
        deletedBy: req.user.id 
      });
      
      res.json({ success: true });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Search contacts
   * @route GET /api/contacts/search
   */
  async searchContacts(req: Request, res: Response) {
    try {
      const query = req.query.q as string || '';
      
      const contacts = await contactService.searchContacts(query);
      
      res.json(contacts);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}

// Export singleton instance
export const contactController = new ContactController();