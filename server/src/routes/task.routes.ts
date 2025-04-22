/**
 * @file Task routes
 * @description Defines API routes for task management
 * @module routes/task
 */

import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { asyncHandler } from '../utils/error-handler';
import { isAuthenticated } from '../middleware/auth.middleware';

// Create router
const router = Router();

/**
 * @route GET /api/tasks
 * @desc Get all tasks with optional filters
 * @access Private
 */
router.get('/tasks', isAuthenticated, asyncHandler(taskController.getAllTasks.bind(taskController)));

/**
 * @route POST /api/tasks
 * @desc Create a new task
 * @access Private
 */
router.post('/tasks', isAuthenticated, asyncHandler(taskController.createTask.bind(taskController)));

/**
 * @route GET /api/tasks/upcoming
 * @desc Get upcoming tasks
 * @access Private
 */
router.get('/tasks/upcoming', isAuthenticated, asyncHandler(taskController.getUpcomingTasks.bind(taskController)));

/**
 * @route GET /api/tasks/overdue
 * @desc Get overdue tasks
 * @access Private
 */
router.get('/tasks/overdue', isAuthenticated, asyncHandler(taskController.getOverdueTasks.bind(taskController)));

/**
 * @route GET /api/tasks/:id
 * @desc Get task by ID
 * @access Private
 */
router.get('/tasks/:id', isAuthenticated, asyncHandler(taskController.getTaskById.bind(taskController)));

/**
 * @route PATCH /api/tasks/:id
 * @desc Update task
 * @access Private
 */
router.patch('/tasks/:id', isAuthenticated, asyncHandler(taskController.updateTask.bind(taskController)));

/**
 * @route DELETE /api/tasks/:id
 * @desc Delete task
 * @access Private
 */
router.delete('/tasks/:id', isAuthenticated, asyncHandler(taskController.deleteTask.bind(taskController)));

export default router;