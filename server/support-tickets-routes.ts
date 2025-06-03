import { Request, Response, Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { 
  insertSupportTicketSchema, 
  insertTicketMessageSchema,
  type SupportTicket,
  type TicketMessage 
} from '@shared/support-tickets-schema';

// Request validation schemas
const createTicketRequestSchema = insertSupportTicketSchema.extend({
  userId: z.number().positive(),
});

const updateTicketStatusSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
});

const createMessageRequestSchema = insertTicketMessageSchema.extend({
  ticketId: z.number().positive(),
});

export function registerSupportTicketsRoutes(app: Express) {
  
  // Get all support tickets for user
  app.get('/api/support-tickets', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const tickets = await storage.getSupportTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
  });

  // Create new support ticket
  app.post('/api/support-tickets', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validationResult = createTicketRequestSchema.safeParse({
        ...req.body,
        userId
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validationResult.error.issues 
        });
      }

      const ticket = await storage.createSupportTicket(validationResult.data);
      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  });

  // Get specific ticket with messages
  app.get('/api/support-tickets/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await storage.getSupportTicket(ticketId, userId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const messages = await storage.getTicketMessages(ticketId);
      res.json({ ...ticket, messages });
    } catch (error) {
      console.error('Error fetching support ticket:', error);
      res.status(500).json({ error: 'Failed to fetch support ticket' });
    }
  });

  // Update ticket status
  app.patch('/api/support-tickets/:id/status', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const validationResult = updateTicketStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid status',
          details: validationResult.error.issues 
        });
      }

      const ticket = await storage.updateSupportTicketStatus(ticketId, userId, validationResult.data.status);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      res.json(ticket);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ error: 'Failed to update ticket status' });
    }
  });

  // Add message to ticket
  app.post('/api/support-tickets/:id/messages', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const validationResult = createMessageRequestSchema.safeParse({
        ...req.body,
        ticketId
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid message data',
          details: validationResult.error.issues 
        });
      }

      // Verify ticket belongs to user
      const ticket = await storage.getSupportTicket(ticketId, userId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const message = await storage.createTicketMessage(validationResult.data);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating ticket message:', error);
      res.status(500).json({ error: 'Failed to create ticket message' });
    }
  });

  // Get ticket statistics
  app.get('/api/support-tickets/stats', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await storage.getSupportTicketStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      res.status(500).json({ error: 'Failed to fetch ticket stats' });
    }
  });
}