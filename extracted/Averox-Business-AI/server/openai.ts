import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Common error handling for OpenAI API calls
export function isOpenAIQuotaError(errorMessage: string): boolean {
  return (
    errorMessage.includes("quota") || 
    errorMessage.includes("insufficient_quota") || 
    errorMessage.includes("rate_limit")
  );
}

interface AnalysisOptions {
  prompt: string;
  context?: string;
  type?: 'leads' | 'opportunities' | 'customers' | 'general';
}

interface InsightOptions {
  data: any;
  type: 'leads' | 'opportunities' | 'customers' | 'all';
}

interface RecommendationOptions {
  entityType: string;
  entityData: any;
}

/**
 * Generate analysis using OpenAI API
 */
export async function generateAnalysis(options: AnalysisOptions) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a CRM system. Analyze the data and answer the user's question with detailed insights. 
            For context, you're analyzing ${options.type || 'general'} data. ${options.context || ''}`
        },
        {
          role: "user",
          content: options.prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return {
      content: response.choices[0].message.content,
      type: options.type || 'general',
      model: "gpt-4o"
    };
  } catch (error: any) {
    console.error("OpenAI Analysis Error:", error);
    throw error;
  }
}

/**
 * Generate insights using OpenAI API
 */
export async function generateInsights(options: InsightOptions) {
  try {
    const systemPrompt = `You are an AI assistant for a CRM system. Analyze the provided ${options.type} data and generate 3-5 actionable insights. 
      Format your response as a JSON object with the following structure:
      {
        "insights": [
          {
            "title": "Brief insight title",
            "description": "Detailed explanation with data points and recommendations",
            "category": "trend|customer|prediction",
            "importance": "high|medium|low"
          },
          ...
        ]
      }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Here is the ${options.type} data to analyze: ${JSON.stringify(options.data, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    return {
      content: response.choices[0].message.content,
      type: options.type,
      model: "gpt-4o"
    };
  } catch (error: any) {
    console.error("OpenAI Insights Error:", error);
    throw error;
  }
}

/**
 * Generate recommendations using OpenAI API
 */
export async function generateRecommendations(options: RecommendationOptions) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a CRM assistant that provides actionable recommendations. 
            Analyze the ${options.entityType} data and suggest 3-5 specific actions to improve outcomes. 
            Format your response in markdown with bullet points.`
        },
        {
          role: "user",
          content: `Here is the ${options.entityType} data: ${JSON.stringify(options.entityData, null, 2)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return {
      content: response.choices[0].message.content,
      type: options.entityType,
      model: "gpt-4o"
    };
  } catch (error: any) {
    console.error("OpenAI Recommendations Error:", error);
    throw error;
  }
}

/**
 * Generate email template using OpenAI API
 */
export async function generateEmailTemplate(
  emailType: string,
  contactInfo: any,
  dealInfo?: any,
  additionalContext?: string
) {
  try {
    const systemPrompt = `You are an AI assistant that creates professional email templates for sales teams. 
      Create a concise, effective email template for a "${emailType}" email.`;

    const contextPrompt = `Create a ${emailType} email template for ${contactInfo.firstName} ${contactInfo.lastName} 
      ${dealInfo ? `regarding ${dealInfo.name || 'their opportunity'}` : ''}. 
      ${additionalContext || ''}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return {
      content: response.choices[0].message.content,
      type: "email_template",
      model: "gpt-4o"
    };
  } catch (error: any) {
    console.error("OpenAI Email Template Error:", error);
    throw error;
  }
}

/**
 * Summarize meeting using OpenAI API
 */
export async function summarizeMeeting(
  transcript: string,
  meetingContext?: string
) {
  try {
    const systemPrompt = `You are an AI assistant that summarizes meetings for sales teams. 
      Create a concise summary with these sections:
      1. Key Points
      2. Action Items
      3. Follow-up Tasks`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Here's the meeting transcript to summarize: ${transcript}
          ${meetingContext ? `\nMeeting context: ${meetingContext}` : ''}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    return {
      content: response.choices[0].message.content,
      type: "meeting_summary",
      model: "gpt-4o"
    };
  } catch (error: any) {
    console.error("OpenAI Meeting Summary Error:", error);
    throw error;
  }
}