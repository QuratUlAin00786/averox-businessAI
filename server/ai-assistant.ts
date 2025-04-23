import OpenAI from "openai";
import { db } from "./db";
import { contacts, leads, opportunities, tasks, events, activities, invoices } from "@shared/schema";
import { and, eq, gte, lt, lte, desc, sql } from "drizzle-orm";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface BusinessInsight {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction: string;
  entityId?: number;
  entityType?: string;
  metadata?: Record<string, any>;
}

export async function generateBusinessInsights(): Promise<BusinessInsight[]> {
  try {
    // Get data for analysis
    const recentLeads = await db
      .select()
      .from(leads)
      .where(
        and(
          gte(leads.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
          eq(leads.status, "Qualified")
        )
      )
      .limit(50);
    
    const staleOpportunities = await db
      .select()
      .from(opportunities)
      .where(
        and(
          lte(opportunities.updatedAt, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)), // No updates in 14 days
          eq(opportunities.stage, "Proposal")
        )
      )
      .orderBy(desc(opportunities.amount))
      .limit(20);
    
    const highValueContacts = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.id)) // This would normally be based on some value metric
      .limit(30);
    
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          gte(events.startDate, new Date()),
          lt(events.startDate, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // Next 7 days
        )
      )
      .limit(20);
    
    const overdueInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.status, "Overdue"),
          lt(invoices.dueDate, new Date())
        )
      )
      .orderBy(desc(invoices.amount))
      .limit(10);
    
    const pendingTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          lt(tasks.dueDate, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // Due in next 3 days
          eq(tasks.status, "In Progress")
        )
      )
      .limit(20);

    // Format data for OpenAI
    const businessData = {
      qualified_leads: recentLeads,
      stale_opportunities: staleOpportunities,
      high_value_contacts: highValueContacts,
      upcoming_events: upcomingEvents,
      overdue_invoices: overdueInvoices,
      pending_tasks: pendingTasks
    };
    
    // Query OpenAI for business insights
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI business assistant for a CRM system. Your job is to analyze business data and provide actionable insights to help the business grow. 
          You should identify opportunities for follow-up, potential issues that need attention, and prioritize tasks based on their potential business impact.
          Focus on high-value customers, qualified leads, stale opportunities, upcoming events, overdue invoices, and pending tasks.
          
          Provide exactly 5 actionable insights with the following structure:
          1. type: The category of the insight (e.g., "lead_followup", "opportunity_stale", "invoice_overdue", "event_preparation", "contact_engagement")
          2. priority: Priority level ("high", "medium", "low") based on business impact
          3. title: A brief, action-oriented title (max 10 words)
          4. description: Detailed explanation of the insight (2-3 sentences)
          5. suggestedAction: Specific next step the user should take
          6. entityId: The ID of the relevant entity (if applicable)
          7. entityType: The type of entity (e.g., "lead", "opportunity", "contact", "invoice", "task", "event")
          8. metadata: Any additional relevant information
          
          The response should be in valid JSON format.`
        },
        {
          role: "user",
          content: JSON.stringify(businessData)
        }
      ],
      response_format: { type: "json_object" }
    });

    const insights = JSON.parse(response.choices[0].message.content);
    return insights.insights as BusinessInsight[];
  } catch (error) {
    console.error("Error generating business insights:", error);
    return [
      {
        type: "error",
        priority: "medium",
        title: "Unable to generate insights",
        description: "There was an error analyzing your business data. Please try again later or contact support if the issue persists.",
        suggestedAction: "Refresh the page or try again later."
      }
    ];
  }
}

export async function getPersonalizedAdvice(entityType: string, entityId: number): Promise<string> {
  try {
    // Get entity data
    let entityData: any = null;
    
    switch(entityType) {
      case "lead":
        const [lead] = await db.select().from(leads).where(eq(leads.id, entityId));
        entityData = lead;
        break;
      case "opportunity":
        const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, entityId));
        entityData = opportunity;
        break;
      case "contact":
        const [contact] = await db.select().from(contacts).where(eq(contacts.id, entityId));
        entityData = contact;
        break;
      case "task":
        const [task] = await db.select().from(tasks).where(eq(tasks.id, entityId));
        entityData = task;
        break;
      case "event":
        const [event] = await db.select().from(events).where(eq(events.id, entityId));
        entityData = event;
        break;
      default:
        return "Unable to provide advice for this entity type.";
    }
    
    if (!entityData) {
      return "Entity not found.";
    }
    
    // Get related activities for context
    const relatedActivities = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.relatedToType, entityType),
          eq(activities.relatedToId, entityId)
        )
      )
      .orderBy(desc(activities.createdAt))
      .limit(10);
    
    // Query OpenAI for personalized advice
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI sales and customer relationship assistant. Based on the entity data and related activities, 
          provide personalized, actionable advice on how to best engage with this ${entityType}.
          
          Your advice should be:
          1. Specific to the entity's situation and history
          2. Strategic and action-oriented
          3. Focused on increasing the likelihood of conversion or strengthening the relationship
          4. About 3-5 sentences in length
          5. Professional but conversational in tone
          
          Do not include any placeholder text, generic advice, or statements that could apply to any entity. 
          Respond with the advice text only, no introductions or explanations.`
        },
        {
          role: "user",
          content: JSON.stringify({
            entityType,
            entityData,
            relatedActivities
          })
        }
      ]
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating personalized advice:", error);
    return "Unable to generate personalized advice at this time. Please try again later.";
  }
}