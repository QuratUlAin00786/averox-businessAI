/**
 * @file Contact routes
 * @description Defines API routes for contact management
 * @module routes/contact
 */

import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { asyncHandler } from '../utils/error-handler';
import { isAuthenticated } from '../middleware/auth.middleware';

// Create router
const router = Router();

/**
 * @route GET /api/contacts
 * @desc Get all contacts or filter by account
 * @access Private
 */
router.get('/contacts', isAuthenticated, asyncHandler(contactController.getAllContacts.bind(contactController)));

/**
 * @route POST /api/contacts
 * @desc Create a new contact
 * @access Private
 */
router.post('/contacts', isAuthenticated, asyncHandler(contactController.createContact.bind(contactController)));

/**
 * @route GET /api/contacts/search
 * @desc Search contacts
 * @access Private
 */
router.get('/contacts/search', isAuthenticated, asyncHandler(contactController.searchContacts.bind(contactController)));

/**
 * @route GET /api/contacts/:id
 * @desc Get contact by ID
 * @access Private
 */
router.get('/contacts/:id', isAuthenticated, asyncHandler(contactController.getContactById.bind(contactController)));

/**
 * @route PATCH /api/contacts/:id
 * @desc Update contact
 * @access Private
 */
router.patch('/contacts/:id', isAuthenticated, asyncHandler(contactController.updateContact.bind(contactController)));

/**
 * @route DELETE /api/contacts/:id
 * @desc Delete contact
 * @access Private
 */
router.delete('/contacts/:id', isAuthenticated, asyncHandler(contactController.deleteContact.bind(contactController)));

export default router;