import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { 
  insertUserSchema,
  insertContactSchema,
  insertAccountSchema,
  insertLeadSchema,
  insertOpportunitySchema,
  insertTaskSchema,
  insertEventSchema,
  insertActivitySchema,
  insertSubscriptionPackageSchema,
  insertUserSubscriptionSchema,
  insertApiKeySchema,
  insertCommunicationSchema,
  // Accounting and inventory schemas
  insertProductSchema,
  insertProductCategorySchema,
  insertInventoryTransactionSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema
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
  // Set up authentication
  setupAuth(app);
  
  // Set up Stripe client for payment processing
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  
  // Base API route
  const apiRouter = app.route('/api');
  
  // Error handler helper
  const handleError = (res: Response, error: unknown) => {
    console.error('API Error:', error);
    
    // Log stack trace if available
    if (error instanceof Error) {
      console.error('Error stack trace:', error.stack);
    }
    
    // Log detailed object structure for debugging
    try {
      console.error('Error details:', JSON.stringify(error, null, 2));
    } catch (jsonError) {
      console.error('Error cannot be stringified:', error);
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors 
      });
    }
    
    // Handle database-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      // PostgreSQL error codes
      const pgError = error as { code: string; message?: string; detail?: string };
      console.error('Database error code:', pgError.code);
      
      if (pgError.code === '42P01') { // undefined_table
        return res.status(500).json({
          error: "Database Error",
          message: "Table not found. Database schema may be outdated or incomplete.",
          detail: pgError.detail || pgError.message
        });
      }
      
      if (pgError.code.startsWith('23')) { // integrity constraint violations
        return res.status(400).json({
          error: "Database Constraint Error",
          message: pgError.message || "Data violates database constraints",
          detail: pgError.detail
        });
      }
    }
    
    return res.status(500).json({ 
      error: "Server Error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  };
  
  // Special endpoint to make the current user an admin (for demo purposes only)
  app.post('/api/make-admin', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const updatedUser = await storage.updateUser(userId, { role: 'Admin' });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Special profile update endpoint that can handle large base64 encoded images
  app.post('/api/profile', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const { firstName, lastName, email, company, avatar } = req.body;
      
      // Create a sanitized update object
      const updateData: Record<string, any> = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (company !== undefined) updateData.company = company;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      console.log(`Processing profile update for user ${userId}`);
      
      // Perform the update
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Users routes
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      if (req.user?.role !== 'Admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      const { username, password, email, firstName, lastName, role, isActive, avatar } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'User',
        isActive: isActive !== undefined ? isActive : true,
        avatar: avatar || null,
      });
      
      res.status(200).json(user);
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
  
  app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
      // Check if the user is authenticated and has proper permissions
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Only allow users to update their own profile or admins to update any profile
      if (req.user.id !== id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Validate the request body using a schema
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Prevent changing the role for security
      if (userData.role && req.user.role !== 'Admin') {
        delete userData.role;
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.patch('/api/users/:id/password', async (req: Request, res: Response) => {
    try {
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      
      // Only allow users to update their own password or admins to update any password
      if (req.user.id !== id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Require newPassword in the body
      if (!req.body.newPassword) {
        return res.status(400).json({ error: "New password is required" });
      }
      
      // Hash the password
      const password = await hashPassword(req.body.newPassword);
      
      const updatedUser = await storage.updateUser(id, { password });
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true, message: "Password updated successfully" });
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
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getSalesReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/leads', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getLeadsReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/conversion', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getConversionReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/reports/performance', async (req: Request, res: Response) => {
    try {
      const timeRange = req.query.timeRange as string || 'month';
      
      // Force different response based on time range to avoid 304 caching issues
      const report = await storage.getTeamPerformanceReport(timeRange);
      
      // Add timestamp to ensure unique responses for different time ranges
      const responseData = {
        ...report,
        _requestTime: new Date().toISOString(),
        _timeRange: timeRange
      };
      
      res.json(responseData);
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

  // Subscription package routes
  app.get('/api/subscription-packages', async (req: Request, res: Response) => {
    try {
      const packages = await storage.listSubscriptionPackages();
      res.json(packages);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/subscription-packages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const package_ = await storage.getSubscriptionPackage(id);
      if (!package_) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      res.json(package_);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/subscription-packages', async (req: Request, res: Response) => {
    try {
      const packageData = insertSubscriptionPackageSchema.parse(req.body);
      const package_ = await storage.createSubscriptionPackage(packageData);
      res.status(201).json(package_);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/subscription-packages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = insertSubscriptionPackageSchema.partial().parse(req.body);
      const updatedPackage = await storage.updateSubscriptionPackage(id, packageData);
      if (!updatedPackage) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/subscription-packages/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubscriptionPackage(id);
      if (!success) {
        return res.status(404).json({ error: "Subscription package not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // User subscription routes
  app.get('/api/user-subscriptions', async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.listUserSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/user-subscriptions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/users/:userId/active-subscription', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscription = await storage.getUserActiveSubscription(userId);
      if (!subscription) {
        return res.status(404).json({ error: "No active subscription found for this user" });
      }
      res.json(subscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/user-subscriptions', async (req: Request, res: Response) => {
    try {
      const subscriptionData = insertUserSubscriptionSchema.parse(req.body);
      const subscription = await storage.createUserSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/user-subscriptions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscriptionData = insertUserSubscriptionSchema.partial().parse(req.body);
      const updatedSubscription = await storage.updateUserSubscription(id, subscriptionData);
      if (!updatedSubscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      res.json(updatedSubscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/user-subscriptions/:id/cancel', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // First get the subscription to check if it has a Stripe Subscription ID
      const subscription = await storage.getUserSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      
      // If there's a Stripe subscription, cancel it there first
      if (subscription.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        } catch (stripeError) {
          console.error('Error canceling Stripe subscription:', stripeError);
          // Continue with local cancellation even if Stripe fails
        }
      }
      
      // Then cancel in our database
      const canceledSubscription = await storage.cancelUserSubscription(id);
      if (!canceledSubscription) {
        return res.status(404).json({ error: "User subscription not found" });
      }
      
      res.json(canceledSubscription);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Stripe Integration Routes
  app.post('/api/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          error: "Invalid amount", 
          details: "Amount must be a positive number" 
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Stripe Error", 
        message: error.message
      });
    }
  });

  app.post('/api/create-subscription', async (req: Request, res: Response) => {
    try {
      const { userId, packageId } = req.body;
      
      if (!userId || !packageId) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: "User ID and package ID are required" 
        });
      }

      // Get user and package details
      const user = await storage.getUser(userId);
      const package_ = await storage.getSubscriptionPackage(packageId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!package_) {
        return res.status(404).json({ error: "Subscription package not found" });
      }

      if (!package_.stripePriceId) {
        return res.status(400).json({ 
          error: "Invalid package", 
          details: "This package is not configured for online payment" 
        });
      }

      let customerId = user.stripeCustomerId;
      
      // Create a Stripe customer if user doesn't have one
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        });
        
        customerId = customer.id;
        await storage.updateStripeCustomerId(userId, customerId);
      }

      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: package_.stripePriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Create user subscription in our database
      const userSubscription = await storage.createUserSubscription({
        userId,
        packageId,
        stripeSubscriptionId: subscription.id,
        status: 'Pending',
        startDate: new Date(),
        endDate: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        canceledAt: null,
        trialEndsAt: null
      });

      // Return the client secret
      const invoice = subscription.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret;

      res.json({
        clientSecret,
        subscriptionId: subscription.id,
        userSubscriptionId: userSubscription.id
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Stripe Error", 
        message: error.message
      });
    }
  });

  app.post('/api/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn('Missing Stripe webhook secret, skipping signature verification');
        return res.status(200).end();
      }
      
      // Verify the webhook
      const event = stripe.webhooks.constructEvent(
        req.body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription;
          const userSubscription = await storage.listUserSubscriptions({ 
            stripeSubscriptionId: subscriptionId 
          });
          
          if (userSubscription.length > 0) {
            await storage.updateUserSubscription(userSubscription[0].id, {
              status: 'Active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });
          }
          break;
        
        case 'customer.subscription.updated':
          const subscription = event.data.object as any;
          const userSubs = await storage.listUserSubscriptions({ 
            stripeSubscriptionId: subscription.id 
          });
          
          if (userSubs.length > 0) {
            let status: "Active" | "Canceled" | "Expired" | "Pending" | "Trial" | null = null;
            
            switch (subscription.status) {
              case 'active':
                status = 'Active';
                break;
              case 'canceled':
                status = 'Canceled';
                break;
              case 'past_due':
              case 'unpaid':
                status = 'Expired';
                break;
              case 'trialing':
                status = 'Trial';
                break;
              default:
                status = 'Pending';
            }
            
            if (status) {
              await storage.updateUserSubscription(userSubs[0].id, { status });
            }
          }
          break;
      }

      res.status(200).end();
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  // Social Media Integrations Routes
  app.get('/api/social-integrations', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user ID from authenticated user
      const userId = req.user.id;
      const integrations = await storage.getUserSocialIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/social-integrations', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user ID from authenticated user
      const userId = req.user.id;
      const integrationData = {
        ...req.body,
        userId
      };

      const integration = await storage.createSocialIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/social-integrations/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const integration = await storage.getSocialIntegration(id);
      
      if (!integration) {
        return res.status(404).json({ error: "Social integration not found" });
      }
      
      // Make sure the user owns this integration or is an admin
      if (integration.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to access this integration" });
      }
      
      res.json(integration);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/social-integrations/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the integration to check permissions
      const integration = await storage.getSocialIntegration(id);
      if (!integration) {
        return res.status(404).json({ error: "Social integration not found" });
      }
      
      // Make sure the user owns this integration or is an admin
      if (integration.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to update this integration" });
      }
      
      const updatedIntegration = await storage.updateSocialIntegration(id, req.body);
      res.json(updatedIntegration);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/social-integrations/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the integration to check permissions
      const integration = await storage.getSocialIntegration(id);
      if (!integration) {
        return res.status(404).json({ error: "Social integration not found" });
      }
      
      // Make sure the user owns this integration or is an admin
      if (integration.userId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to delete this integration" });
      }
      
      const success = await storage.deleteSocialIntegration(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete integration" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Social Media Messages Routes
  app.get('/api/social-messages', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Optionally filter by lead or contact ID
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : undefined;
      const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;
      
      let messages = [];
      if (leadId) {
        messages = await storage.getLeadSocialMessages(leadId);
      } else if (contactId) {
        messages = await storage.getContactSocialMessages(contactId);
      } else {
        messages = await storage.listSocialMessages();
      }
      
      res.json(messages);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/social-messages', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const message = await storage.createSocialMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/social-messages/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const updatedMessage = await storage.updateSocialMessage(id, req.body);
      
      if (!updatedMessage) {
        return res.status(404).json({ error: "Social message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Lead Sources Routes
  app.get('/api/lead-sources', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const sources = await storage.listLeadSources();
      res.json(sources);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/lead-sources', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow admins to create lead sources
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Only administrators can create lead sources" });
      }

      const source = await storage.createLeadSource(req.body);
      res.status(201).json(source);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/lead-sources/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow admins to update lead sources
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Only administrators can update lead sources" });
      }

      const id = parseInt(req.params.id);
      const updatedSource = await storage.updateLeadSource(id, req.body);
      
      if (!updatedSource) {
        return res.status(404).json({ error: "Lead source not found" });
      }
      
      res.json(updatedSource);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/lead-sources/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Only allow admins to delete lead sources
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Only administrators can delete lead sources" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteLeadSource(id);
      
      if (!success) {
        return res.status(404).json({ error: "Lead source not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Social Campaigns Routes
  app.get('/api/social-campaigns', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const campaigns = await storage.listSocialCampaigns();
      res.json(campaigns);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/social-campaigns', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Set the owner ID to the current user if not provided
      const campaignData = {
        ...req.body,
        ownerId: req.body.ownerId || req.user.id
      };

      const campaign = await storage.createSocialCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/social-campaigns/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      const campaign = await storage.getSocialCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Social campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/social-campaigns/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the campaign to check permissions
      const campaign = await storage.getSocialCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: "Social campaign not found" });
      }
      
      // Make sure the user owns this campaign or is an admin
      if (campaign.ownerId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to update this campaign" });
      }
      
      const updatedCampaign = await storage.updateSocialCampaign(id, req.body);
      res.json(updatedCampaign);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/social-campaigns/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const id = parseInt(req.params.id);
      
      // First get the campaign to check permissions
      const campaign = await storage.getSocialCampaign(id);
      if (!campaign) {
        return res.status(404).json({ error: "Social campaign not found" });
      }
      
      // Make sure the user owns this campaign or is an admin
      if (campaign.ownerId !== req.user.id && req.user.role !== 'Admin') {
        return res.status(403).json({ error: "You don't have permission to delete this campaign" });
      }
      
      const success = await storage.deleteSocialCampaign(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete campaign" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // API Keys routes
  app.get('/api/settings/api-keys', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const apiKeys = await storage.listApiKeys();
      res.json(apiKeys);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/settings/api-keys', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Validate the data
      const apiKeyData = insertApiKeySchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const apiKey = await storage.createApiKey(apiKeyData);
      res.status(201).json(apiKey);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/settings/api-keys/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json(apiKey);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/settings/api-keys/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const apiKeyData = insertApiKeySchema.partial().parse(req.body);
      
      const updatedApiKey = await storage.updateApiKey(id, apiKeyData);
      
      if (!updatedApiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json(updatedApiKey);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/settings/api-keys/:id', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteApiKey(id);
      
      if (!success) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/settings/api-keys/:id/stats', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      const apiKey = await storage.getApiKey(id);
      
      if (!apiKey) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      // For now we'll return static data, but this would be backed by a real stats system
      const stats = {
        totalRequests: apiKey.usageCount || 0,
        successRate: "95%",
        lastUsed: apiKey.lastUsed,
        usageByDay: [
          { date: "2025-03-28", count: 12 },
          { date: "2025-03-29", count: 15 },
          { date: "2025-03-30", count: 8 },
          { date: "2025-03-31", count: 20 },
          { date: "2025-04-01", count: 18 },
          { date: "2025-04-02", count: 25 },
          { date: "2025-04-03", count: 22 }
        ]
      };
      
      res.json(stats);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Communication Center APIs
  app.get('/api/communications', async (req: Request, res: Response) => {
    try {
      const communications = await storage.getAllCommunications();
      res.status(200).json(communications);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/communications/contact/:id', async (req: Request, res: Response) => {
    try {
      const contactId = parseInt(req.params.id);
      const contactType = req.query.type as 'lead' | 'customer';
      
      if (!contactType || (contactType !== 'lead' && contactType !== 'customer')) {
        return res.status(400).json({ error: "Invalid contact type. Must be 'lead' or 'customer'." });
      }
      
      const communications = await storage.getContactCommunications(contactId, contactType);
      res.status(200).json(communications);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put('/api/communications/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['unread', 'read', 'replied', 'archived'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'unread', 'read', 'replied', or 'archived'." });
      }
      
      const communication = await storage.updateCommunicationStatus(id, status as 'unread' | 'read' | 'replied' | 'archived');
      
      if (!communication) {
        return res.status(404).json({ error: "Communication not found" });
      }
      
      res.status(200).json(communication);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/communications/send', async (req: Request, res: Response) => {
    try {
      const { recipientId, channel, content, contactType } = req.body;
      
      if (!recipientId || !channel || !content || !contactType) {
        return res.status(400).json({ error: "Required fields missing: recipientId, channel, content, contactType" });
      }
      
      if (contactType !== 'lead' && contactType !== 'customer') {
        return res.status(400).json({ error: "Invalid contactType. Must be 'lead' or 'customer'." });
      }
      
      const communication = await storage.createCommunication({
        contactId: recipientId,
        contactType,
        channel,
        direction: 'inbound',
        content,
        status: 'read',
        sentAt: new Date(),
      });
      
      res.status(201).json(communication);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Product Category Routes
  app.get('/api/product-categories', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const categories = await storage.listProductCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/product-categories', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/product-categories/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const category = await storage.getProductCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Product category not found" });
      }
      res.json(category);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/product-categories/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const categoryData = insertProductCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateProductCategory(id, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ error: "Product category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/product-categories/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductCategory(id);
      if (!success) {
        return res.status(404).json({ error: "Product category not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Products Routes
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log('Fetching products from storage...');
      const products = await storage.listProducts();
      console.log('Products fetched:', products);
      res.json(products);
    } catch (error) {
      console.error('Detailed error when fetching products:', error);
      handleError(res, error);
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/products/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Inventory Transaction Routes
  app.get('/api/inventory-transactions', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const transactions = await storage.listInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/inventory-transactions', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const transactionData = insertInventoryTransactionSchema.parse(req.body);
      const transaction = await storage.createInventoryTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/inventory-transactions/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const transaction = await storage.getInventoryTransaction(id);
      if (!transaction) {
        return res.status(404).json({ error: "Inventory transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/products/:id/inventory-history', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const productId = parseInt(req.params.id);
      const history = await storage.getProductInventoryHistory(productId);
      res.json(history);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/inventory-summary', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const summary = await storage.getInventorySummary();
      res.json(summary);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Invoice Routes
  app.get('/api/invoices', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log('Fetching invoices from storage...');
      const invoices = await storage.listInvoices();
      console.log('Invoices fetched:', invoices);
      res.json(invoices);
    } catch (error) {
      console.error('Detailed error when fetching invoices:', error);
      handleError(res, error);
    }
  });

  app.post('/api/invoices', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/invoices/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/invoices/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const updatedInvoice = await storage.updateInvoice(id, invoiceData);
      if (!updatedInvoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/invoices/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoice(id);
      if (!success) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Invoice Items Routes
  app.get('/api/invoices/:invoiceId/items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const invoiceId = parseInt(req.params.invoiceId);
      const items = await storage.getInvoiceItems(invoiceId);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/invoice-items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const itemData = insertInvoiceItemSchema.parse(req.body);
      const item = await storage.createInvoiceItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/invoice-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const itemData = insertInvoiceItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateInvoiceItem(id, itemData);
      if (!updatedItem) {
        return res.status(404).json({ error: "Invoice item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/invoice-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoiceItem(id);
      if (!success) {
        return res.status(404).json({ error: "Invoice item not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Purchase Order Routes
  app.get('/api/purchase-orders', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const purchaseOrders = await storage.listPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/purchase-orders', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const purchaseOrderData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder(purchaseOrderData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get('/api/purchase-orders/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const purchaseOrder = await storage.getPurchaseOrder(id);
      if (!purchaseOrder) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(purchaseOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/purchase-orders/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const purchaseOrderData = insertPurchaseOrderSchema.partial().parse(req.body);
      const updatedPurchaseOrder = await storage.updatePurchaseOrder(id, purchaseOrderData);
      if (!updatedPurchaseOrder) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(updatedPurchaseOrder);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/purchase-orders/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchaseOrder(id);
      if (!success) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Purchase Order Items Routes
  app.get('/api/purchase-orders/:purchaseOrderId/items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const purchaseOrderId = parseInt(req.params.purchaseOrderId);
      const items = await storage.getPurchaseOrderItems(purchaseOrderId);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/purchase-order-items', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const itemData = insertPurchaseOrderItemSchema.parse(req.body);
      const item = await storage.createPurchaseOrderItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch('/api/purchase-order-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const itemData = insertPurchaseOrderItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updatePurchaseOrderItem(id, itemData);
      if (!updatedItem) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete('/api/purchase-order-items/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchaseOrderItem(id);
      if (!success) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.status(204).end();
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post('/api/purchase-orders/:id/receive', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }
      
      const result = await storage.receivePurchaseOrderItems(id, items);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}
