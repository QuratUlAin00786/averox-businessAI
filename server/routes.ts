import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth } from "./auth";
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
  insertUserSubscriptionSchema
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

  // Create HTTP server
  const server = createServer(app);
  
  return server;
}
