import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize the OpenAI client with browser-compatible environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For client-side usage
});

export interface AnalysisRequest {
  prompt: string;
  context?: string;
  type?: 'leads' | 'opportunities' | 'customers' | 'general';
}

export interface AnalysisResponse {
  content: string;
  type: string;
  metadata?: Record<string, any>;
}

/**
 * Generate AI analysis based on CRM data and user prompt
 */
export async function generateAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const { prompt, context = '', type = 'general' } = request;
    
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
    
    // Add response formatting guidelines
    systemContent += " Format your response with clear sections, bullet points for key insights, and actionable recommendations.";
    
    const messages = [
      { role: "system", content: systemContent },
      { role: "user", content: `${context ? context + '\n\n' : ''}${prompt}` }
    ];
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return {
      content: response.choices[0].message.content || "No analysis could be generated at this time.",
      type: type
    };
  } catch (error: any) {
    console.error("Error generating AI analysis:", error);
    return {
      content: `Error generating analysis: ${error.message || "Unknown error"}`,
      type: "error"
    };
  }
}

/**
 * Generate structured insights from CRM data
 */
export async function generateInsights(
  data: Record<string, any>,
  insightType: 'leads' | 'opportunities' | 'customers' | 'all' = 'all'
): Promise<AnalysisResponse> {
  try {
    // Construct the system message based on the type of insights
    let systemContent = "You are an AI analyst for AVEROX CRM. Generate structured business insights in JSON format.";
    systemContent += " Each insight should have a title, description, category, and importance level (high, medium, low).";
    
    // Add specific focus based on insight type
    if (insightType !== 'all') {
      systemContent += ` Focus specifically on ${insightType} data and trends.`;
    }
    
    // Create a prompt for insights generation
    const prompt = `Analyze the following CRM data and generate 3-5 key business insights:\n\n${JSON.stringify(data, null, 2)}`;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: prompt }
      ] as any,
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    // Parse and return the structured insights
    const content = response.choices[0].message.content || "{}";
    
    return {
      content,
      type: insightType,
      metadata: JSON.parse(content)
    };
  } catch (error: any) {
    console.error("Error generating insights:", error);
    return {
      content: `Error generating insights: ${error.message || "Unknown error"}`,
      type: "error"
    };
  }
}

/**
 * Generate recommendations for specific entities (leads, opportunities, etc.)
 */
export async function generateRecommendations(
  entityType: string,
  entityData: Record<string, any>
): Promise<AnalysisResponse> {
  try {
    // Define the system message for recommendations
    const systemContent = `You are an AI assistant for AVEROX CRM. Generate actionable recommendations for a ${entityType} in JSON format. Include at least 3 specific actions, each with a title, description, priority (high, medium, low), and expected outcome.`;
    
    // Create a prompt for recommendation generation
    const prompt = `Generate recommendations for the following ${entityType}:\n\n${JSON.stringify(entityData, null, 2)}`;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: prompt }
      ] as any,
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    // Parse and return the structured recommendations
    const content = response.choices[0].message.content || "{}";
    
    return {
      content,
      type: entityType,
      metadata: JSON.parse(content)
    };
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return {
      content: `Error generating recommendations: ${error.message || "Unknown error"}`,
      type: "error"
    };
  }
}