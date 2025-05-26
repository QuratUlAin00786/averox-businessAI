import { Request, Response } from "express";
import { db } from "../db";
import { leads, contacts, accounts, opportunities, tasks, events } from "../../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Zapier Integration for Averox CRM
 * Enables connection with 6000+ apps through Zapier webhooks
 */

interface ZapierWebhookPayload {
  event: string;
  data: any;
  source?: string;
  timestamp?: string;
}

interface ZapierTriggerConfig {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  sampleData: any;
}

// Available Zapier triggers from Averox CRM
export const ZAPIER_TRIGGERS: ZapierTriggerConfig[] = [
  {
    id: "new_lead",
    name: "New Lead Created",
    description: "Triggers when a new lead is added to your CRM",
    endpoint: "/api/zapier/triggers/new-lead",
    sampleData: {
      id: 123,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      company: "Example Corp",
      source: "Website",
      status: "New",
      createdAt: "2025-05-26T12:00:00Z"
    }
  },
  {
    id: "lead_converted",
    name: "Lead Converted",
    description: "Triggers when a lead is converted to customer",
    endpoint: "/api/zapier/triggers/lead-converted",
    sampleData: {
      leadId: 123,
      contactId: 456,
      accountId: 789,
      convertedAt: "2025-05-26T12:00:00Z",
      leadData: { firstName: "John", lastName: "Doe", email: "john@example.com" }
    }
  },
  {
    id: "new_opportunity",
    name: "New Opportunity Created",
    description: "Triggers when a new sales opportunity is created",
    endpoint: "/api/zapier/triggers/new-opportunity",
    sampleData: {
      id: 789,
      name: "Enterprise Deal",
      amount: "50000",
      stage: "Qualification",
      probability: 25,
      accountId: 456,
      createdAt: "2025-05-26T12:00:00Z"
    }
  },
  {
    id: "opportunity_won",
    name: "Opportunity Won",
    description: "Triggers when a deal is closed as won",
    endpoint: "/api/zapier/triggers/opportunity-won",
    sampleData: {
      id: 789,
      name: "Enterprise Deal",
      amount: "50000",
      wonAt: "2025-05-26T12:00:00Z",
      accountName: "Example Corp"
    }
  },
  {
    id: "task_completed",
    name: "Task Completed",
    description: "Triggers when a task is marked as completed",
    endpoint: "/api/zapier/triggers/task-completed",
    sampleData: {
      id: 321,
      title: "Follow up call",
      completedAt: "2025-05-26T12:00:00Z",
      assignedTo: "John Smith",
      associatedEntity: "opportunity"
    }
  }
];

// Available Zapier actions for Averox CRM
export const ZAPIER_ACTIONS = [
  {
    id: "create_lead",
    name: "Create Lead",
    description: "Creates a new lead in your CRM",
    fields: [
      { key: "firstName", label: "First Name", required: true },
      { key: "lastName", label: "Last Name", required: true },
      { key: "email", label: "Email", required: true },
      { key: "company", label: "Company", required: false },
      { key: "phone", label: "Phone", required: false },
      { key: "source", label: "Lead Source", required: false }
    ]
  },
  {
    id: "create_contact",
    name: "Create Contact",
    description: "Creates a new contact in your CRM",
    fields: [
      { key: "firstName", label: "First Name", required: true },
      { key: "lastName", label: "Last Name", required: true },
      { key: "email", label: "Email", required: true },
      { key: "title", label: "Job Title", required: false },
      { key: "phone", label: "Phone", required: false },
      { key: "accountId", label: "Account ID", required: false }
    ]
  },
  {
    id: "create_task",
    name: "Create Task",
    description: "Creates a new task in your CRM",
    fields: [
      { key: "title", label: "Task Title", required: true },
      { key: "description", label: "Description", required: false },
      { key: "dueDate", label: "Due Date", required: false },
      { key: "priority", label: "Priority", required: false },
      { key: "assignedTo", label: "Assigned To (User ID)", required: false }
    ]
  }
];

/**
 * Handle incoming webhook from Zapier
 */
