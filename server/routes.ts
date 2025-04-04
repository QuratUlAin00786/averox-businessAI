import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertContactSchema,
  insertAccountSchema,
  insertLeadSchema,
  insertOpportunitySchema,
  insertTaskSchema,
  insertEventSchema,
  insertActivitySchema
} from "@shared/schema";
import { z } from "zod";
import { 
  isOpenAIQuotaError, 
  generateAnalysis, 
  generateInsights, 
  generateRecommendations,
  generateEmailTemplate,
  summarizeMeeting
} from "./openai";

// Utility function to handle OpenAI API errors
function handleOpenAIError(res: Response, errorData: any) {
  const errorMessage = errorData.error?.message || "Unknown error";
  const isQuotaError = isOpenAIQuotaError(errorMessage);
  
  return res.status(429).json({
    error: "OpenAI API Error",
    details: isQuotaError ? 
      "OpenAI API quota exceeded. Please contact your administrator or try again later." : 
      errorMessage,
    isQuotaError: isQuotaError
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Base API route
  const apiRouter = app.route('/api');
  
  // Error handler helper
  const handleError = (res: Response, error: unknown) => {
    console.error('API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      error: "Server Error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  };

  // Users routes
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Contacts routes
  app.get('/api/contacts', async (req: Request, res: Response) => {
    try {
      const contacts = await storage.listContacts();
      res.json(contacts);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/contacts', async (req: Request, res: Response) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contactData = insertContactSchema.partial().parse(req.body);
      const updatedContact = await storage.updateContact(id, contactData);
      if (!updatedContact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.json(updatedContact);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Accounts routes
  app.get('/api/accounts', async (req: Request, res: Response) => {
    try {
      const accounts = await storage.listAccounts();
      res.json(accounts);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/accounts', async (req: Request, res: Response) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/accounts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/accounts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const accountData = insertAccountSchema.partial().parse(req.body);
      const updatedAccount = await storage.updateAccount(id, accountData);
      if (!updatedAccount) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(updatedAccount);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/accounts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAccount(id);
      if (!success) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Leads routes
  app.get('/api/leads', async (req: Request, res: Response) => {
    try {
      const leads = await storage.listLeads();
      res.json(leads);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/leads', async (req: Request, res: Response) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const leadData = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(id, leadData);
      if (!updatedLead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(updatedLead);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/leads/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/leads/:id/convert', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { contact, account, opportunity } = req.body;
      
      const validatedData: {
        contact?: any, 
        account?: any, 
        opportunity?: any
      } = {};
      
      if (contact) {
        validatedData.contact = insertContactSchema.parse(contact);
      }
      
      if (account) {
        validatedData.account = insertAccountSchema.parse(account);
      }
      
      if (opportunity) {
        validatedData.opportunity = insertOpportunitySchema.parse(opportunity);
      }
      
      const result = await storage.convertLead(id, validatedData);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Opportunities routes
  app.get('/api/opportunities', async (req: Request, res: Response) => {
    try {
      const opportunities = await storage.listOpportunities();
      res.json(opportunities);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/opportunities', async (req: Request, res: Response) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/opportunities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/opportunities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const opportunityData = insertOpportunitySchema.partial().parse(req.body);
      const updatedOpportunity = await storage.updateOpportunity(id, opportunityData);
      if (!updatedOpportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(updatedOpportunity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/opportunities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOpportunity(id);
      if (!success) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Tasks routes
  app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
      const tasks = await storage.listTasks();
      res.json(tasks);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Events routes
  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const events = await storage.listEvents();
      res.json(events);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(id, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(updatedEvent);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Activities routes
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const activities = await storage.listActivities();
      res.json(activities);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/activities/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(activity);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Dashboard data
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/dashboard/pipeline', async (req: Request, res: Response) => {
    try {
      const pipeline = await storage.getSalesPipeline();
      res.json(pipeline);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Reports
  app.get('/api/reports/sales', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      const report = await storage.getSalesReport(timeRange);
      res.json(report);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/leads', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      const report = await storage.getLeadsReport(timeRange);
      res.json(report);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/conversion', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      const report = await storage.getConversionReport(timeRange);
      res.json(report);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/performance', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      const report = await storage.getTeamPerformanceReport(timeRange);
      res.json(report);
    } catch (error) {
      handleError(res, error);
    }
  });

  // OpenAI API routes
  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    try {
      const { prompt, context, type } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Missing required field: prompt" });
      }
      
      const result = await generateAnalysis({
        prompt,
        context,
        type: type as any
      });
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/ai/insights', async (req: Request, res: Response) => {
    try {
      const { data, type } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: "Missing required field: data" });
      }
      
      const result = await generateInsights({
        data,
        type: type as any || 'all'
      });
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/ai/recommendations', async (req: Request, res: Response) => {
    try {
      const { entityType, entityData } = req.body;
      
      if (!entityType) {
        return res.status(400).json({ error: "Missing required field: entityType" });
      }
      
      // If entityData was not provided, fetch it
      let contextData = entityData;
      if (!contextData) {
        try {
          const entityId = req.body.entityId;
          switch(entityType) {
            case 'lead':
              if (entityId) {
                contextData = await storage.getLead(parseInt(entityId));
              } else {
                contextData = await storage.listLeads();
              }
              break;
            case 'opportunity':
              if (entityId) {
                contextData = await storage.getOpportunity(parseInt(entityId));
              } else {
                contextData = await storage.listOpportunities();
              }
              break;
            case 'contact':
              if (entityId) {
                contextData = await storage.getContact(parseInt(entityId));
              } else {
                contextData = await storage.listContacts();
              }
              break;
            default:
              contextData = {
                message: "No specific entity requested."
              };
          }
        } catch (dataError) {
          console.error('Error fetching data for AI recommendations:', dataError);
          contextData = { error: "Failed to fetch context data" };
        }
      }
      
      const result = await generateRecommendations({
        entityType,
        entityData: contextData
      });
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  // Email template generation endpoint
  app.post('/api/ai/email-template', async (req: Request, res: Response) => {
    try {
      const { emailType, contactInfo, dealInfo, additionalContext } = req.body;
      
      if (!emailType || !contactInfo) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          details: "Both emailType and contactInfo are required" 
        });
      }
      
      const result = await generateEmailTemplate(
        emailType,
        contactInfo,
        dealInfo,
        additionalContext
      );
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Meeting summarization endpoint
  app.post('/api/ai/summarize-meeting', async (req: Request, res: Response) => {
    try {
      const { transcript, meetingContext } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ 
          error: "Missing required field", 
          details: "Transcript is required" 
        });
      }
      
      const result = await summarizeMeeting(transcript, meetingContext);
      
      return res.json(result);
      
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}
