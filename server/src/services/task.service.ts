/**
 * @file Task service
 * @description Provides task management functionality
 * @module services/task
 */

import { eq, and, desc, sql, or, isNull, not } from 'drizzle-orm';
import { db } from '../utils/db';
import { tasks, users, activities } from '../../shared/schema';
import { ApiError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * Task service class
 * Provides methods for task CRUD operations
 */
export class TaskService {
  /**
   * Get all tasks
   * @returns List of all tasks
   */
  async getAllTasks() {
    try {
      // Fetch tasks with assignee and creator information
      const allTasks = await db.query.tasks.findMany({
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [desc(tasks.dueDate)]
      });
      
      return allTasks;
    } catch (error) {
      logger.error('Failed to retrieve tasks', error);
      throw new ApiError('Failed to retrieve tasks', 500);
    }
  }
  
  /**
   * Get tasks for a specific user
   * @param userId User ID to filter by
   * @returns List of tasks assigned to the specified user
   */
  async getTasksByAssignee(userId: number) {
    try {
      const userTasks = await db.query.tasks.findMany({
        where: eq(tasks.assigneeId, userId),
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [desc(tasks.dueDate)]
      });
      
      return userTasks;
    } catch (error) {
      logger.error('Failed to retrieve tasks by assignee', { userId, error });
      throw new ApiError('Failed to retrieve tasks', 500);
    }
  }
  
  /**
   * Create a new task
   * @param taskData Task data for new task
   * @returns Created task object
   */
  async createTask(taskData: typeof tasks.$inferInsert) {
    try {
      // Validate assignee if provided
      if (taskData.assigneeId) {
        const assignee = await db.query.users.findFirst({
          where: eq(users.id, taskData.assigneeId)
        });
        
        if (!assignee) {
          throw new ApiError('Assignee not found', 404, 'USER_NOT_FOUND');
        }
      }
      
      // Insert the new task
      const [newTask] = await db.insert(tasks)
        .values({
          ...taskData,
          createdAt: new Date(),
        })
        .returning();
      
      if (!newTask) {
        throw new ApiError('Failed to create task', 500);
      }
      
      // Log activity
      if (taskData.creatorId) {
        await db.insert(activities).values({
          userId: taskData.creatorId,
          action: 'Created task',
          detail: newTask.title,
          relatedToType: 'task',
          relatedToId: newTask.id,
          createdAt: new Date(),
          icon: 'added',
        });
      }
      
      // Fetch full task with assignee and creator information
      const taskWithRelations = await db.query.tasks.findFirst({
        where: eq(tasks.id, newTask.id),
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      return taskWithRelations;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to create task', error);
      throw new ApiError('Failed to create task', 500);
    }
  }
  
  /**
   * Get task by ID
   * @param taskId Task ID to lookup
   * @returns Task object
   */
  async getTaskById(taskId: number) {
    try {
      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      if (!task) {
        throw new ApiError('Task not found', 404, 'TASK_NOT_FOUND');
      }
      
      return task;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to retrieve task', { taskId, error });
      throw new ApiError('Failed to retrieve task', 500);
    }
  }
  
  /**
   * Update a task
   * @param taskId Task ID to update
   * @param taskData Updated task data
   * @param userId User ID performing the update
   * @returns Updated task object
   */
  async updateTask(taskId: number, taskData: Partial<typeof tasks.$inferInsert>, userId: number) {
    try {
      // Check if task exists
      const existingTask = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId)
      });
      
      if (!existingTask) {
        throw new ApiError('Task not found', 404, 'TASK_NOT_FOUND');
      }
      
      // Validate assignee if provided
      if (taskData.assigneeId) {
        const assignee = await db.query.users.findFirst({
          where: eq(users.id, taskData.assigneeId)
        });
        
        if (!assignee) {
          throw new ApiError('Assignee not found', 404, 'USER_NOT_FOUND');
        }
      }
      
      // Update the task
      const [updatedTask] = await db.update(tasks)
        .set(taskData)
        .where(eq(tasks.id, taskId))
        .returning();
      
      if (!updatedTask) {
        throw new ApiError('Failed to update task', 500);
      }
      
      // Check if status changed to completed
      let activityAction = 'Updated task';
      let activityIcon = 'updated';
      
      if (taskData.status === 'Completed' && existingTask.status !== 'Completed') {
        activityAction = 'Completed task';
        activityIcon = 'completed';
      }
      
      // Log activity
      await db.insert(activities).values({
        userId,
        action: activityAction,
        detail: updatedTask.title,
        relatedToType: 'task',
        relatedToId: updatedTask.id,
        createdAt: new Date(),
        icon: activityIcon,
      });
      
      // Fetch full task with assignee and creator information
      const taskWithRelations = await db.query.tasks.findFirst({
        where: eq(tasks.id, updatedTask.id),
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      return taskWithRelations;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to update task', { taskId, error });
      throw new ApiError('Failed to update task', 500);
    }
  }
  
  /**
   * Delete a task
   * @param taskId Task ID to delete
   * @param userId User ID performing the deletion
   * @returns Success status
   */
  async deleteTask(taskId: number, userId: number) {
    try {
      // Check if task exists
      const existingTask = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId)
      });
      
      if (!existingTask) {
        throw new ApiError('Task not found', 404, 'TASK_NOT_FOUND');
      }
      
      // Log activity before deletion
      await db.insert(activities).values({
        userId,
        action: 'Deleted task',
        detail: existingTask.title,
        relatedToType: 'task',
        relatedToId: null, // No ID since it will be deleted
        createdAt: new Date(),
        icon: 'deleted',
      });
      
      // Delete the task
      await db.delete(tasks).where(eq(tasks.id, taskId));
      
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      logger.error('Failed to delete task', { taskId, error });
      throw new ApiError('Failed to delete task', 500);
    }
  }
  
  /**
   * Get upcoming tasks
   * @param days Number of days to look ahead
   * @returns List of upcoming tasks
   */
  async getUpcomingTasks(days: number = 7) {
    try {
      // Calculate date range
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + days);
      
      // Fetch upcoming tasks
      const upcomingTasks = await db.query.tasks.findMany({
        where: and(
          not(eq(tasks.status, 'Completed')),
          sql`${tasks.dueDate} >= ${today}`,
          sql`${tasks.dueDate} <= ${endDate}`
        ),
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [tasks.dueDate]
      });
      
      return upcomingTasks;
    } catch (error) {
      logger.error('Failed to retrieve upcoming tasks', error);
      throw new ApiError('Failed to retrieve upcoming tasks', 500);
    }
  }
  
  /**
   * Get overdue tasks
   * @returns List of overdue tasks
   */
  async getOverdueTasks() {
    try {
      // Calculate today's date
      const today = new Date();
      
      // Fetch overdue tasks
      const overdueTasks = await db.query.tasks.findMany({
        where: and(
          not(eq(tasks.status, 'Completed')),
          sql`${tasks.dueDate} < ${today}`
        ),
        with: {
          assignee: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          },
          creator: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: [tasks.dueDate]
      });
      
      return overdueTasks;
    } catch (error) {
      logger.error('Failed to retrieve overdue tasks', error);
      throw new ApiError('Failed to retrieve overdue tasks', 500);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();