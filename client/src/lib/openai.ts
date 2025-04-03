import { apiRequestJson } from "./queryClient";

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
    // Use the server-side endpoint for AI analysis
    const response = await apiRequestJson<AnalysisResponse>(
      'POST',
      '/api/ai/analyze',
      request
    );
    
    return response;
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
    // Use the server-side endpoint for AI insights
    const response = await apiRequestJson<AnalysisResponse>(
      'POST',
      '/api/ai/insights',
      {
        data,
        type: insightType
      }
    );
    
    return response;
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
    // Use the server-side endpoint for AI recommendations
    const response = await apiRequestJson<AnalysisResponse>(
      'POST',
      '/api/ai/recommendations',
      {
        entityType,
        entityData
      }
    );
    
    return response;
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return {
      content: `Error generating recommendations: ${error.message || "Unknown error"}`,
      type: "error"
    };
  }
}