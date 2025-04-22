/**
 * @file User routes
 * @description Defines API routes for user management
 * @module routes/user
 */

import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { asyncHandler } from '../utils/error-handler';
import { isAuthenticated, isAdmin, isResourceOwnerOrHasRole } from '../middleware/auth.middleware';

// Create router
const router = Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private/Admin
 */
router.get('/users', isAuthenticated, isAdmin, asyncHandler(userController.getAllUsers.bind(userController)));

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private/Admin
 */
router.post('/users', isAuthenticated, isAdmin, asyncHandler(userController.createUser.bind(userController)));

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get('/users/:id', isAuthenticated, isResourceOwnerOrHasRole('id', ['Admin']), asyncHandler(userController.getUserById.bind(userController)));

/**
 * @route PATCH /api/users/:id
 * @desc Update user
 * @access Private
 */
router.patch('/users/:id', isAuthenticated, isResourceOwnerOrHasRole('id', ['Admin']), asyncHandler(userController.updateUser.bind(userController)));

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private/Admin
 */
router.delete('/users/:id', isAuthenticated, isAdmin, asyncHandler(userController.deleteUser.bind(userController)));

/**
 * @route GET /api/user
 * @desc Get current user
 * @access Private
 */
router.get('/user', isAuthenticated, asyncHandler(userController.getCurrentUser.bind(userController)));

/**
 * @route POST /api/make-admin
 * @desc Make current user an admin (for demo purposes)
 * @access Private
 */
router.post('/make-admin', isAuthenticated, asyncHandler(userController.makeAdmin.bind(userController)));

export default router;