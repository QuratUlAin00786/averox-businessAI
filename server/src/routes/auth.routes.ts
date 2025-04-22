/**
 * @file Authentication routes
 * @description Defines API routes for authentication
 * @module routes/auth
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../utils/error-handler';
import { isAuthenticated } from '../middleware/auth.middleware';

// Create router
const router = Router();

/**
 * @route POST /api/login
 * @desc Log in a user
 * @access Public
 */
router.post('/login', asyncHandler(authController.login.bind(authController)));

/**
 * @route POST /api/logout
 * @desc Log out a user
 * @access Private
 */
router.post('/logout', isAuthenticated, asyncHandler(authController.logout.bind(authController)));

/**
 * @route POST /api/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', asyncHandler(authController.register.bind(authController)));

/**
 * @route PATCH /api/profile
 * @desc Update user profile
 * @access Private
 */
router.patch('/profile', isAuthenticated, asyncHandler(authController.updateProfile.bind(authController)));

/**
 * @route GET /api/auth/status
 * @desc Check authentication status
 * @access Public
 */
router.get('/auth/status', asyncHandler(authController.authStatus.bind(authController)));

export default router;