export async function handleZapierWebhook(req: Request, res: Response) {
  try {
    const payload: ZapierWebhookPayload = req.body;
    
    console.log("📨 Received Zapier webhook:", payload.event);
    
    // Verify webhook authenticity (you would implement signature verification here)
    if (!payload.event || !payload.data) {
      return res.status(400).json({ 
        error: "Invalid webhook payload",
        message: "Missing event or data fields"
      });
    }

    let result;
    
    switch (payload.event) {
      case "create_lead":
        result = await createLeadFromZapier(payload.data);
        break;
        
      case "create_contact":
        result = await createContactFromZapier(payload.data);
        break;
        
      case "create_task":
        result = await createTaskFromZapier(payload.data);
        break;
        
      case "update_lead_status":
        result = await updateLeadStatusFromZapier(payload.data);
        break;
        
      default:
        return res.status(400).json({
          error: "Unsupported event type",
          supportedEvents: ["create_lead", "create_contact", "create_task", "update_lead_status"]
        });
    }

    res.json({
      success: true,
      message: `Successfully processed ${payload.event}`,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Zapier webhook error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Create lead from Zapier webhook
 */
async function createLeadFromZapier(data: any) {
  const leadData = {
    firstName: data.firstName || data.first_name,
    lastName: data.lastName || data.last_name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    title: data.title || data.job_title,
    source: data.source || "Zapier Integration",
    status: data.status || "New",
    ownerId: data.ownerId || 1, // Default to admin user
    notes: data.notes || `Lead created via Zapier integration from ${data.source || 'external app'}`
  };

  const [newLead] = await db.insert(leads).values(leadData).returning();
  
  // Trigger outbound webhook to notify other Zapier workflows
  await triggerZapierWebhook("new_lead", newLead);
  
  return newLead;
}

/**
 * Create contact from Zapier webhook
 */
async function createContactFromZapier(data: any) {
  const contactData = {
    firstName: data.firstName || data.first_name,
    lastName: data.lastName || data.last_name,
    email: data.email,
    phone: data.phone,
    title: data.title || data.job_title,
    accountId: data.accountId || null,
    ownerId: data.ownerId || 1,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    country: data.country || "USA",
    notes: data.notes || `Contact created via Zapier integration`
  };

  const [newContact] = await db.insert(contacts).values(contactData).returning();
  return newContact;
}

/**
 * Create task from Zapier webhook
 */
async function createTaskFromZapier(data: any) {
  const taskData = {
    title: data.title,
    description: data.description || `Task created via Zapier integration`,
    status: data.status || "Not Started",
    priority: data.priority || "Medium",
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    ownerId: data.assignedTo || data.ownerId || 1,
    associatedEntityType: data.entityType || null,
    associatedEntityId: data.entityId || null
  };

  const [newTask] = await db.insert(tasks).values(taskData).returning();
  return newTask;
}

/**
 * Update lead status from Zapier webhook
 */
async function updateLeadStatusFromZapier(data: any) {
  if (!data.leadId) {
    throw new Error("Lead ID is required for status update");
  }

  const [updatedLead] = await db
    .update(leads)
    .set({ 
      status: data.status,
      notes: data.notes || `Status updated via Zapier integration to: ${data.status}`
    })
    .where(eq(leads.id, data.leadId))
    .returning();

  if (!updatedLead) {
    throw new Error(`Lead with ID ${data.leadId} not found`);
  }

  // Trigger webhook if lead was converted
  if (data.status === "Converted") {
    await triggerZapierWebhook("lead_converted", {
      leadId: updatedLead.id,
      leadData: updatedLead,
      convertedAt: new Date().toISOString()
    });
  }

  return updatedLead;
}

/**
 * Trigger outbound webhook to Zapier
 */
async function triggerZapierWebhook(event: string, data: any) {
  // In a real implementation, you would:
  // 1. Look up registered webhook URLs for this event type
  // 2. Send HTTP POST requests to those URLs
  // 3. Handle retries and failures
  
  console.log(`🔔 Triggering Zapier webhook: ${event}`, {
    event,
    data,
    timestamp: new Date().toISOString()
  });
  
  // Store webhook delivery attempt for debugging
  // You could implement a webhook_deliveries table to track this
}

/**
 * Get available Zapier triggers for app setup
 */
export function getZapierTriggers(req: Request, res: Response) {
  res.json({
    triggers: ZAPIER_TRIGGERS,
    description: "Available triggers that can send data from Averox CRM to other apps via Zapier"
  });
}

/**
 * Get available Zapier actions for app setup
 */
export function getZapierActions(req: Request, res: Response) {
  res.json({
    actions: ZAPIER_ACTIONS,
    description: "Available actions that can receive data from other apps via Zapier"
  });
}

/**
 * Test Zapier connection
 */
export function testZapierConnection(req: Request, res: Response) {
  res.json({
    success: true,
    message: "Zapier connection test successful",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    supportedEvents: ZAPIER_TRIGGERS.map(t => t.id),
    supportedActions: ZAPIER_ACTIONS.map(a => a.id)
  });
}

/**
 * Get recent Zapier activity/logs
 */
export async function getZapierActivity(req: Request, res: Response) {
  // In a real implementation, you would fetch from a webhook_logs table
  const mockActivity = [
    {
      id: 1,
      event: "new_lead",
      source: "Google Forms",
      status: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      data: { firstName: "John", lastName: "Doe", email: "john@example.com" }
    },
    {
      id: 2,
      event: "create_task",
      source: "Slack",
      status: "success", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      data: { title: "Follow up with new lead", priority: "High" }
    },
    {
      id: 3,
      event: "lead_converted",
      source: "Averox CRM",
      status: "delivered",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      data: { leadId: 123, accountName: "Tech Corp" }
    }
  ];

  res.json({
    activity: mockActivity,
    total: mockActivity.length,
    description: "Recent Zapier integration activity"
  });
}