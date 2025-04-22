/**
 * @file Lead routes
 * @description Defines API routes for lead management
 * @module routes/lead
 */

import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { asyncHandler } from '../utils/error-handler';
import { isAuthenticated } from '../middleware/auth.middleware';

// Create router
const router = Router();

/**
 * @route GET /api/leads
 * @desc Get all leads
 * @access Private
 */
router.get('/leads', isAuthenticated, asyncHandler(leadController.getAllLeads.bind(leadController)));

/**
 * @route POST /api/leads
 * @desc Create a new lead
 * @access Private
 */
router.post('/leads', isAuthenticated, asyncHandler(leadController.createLead.bind(leadController)));

/**
 * @route GET /api/leads/stats
 * @desc Get lead statistics
 * @access Private
 */
router.get('/leads/stats', isAuthenticated, asyncHandler(leadController.getLeadStats.bind(leadController)));

/**
 * @route GET /api/leads/:id
 * @desc Get lead by ID
 * @access Private
 */
router.get('/leads/:id', isAuthenticated, asyncHandler(leadController.getLeadById.bind(leadController)));

/**
 * @route PATCH /api/leads/:id
 * @desc Update lead
 * @access Private
 */
router.patch('/leads/:id', isAuthenticated, asyncHandler(leadController.updateLead.bind(leadController)));

/**
 * @route DELETE /api/leads/:id
 * @desc Delete lead
 * @access Private
 */
router.delete('/leads/:id', isAuthenticated, asyncHandler(leadController.deleteLead.bind(leadController)));

/**
 * @route POST /api/leads/:id/convert
 * @desc Convert lead to contact/account/opportunity
 * @access Private
 */
router.post('/leads/:id/convert', isAuthenticated, asyncHandler(leadController.convertLead.bind(leadController)));

export default router;