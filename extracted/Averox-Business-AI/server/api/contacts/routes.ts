/**
 * @file Contact Routes
 * @description API routes for contact management
 */

import express from 'express';
import { ContactController } from './controllers/ContactController';
import { isAuthenticated } from '../../middleware/auth';

const router = express.Router();
const controller = new ContactController();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// GET /api/contacts - Get all contacts with pagination and filtering
router.get('/', controller.getContacts);

// GET /api/contacts/:id - Get a contact by ID
router.get('/:id', controller.getContactById);

// POST /api/contacts - Create a new contact
router.post('/', controller.createContact);

// PUT /api/contacts/:id - Update a contact
router.put('/:id', controller.updateContact);

// PATCH /api/contacts/:id - Partially update a contact
router.patch('/:id', controller.updateContact);

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', controller.deleteContact);

// PATCH /api/contacts/:id/soft-delete - Soft delete a contact by marking as inactive
router.patch('/:id/soft-delete', controller.softDeleteContact);

export default router;