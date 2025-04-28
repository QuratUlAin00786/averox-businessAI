/**
 * @file User routes
 * @description Routes for user management
 */

import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { isAuthenticated, isAdmin } from '../../middleware/auth';

// Create a router instance
const userRouter = Router();
const userController = new UserController();

// Get the current authenticated user
userRouter.get('/me', isAuthenticated, userController.getCurrentUser);

// Get all users (admin only)
userRouter.get('/', isAuthenticated, userController.getAllUsers);

// Get a user by ID
userRouter.get('/:id', isAuthenticated, userController.getUserById);

// Create a new user (admin only)
userRouter.post('/', isAuthenticated, userController.createUser);

// Update an existing user
userRouter.put('/:id', isAuthenticated, userController.updateUser);

// Change a user's password
userRouter.post('/:id/change-password', isAuthenticated, userController.changePassword);

// Delete a user (admin only)
userRouter.delete('/:id', isAuthenticated, userController.deleteUser);

// Export the router
export default userRouter;