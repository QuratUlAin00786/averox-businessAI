import { apiRequestJson } from "@/lib/queryClient";

export type AnalysisResponse = {
  content: string;
  created: number;
};

export interface DashboardInsightRequest {
  data: any;
  type: string;
}

export interface Insight {
  title: string;
  description: string;
  category: "trend" | "customer" | "prediction" | string;
  importance: "high" | "medium" | "low";
}

/**
 * Generates AI insights based on dashboard data
 * @param data Dashboard data to analyze
 * @param type Type of insights to generate (leads, opportunities, revenue, customers, or all)
 * @returns Insights from the AI
 */
export async function generateInsights(data: any, type: string = 'all'): Promise<Insight[]> {
  try {
    const response = await apiRequestJson<AnalysisResponse>(
      'POST', 
      '/api/ai/insights',
      { data, type }
    );
    
    if (typeof response.content === 'string') {
      try {
        // Try to parse as JSON
        const parsedContent = JSON.parse(response.content);
        return parsedContent.insights || [];
      } catch (e) {
        console.error("Error parsing AI insights:", e);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error("Failed to generate insights:", error);
    throw error;
  }
}