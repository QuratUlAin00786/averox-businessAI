import type { Express, Request, Response } from "express";
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
import OpenAI from "openai";

// Utility function to check for OpenAI quota errors in API responses
function isOpenAIQuotaError(errorMessage: string): boolean {
  return (
    errorMessage.includes("quota") || 
    errorMessage.includes("insufficient_quota") || 
    errorMessage.includes("rate_limit")
  );
}

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
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unexpected error occurred" });
  };

  // Authentication endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In a real application, you would use proper authentication here
      // like JWT tokens or sessions. For this demo, we'll just return the user.
      const { password: _, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Dashboard endpoints
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/dashboard/pipeline', async (req, res) => {
    try {
      const pipeline = await storage.getSalesPipeline();
      return res.json(pipeline);
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.get('/api/dashboard/activities', async (req, res) => {
    try {
      // Get the most recent activities
      const activities = await storage.listActivities();
      const recentActivities = activities.slice(0, 10);
      
      // Fetch user details for each activity
      const activitiesWithUserDetails = await Promise.all(
        recentActivities.map(async (activity) => {
          // Make sure userId is a valid number before calling getUser
          const user = activity.userId !== null ? await storage.getUser(activity.userId) : null;
          return {
            ...activity,
            user: user ? {
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.avatar || "",
              initials: `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`,
            } : { name: "Unknown User", avatar: "", initials: "??" }
          };
        })
      );
      
      return res.json(activitiesWithUserDetails);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Reports endpoints
  app.get('/api/reports/sales', async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || 'last-30';
      const salesReport = await storage.getSalesReport(timeRange);
      return res.json(salesReport);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/reports/leads', async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || 'last-30';
      const leadsReport = await storage.getLeadsReport(timeRange);
      return res.json(leadsReport);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/reports/conversion', async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || 'last-30';
      const conversionReport = await storage.getConversionReport(timeRange);
      return res.json(conversionReport);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/reports/team-performance', async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || 'last-30';
      const teamReport = await storage.getTeamPerformanceReport(timeRange);
      return res.json(teamReport);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Users endpoints
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.listUsers();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      return res.json(usersWithoutPasswords);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // Contacts endpoints
  app.get('/api/contacts', async (req, res) => {
    try {
      const contacts = await storage.listContacts();
      return res.json(contacts);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      return res.json(contact);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/contacts', async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contactData);
      return res.status(201).json(newContact);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.put('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      const contactData = insertContactSchema.partial().parse(req.body);
      const updatedContact = await storage.updateContact(id, contactData);
      
      if (!updatedContact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      return res.json(updatedContact);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.delete('/api/contacts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      const success = await storage.deleteContact(id);
      if (!success) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Update contact notes
  app.patch('/api/contacts/:id/notes', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      const { notes } = req.body;
      
      if (typeof notes !== 'string') {
        return res.status(400).json({ error: "Notes must be a string" });
      }
      
      const updatedContact = await storage.updateContact(id, { notes });
      
      if (!updatedContact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      return res.json(updatedContact);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Accounts endpoints
  app.get('/api/accounts', async (req, res) => {
    try {
      const accounts = await storage.listAccounts();
      return res.json(accounts);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid account ID" });
      }
      
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      return res.json(account);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/accounts', async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const newAccount = await storage.createAccount(accountData);
      return res.status(201).json(newAccount);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.put('/api/accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid account ID" });
      }
      
      const accountData = insertAccountSchema.partial().parse(req.body);
      const updatedAccount = await storage.updateAccount(id, accountData);
      
      if (!updatedAccount) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      return res.json(updatedAccount);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid account ID" });
      }
      
      const success = await storage.deleteAccount(id);
      if (!success) {
        return res.status(404).json({ error: "Account not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Leads endpoints
  app.get('/api/leads', async (req, res) => {
    try {
      const leads = await storage.listLeads();
      return res.json(leads);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/leads/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      return res.json(lead);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/leads', async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const newLead = await storage.createLead(leadData);
      return res.status(201).json(newLead);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.put('/api/leads/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      const leadData = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(id, leadData);
      
      if (!updatedLead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      return res.json(updatedLead);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.delete('/api/leads/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/leads/:id/convert', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      const { contact, account, opportunity } = req.body;
      
      // Validate optional conversion data
      if (contact) {
        insertContactSchema.partial().parse(contact);
      }
      if (account) {
        insertAccountSchema.partial().parse(account);
      }
      if (opportunity) {
        insertOpportunitySchema.partial().parse(opportunity);
      }
      
      const result = await storage.convertLead(id, { contact, account, opportunity });
      return res.json(result);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Opportunities endpoints
  app.get('/api/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.listOpportunities();
      return res.json(opportunities);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      
      return res.json(opportunity);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/opportunities', async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const newOpportunity = await storage.createOpportunity(opportunityData);
      return res.status(201).json(newOpportunity);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.patch('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      
      const opportunityData = insertOpportunitySchema.partial().parse(req.body);
      const updatedOpportunity = await storage.updateOpportunity(id, opportunityData);
      
      if (!updatedOpportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      
      return res.json(updatedOpportunity);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.delete('/api/opportunities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid opportunity ID" });
      }
      
      const success = await storage.deleteOpportunity(id);
      if (!success) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Tasks endpoints
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.listTasks();
      return res.json(tasks);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      return res.json(task);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/tasks', async (req, res) => {
    try {
      // Convert Date strings to proper format for timestamps
      const data = {...req.body};
      if (data.reminderDate && typeof data.reminderDate === 'string') {
        // Keep as string, storage layer will handle conversion
      }
      
      const taskData = insertTaskSchema.parse(data);
      const newTask = await storage.createTask(taskData);
      return res.status(201).json(newTask);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      
      const taskData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      return res.json(updatedTask);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Events endpoints
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.listEvents();
      return res.json(events);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      return res.json(event);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/events', async (req, res) => {
    try {
      console.log('Event creation request body:', req.body);
      
      // Simple approach - just pass the data directly to storage
      // The storage layer will handle date conversion
      try {
        const eventData = {
          title: req.body.title,
          description: req.body.description,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          location: req.body.location,
          locationType: req.body.locationType,
          eventType: req.body.eventType,
          status: req.body.status,
          ownerId: req.body.ownerId,
          isAllDay: req.body.isAllDay,
          isRecurring: req.body.isRecurring,
          recurringRule: req.body.recurringRule
        };
        
        console.log('Simplified event data:', eventData);
        const newEvent = await storage.createEvent(eventData);
        console.log('New event created:', newEvent);
        return res.status(201).json(newEvent);
      } catch (processingError) {
        console.error('Processing error:', processingError);
        throw processingError;
      }
    } catch (error) {
      console.error('Event creation failed:', error);
      return handleError(res, error);
    }
  });
  
  app.patch('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      // Process date fields properly
      const data = {...req.body};
      if (data.startDate && typeof data.startDate === 'string') {
        // Keep as string, storage layer will handle conversion
      }
      if (data.endDate && typeof data.endDate === 'string') {
        // Keep as string, storage layer will handle conversion
      }
      
      const eventData = insertEventSchema.partial().parse(data);
      const updatedEvent = await storage.updateEvent(id, eventData);
      
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      return res.json(updatedEvent);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.delete('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Activities endpoints
  app.get('/api/activities', async (req, res) => {
    try {
      const activities = await storage.listActivities();
      return res.json(activities);
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  app.post('/api/activities', async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(activityData);
      return res.status(201).json(newActivity);
    } catch (error) {
      return handleError(res, error);
    }
  });

  // AI Intelligence endpoints
  // Initialize OpenAI client with debug info
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  console.log("Using API key:", apiKey ? "Defined (length: " + apiKey.length + ", starts with: " + apiKey.substring(0, 7) + ")" : "Undefined");

  // Configure OpenAI with project key support
  const config: any = { 
    apiKey: apiKey as string,
  };
  
  // Add project config if it's a project key
  if (apiKey?.startsWith('sk-proj-')) {
    console.log("Detected project key format, configuring accordingly");
    config.project = 'default'; // Most project keys use 'default' as the project name
  }

  const openai = new OpenAI(config);
  
  // The newest OpenAI model is "gpt-4o"
  const AI_MODEL = "gpt-4o";

  // Analyze data with AI
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const { prompt, context, type = 'general' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      // Log environment variables for debugging
      console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Defined" : "Undefined");
      console.log("VITE_OPENAI_API_KEY:", process.env.VITE_OPENAI_API_KEY ? "Defined" : "Undefined");
      
      // Construct the system message based on the type of analysis
      let systemContent = "You are an AI assistant for AVEROX CRM, providing business analysis and insights.";
      
      switch(type) {
        case 'leads':
          systemContent += " Focus on lead generation, qualification and conversion strategies.";
          break;
        case 'opportunities':
          systemContent += " Focus on sales pipeline, forecasting, and deal closure strategies.";
          break;
        case 'customers':
          systemContent += " Focus on customer retention, satisfaction, and relationship management.";
          break;
        default:
          systemContent += " Provide general business analysis and actionable insights.";
      }
      
      // Format the response with clear sections, bullet points, and recommendations
      systemContent += " Format your response with clear sections, bullet points for key insights, and actionable recommendations.";
      
      // Construct messages for OpenAI
      const messages = [
        { role: "system", content: systemContent },
        { role: "user", content: `${context ? context + '\n\n' : ''}${prompt}` }
      ];
      
      try {
        // Use direct fetch API instead of OpenAI client library
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // Use the most widely available model
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API Error Response:", errorData);
          return handleOpenAIError(res, errorData);
            error: "OpenAI API Error",
            details: errorData.error?.message || "Unknown error",
            apiError: errorData
          });
        }
        
        const data = await response.json();
        
        // Return the AI response
        return res.json({
          content: data.choices[0].message.content,
          type: type
        });
      } catch (openaiError: any) {
        console.error("OpenAI API Error Details:", openaiError);
        
        // Return a more detailed error for debugging
        return res.status(500).json({
          error: "OpenAI API Error",
          details: openaiError.message || "Unknown error",
          apiError: openaiError
        });
      }
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Generate insights from CRM data
  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { data, type = 'all' } = req.body;
      
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ error: "Data is required for insight generation" });
      }
      
      // Construct system message
      const systemContent = `You are an AI analyst for AVEROX CRM. Generate structured business insights in JSON format. 
        Each insight should have a title, description, category, and importance level (high, medium, low).
        ${type !== 'all' ? `Focus specifically on ${type} data and trends.` : ''}`;
      
      // Create prompt for insights
      const prompt = `Analyze the following CRM data and generate 3-5 key business insights:\n\n${JSON.stringify(data, null, 2)}`;
      
      try {
        // Use direct fetch API instead of OpenAI client library
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // Use the most widely available model
            messages: [
              { role: "system", content: systemContent },
              { role: "user", content: prompt }
            ],
            temperature: 0.5,
            response_format: { type: "json_object" }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API Error Response:", errorData);
          return handleOpenAIError(res, errorData);
            error: "OpenAI API Error",
            details: errorData.error?.message || "Unknown error",
            apiError: errorData
          });
        }
        
        const data = await response.json();
        
        // Return the AI response
        return res.json({
          content: data.choices[0].message.content,
          type: type
        });
      } catch (openaiError: any) {
        console.error("OpenAI API Error Details:", openaiError);
        
        // Return a more detailed error for debugging
        return res.status(500).json({
          error: "OpenAI API Error",
          details: openaiError.message || "Unknown error",
          apiError: openaiError
        });
      }
    } catch (error) {
      return handleError(res, error);
    }
  });
  
  // Generate entity-specific recommendations
  app.post('/api/ai/recommendations', async (req, res) => {
    try {
      const { entityType, entityData } = req.body;
      
      if (!entityType || !entityData) {
        return res.status(400).json({ error: "Entity type and data are required" });
      }
      
      // Define system message for recommendations
      const systemContent = `You are an AI assistant for AVEROX CRM. Generate actionable recommendations for a ${entityType} in JSON format. Include at least 3 specific actions, each with a title, description, priority (high, medium, low), and expected outcome.`;
      
      // Create prompt for recommendation generation
      const prompt = `Generate recommendations for the following ${entityType}:\n\n${JSON.stringify(entityData, null, 2)}`;
      
      try {
        // Use direct fetch API instead of OpenAI client library
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo", // Use the most widely available model
            messages: [
              { role: "system", content: systemContent },
              { role: "user", content: prompt }
            ],
            temperature: 0.5,
            response_format: { type: "json_object" }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API Error Response:", errorData);
          return handleOpenAIError(res, errorData);
            error: "OpenAI API Error",
            details: errorData.error?.message || "Unknown error",
            apiError: errorData
          });
        }
        
        const data = await response.json();
        
        // Return the AI response
        return res.json({
          content: data.choices[0].message.content,
          type: entityType
        });
      } catch (openaiError: any) {
        console.error("OpenAI API Error Details:", openaiError);
        
        // Return a more detailed error for debugging
        return res.status(500).json({
          error: "OpenAI API Error",
          details: openaiError.message || "Unknown error",
          apiError: openaiError
        });
      }
    } catch (error) {
      return handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
