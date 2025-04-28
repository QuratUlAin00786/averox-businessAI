/**
 * @file Task controller
 * @description Handles HTTP requests for task management
 * @module controllers/task
 */

import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { handleControllerError } from '../utils/error-handler';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { insertTaskSchema } from '../../shared/schema';

/**
 * Validation schema for task creation
 * Extends the base schema with additional validation rules
 */
const createTaskSchema = insertTaskSchema.extend({
  title: z.string().min(1, 'Title is required'),
  dueDate: z.string().or(z.date()).transform(val => new Date(val)),
  priority: z.enum(['High', 'Medium', 'Normal']),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Deferred']),
});

/**
 * Task controller class
 * Handles HTTP requests for task management
 */
export class TaskController {
  /**
   * Get all tasks
   * @route GET /api/tasks
   */
  async getAllTasks(req: Request, res: Response) {
    try {
      // If assignee filter is provided, get tasks for that assignee
      const assigneeId = req.query.assigneeId ? parseInt(req.query.assigneeId as string) : null;
      
      // Check for special filters
      const filter = req.query.filter as string;
      
      // Handle special filters
      if (filter === 'upcoming') {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const tasks = await taskService.getUpcomingTasks(days);
        return res.json(tasks);
      } else if (filter === 'overdue') {
        const tasks = await taskService.getOverdueTasks();
        return res.json(tasks);
      }
      
      // Handle regular queries
      let tasks;
      if (assigneeId) {
        tasks = await taskService.getTasksByAssignee(assigneeId);
      } else {
        tasks = await taskService.getAllTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Create a new task
   * @route POST /api/tasks
   */
  async createTask(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createTaskSchema.parse(req.body);
      
      // Assign creator if not provided
      if (!validatedData.creatorId) {
        validatedData.creatorId = req.user.id;
      }
      
      // Create task
      const newTask = await taskService.createTask(validatedData);
      
      logger.info('Task created successfully', { 
        taskId: newTask.id, 
        title: newTask.title,
        createdBy: req.user.id
      });
      
      res.status(201).json(newTask);
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
   * Get task by ID
   * @route GET /api/tasks/:id
   */
  async getTaskById(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Task ID must be a number'
        });
      }
      
      const task = await taskService.getTaskById(taskId);
      res.json(task);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Update task
   * @route PATCH /api/tasks/:id
   */
  async updateTask(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Task ID must be a number'
        });
      }
      
      const updatedTask = await taskService.updateTask(taskId, req.body, req.user.id);
      
      logger.info('Task updated successfully', { 
        taskId, 
        updatedBy: req.user.id 
      });
      
      res.json(updatedTask);
    } catch (error) {
      handleControllerError(res, error);
    }
  }

  /**
   * Delete task
   * @route DELETE /api/tasks/:id
   */
  async deleteTask(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID',
          message: 'Task ID must be a number'
        });
      }
      
      await taskService.deleteTask(taskId, req.user.id);
      
      logger.info('Task deleted successfully', { 
        taskId, 
        deletedBy: req.user.id 
      });
      
      res.json({ success: true });
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Get upcoming tasks
   * @route GET /api/tasks/upcoming
   */
  async getUpcomingTasks(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      
      const tasks = await taskService.getUpcomingTasks(days);
      
      res.json(tasks);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
  
  /**
   * Get overdue tasks
   * @route GET /api/tasks/overdue
   */
  async getOverdueTasks(req: Request, res: Response) {
    try {
      const tasks = await taskService.getOverdueTasks();
      
      res.json(tasks);
    } catch (error) {
      handleControllerError(res, error);
    }
  }
}

// Export singleton instance
export const taskController = new TaskController();