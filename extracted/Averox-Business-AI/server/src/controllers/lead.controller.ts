/**
 * @file Lead controller
 * @description Handles HTTP requests for lead management
 * @module controllers/lead
 */

import { Request, Response } from 'express';
import { leadService } from '../services/lead.service';
import { handleControllerError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { insertLeadSchema } from '../../shared/schema';

/**
 * Validation schema for lead creation
 * Extends the base schema with additional validation rules
 */
const createLeadSchema = insertLeadSchema.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

/**
 * Lead controller class
 * Handles HTTP requests for lead management
 */
export class LeadController {
  /**
   * Get all leads
   * @route GET /api/leads
   */
  async getAllLeads(req: Request, res: Response) {
    try {
      // If owner filter is provided, get leads for that owner
      const ownerId = req.query.ownerId ? parseInt(req.query.ownerId as string) : null;
      
      let leads;
      if (ownerId) {
        leads = await leadService.getLeadsByOwner(ownerId);
      } else {
        leads = await leadService.getAllLeads();
      }
      
      res.json(leads);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Create a new lead
   * @route POST /api/leads
   */
  async createLead(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createLeadSchema.parse(req.body);
      
      // Create lead
      const newLead = await leadService.createLead(validatedData);
      
      logger.info('Lead created successfully', { 
        leadId: newLead.id, 
        name: `${newLead.firstName} ${newLead.lastName}`,
        createdBy: req.user.id
      });
      
      res.status(201).json(newLead);
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
   * Get lead by ID
   * @route GET /api/leads/:id
   */
  async getLeadById(req: Request, res: Response) {
    try {
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Lead ID must be a number'
        });
      }
      
      const lead = await leadService.getLeadById(leadId);
      res.json(lead);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Update lead
   * @route PATCH /api/leads/:id
   */
  async updateLead(req: Request, res: Response) {
    try {
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Lead ID must be a number'
        });
      }
      
      const updatedLead = await leadService.updateLead(leadId, req.body, req.user.id);
      
      logger.info('Lead updated successfully', { 
        leadId, 
        updatedBy: req.user.id 
      });
      
      res.json(updatedLead);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Delete lead
   * @route DELETE /api/leads/:id
   */
  async deleteLead(req: Request, res: Response) {
    try {
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Lead ID must be a number'
        });
      }
      
      await leadService.deleteLead(leadId, req.user.id);
      
      logger.info('Lead deleted successfully', { 
        leadId, 
        deletedBy: req.user.id 
      });
      
      res.json({ success: true });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Get lead statistics
   * @route GET /api/leads/stats
   */
  async getLeadStats(req: Request, res: Response) {
    try {
      const stats = await leadService.getLeadStats();
      res.json(stats);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Convert lead
   * @route POST /api/leads/:id/convert
   */
  async convertLead(req: Request, res: Response) {
    try {
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Lead ID must be a number'
        });
      }
      
      // Get the lead
      const lead = await leadService.getLeadById(leadId);
      
      // Extract conversion data from request body
      const { 
        convertToContact, 
        convertToAccount, 
        convertToOpportunity,
        accountId,
        opportunityName,
        opportunityAmount,
        opportunityCloseDate
      } = req.body;
      
      // Prepare update data
      const updateData: any = {
        isConverted: true
      };
      
      // If converting to contact, account, or opportunity,
      // set appropriate IDs (these would be created in a real implementation)
      if (convertToContact) {
        updateData.convertedToContactId = 0; // Placeholder
      }
      
      if (convertToAccount) {
        updateData.convertedToAccountId = accountId || 0; // Placeholder
      }
      
      if (convertToOpportunity) {
        updateData.convertedToOpportunityId = 0; // Placeholder
      }
      
      // Update the lead
      const updatedLead = await leadService.updateLead(leadId, updateData, req.user.id);
      
      logger.info('Lead converted successfully', { 
        leadId, 
        convertedBy: req.user.id,
        convertToContact,
        convertToAccount,
        convertToOpportunity
      });
      
      res.json({
        success: true,
        lead: updatedLead
      });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}

// Export singleton instance
export const leadController = new LeadController();